import React, { useEffect, useState } from "react";
import { fetchDocnames } from "../utilities/utility";
import { useNavigate } from "react-router-dom";
import AppointmentForm from "./Health+/Form";

// Doctor List Component
const BookAppointment = () => {
  const [loading, setLoading] = useState(true);
  const [doctorName, setDoctorName] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState(null); 
  const [isModalVisible, setModalVisible] = useState(false);
  const navigate = useNavigate();


  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const doctors = await fetchDocnames(setDoctorName);
        setFilteredDoctors(doctors);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch doctors");
        setLoading(false);
        console.error(err);
      }
    };

    fetchDoctors(); 
  }, []);

  // Handle Search
  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);

    // Filter doctors based on search term
    const filtered = doctorName.filter((doctor) =>
      doctor.username.toLowerCase().includes(value) ||
      doctor.specialty.toLowerCase().includes(value)
    );
    setFilteredDoctors(filtered);
  };

  const handleDoctorClick = (doctor) => {
    setSelectedDoctor(doctor);
    setModalVisible(true);
  };
  

  const closeModal = () => {
    setModalVisible(false); // Close the modal
    setSelectedDoctor(null); // Clear the selected doctor
  };
  

  if (loading) return <div className="flex justify-center items-center h-screen ">
<svg width="120" height="120" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="40" stroke="#004D4D" strokeWidth="10" fill="none" strokeDasharray="200" strokeDashoffset="50">
    <animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur="1.2s" repeatCount="indefinite" />
  </circle>
  <circle cx="50" cy="50" r="30" stroke="#5A9898" strokeWidth="10" fill="none" strokeDasharray="100" strokeDashoffset="30">
    <animateTransform attributeName="transform" type="rotate" from="0 50 50" to="-360 50 50" dur="1.2s" repeatCount="indefinite" />
  </circle>
</svg>

  </div>
  if (error) return <p>{error}</p>;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#F5F5F5] p-4">
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
    <div className="bg-white rounded-2xl p-10 shadow-lg">
      <h1 className="text-4xl font-bold text-[#004D4D] mb-6 font-mono text-left">
        Locate Your Healthcare Provider
      </h1>
      <input
        type="text"
        placeholder="Search by Doctor's Name or Specialty Area"
        className="mb-6 p-2 w-full max-w-md rounded-2xl border border-[#5A9898] focus:outline-none focus:ring-2 focus:ring-[#004D4D] transition"
        value={searchTerm}
        onChange={handleSearch}
      />
      <div className="grid grid-cols-4 gap-4">
        {filteredDoctors.length > 0 ? (
          filteredDoctors.map((doctor) => (
            <div
              key={doctor.id}
              onClick={() => handleDoctorClick(doctor)} 
              className="bg-[#5A9898] shadow-md rounded-2xl p-4  border-[#5A9898] transition-transform duration-300 hover:scale-105 flex flex-col space-y-4 items-left"
            >
              <h3 className="text-xl font-semibold text-white  mb-2">
                Doctor: <br/>{doctor.username}
              </h3>
              <p className="text-md text-white font-semibold relative  -top-2"><span className=" bg-[#A7D5D5] rounded-xl text-[#004D4D] p-2">{doctor.specialty}</span></p>
              <button className="mt-3 px-3 py-1 bg-[#004D4D] text-white rounded-xl  font-bold hover:bg-[#003737] transition duration-200">
              Schedule Appointment
              </button>
            </div>
          ))
        ) : (
          <p className="text-[#004D4D]">No healthcare providers match your search criteria. Please try different keywords.</p>
        )}
      </div>
    </div>
    {isModalVisible && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-3xl p-5 w-11/12 md:w-1/3">
            <h2 className="text-2xl font-bold mb-4 font-mono text-[#004D4D]">Book Appointment with {selectedDoctor?.username}</h2>
            <AppointmentForm doctorName={selectedDoctor?.username} specialty={selectedDoctor?.specialty} closeModal={closeModal} />
              {/* Pass selected doctor to form */}
            <button className="mt-4 bg-[#004D4D] font-bold hover:bg-[#003B3B] text-white rounded-md px-4 py-2" onClick={closeModal}>
              Close
            </button>
          </div>
        </div>
      )}
  </div>
  );
};

export default BookAppointment;
