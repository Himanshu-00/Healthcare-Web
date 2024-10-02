import React,{useState, useEffect} from "react";
import { ref, listAll, getDownloadURL} from 'firebase/storage';
import {auth,  storage } from '../firebaseConfig';
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";



const Vault = () => {
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const navigate = useNavigate();


    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          if (user) {
            fetchUploadedFiles(user.uid);
           
          } else {
            // User is signed out
            console.log("No user is logged in.");
            
          }
        });
      
        // Cleanup subscription on unmount
        return () => unsubscribe();
      }, []);

    // Fetch files from Firebase Storage
    const fetchUploadedFiles = async () => {

     const user = auth.currentUser;
     if(!user){
        return console.log("NO User");
     }   
    
      const userId = auth.currentUser.uid;
      const listRef = ref(storage, `userReports/${userId}/`);
      try {
        const res = await listAll(listRef);
        const files = await Promise.all(res.items.map(async (itemRef) => {
          const url = await getDownloadURL(itemRef);
          return { name: itemRef.name, url };
          
        }));
        setUploadedFiles(files);
      } catch (error) {
        console.error('Failed to fetch files:', error);
      }
    };


    return(
  <div className="bg-[#F5F5F5] h-screen flex items-center justify-center">
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
      <section className={`flex-1 max-w-4xl bg-white rounded-2xl shadow-xl p-8`}>
        <h3 className="text-3xl font-bold mb-6 text-left font-mono text-[#004D4D]">Digital Reports</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {uploadedFiles.map((file) => (
            <div key={file.name} className="bg-[#A7D5D5] p-4 rounded-xl shadow-md">
              
              <a href={file.url} target="_blank" rel="noopener noreferrer" className="mt-2 block text-center text-[#004D4D] underline">View</a>
            </div>
          ))}
        </div>
      </section>
  </div>

    );
}

export default Vault
