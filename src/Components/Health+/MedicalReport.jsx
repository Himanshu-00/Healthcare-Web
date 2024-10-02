import React, { useState} from 'react';
import { ref, getDownloadURL, uploadBytes } from 'firebase/storage';
import { storage, auth } from '../../firebaseConfig';
import { ArrowUpOnSquareIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import '../../Components/Health+/Medical.css'
import { jsPDF } from 'jspdf';
import { useNavigate } from 'react-router-dom';

const ReportAnalysis = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [fileUrl, setFileUrl] = useState('');
  const [analysisResult, setAnalysisResult] = useState('');
  const [fileUploaded, setFileUploaded] = useState(false);
  const [analyzing, setAnalyzing] = useState(false); 
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();


  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type.startsWith('image/') || file.type === 'application/pdf') {
        setSelectedFile(file);
        setError('');
        await uploadFile(file);
      } else {
        setError('Please upload an image or PDF file only.');
        setSelectedFile(null);
      }
    }
  };

  const uploadFile = async (file) => {
    const storageRef = ref(storage, `uploads/${file.name}`);
  
    setUploading(true);
    try {
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      setFileUrl(downloadURL);
      setFileUploaded(true);
    } catch (uploadError) {
      setError('Failed to upload file. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const analyzeFile = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('report', selectedFile);
    
    setAnalyzing(true); // Start analyzing
    try {
      const response = await axios.post('https://healthcare-server-bdyx.onrender.com/api/analyze-report', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const htmlContent = marked(response.data.response);
      const sanitizedContent = DOMPurify.sanitize(htmlContent);
      setAnalysisResult(sanitizedContent);
      setShowModal(true); 

      // Generate PDF after analysis
      generatePDF(sanitizedContent);
       // Pass the sanitized content to PDF generation
    } catch (error) {
      setError('Failed to analyze file. Please try again.');
    } finally {
      setAnalyzing(false); // End analyzing
    }
  };

  const generatePDF = async (htmlContent) => {
    const doc = new jsPDF();

  
    // Generate PDF from the HTML content passed as a parameter
    await doc.html(htmlContent, {
        callback: async function (doc) {
            const pdfBlob = doc.output('blob');
            const userId = auth.currentUser.uid;
            const randomString = Math.random().toString(36).substring(2, 15);
            const storageRef = ref(storage, `userReports/${userId}/analysis_result_${randomString}.pdf`);

            // Upload PDF to Firebase Storage
            try {
                await uploadBytes(storageRef, pdfBlob);
                console.log('PDF uploaded successfully!');
            } catch (error) {
                console.error('Failed to upload PDF:', error);
            }
        },
        x: 10,
        y: 10,
        width: 190,
        windowWidth: document.body.scrollWidth,
    });
};

// OLD FUNC - Generate using DOMParser to extract all text from data and create a completely new file.

// const generatePDF = async (analysisContent) => {
//   const doc = new jsPDF();
//   const pageWidth = doc.internal.pageSize.width;
//   const pageHeight = doc.internal.pageSize.height;
//   const margin = 20;
//   const usableWidth = pageWidth - 2 * margin;
//   const usableHeight = pageHeight - 2 * margin;
//   let currentY = margin;

//   // Function to add text and manage page breaks
//   const addText = (text, fontSize = 12, isBold = false) => {
//     doc.setFontSize(fontSize);
//     doc.setFont(undefined, isBold ? 'bold' : 'normal');
    
//     const lines = doc.splitTextToSize(text, usableWidth);
    
//     lines.forEach(line => {
//       if (currentY + doc.getTextDimensions(line).h > pageHeight - margin) {
//         doc.addPage();
//         currentY = margin;
//       }
      
//       doc.text(line, margin, currentY);
//       currentY += doc.getTextDimensions(line).h + 2;
//     });
    
//     currentY += 5; // Add some space after the text block
//   };

//   // Function to add a section
//   const addSection = (title, items) => {
//     addText(title, 14, true);
//     items.forEach(item => addText(item));
//   };

//   const parser = new DOMParser();
//   const docFragment = parser.parseFromString(analysisContent, 'text/html');

//   // Helper function to extract items from each heading section
//   const extractItems = (headingText) => {
//     const headingElement = Array.from(docFragment.querySelectorAll('h3, strong'))
//       .find(el => el.textContent.trim().includes(headingText));

//     if (headingElement) {
//       let nextElement = headingElement.nextElementSibling;
//       const items = [];

//       while (nextElement && !['H3', 'STRONG'].includes(nextElement.tagName)) {
//         if (nextElement.tagName === 'UL') {
//           const listItems = Array.from(nextElement.querySelectorAll('li'));

//           listItems.forEach(li => {
//             const subList = li.querySelector('ul');
//             if (subList) {
//               const subItems = Array.from(subList.querySelectorAll('li'))
//                 .map(subLi => `  - ${subLi.innerText}`);
//               items.push(`${li.innerText}\n${subItems.join('\n')}`);
//             } else {
//               items.push(li.innerText);
//             }
//           });
//         }
//         nextElement = nextElement.nextElementSibling;
//       }
//       return items;
//     }
//     return [];
//   };

//   // Add sections to the PDF in sequence
//   const sections = [
//     { title: 'Patient Details', key: 'Patient Details' },
//     { title: 'Report Data', key: 'Report Data' },
//     { title: 'Metrics Below Normal', key: 'Metrics Below Normal' },
//     { title: 'Above Normal Metrics', key: 'Above Normal Metrics' },
//     { title: 'Potential Conditions', key: 'Potential Conditions' },
//     { title: 'Recommendations', key: 'Recommendations' },
//     { title: 'When to See a Doctor', key: 'When to See a Doctor' },
//   ];

//   sections.forEach(section => {
//     const items = extractItems(section.key);
//     if (items.length > 0) {
//       addSection(`${section.title}:`, items);
//     }
//   });

//   // Finalize the PDF and upload it
//   const pdfBlob = doc.output('blob');
//   const userId = auth.currentUser.uid;
//   const storageRef = ref(storage, `userReports/${userId}/analysis_result.pdf`);

//   // Upload PDF to Firebase Storage
//   try {
//     await uploadBytes(storageRef, pdfBlob);
//     console.log('PDF uploaded successfully!');
//   } catch (error) {
//     console.error('Failed to upload PDF:', error);
//   }
// };
  
  

  
  return (
    <div className="h-screen bg-[#F5F5F5] p-6">
      <button
          onClick={() => navigate(-1)}
          className="mb-4 p-2 bg-[#004D4D] text-white rounded-2xl hover:bg-[#003737] transition duration-200 absolute top-20 left-12 rotate-90"
        >
                <svg fill="#ffff" height="40px" width="40px" version="1.1" id="Icons" xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 32 32">
                    <path d="M21,2H11c-5,0-9,4-9,9v10c0,5,4,9,9,9h10c5,0,9-4,9-9V11C30,6,26,2,21,2z M21.7,14.7l-5,5C16.5,19.9,16.3,20,16,20
                    s-0.5-0.1-0.7-0.3l-5-5c-0.4-0.4-0.4-1,0-1.4s1-0.4,1.4,0l4.3,4.3l4.3-4.3c0.4-0.4,1-0.4,1.4,0S22.1,14.3,21.7,14.7z"/>
                </svg>
        </button>
      <div className='flex items-center justify-center h-[100%]'>
      <div className={`rounded-[25px] bg-white w-[800px] shadow-xl p-8 transition-all duration-500 items-center`}>
        <h3 className="text-3xl font-bold mb-6 text-center text-[#004D4D]">Please Upload Your Document Here</h3>
        <div className={`space-x-6`}>
          <div className={`flex flex-col items-center`}>
            <div
              className="flex flex-col items-center justify-center w-full h-72 bg-gradient-to-r from-teal-100 to-blue-100 border border-[#5A9898] rounded-xl p-6 cursor-pointer hover:bg-gradient-to-r hover:from-teal-200 hover:to-blue-200 transition-all duration-300"
              onClick={() => document.getElementById('file-input').click()}
            >
              <ArrowUpOnSquareIcon className="w-14 h-14 text-[#004D4D] mb-3" />
              <p className="text-[#004D4D] text-lg">Drag & drop your Image or PDF here</p>
              <p className="text-[#004D4D] text-sm">or</p>
              <button className="mt-4 px-10 py-3 bg-[#004D4D] text-white rounded-lg shadow-lg hover:bg-teal-800 transition-all duration-300">
                Choose File
              </button>
              <input
                type="file"
                id="file-input"
                className="hidden"
                accept="image/*,application/pdf"
                onChange={handleFileChange}
              />
            </div>
            {error && (
              <p className="text-red-600 bg-red-200 p-3 rounded-lg shadow-md">{error}</p>
            )}
            {uploading && (
              <p className="text-[#004D4D] bg-[#5A9898] p-3 rounded-xl shadow-md relative top-5">Uploading...</p>
            )}
            {fileUrl && (
              <div className="mt-6 flex flex-col items-center space-y-4">
                {selectedFile.type.startsWith('image/') ? (
                  <img src={fileUrl} alt="Preview" className="w-40 h-40 object-cover rounded-xl shadow-lg" />
                ) : (
                  <div className="flex items-center space-x-3">
                    <p className="text-gray-800 text-lg font-semibold">{selectedFile.name}</p>
                  </div>
                )}
                <p className="text-gray-500 text-sm">{selectedFile.name}</p>
                
                {fileUploaded && (
                  <button 
                    onClick={analyzeFile} 
                    className="mt-4 px-20 font-bold py-3 bg-[#004D4D] text-white rounded-lg shadow-lg hover:bg-teal-800 transition-all duration-300"
                  >
                    Analyze
                  </button>
                )}
              </div>
            )}
          </div>

          <section className='flex-1 p-2 relative -top-10'>
            {analyzing && (
              <div className="flex justify-center items-center h-full relative top-14">
             <svg width="50" height="50" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="50" cy="50" r="40" stroke="#004D4D" strokeWidth="10" fill="none" strokeDasharray="200" strokeDashoffset="50">
                        <animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur="1.2s" repeatCount="indefinite" />
                      </circle>
                      <circle cx="50" cy="50" r="30" stroke="#5A9898" strokeWidth="10" fill="none" strokeDasharray="100" strokeDashoffset="30">
                        <animateTransform attributeName="transform" type="rotate" from="0 50 50" to="-360 50 50" dur="1.2s" repeatCount="indefinite" />
                      </circle>
                    </svg>
              </div>
            )}

           {/* Modal for analysis result */}
           {showModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                <div className="bg-white p-6 rounded-3xl shadow-lg w-[800px]  max-h-[90vh] overflow-auto scrollbar-hide">
                  <div className="flex justify-between items-center">
                    <h3 className="text-2xl font-bold text-[#004D4d] relative left-1">Analysis Result</h3>
                    <button
                      onClick={() => setShowModal(false)}
                      className="bg-[#004D4D] py-1 px-3 text-white rounded-xl text-xl"
                    >
                      &times;
                    </button>
                  </div>
                  <div className="mt-4 p-6 bg-white border border-[#004D4D] rounded-3xl shadow-md">
                    <p className="text-gray-700" dangerouslySetInnerHTML={{ __html: analysisResult }}></p>
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
      </div>
    </div>
  );
};

export default ReportAnalysis;
