import React, { useState, useEffect } from "react";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay
} from "date-fns";
import { db } from "../firebaseConfig"; // Adjust this import based on your Firebase setup
import { collection, getDocs, Timestamp} from "firebase/firestore"


// Function to calculate time remaining
export const calculateTimeRemaining = (appointmentDate) => {

     // Check if appointmentDate is a Firestore Timestamp
     const appointmentDateTime = appointmentDate instanceof Timestamp 
     ? appointmentDate.toDate() 
     : new Date(appointmentDate); 

    const now = new Date();
    const difference = appointmentDateTime - now;

  
    if (difference <= 0) {
      return "Event has passed";
    }
  
    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((difference / (1000 * 60)) % 60);
  
    return {
      days,
      hours,
      minutes,
    };
  };


const CircularCalendar = ({onAppointmentsFetched}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [timeRemaining, setTimeRemaining] = useState(null);

  // Fetch events from Firebase
  useEffect(() => {
    const fetchAppointments = async () => {
      const appointmentsCollection = collection(db, "Appointments");
      const snapshot = await getDocs(appointmentsCollection);
      const appointmentList = snapshot.docs.map((doc) => {
        const data = doc.data();
        let appointmentDate = null;

        // Check if selectedDate is a Firestore Timestamp
        if (data.selectedDate && data.selectedDate.seconds) {
          appointmentDate = new Date(data.selectedDate.seconds * 1000); // Convert Timestamp to Date
        }

        return {
          id: doc.id,
          date: appointmentDate,
        };
      }).filter(appointment => appointment.date !== null);
      setAppointments(appointmentList);
      onAppointmentsFetched(appointmentList);
    };

    fetchAppointments();
  }, []);

   // Calculate time remaining for the next appointment
   useEffect(() => {
    const nextAppointment = appointments
      .filter((appointment) => appointment.date > new Date())
      .sort((a, b) => a.date - b.date)[0];

    if (nextAppointment) {
      const interval = setInterval(() => {
        setTimeRemaining(calculateTimeRemaining(nextAppointment.date));
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [appointments]);


  const nextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const prevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const onDateClick = (day) => {
    setSelectedDate(day);
  };
  

  const renderHeader = () => {
    const dateFormat = "MMMM yyyy";
    return (
      <div className="flex justify-between gap-12 items-center">
        <button onClick={prevMonth} className="text-[#004D4D] font-bold text-xl bg-white mb-5 py-2 px-[18px] rounded-full">
          &#8249;
        </button>
        <span className="text-lg font-bold text-[#004D4D] rounded-xl mb-5">{format(currentDate, dateFormat)}</span>
        <button onClick={nextMonth} className="text-[#004D4D] font-bold text-xl bg-white mb-5 py-2 px-[18px] rounded-full">
          &#8250;
        </button>
      </div>
    );
  };

  const renderDays = () => {
    const days = [];
    const dateFormat = "EEE";
    let startDate = startOfWeek(currentDate);

    for (let i = 0; i < 7; i++) {
      days.push(
        <div className="text-center w-12 text-[#004D4D]" key={i}>
          {format(addDays(startDate, i), dateFormat)}
        </div>
      );
    }
    return <div className="flex justify-center">{days}</div>;
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    const today = new Date();

    const dateFormat = "d";
    const rows = [];
    let days = [];
    let day = startDate;
    let formattedDate = "";

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, dateFormat);
        const cloneDay = day;

        const hasAppointment = appointments.some(
            (appointment) => isSameDay(cloneDay, appointment.date)
          );

        days.push(
          <div
            className={`w-10 h-10 flex items-center justify-center rounded-full m-1 cursor-pointer ${
              !isSameMonth(day, monthStart)
                ? "text-[#004D4D]" // Other month's days
                : isSameDay(day, today)
                ? "bg-white bg-opacity-70 text-[#004D4D] font-bold" // Highlight today's date
                : isSameDay(day, selectedDate)
                ? "bg-white text-[#004D4D] font-bold" // Highlight selected date
                : hasAppointment
                ? "bg-[#5A9898] text-white font-bold rounded-xl" // Highlight dates with appointments
                : "bg-transparent text-[#004D4D]"
            }`}
            key={day}
            onClick={() => onDateClick(cloneDay)}
          >
            <span>{formattedDate}</span>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="flex justify-center" key={day}>
          {days}
        </div>
      );
      days = [];
    }
    return <div>{rows}</div>;
  };

  return (
    <div className="bg-[#A7D5D5] rounded-3xl p-6 w-70 h-70 flex flex-col items-center justify-center">
      {renderHeader()}
      {renderDays()}
      {renderCells()}
       {/* Display Time Remaining
       <div className="mt-4 p-4 bg-white shadow-lg rounded-lg">
        <h2 className="text-lg font-bold text-[#004D4D]">Time Until Next Appointment</h2>
        {timeRemaining ? (
          <p className="text-xl text-[#FF6347]">
            {typeof timeRemaining === 'string'
              ? timeRemaining
              : `${timeRemaining.days} days, ${timeRemaining.hours} hours, ${timeRemaining.minutes} minutes, ${timeRemaining.seconds} seconds`}
          </p>
        ) : (
          <p className="text-xl text-[#FF6347]">Loading...</p>
        )}
      </div> */}
    </div>
  );
};

export default CircularCalendar;
