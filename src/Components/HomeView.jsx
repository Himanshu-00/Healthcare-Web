import React, { useState, useEffect } from "react";
import { auth, db, deleteDoc } from "../firebaseConfig";
import { collection, getDoc, doc, getDocs } from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import {fetchDocnames} from '../utilities/utility'
import { useContext } from "react";
import { UserContext } from "../utilities/ContextProvider";




const HomeView = () => {
  const {fullname} = useContext(UserContext);
  const [greeting, setGreeting] = useState("");
  const [doctorName, setDoctorName] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSpecialty, setSelectedSpecialty] = useState("Not Selected Any Doctor");
  const [selectedDoctor, setSelectedDoctor] = useState(null); 
  const [isModalVisible, setModalVisible] = useState(false);
  const navigate = useNavigate();

  const filteredDoctors = selectedSpecialty
  ? doctorName.filter((doctor) => doctor.specialty === selectedSpecialty)
  : doctorName;



  useEffect(() => {

    const isUser = onAuthStateChanged(auth, (user) => {
        if(user) {
            fetchDocnames(setDoctorName);
            setGreetingMessage();
        }
        else
        {
            console.log("No User Present")
        }
    });

    return () => isUser();
 
  }, []);




  // const formatDate = (timestamp) => {
  //   if (!timestamp) return "";
  //   const date = new Date(timestamp.seconds * 1000); 
  //   return date.toLocaleDateString(); 
  // };
  
  
  const setGreetingMessage = () => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning, ");
    else if (hour < 18) setGreeting("Good Afternoon, ");
    else setGreeting("Good Evening, ");
  };

  // const handleLogout = async () => {
  //   await signOut(auth);
  //   navigate("/login");
  // };




  return (
    <div className="container mx-auto p-4 pt-20 animate-fade-in h-screen">
      {/* <div className="text-2xl font-mono font-bold text-[#004D4D]">
      {greeting}{fullname}
      </div> */}
      <div className="mt-4 flex justify-between">
        <div className="flex-col space-y-4">
        <div className="flex  space-x-4">
        <div className="w-[500px] h-[300px] bg-white rounded-3xl p-10">
          <div className="font-mono">
                  <div className="flex flex-col items-left">
                    <h2 className="text-2xl font-bold  text-[#004D4D] mb-4">
                      Need Expert Guidance?
                    </h2>
                    <p className="text-[#004D4D] font-semibold mb-20">
                      Schedule a consultation with our specialists to discuss your health needs.
                    </p>
                    <button onClick={() => navigate("/appointment")} className="bg-[#004D4D] w-80 hover:bg-teal-700 text-white text-left font-bold py-3 px-4 rounded-2xl transition duration-300">
                      Book a Consultation
                    </button>
                  </div>
            </div>
          </div>

            <div className=" w-[500px] h-[300px] bg-white p-10 text-gray-800 rounded-3xl">
            <div className="flex items-center p-4">
            <div className='bg-[#A7D5D5] rounded-3xl w-[160px] h-[140px] relative top-5 -left-5'>
              <div className='flex flex-col items-center'>
              <span className='text-[#004D4D] text-2xl w-[300px] font-mono font-bold relative -top-12 left-[70px]'>
                  AI VisualMed
                  </span>
                <div className='bg-white bg-opacity-80 w-[80px] h-[80px] rounded-3xl'>
                  <svg width="80px" height="80px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 11.75C12.4142 11.75 12.75 12.0858 12.75 12.5V13.25H13.5C13.9142 13.25 14.25 13.5858 14.25 14C14.25 14.4142 13.9142 14.75 13.5 14.75H12.75V15.5C12.75 15.9142 12.4142 16.25 12 16.25C11.5858 16.25 11.25 15.9142 11.25 15.5V14.75H10.5C10.0858 14.75 9.75 14.4142 9.75 14C9.75 13.5858 10.0858 13.25 10.5 13.25H11.25V12.5C11.25 12.0858 11.5858 11.75 12 11.75Z" fill="#004D4D"/>
                  <path fillRule="evenodd" clipRule="evenodd" d="M11.948 1.25C11.0495 1.24997 10.3003 1.24995 9.70552 1.32991C9.07773 1.41432 8.51093 1.59999 8.05546 2.05546C7.59999 2.51093 7.41432 3.07773 7.32991 3.70552C7.24995 4.3003 7.24997 5.04952 7.25 5.948L7.25 6.02572C5.22882 6.09185 4.01511 6.32803 3.17157 7.17158C2 8.34315 2 10.2288 2 14C2 17.7712 2 19.6569 3.17157 20.8284C4.34314 22 6.22876 22 9.99998 22H14C17.7712 22 19.6569 22 20.8284 20.8284C22 19.6569 22 17.7712 22 14C22 10.2288 22 8.34315 20.8284 7.17158C19.9849 6.32803 18.7712 6.09185 16.75 6.02572L16.75 5.94801C16.75 5.04954 16.7501 4.3003 16.6701 3.70552C16.5857 3.07773 16.4 2.51093 15.9445 2.05546C15.4891 1.59999 14.9223 1.41432 14.2945 1.32991C13.6997 1.24995 12.9505 1.24997 12.052 1.25H11.948ZM15.25 6.00189V6C15.25 5.03599 15.2484 4.38843 15.1835 3.9054C15.1214 3.44393 15.0142 3.24644 14.8839 3.11612C14.7536 2.9858 14.5561 2.87858 14.0946 2.81654C13.6116 2.7516 12.964 2.75 12 2.75C11.036 2.75 10.3884 2.7516 9.90539 2.81654C9.44393 2.87858 9.24643 2.9858 9.11612 3.11612C8.9858 3.24644 8.87858 3.44393 8.81654 3.9054C8.75159 4.38843 8.75 5.03599 8.75 6V6.00189C9.14203 6 9.55807 6 10 6H14C14.4419 6 14.858 6 15.25 6.00189ZM16 14C16 16.2091 14.2091 18 12 18C9.79086 18 8 16.2091 8 14C8 11.7909 9.79086 10 12 10C14.2091 10 16 11.7909 16 14Z" fill="#004D4D"/>
                  </svg>
                  </div>
                </div>
                <p className="text-[#004D4D] absolute w-[220px] text-sm font-bold font-mono top-[5px] left-[190px]">
                 An AI to identify visual diseases from images, offering instant insights.
                 </p>
              </div>
          </div>
          <button onClick={() => navigate("/health")} className="relative top-2 left-[245px] bg-[#004D4D] w-50 hover:bg-teal-700 text-white text-left font-bold py-3 px-4 rounded-2xl transition duration-300">
                      Open AIVisualMed
              </button>
            </div>
            <div className="flex flex-col">

            <div className=" w-[300px] h-[300px] p-7 text-gray-800 font-mono rounded-3xl bg-[#A7D5D5]">
            <h2 className="text-2xl font-semibold text-[#004D4D] mb-4 ">
                  Available Specialists
                </h2>
            </div>
            
            <div> 
              <p className="text-white mb-6 absolute top-[210px] -right-10 w-[250px] text-center bg-[#5A9898] rounded-3xl p-2 font-bold font-mono">
                  Our team of experienced doctors is here to assist you. Below are the specialties currently available for consultations:
                </p> 
            </div>

          </div>
            

         </div>

        <div className="flex space-x-4">          
        <div onClick={() => navigate("/vault")} className="p-4 cursor-pointer bg-[#A7D5D5] to-teal-200 text-gray-800 rounded-3xl w-[300px] h-[280px]">
            <div className="flex p-2">
            <div className="flex flex-col items-left p-4">
            <span className='text-[#004D4D] text-2xl font-mono font-bold relative -top-4 -left-4'>
                  HealthVault
                  </span>
            <div className='bg-[#A7D5D5] rounded-3xl w-[190px] h-[140px] flex relative -left-5 top-5'>
              <div className='flex flex-col gap-2'>
                  <div className='bg-white bg-opacity-80 w-[80px] rounded-3xl'>
                  <svg width="80px" height="80px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22 7.81V12.5H17.92C17.8 12.49 17.54 12.34 17.48 12.23L16.44 10.26C16.03 9.48 15.32 9.04 14.56 9.08C13.8 9.12 13.15 9.63 12.82 10.46L11.44 13.92L11.24 13.4C10.75 12.13 9.35 11.17 7.97 11.17L2 11.2V7.81C2 4.17 4.17 2 7.81 2H16.19C19.83 2 22 4.17 22 7.81Z" fill="#004D4D"/>
                    <path d="M22 16.1887V13.9987H17.92C17.25 13.9987 16.46 13.5187 16.15 12.9287L15.11 10.9587C14.83 10.4287 14.43 10.4587 14.21 11.0087L11.91 16.8187C11.66 17.4687 11.24 17.4687 10.98 16.8187L9.84 13.9387C9.57 13.2387 8.73 12.6687 7.98 12.6687L2 12.6987V16.1887C2 19.7687 4.1 21.9287 7.63 21.9887C7.74 21.9987 7.86 21.9987 7.97 21.9987H15.97C16.12 21.9987 16.27 21.9987 16.41 21.9887C19.92 21.9087 22 19.7587 22 16.1887Z" fill="#5A9898"/>
                    <path d="M2.0007 12.6992V16.0092C1.9807 15.6892 1.9707 15.3492 1.9707 14.9992V12.6992H2.0007Z" fill="#292D32"/>
                    </svg>
                  </div>
                </div>
              </div>
                  </div>
                  <p className="text-[#004D4D] text-xs font-mono font-bold absolute top-[505px] w-[140px] left-[150px]">
                  HealthVault stores and organizes personal medical records for easy access and sharing.
                  </p>  
              </div>
              <button onClick={() => navigate("")} className=" relative -top-7  bg-[#004D4D] w-50 hover:bg-teal-700 text-white text-left font-bold py-3 px-4 rounded-2xl transition duration-300">
                      Open HealthVault
              </button>
        </div>
        <div onClick={() => navigate("/report")} className="p-4 cursor-pointer bg-white to-teal-200 text-gray-800 rounded-3xl w-[400px] h-[280px]">
          <div className="flex items-center p-5">
          <div className='bg-[#A7D5D5] rounded-3xl w-[190px] h-[140px] flex items-center justify-center relative -left-4'>
                <div className='flex flex-col gap-2 items-center'>
                  <div className='bg-white bg-opacity-80 w-[80px] rounded-3xl'>
                  <svg
                    width="80"
                    height="80"
                    viewBox="0 0 24 24"
                    data-name="Flat Color"
                    xmlns="http://www.w3.org/2000/svg"
                    className="icon flat-color"
                  >
                    <path
                      d="M18 4v15.49L15.49 22H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2"
                      style={{ fill: '#004D4D' }}
                    />
                    <path
                      d="M17.73 13.73a2.52 2.52 0 0 1 3.54 0 2.52 2.52 0 0 1 0 3.54l-4 4a2.52 2.52 0 0 1-3.54 0 2.52 2.52 0 0 1 0-3.54ZM15 8a1 1 0 0 0-1-1H6a1 1 0 0 0 0 2h8a1 1 0 0 0 1-1m-2 4a1 1 0 0 0-1-1H6a1 1 0 0 0 0 2h6a1 1 0 0 0 1-1"
                      style={{ fill: '#A7D5D5' }}
                    />
                  </svg>
                  </div>   
                </div>
              </div>
              <p className="text-[#004D4D] font-mono text-xs font-bold w-[150px] left-[545px] top-[460px] absolute">MediInsight provides AI-powered summaries of medical reports for quick and clear insights.</p>
              <span className='text-[#004D4D] text-2xl font-mono font-bold w-[220px] relative top-[110px] left-6'>
                  MediInsight AI
                  </span>    
          </div>
          <button onClick={() => navigate("")} className="relative left-1 bg-[#004D4D] w-30 hover:bg-teal-700 text-white text-left font-bold py-3 px-4 rounded-2xl transition duration-300">
                    Open AI Insight
           </button>
        </div>
        <div  className="p-4 cursor-pointer bg-[#A7D5D5] to-teal-200 text-gray-800 rounded-3xl flex-1 h-[280px]">
          <div className="flex items-center">
                  {doctorName.length === 0  ? (
                 <p className="text-center text-[#004D4D] font-bold text-xl relative top-5">
                 Data not available
               </p>
              ) : (
                <div className=" bg-[#5A9898] h-[245px] w-[560px] rounded-2xl overflow-auto">
                  <div className="grid grid-cols-2 gap-2 text-[#004D4D] text-xl font-mono">
                  {doctorName.map((doctor, index) => (
                    <div
                      key={index}
                      className="p-2 font-semibold cursor-pointer">
                     
                      <div className="bg-white p-4 rounded-xl text-[#004D4D] font-bold">
                        {doctor.specialty}
                      </div>
                    </div>
                  ))}
                </div>
                  </div>
              )}
             
          </div>
        </div>
        </div>
        </div>

        
        <div className="">
       
        </div>
      </div>
      



     
    </div>
  );
};

export default HomeView;
