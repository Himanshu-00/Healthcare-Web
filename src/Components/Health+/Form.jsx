import React, { useState, useEffect } from "react";
import { db, auth } from "../../firebaseConfig"; // Import Firebase and auth here
import { addDoc, collection, Timestamp} from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const AppointmentForm = ({ title, doctorName, specialty}) => {
  const [fullName, setFullName] = useState("");
  const [address, setAddress] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [fees, setFees] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isAppointmentBooked, setIsAppointmentBooked] = useState(false);
  const navigate = useNavigate();
  

  const [isPopupVisible, setPopupVisible] = useState(false);

  const userEmail = auth.currentUser?.email || "No email found";

  // Generate random fee
  const generateRandomFee = () => {
    const randomFee = Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000; // Random 4 digit number
    setFees(`${randomFee}`);
  };

  useEffect(() => {
    generateRandomFee();
  }, []);

  const validateForm = () => {
    if (!fullName.trim()) {
      alert("Full name cannot be blank.");
      return false;
    }
    if (!address.trim()) {
      alert("Address cannot be blank.");
      return false;
    }
    if (!contactNumber.trim()) {
      alert("Contact number cannot be blank.");
      return false;
    }
    if (!selectedDate) {
      alert("Please select a date.");
      return false;
    }
    return true;
  };

  const saveAppointmentToFirestore = async () => {

    if (!validateForm()) {
      return;
    }

   const currentTime = new Date();
   const combinedDateTime = new Date(selectedDate);
   combinedDateTime.setHours(currentTime.getHours(), currentTime.getMinutes(), currentTime.getSeconds());


   const appointmentTimestamp = Timestamp.fromDate(combinedDateTime);

    const appointmentData = {
      fullName,
      address,
      contactNumber,
      fees,
      selectedDate:appointmentTimestamp,
      userEmail,
      doctorName,
      specialty,
    };

  if (!doctorName || !specialty) {
    alert("Doctor name or specialty is not defined.");
    return;
  }

    try {
      await addDoc(collection(db, "Appointments"), appointmentData);
      setIsAppointmentBooked(true);
      setPopupVisible(true);


       setTimeout(() => {
        navigate(-1);
      }, 3000);
    } catch (error) {
      console.error("Error adding appointment: ", error);
      alert("Failed to book the appointment. Please try again.");
    }
  };

  const closePopup = () => {
    setPopupVisible(false); 
    navigate(-1);
  };

  return (
    <div className="relative">
      <h2 className="text-2xl font-bold text-[#004D4D] mb-4">{title}</h2>
      
      <div className="space-y-4">
        <input
          type="text"
          placeholder="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="border-2 border-[#5A9898] text-[#004D4D] rounded-lg p-2 w-full"
        />

        <input
          type="text"
          placeholder="Address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="border-2 border-[#5A9898] text-[#004D4D] rounded-lg p-2 w-full"
        />

        <input
          type="tel" 
          placeholder="Contact Number"
          value={contactNumber}
          onChange={(e) => {
            const value = e.target.value;

            // Allow only numbers and update state
            if (/^\d*$/.test(value)) {
              setContactNumber(value);
            } else {
              alert("Please enter a valid phone number (only numbers are allowed).");
            }
          }}
          className="border-2 border-[#5A9898] text-[#004D4D] rounded-lg p-2 w-full"
        />

        <input
          type="text"
          value={fees}
          disabled
          className="border-2 border-[#5A9898] text-[#004D4D] bg-[#004D4D] bg-opacity-20 rounded-lg p-2 w-full"
        />

        <div>
          <label className="block text-[#004D4D] font-semibold mb-2">
            Select Date
          </label>
          <input
            type="date"
            value={selectedDate.toISOString().split("T")[0]} // Format date to YYYY-MM-DD
            onChange={(e) => setSelectedDate(new Date(e.target.value))}
            className="border-2 border-[#5A9898] text-[#004D4D] rounded-lg p-2 w-full"
          />
        </div>

        <div className="flex space-x-4">
          <button
            onClick={saveAppointmentToFirestore}
            className="bg-[#004D4D] hover:bg-[#003B3B] font-bold text-white px-6 py-3 rounded-lg w-full"
          >
            Confirm Appointment
          </button>

          
        </div>
      </div>

      {/* Popup Modal */}
      {isPopupVisible && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white p-8 rounded-lg shadow-lg w-[350px] text-center">
            <h3 className="text-2xl font-bold text-[#004D4D] mb-4">
              Appointment Booked!
            </h3>
            <p>Your appointment has been successfully booked.</p>
            <button
              onClick={closePopup}
              className="bg-[#004D4D] text-white font-bold px-4 py-2 mt-4 rounded-lg"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentForm;
