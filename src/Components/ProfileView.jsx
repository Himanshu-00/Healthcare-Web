import React, {useState, useEffect} from 'react';
import { FetchUserDetails } from '../utilities/utility';
import {auth} from "../firebaseConfig";
import {signOut} from "firebase/auth";
import { useNavigate } from "react-router-dom";


const Profile = () => {

const [userData, setUserData] = useState([]);
const navigate = useNavigate();


useEffect(()=>{
    FetchUserDetails(setUserData);
},[]);

const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };


  const user = {
    DOB: "12/12/2012",
    BloodG:"A+",
    
  };

  return (
  <div className='flex h-screen w-screen items-center justify-center'>
      <div className="bg-white w-[700px] h-[500px] shadow-lg rounded-3xl">
      <div className="p-6 mt-10">
        <div className="flex flex-col items-center">
          <div className="w-40 h-40 rounded-full border-2 border-[#004D4D]">
          <svg className="relative -top-1.5 -left-1.5" width="170px" height="170px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2Z" fill="#ffff"/>
            <path d="M12.0001 6C10.3433 6 9.00012 7.34315 9.00012 9C9.00012 10.6569 10.3433 12 12.0001 12C13.657 12 15.0001 10.6569 15.0001 9C15.0001 7.34315 13.657 6 12.0001 6Z" fill="#004D4D"/>
            <path d="M17.8948 16.5528C18.0356 16.8343 18.0356 17.1657 17.8948 17.4473C17.9033 17.4297 17.8941 17.4487 17.8941 17.4487L17.8933 17.4502L17.8918 17.4532L17.8883 17.46L17.8801 17.4756C17.874 17.4871 17.8667 17.5004 17.8582 17.5155C17.841 17.5458 17.8187 17.5832 17.7907 17.6267C17.7348 17.7138 17.6559 17.8254 17.5498 17.9527C17.337 18.208 17.0164 18.5245 16.555 18.8321C15.623 19.4534 14.1752 20 12.0002 20C8.31507 20 6.76562 18.4304 6.26665 17.7115C5.96476 17.2765 5.99819 16.7683 6.18079 16.4031C6.91718 14.9303 8.42247 14 10.0691 14H13.7643C15.5135 14 17.1125 14.9883 17.8948 16.5528Z" fill="#004D4D"/>
          </svg>
        </div>
          <div className="ml-4 text-[#004D4D] font-mono">
        {userData && (
            <h3 className="font-bold">{userData.username}</h3>
        )}
          </div>
          <ol>
            {userData && (
                <>
                <li>
                    <span className='font-bold'>Email:</span> {userData.email},
                </li>
                <li>
                    <span className='font-bold'>Phone No:</span> {userData.phone}
                </li>
                <li>
                    <span className='font-bold'>DOB:</span> {user.DOB}
                </li>
                <li>
                    <span className='font-bold'>Blood Group:</span> {user.BloodG}
                </li>
                </>
            )}
          </ol>
        <button onClick={handleLogout} className="flex items-center font-bold mt-7 font-mono justify-center w-40 h-10 rounded-xl border-2 border-[#004D4D] transition duration-200 hover:bg-[#004D4D] hover:text-white">
           SignOut
            </button>
            </div>
          </div>
    </div>
  </div>
  );
};

export default Profile;
