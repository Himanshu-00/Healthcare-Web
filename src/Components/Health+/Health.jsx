import { useState, useRef } from "react";
import axios from "axios";
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { ArrowUpOnSquareIcon } from '@heroicons/react/24/outline';
import '../Health+/style.css'
import { useNavigate } from "react-router-dom";

const HealthAI = () => {
  const [result, setResult] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageName, setImageName] = useState('');
  const [imageURL, setImageURL] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const navigate = useNavigate();



  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if(file) {
      setSelectedImage(file);
      setImageName(file.name);
      setImageURL(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const formData = new FormData();


      if (selectedImage) {
        // Append image to form data
        formData.append("image", selectedImage);
        const response = await axios.post("https://healthcare-server-bdyx.onrender.com/api/analyze-image", formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        // Sanatize And Send
        const htmlContent = marked(response.data.response);
        const sanitizedContent = DOMPurify.sanitize(htmlContent);
        setResult(sanitizedContent);
        setModalVisible(true);

      }  else {
        alert("Please provide a prompt or select an image.");
        setLoading(false);

        return;
      }
    } catch (err) {
      console.error("Error generating content:", err.response ? err.response.data : err.message);
      setResult("Error generating content.");
    }
    finally {
      setLoading(false);
    }
  };

  const InputRef = useRef(null);
  const handleClick = () => {
    if (InputRef.current) {
      InputRef.current.click(); // Programmatically click the file input
    }
  };

  return (
    <div className="bg-[#F5F5F5] h-screen flex items-center justify-center">
     <button
          onClick={() => navigate(-1)}
          className="mb-4 p-2 bg-[#004D4D] text-white rounded-2xl hover:bg-[#003737] transition duration-200 absolute top-20 left-20 rotate-90"
        >
                <svg fill="#ffff" height="40px" width="40px" version="1.1" id="Icons" xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 32 32">
                    <path d="M21,2H11c-5,0-9,4-9,9v10c0,5,4,9,9,9h10c5,0,9-4,9-9V11C30,6,26,2,21,2z M21.7,14.7l-5,5C16.5,19.9,16.3,20,16,20
                    s-0.5-0.1-0.7-0.3l-5-5c-0.4-0.4-0.4-1,0-1.4s1-0.4,1.4,0l4.3,4.3l4.3-4.3c0.4-0.4,1-0.4,1.4,0S22.1,14.3,21.7,14.7z"/>
                </svg>
        </button>
      <div className="bg-[#A7D5D5] w-[800px]  rounded-3xl p-10">
        <div className="text-[#004D4D] text-2xl font-mono font-bold">
          AI VisualMed
        </div>
      <div className="flex flex-col gap-16">
      <input
        type="file"
        ref={InputRef}
        accept="image/*"
        onChange={handleImageChange}
        style={{ boxSizing: 'border-box', fontWeight: 'bold', display: 'none' }}
      />

      <div onClick={handleClick} className="mt-5 w-full h-[250px] rounded-[20px]  cursor-pointer">
           <div className="h-60">
           <div className="flex flex-col items-center justify-center w-full h-72 bg-white rounded-3xl p-6 cursor-pointer">
              <ArrowUpOnSquareIcon className="w-14 h-14 text-[#004D4D] mb-3" />
              <p className="text-[#004D4D] text-lg font-bold font-mono">Click Here to Upload Image File</p>
            </div>
           </div>
      </div>

        {imageName && (
        <div className="text-[18px]">
          <p className="relative top-[80px] left-[170px]"><strong>Selected Image:</strong> {imageName}</p>
          {imageURL && <img src={imageURL} alt="Selected" className="w-[150px] h-[150px] object-cover rounded-[10px] -mb-8" />}
        </div>
      )}

      <button
        onClick={handleSubmit}
        className="p-2 bg-[#5A9898] text-[#004D4D] rounded-xl w-60 font-bold"
      >
        Analyze
      </button>

      {loading && (
        <div><svg width="50" height="50" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="40" stroke="#004D4D" strokeWidth="10" fill="none" strokeDasharray="200" strokeDashoffset="50">
          <animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur="1.2s" repeatCount="indefinite" />
        </circle>
        <circle cx="50" cy="50" r="30" stroke="#5A9898" strokeWidth="10" fill="none" strokeDasharray="100" strokeDashoffset="30">
          <animateTransform attributeName="transform" type="rotate" from="0 50 50" to="-360 50 50" dur="1.2s" repeatCount="indefinite" />
        </circle>
      </svg></div>
      )}

        {isModalVisible && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                <div className="bg-white p-6 rounded-3xl shadow-lg w-[800px]  max-h-[90vh] overflow-auto scrollbar-hide">
                  <div className="flex justify-between items-center">
                    <button
                      onClick={() => setModalVisible(false)}
                      className="bg-[#004D4D] py-1 px-3 text-white rounded-xl text-xl"
                    >
                      &times;
                    </button>
                  </div>
                  <div className="mt-4 p-6 bg-white border border-[#004D4D] rounded-3xl shadow-md">
                    <p className="text-[#004D4D] font-bold" dangerouslySetInnerHTML={{ __html: result }}></p>
                  </div>
                </div>
              </div>
            )}

    </div>
      </div>
    </div>
  );
};

export default HealthAI;



{/* <svg
className="animate-spin h-14 w-14 text-white"
xmlns="http://www.w3.org/2000/svg"
viewBox="0 0 50 50"
fill="none"
>
<circle
  cx="25"
  cy="25"
  r="20"
  stroke="currentColor"
  strokeWidth="5"
  strokeDasharray="31.4"
  strokeDashoffset="25"
  className="opacity-25"
/>
<circle
  cx="25"
  cy="25"
  r="20"
  stroke="currentColor"
  strokeWidth="5"
  strokeDasharray="31.4"
  strokeDashoffset="10"
  className="opacity-75"
/>
</svg> */}


// else if (prompt) {
//   const response = await axios.post("https://healthcare-server-bdyx.onrender.com/api/analyze-text", { prompt });

//   const htmlContent = marked(response.data.response);
//   const sanitizedContent = DOMPurify.sanitize(htmlContent);
//   setResult(sanitizedContent);


// }