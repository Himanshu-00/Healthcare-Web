import React, { useState } from "react";
import { auth } from "../firebaseConfig"; 
import { Navigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebaseConfig"; 

const SignUpView = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phoneno, setPhoneno] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [userType, setUserType] = useState("user");
  const [address, setAddress] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [price, setPrice] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [isRegistered, setIsRegistered] = useState(false);

  const handleRegister = async () => {
    if (!username || !email || !password || !confirmPassword) {
      setAlertMessage("Please fill in all fields");
      setShowAlert(true);
      return;
    }

    if (password !== confirmPassword) {
      setAlertMessage("Password and Confirm Password didn't match");
      setShowAlert(true);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userData = {
        username,
        email,
        phoneno,
        userType,
      };

      if (userType === "doctor") {
        userData.address = address;
        userData.specialty = specialty;
        userData.price = price;
      }

      await setDoc(doc(db, userType === "doctor" ? "Doctors" : "users", user.uid), userData);
      setIsRegistered(true);
    } catch (error) {
      setAlertMessage(error.message);
      setShowAlert(true);
    }
  };

  if (isRegistered) return <Navigate to="/home" />;

  return (
    <div className="flex items-center justify-center h-screen bg-[#F5F5F5]">
      <div className="bg-white p-6 rounded-3xl shadow-xl w-96">
        <h2 className="text-3xl font-bold text-center text-[#004D4D] mb-4 font-mono">Sign Up</h2>
        
        <div className="flex justify-between mb-4">
          <button
            className={`flex-1 p-2 text-center rounded-l-xl font-bold ${userType === "user" ? "bg-[#004D4D] text-white" : "bg-gray-200 text-[#004D4D]"}`}
            onClick={() => setUserType("user")}
          >
            User
          </button>
          <button
            className={`flex-1 p-2 text-center rounded-r-xl font-bold ${userType === "doctor" ? "bg-[#004D4D] text-white" : "bg-gray-200 text-[#004D4D]"}`}
            onClick={() => setUserType("doctor")}
          >
            Doctor
          </button>
        </div>

        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          className="w-full p-3 border border-gray-300 rounded-2xl mb-3"
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full p-3 border border-gray-300 rounded-2xl mb-3"
        />
        <input
          type="text"
          value={phoneno}
          onChange={(e) => setPhoneno(e.target.value)}
          placeholder="+91 Phone Number"
          className="w-full p-3 border border-gray-300 rounded-2xl mb-3"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full p-3 border border-gray-300 rounded-2xl mb-3"
        />
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm Password"
          className="w-full p-3 border border-gray-300 rounded-2xl mb-3"
        />

        {userType === "doctor" && (
          <div className="grid grid-cols-2 gap-2 mb-3">
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Address"
              className="p-3 border border-gray-300 rounded-2xl"
            />
            <input
              type="text"
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              placeholder="Specialty"
              className="p-3 border border-gray-300 rounded-2xl"
            />
            <input
              type="text"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Consultation Price"
              className="p-3 border border-gray-300 rounded-2xl"
            />
          </div>
        )}

        <button
          onClick={handleRegister}
          className="w-full p-3 bg-[#004D4D] hover:bg-[#003030] text-white font-bold rounded-2xl shadow-md transition duration-200"
        >
          Register
        </button>

        {showAlert && (
          <div className="mt-4 text-red-600 text-center">{alertMessage}</div>
        )}

        <div className="mt-6 text-center font-mono">
          <span className="text-gray-500">Already have an account? </span>
          <a href="/login" className="text-[#004D4D] hover:underline font-mono font-semibold">Log In</a>
        </div>
      </div>
    </div>
  );
};

export default SignUpView;
