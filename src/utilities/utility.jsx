import { auth, db, deleteDoc } from "../firebaseConfig";
import { collection, getDoc, doc, getDocs, query, where } from "firebase/firestore";




export const fetchUsername = async (setUsername, setFullname) => {
    const user = auth.currentUser;
    if (user) {
        const uid = user.uid;
        try {
            const userDocRef = doc(db, "users", uid);
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
                const name = userDoc.data().username || "User";
                setUsername(name.split(" ")[0]); // Set the username state
                setFullname(name);
            } else {
                console.log("User document does not exist.");
            }
        } catch (error) {
            console.error("Error fetching user document: ", error);
        }
    } else {
        console.log("No User");
    }
};


export const fetchAppointmentDetails = async (setIsLoading, setAppointmentDetails, setIsToday) => {
    try {

      // Get the current logged-in user's email
    const userEmail = auth.currentUser?.email;

    if (!userEmail) {
      console.error("User is not logged in.");
      return;
    }

    // Query only the appointments for the logged-in user
    const appointmentsQuery = query(
      collection(db, "Appointments"),
      where("userEmail", "==", userEmail)
    );



      setIsLoading(true);
      const appointmentsSnapshot = await getDocs(appointmentsQuery);
      const appointmentData = appointmentsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
  
      //Get today's date without time 
      const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);

      const currentTimestamp = new Date().getTime();
  
      // Filter appointments to find those in the past
      const appointmentsToDelete = appointmentData.filter(appointment => {
        const appointmentDate = new Date(appointment.selectedDate.seconds * 1000);
        return appointmentDate.getTime() <= currentDate;
      });
  
      // Delete appointments that are in the past
      await Promise.all(appointmentsToDelete.map(appointment => deleteAppointment(appointment.id)));
  
      

         // Get tomorrow's date to ensure we filter only today's appointments
      const tomorrow = new Date(currentDate);
        tomorrow.setDate(currentDate.getDate() + 1);

      // Filter appointments for today
    const todayAppointments = appointmentData.filter(appointment => {
      const appointmentDate = new Date(appointment.selectedDate.seconds * 1000);
      return appointmentDate >= currentDate && appointmentDate < tomorrow;
    });

    // Filter future appointments
      const filteredAppointments = appointmentData.filter(appointment => {
        const appointmentDate = new Date(appointment.selectedDate.seconds * 1000);
        return appointmentDate.getTime() >= currentTimestamp;
      });

      // Sort today's appointments by selectedDate (earliest first)
    const sortedTodayAppointments = todayAppointments.sort((a, b) => {
      const dateA = new Date(a.selectedDate.seconds * 1000);
      const dateB = new Date(b.selectedDate.seconds * 1000);
      return dateA - dateB;
    });
  
      // Sort appointments by selectedDate (earliest first)
      const sortedAppointments = filteredAppointments.sort((a, b) => {
        const dateA = new Date(a.selectedDate.seconds * 1000);
        const dateB = new Date(b.selectedDate.seconds * 1000);
        return dateA - dateB; // Sort by earliest date first
      });
  
      setIsToday(sortedTodayAppointments);
      // Limit to first 2 appointments
      setAppointmentDetails(sortedAppointments);
    } catch (error) {
      console.error("Error fetching appointment details: ", error);
    } finally {
      setIsLoading(false);
    }
  };

  {/*To Delete Past Appointments*/}
  const deleteAppointment = async (id) => {
    try {
        const appointmentDocRef = doc(db, "Appointments", id);
        await deleteDoc(appointmentDocRef);
        console.log(`Appointment with ID: ${id} deleted successfully`);
    } catch (error) {
        console.error("Error deleting appointment: ", error);
    }
};

export const fetchDocnames = async (setDoctorName) => {
  try{
      const docs = await getDocs(collection(db, "Doctors"));
      const doctorName = docs.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
              username: typeof data.username === 'string' ? data.username : "",
              specialty: typeof data.specialty === 'string'? data.specialty: ""
      };
  });

  setDoctorName(doctorName);
  return doctorName;
  }
  catch(error) {
      console.error("Error fetching doctor names: ", error);
  }
};

export const FetchUserDetails = async(setUserData) => {
     try{
        const authUser = auth.currentUser;
        if(!authUser) {
          return;
        }
        const uid = authUser.uid;
        const user = await getDoc(doc(db, "users", uid));
        
      if(user.exists()) {
        const UserData = user.data();
        const Data = {
          username: typeof UserData.username === 'string' ? UserData.username : "No username",
          email: typeof UserData.email === 'string' ? UserData.email : "No email",
          phone: typeof UserData.phoneno === 'string' ? UserData.phoneno : "+91 7494738863",
        }
        setUserData(Data);
        return Data;
      }
     } catch(err) {
          console.log(`No Data ${err}`);
     }
}

