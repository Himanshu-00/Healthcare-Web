import React, {useState, useEffect} from "react";
import { auth, db, deleteDoc } from "../firebaseConfig";
import { collection, getDoc, doc, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";





const Schedule = () => {
    const [filteredDoctors, setFilteredDoctors] = useState([]);
    const [doctorName, setDoctorName] = useState("Loading...");
    const [searchQuery, setSearchQuery] = useState("");
    const navigate = useNavigate();

    useEffect(() => {

        const isUser = onAuthStateChanged(auth, (user) => {
            if(user) {
                fetchDocnames();
            }
            else
            {
                console.log("No User Present")
            }
        });
    
        return () => isUser();
     
      }, []);

    useEffect(() => {
        if (Array.isArray(doctorName) && doctorName.length) {
    
            setFilteredDoctors(
                doctorName.filter(doctorName =>
                    (doctorName.username && doctorName.username.toLowerCase().includes(searchQuery.toLowerCase())) ||
                    (doctorName.specialty && doctorName.specialty.toLowerCase().includes(searchQuery.toLowerCase()))
                )
              );
           
        }
      }, [searchQuery, doctorName]);

    return(
        <div className="flex items-center">
        <div className="ml-10 mt-10 flex">
          <h2 className="text-xl font-mono font-bold relative -left-4">Schedule an Appointment</h2>
          <div className="searchbar absolute top-[150px] left-[40px]">
          <input
            type="text"
            placeholder="Search .."
            value={searchQuery}
            onChange={handleSearchChange}
            className="mt-10 p-2 pr-20 placeholder-black rounded-xl font-semibold bg-white opacity-50 text-white"
          />
          <ul className="max-h-[240px] overflow-y-auto font-semibold mt-2">
            {filteredDoctors.length > 0 ? (
              filteredDoctors.map((doctorName, index) => (
                <li key={index} className="text-gray-800 border-b border-gray-800 mt-2 p-2">
                   <p>Name: {doctorName.username}</p>
                   <p>Specialty: {doctorName.specialty}</p>
                </li>
              ))
            ) : (
              <p className="text-white">No doctors found</p>
            )}
          </ul>
      
          </div>
       
        </div>
      </div>
    );
};

export default Schedule