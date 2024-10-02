import React, { useState, useEffect, useContext } from 'react';
import {fetchAppointmentDetails} from '../utilities/Utility';
import { auth} from "../firebaseConfig";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import HomeView from './HomeView';
// import Message from './MessageView'
import Profle from './ProfileView'
import CircularCalendar, { calculateTimeRemaining } from './calendar';
import axios from "axios";
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { UserContext } from '../utilities/ContextProvider';



const NavButton = ({isActive, onClick, icon }) => {
    const iconColorClass = isActive ? 'text-[#004D4D]' : 'text-white';
     
    return (
      <button
        className={`flex items-center p-4 rounded-3xl transition duration-200 ease-in-out ${
          isActive ? 'bg-[#B2E0D8]' : 'hover:bg-[#B2E0D8]'
        }`}
        onClick={onClick}
      >
        {React.cloneElement(icon, {
          className: `w-7 h-7 ${iconColorClass}`,
        })}
      </button>
    );
  };

const FloatingNavBar = ({setCurrentScreen}) => {
  const [activeButton, setActiveButton] = useState('');

  

  const handleButtonClick = (buttonName) => {
    if (activeButton === buttonName) {
      setActiveButton('');
      setCurrentScreen('');
    } else {
      setActiveButton(buttonName);
      setCurrentScreen(buttonName);
    }
  };
  
  

  return (
    <div className="absolute p-4 left-3 top-60 h-[220px] bg-[#004D4D] flex flex-col rounded-3xl shadow-xl">
      {/* Navigation */}
      <div className="flex flex-col space-y-4 mt-7">
        <NavButton
          name="home"
          isActive={activeButton === 'home'}
          onClick={() => handleButtonClick('home')}
          icon={
            <svg width="30px" height="30px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                className="stroke-current"
                d="M22 12.2039V13.725C22 17.6258 22 19.5763 20.8284 20.7881C19.6569 22 17.7712 22 14 22H10C6.22876 22 4.34315 22 3.17157 20.7881C2 19.5763 2 17.6258 2 13.725V12.2039C2 9.91549 2 8.77128 2.5192 7.82274C3.0384 6.87421 3.98695 6.28551 5.88403 5.10813L7.88403 3.86687C9.88939 2.62229 10.8921 2 12 2C13.1079 2 14.1106 2.62229 16.116 3.86687L18.116 5.10812C20.0131 6.28551 20.9616 6.87421 21.4808 7.82274"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                className="stroke-current"
                d="M15 18H9"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          }
        />
        
     

        <NavButton
          name="account"
          isActive={activeButton === 'account'}
          onClick={() => handleButtonClick('account')}
          icon={
            <svg width="40px" height="40px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2Z" fill="#ffff"/>
            <path d="M12.0001 6C10.3433 6 9.00012 7.34315 9.00012 9C9.00012 10.6569 10.3433 12 12.0001 12C13.657 12 15.0001 10.6569 15.0001 9C15.0001 7.34315 13.657 6 12.0001 6Z" fill="#004D4D"/>
            <path d="M17.8948 16.5528C18.0356 16.8343 18.0356 17.1657 17.8948 17.4473C17.9033 17.4297 17.8941 17.4487 17.8941 17.4487L17.8933 17.4502L17.8918 17.4532L17.8883 17.46L17.8801 17.4756C17.874 17.4871 17.8667 17.5004 17.8582 17.5155C17.841 17.5458 17.8187 17.5832 17.7907 17.6267C17.7348 17.7138 17.6559 17.8254 17.5498 17.9527C17.337 18.208 17.0164 18.5245 16.555 18.8321C15.623 19.4534 14.1752 20 12.0002 20C8.31507 20 6.76562 18.4304 6.26665 17.7115C5.96476 17.2765 5.99819 16.7683 6.18079 16.4031C6.91718 14.9303 8.42247 14 10.0691 14H13.7643C15.5135 14 17.1125 14.9883 17.8948 16.5528Z" fill="#004D4D"/>
          </svg>
          }
        />
      </div>
    </div>
  );
};


