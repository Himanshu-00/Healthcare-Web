import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Main from './Components/Dashboard';
import LoginView from './Components/LoginView';
import ReportAnalysis from './Components/Health+/MedicalReport';
import SignUpView from './Components/SignUpView';
import HomeView from './Components/HomeView';
import { UserProvider } from './utilities/ContextProvider';
import BookAppointment from './Components/BookAppointment';
import HealthAI from './Components/Health+/Health';
import Vault from './Components/Vault';

function App() {
  return (
   <UserProvider>
     <Router>
      <Routes>
        <Route path="/" element={<LoginView />} />
        <Route path="/login" element={<LoginView />} />
        <Route path="signup"  element={<SignUpView />}/>
        <Route path="/home" element={<HomeView />} />
        <Route path="/dashboard" element={<Main />} />
        <Route path='/report' element={<ReportAnalysis />} />
        <Route path='/appointment' element={<BookAppointment />}/>
        <Route path='/health' element={<HealthAI />}/>
        <Route path='/vault' element={<Vault/>}/>
      </Routes>
    </Router>
   </UserProvider>
  );
}

export default App;