const Dashboard = () => {
    const {username} = useContext(UserContext);
    const [greeting, setGreeting] = useState("");
    const [appointmentDetails, setAppointmentDetails] = useState([]);
    const [isToday, setIsToday] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [time] = useState(new Date());
    const totalAppointments = appointmentDetails.length + isToday.length;
    const [appointments, setAppointments] = useState([]);
    const [timeRemaining, setTimeRemaining] = useState(null);
    const [prompt, setPrompt] = useState('');
    const [result, setResult] = useState("Hi! I’m Accura, your AI health companion, ready to assist you with reliable information about various health topics.");
    const navigate = useNavigate();

    // Function to handle fetched appointments
  const onAppointmentsFetched = (fetchedAppointments) => {
    setAppointments(fetchedAppointments);
  }

  // useEffect to calculate time remaining whenever appointments change
  useEffect(() => {
    const nextAppointment = appointments
      .filter((appointment) => appointment.date > new Date())
      .sort((a, b) => a.date - b.date)[0];

    if (nextAppointment) {
      const remainingTime = calculateTimeRemaining(nextAppointment.date);
      setTimeRemaining(remainingTime);
    } else {
      setTimeRemaining("No upcoming appointments");
    }
  }, [appointments]);
    
    useEffect(() => {
        const isUser = onAuthStateChanged(auth, (user) => {
            if(user) {
                // fetchUsername(setUsername);
                fetchAppointmentDetails(setIsLoading, setAppointmentDetails, setIsToday);
                setGreetingMessage();
            }
            else
            {
                console.log("No User Present")
            }
        });
    
        return () => isUser();
    }, []);
  
    const setGreetingMessage = () => {
      const hour = new Date().getHours();
      if (hour < 12) setGreeting("Good Morning, ");
      else if (hour < 18) setGreeting("Good Afternoon, ");
      else setGreeting("Good Evening, ");
    };

    const handleLogout = async () => {
        await signOut(auth);
        navigate("/login");
      };

    //   const formatDate = (timestamp) => {
    //     if (!timestamp) return "";
    //     const date = new Date(timestamp.seconds * 1000); 
    //     return date.toLocaleDateString(); 
    //   };

    const totalFees = isToday.reduce((total, appointment) => {
      return total + parseFloat(appointment.fees);
    }, 0);
    

      const formatToMonthDay = (timestamp) => {
        const date = new Date(timestamp.seconds * 1000); 
        const day = String(date.getDate()).padStart(2, '0');
        const month = date.toLocaleString('en-US', { month: 'short' });
      
        return {day, month};
      };

      const handleSubmit = async () => {
        setIsLoading(true);
        try {
    
          if (prompt) {
            const response = await axios.post("https://healthcare-server-bdyx.onrender.com/api/analyze-text", { prompt });
    
            const htmlContent = marked(response.data.response);
            const sanitizedContent = DOMPurify.sanitize(htmlContent);
            setResult(sanitizedContent);
          } else {
            alert("Please provide a prompt.");
            setIsLoading(false);
            return;
          }
        } catch (err) {
          console.error("Error generating content:", err.response ? err.response.data : err.message);
          setResult("Error generating content.");
        }
        finally {
          setIsLoading(false);
        }
      };


      // Function to handle key press
      const handleKeyPress = (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          handleSubmit();
        }
      };

      const handleInputChange = (e) => {
        setPrompt(e.target.value);
      };

      // const handleClear = () => {
      //   setPrompt('');
      //   setIsLoading(false);
      // };
  
    return (
      <div className="min-h-screen p-6">
        {/* Dashboard Title, Logout Button, and Profile Picture */}
        <div className="flex justify-between items-center mb-6 relative w-[100%]">
          <h1 className="text-3xl font-bold text-[#004D4D] font-mono">Dashboard</h1>
          <div className="flex bg-[#004D4D] p-4 rounded-3xl right-2 relative">
          <div className='group'>   
            <button onClick={handleLogout} className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-white  transition duration-200 hover:bg-[#004D4D] group">
            <svg
            className="transition duration-200"
            width="25px"
            height="25px"
            fill="white"
            viewBox="0 0 24.00 24.00"
            xmlns="http://www.w3.org/2000/svg"
            >
                <path d="M22 6.62219V17.245C22 18.3579 21.2857 19.4708 20.1633 19.8754L15.0612 21.7977C14.7551 21.8988 14.449 22 14.0408 22C13.5306 22 12.9184 21.7977 12.4082 21.4942C12.2041 21.2918 11.898 21.0895 11.7959 20.8871H7.91837C6.38776 20.8871 5.06122 19.6731 5.06122 18.0544V17.0427C5.06122 16.638 5.36735 16.2333 5.87755 16.2333C6.38776 16.2333 6.69388 16.5368 6.69388 17.0427V18.0544C6.69388 18.7626 7.30612 19.2684 7.91837 19.2684H11.2857V4.69997H7.91837C7.20408 4.69997 6.69388 5.20582 6.69388 5.91401V6.9257C6.69388 7.33038 6.38776 7.73506 5.87755 7.73506C5.36735 7.73506 5.06122 7.33038 5.06122 6.9257V5.91401C5.06122 4.39646 6.28572 3.08125 7.91837 3.08125H11.7959C12 2.87891 12.2041 2.67657 12.4082 2.47423C13.2245 1.96838 14.1429 1.86721 15.0612 2.17072L20.1633 4.09295C21.1837 4.39646 22 5.50933 22 6.62219Z" />
                <path d="M4.85714 14.8169C4.65306 14.8169 4.44898 14.7158 4.34694 14.6146L2.30612 12.5912C2.20408 12.49 2.20408 12.3889 2.10204 12.3889C2.10204 12.2877 2 12.1865 2 12.0854C2 11.9842 2 11.883 2.10204 11.7819C2.10204 11.6807 2.20408 11.5795 2.30612 11.5795L4.34694 9.55612C4.65306 9.25261 5.16327 9.25261 5.46939 9.55612C5.77551 9.85963 5.77551 10.3655 5.46939 10.669L4.7551 11.3772H8.93878C9.34694 11.3772 9.7551 11.6807 9.7551 12.1865C9.7551 12.6924 9.34694 12.7936 8.93878 12.7936H4.65306L5.36735 13.5017C5.67347 13.8052 5.67347 14.3111 5.36735 14.6146C5.26531 14.7158 5.06122 14.8169 4.85714 14.8169Z" />
            </svg>
            </button>
            <span className="absolute top-14 left-[93.70%] transform -translate-x-1/2 mt-2 w-max rounded-md bg-white font-bold border-2 border-[#004D4D] text-[#004D4D] text-xs p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
            Logout
            </span>
            </div>
            
                
           </div>
        </div>
       
        <div className='w-full rounded-3xl p-10 mb-5 bg-[#A7D5D5]'>
        <h2 className="text-xl  font-bold text-[#004D4D] font-mono">{greeting}{username},<br/> <span className='text-[17px]'>Good health is not something we can buy. However, it can be an extremely valuable savings account</span></h2>
     
   
        </div>
        <h2 className="text-2xl font-bold text-[#004D4D] mt-10 font-mono m-6">Appointment Details</h2>

        {/* Dashboard Components */}
   <div className='flex space-x-6'>
        {/*Flex starts Here*/}
      <div className='flex flex-col space-y-6'>
        {/*2nd Flex*/}
        <div className="bg-white relative w-[480px] rounded-3xl p-10">  
            <div className='flex flex-col'>   
            <h2 className="text-2xl font-bold text-[#004D4D] font-mono mb-8">Today's Appointments</h2>   
              <div className="font-bold">
              {isLoading ? (
                <div className='text-[#004D4D]'>Loading...</div>
              ) : isToday.length === 0 ? (
              <div>
              <div className='text-[#004D4D]'>You currently have no scheduled appointments. Should you wish to book a consultation, kindly click the button below.</div>
              <button onClick={() => navigate("/appointment")} className="mt-5 -ml-1 bg-[#004D4D] text-white p-2 rounded-2xl hover:bg-[#004D4D]">
                Schedule an Appointment
              </button>
              </div>
          ) 
              : (
                isToday.map((appointment, index) => {
                const { day, month } = formatToMonthDay(appointment.selectedDate);
                 return ( 
                 <div key={index} className="bg-[#A7D5D5] text-[#004D4D] mb-5 rounded-3xl p-5 w-[400px] h-20 ">
                 <div className='flex'>
                 <div className='w-60'>
                 <p className="font-bold">Name: {appointment.doctorName}</p>
                 <p className='text-sm'>Specialty: {appointment.specialty}</p>
                 </div>
                 <div className='bg-[#5A9898] text-white rounded-full w-16 h-16 relative left-[50px] top-[-12px]'>
                 <p className='relative left-5 top-2'>{day}</p>
                 <p className='relative left-4 top-2'>{month}</p>
                 </div>
                 </div>
               </div>
               );
            })
              )}
              </div>
            </div>
    </div>

    <div className="bg-white relative w-[480px] max-h-[550px] min-h-[220px] h-[430px] rounded-3xl p-10">
            <h2 className="text-2xl font-bold text-[#004D4D] font-mono mb-8">Shortcut Menu</h2>   
              <div className="grid grid-cols-2 gap-4">
              <div className='bg-[#A7D5D5]  rounded-3xl w-[190px] h-[140px] flex items-center justify-center'>
              <div className='flex flex-col gap-2 items-center'>
                <div className='text-[50px] bg-white bg-opacity-80 w-[80px] font-bold text-[#004D4D] rounded-3xl'>
                  <span className='ml-6'>{totalAppointments}</span>
                </div>
                <span className='text-[#004D4D] font-bold '>
                    Total Appointments
                  </span>
              </div>
              </div>
              <div  onClick={() => navigate("/health")} className='cursor-pointer bg-[#A7D5D5] rounded-3xl w-[190px] h-[140px] flex items-center justify-center'>
              <div className='flex flex-col gap-2 items-center'>
                <div className='bg-white bg-opacity-80 w-[80px] rounded-3xl'>
                  <svg width="80px" height="80px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 11.75C12.4142 11.75 12.75 12.0858 12.75 12.5V13.25H13.5C13.9142 13.25 14.25 13.5858 14.25 14C14.25 14.4142 13.9142 14.75 13.5 14.75H12.75V15.5C12.75 15.9142 12.4142 16.25 12 16.25C11.5858 16.25 11.25 15.9142 11.25 15.5V14.75H10.5C10.0858 14.75 9.75 14.4142 9.75 14C9.75 13.5858 10.0858 13.25 10.5 13.25H11.25V12.5C11.25 12.0858 11.5858 11.75 12 11.75Z" fill="#004D4D"/>
                  <path fillRule="evenodd" clipRule="evenodd" d="M11.948 1.25C11.0495 1.24997 10.3003 1.24995 9.70552 1.32991C9.07773 1.41432 8.51093 1.59999 8.05546 2.05546C7.59999 2.51093 7.41432 3.07773 7.32991 3.70552C7.24995 4.3003 7.24997 5.04952 7.25 5.948L7.25 6.02572C5.22882 6.09185 4.01511 6.32803 3.17157 7.17158C2 8.34315 2 10.2288 2 14C2 17.7712 2 19.6569 3.17157 20.8284C4.34314 22 6.22876 22 9.99998 22H14C17.7712 22 19.6569 22 20.8284 20.8284C22 19.6569 22 17.7712 22 14C22 10.2288 22 8.34315 20.8284 7.17158C19.9849 6.32803 18.7712 6.09185 16.75 6.02572L16.75 5.94801C16.75 5.04954 16.7501 4.3003 16.6701 3.70552C16.5857 3.07773 16.4 2.51093 15.9445 2.05546C15.4891 1.59999 14.9223 1.41432 14.2945 1.32991C13.6997 1.24995 12.9505 1.24997 12.052 1.25H11.948ZM15.25 6.00189V6C15.25 5.03599 15.2484 4.38843 15.1835 3.9054C15.1214 3.44393 15.0142 3.24644 14.8839 3.11612C14.7536 2.9858 14.5561 2.87858 14.0946 2.81654C13.6116 2.7516 12.964 2.75 12 2.75C11.036 2.75 10.3884 2.7516 9.90539 2.81654C9.44393 2.87858 9.24643 2.9858 9.11612 3.11612C8.9858 3.24644 8.87858 3.44393 8.81654 3.9054C8.75159 4.38843 8.75 5.03599 8.75 6V6.00189C9.14203 6 9.55807 6 10 6H14C14.4419 6 14.858 6 15.25 6.00189ZM16 14C16 16.2091 14.2091 18 12 18C9.79086 18 8 16.2091 8 14C8 11.7909 9.79086 10 12 10C14.2091 10 16 11.7909 16 14Z" fill="#004D4D"/>
                  </svg>
                  </div>
                  <span className='text-[#004D4D] font-bold '>
                  AI VisualMed
                  </span>
                </div>
              </div>
              <div  onClick={() => navigate("/report")} className='cursor-pointer bg-[#A7D5D5] rounded-3xl w-[190px] h-[140px] flex items-center justify-center'>
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
                  <span className='text-[#004D4D] font-bold '>
                  MediInsight AI
                  </span>
                </div>
              </div>
              <div  onClick={() => navigate("/vault")} className='cursor-pointer bg-[#A7D5D5] rounded-3xl w-[190px] h-[140px] flex items-center justify-center'>
              <div className='flex flex-col gap-2'>
                  <div className='bg-white bg-opacity-80 w-[80px] rounded-3xl'>
                  <svg width="80px" height="80px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22 7.81V12.5H17.92C17.8 12.49 17.54 12.34 17.48 12.23L16.44 10.26C16.03 9.48 15.32 9.04 14.56 9.08C13.8 9.12 13.15 9.63 12.82 10.46L11.44 13.92L11.24 13.4C10.75 12.13 9.35 11.17 7.97 11.17L2 11.2V7.81C2 4.17 4.17 2 7.81 2H16.19C19.83 2 22 4.17 22 7.81Z" fill="#004D4D"/>
                    <path d="M22 16.1887V13.9987H17.92C17.25 13.9987 16.46 13.5187 16.15 12.9287L15.11 10.9587C14.83 10.4287 14.43 10.4587 14.21 11.0087L11.91 16.8187C11.66 17.4687 11.24 17.4687 10.98 16.8187L9.84 13.9387C9.57 13.2387 8.73 12.6687 7.98 12.6687L2 12.6987V16.1887C2 19.7687 4.1 21.9287 7.63 21.9887C7.74 21.9987 7.86 21.9987 7.97 21.9987H15.97C16.12 21.9987 16.27 21.9987 16.41 21.9887C19.92 21.9087 22 19.7587 22 16.1887Z" fill="#5A9898"/>
                    <path d="M2.0007 12.6992V16.0092C1.9807 15.6892 1.9707 15.3492 1.9707 14.9992V12.6992H2.0007Z" fill="#292D32"/>
                    </svg>
                  </div>
                  <span className='text-[#004D4D] font-bold '>
                  HealthVault
                  </span>
                </div>
              </div>
              </div>      
    </div>
    {/*2nd Flex End*/}

    <div className='bg-[#A7D5D5] rounded-3xl flex-1'>
     {/* Display Time Remaining */}
      <div className="text-[#004D4D] font-bold p-7">
        <h2 className="text-xl font-mono relative -top-1">Your next appointment is in:</h2>
        {timeRemaining ? (
          <p className="text-2xl font-mono text-[#004D4D] bg-white bg-opacity-70 p-3 rounded-2xl w-[420px] relative top-2">
            {typeof timeRemaining === 'string'
              ? timeRemaining
              : `${timeRemaining.days} Days, ${timeRemaining.hours} Hours, and ${timeRemaining.minutes} Minutes`}
          </p>
        ) : (
          <p className="text-xl text-[#004D4D]">Loading...</p>
        )}
      </div>
    </div>

    </div>
  <div className='flex flex-col gap-6'>{/*Flex Box Col Card */}
      <div className='flex gap-6'>{/*Flex Box Row 2 Cards */}
          <div className='flex flex-col space-y-4'>{/*Flex Box*/}
              <div className={`bg-white relative w-[420px] rounded-3xl p-10 ${appointmentDetails.length > 2 ? "flex-1": ""}`}>
              <div className="flex-col">  
              <h2 className="text-2xl font-bold text-[#004D4D] font-mono mb-8">Financial Overview</h2>
                    <div className="font-bold relative -top-7 -left-4">
                    <div className='overflow-y-auto h-full mt-10 w-[350px]'>
                    {isLoading ? (
                      null
                    ) : isToday.length === 0 ? (
                    <div className='text-[#004D4D] absolute top-4 left-4'>No appointments found in the system</div>
                  ): (
                      isToday.map((appointment, index) => {
                      const { day, month } = formatToMonthDay(appointment.selectedDate);
                      return ( 
                      <div key={index} className="bg-white text-[#004D4D] mb-5 rounded-3xl p-5 w-[320px] h-20">
                      <div className='flex'>
                      <div className='flex flex-col w-60 border-b-2 border-[#004D4D]'>
                      <p className='font-bold w-[150px]'>Doctor: {appointment.doctorName}</p>
                      <p className='text-xs'>Specialty: {appointment.specialty}</p>
                      </div>
                      <div className='bg-[#5A9898] text-white rounded-2xl w-40 h-16 relative left-[50px]'>
                      <p className='relative left-2 top-2'>Cost: <br/>₹{appointment.fees}</p>
                      </div>
                      </div>
                    </div>
                    );
                  })
                    )}
                    </div>
                        {isLoading? (<div className='text-[#004D4D] relative left-4 top-4'>Loading...</div>):  (
                        isToday.length > 0 ? ( <div className='text-xl font-bold text-[#004D4D] mt-10 font-mono relative left-4'>
                        Total Cost: <span className='bg-[#5A9898] p-2 rounded-3xl text-white'>₹{totalFees}</span>

                        <div className={`text-sm font-bold text-[#5A9898] ${isToday.length < 2 ? "relative top-14" : "relative top-10"}`}>Would you prefer to pay online?</div>
                        <button className={`relative left-[270px]  text-sm font-bold text-white bg-[#004D4D] py-3 px-3 rounded-2xl shadow-md hover:bg-[#003737] transition-transform transform hover:scale-105 duration-300
                        ${isToday.length <= 1 ? "top-[55px]" : "top-12"} `}>
                          Pay Now
                        </button>
                        </div>
                        ): null
                        )}
                    </div>
                    </div>
              </div>

              {appointmentDetails.length > 2 ? (
                <div className='bg-[#A7D5D5] rounded-3xl w-[420px]'>
                  <p className={`text-[#004D4D] font-mono p-6 font-bold ${isToday.length === 0 ? "relative text-[20px]":"text-sm "}`}>"Your health is your wealth—invest in it daily."</p>
                </div>
              ):null}
          </div>
          <div className='flex flex-col gap-4'>{/*Flex Box*/}
          <div className={`bg-[#A7D5D5] relative rounded-3xl p-10 ${isToday.length < 2 ? "h-[100%]":""}`}>
          <div className="flex-col">
          <h2 className="text-2xl font-bold text-[#004D4D] font-mono mb-8">Upcoming Appointments</h2>
                <div className="font-bold">
                {isLoading ? (
                  <div className='text-[#004D4D]'>Loading...</div>
                ) : appointmentDetails.length === 0 ? ( // Check if there are no appointments
                <div className='text-[#004D4D]'>There are no upcoming appointments at this time.</div>
            ): (
                  appointmentDetails.map((appointment, index) => {
                  const { day, month } = formatToMonthDay(appointment.selectedDate);
                  return ( 
                  <div key={index} className="bg-white text-[#004D4D] mb-5 rounded-3xl p-5 w-[320px] h-20">
                  <div className='flex'>
                  <div className='flex flex-col w-60'>
                  <p className="font-bold">Name: {appointment.doctorName}</p>
                  <p className='text-sm'>Specialty: {appointment.specialty}</p>
                  </div>
                  <div className='bg-[#5A9898] text-white rounded-2xl w-16 h-16 relative left-[10px] top-[-12px]'>
                  <p className='relative left-5 top-2'>{day}</p>
                  <p className='relative left-4 top-2'>{month}</p>
                  </div>
                  </div>
                </div>
                );
              })
                )}
                </div>
                </div>
    
              
          </div>
          {isToday.length > 1 ? (
            <div className={`bg-[#5A9898] rounded-3xl flex-1`}>
                <div className={`text-[70px] font-bold font-mono text-white ml-6 ${isToday.length > 1 ? "mt-14":"mt-3"}`}>
                {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit'})}
            </div>
                </div>
              ):null}
          </div>

        {/*Flex Box Row 2 Cards */}
       </div>
      

        <div className="bg-white relative rounded-3xl p-10">  
                <div className='flex gap-6'>     
                  <div>
                    <CircularCalendar onAppointmentsFetched={onAppointmentsFetched}/>
                  </div>
                  <div className='bg-[#A7D5D5] bg-opacity-40 flex-1 rounded-3xl p-6'>
                  <div className='flex'>
                  <input
                      type="text"
                      placeholder="How can I assist?"
                      value={prompt}
                      onChange={handleInputChange}
                      onKeyDown={handleKeyPress}
                      className="mt-2.5 mb-4 p-2.5 placeholder-[#004D4D] text-sm placeholder-opacity-70 w-[300px] rounded-xl bg-[#A7D5D5] text-[#004D4D]"
                      style={{ boxSizing: 'border-box', fontWeight: 'bold' }}
                    />
                     <button
                      onClick={handleSubmit}
                      className="flex absolute right-20 top-[74px] items-center justify-center w-10 h-10 rounded-xl bg-[#A7D5D5] hover:bg-[#5A9898] focus:outline-none"
                    >
                      <svg fill="#004D4D" height="30px" width="30px" version="1.1" id="Icons" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
                      <path d="M21,2H11c-5,0-9,4-9,9v10c0,5,4,9,9,9h10c5,0,9-4,9-9V11C30,6,26,2,21,2z M21.7,14.7l-5,5C16.5,19.9,16.3,20,16,20
                        s-0.5-0.1-0.7-0.3l-5-5c-0.4-0.4-0.4-1,0-1.4s1-0.4,1.4,0l4.3,4.3l4.3-4.3c0.4-0.4,1-0.4,1.4,0S22.1,14.3,21.7,14.7z"/>
                      </svg>
                    </button>
                    </div>
                    {isLoading ? (
                    <div className='absolute top-[230px] right-[23%]'>
                    <svg width="50" height="50" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="50" cy="50" r="40" stroke="#004D4D" strokeWidth="10" fill="none" strokeDasharray="200" strokeDashoffset="50">
                        <animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur="1.2s" repeatCount="indefinite" />
                      </circle>
                      <circle cx="50" cy="50" r="30" stroke="#5A9898" strokeWidth="10" fill="none" strokeDasharray="100" strokeDashoffset="30">
                        <animateTransform attributeName="transform" type="rotate" from="0 50 50" to="-360 50 50" dur="1.2s" repeatCount="indefinite" />
                      </circle>
                    </svg>
                      </div>
                      ):(
                      <div  className="text-[#004D4D] font-bold p-2 overflow-y-auto  h-[260px]" dangerouslySetInnerHTML={{ __html: result }}/>
                    )}
                  </div>
                </div>
        </div>
        {/*Flex Box Col Card */}
        </div>
      
          </div>
   


    </div>
    );
  };
  


const Main = () => {
    const [currentScreen, setCurrentScreen] = useState('');

    const renderScreen = () => {
        switch (currentScreen) {
          case 'home':
            return <HomeView />;
          case 'account':
            return <Profle />;
          default:
            return <div className='flex-1 pl-[100px]'>
                   <Dashboard />
                   </div>;
        }
      };

    return (
        <div className='flex h-auto bg-[#F5F5F5]'>
  
        <FloatingNavBar setCurrentScreen={setCurrentScreen}/>
        {renderScreen()}

        </div>
    );
};

export default Main;
