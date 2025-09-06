import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import "./App.css";
import Home from "./Home";
import Login from "./Login";
import Signup from "./Signup";
import PatientSignup from "./PatientSignup";
import InsurerSignup from "./InsurerSignup";
import Navigation from "./components/NewNav";
import About from "./About";
import Contact from "./Contact";
import Upload from "./Upload";
import TakeTest from "./TakeTest";
import AssessmentPage from "./AssessmentPage";
import HealthPlan from "./HealthPlan";
import PatientPanel from "./PatientPanel";
import InsurancePanel from "./InsurancePanel";
import ProfileIcon from "./components/ProfileIcon";
import Dashboard from "./Dashboard";
import UserProfile from "./UserProfile";
import InsurerProfile from "./InsurerProfile";
import Chatbot from "./Chatbot";
import ChatbotIcon from "./ChatbotIcon";
import Provider from "./provider";

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

function AppContent() {
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  return (
    <div className="app-container">
      {/* <Upload/> */}
      {/* <TakeTest/> */}
      {/* <AssessmentPage/> */}
      {/* <HealthPlan/> */}
      {/* <PatientPanel /> */}
      {/* <InsurancePanel /> */}
      {/* <PatientSignup/> */}
      {/* <InsurerSignup/> */}
      {/* <ProfileIcon/> */}
      {/* <Dashboard/> */}
      {/* <UserProfile/> */}

      {/* <div>
        <Chatbot/>
      </div> */}
      {/* <ChatbotIcon/> */}

      {isHomePage && <Navigation />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/signup/patient" element={<PatientSignup />} />
        <Route path="/signup/insurer" element={<InsurerSignup />} />
        <Route path="*" element={<Navigate to="/" />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/take-test" element={<TakeTest />} />
        <Route path="/assessment" element={<AssessmentPage />} />
        <Route path="/health-plan" element={<HealthPlan />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/patient-panel" element={<PatientPanel />} />
        <Route path="/insurance-panel" element={<InsurancePanel />} />
        <Route path="/UserProfile" element={<UserProfile />} />
        <Route path="/InsurerProfile" element={<InsurerProfile />} />
        <Route path="/insurance-panel" element={<InsurancePanel />} />
        <Route path="/insurer-dashboard" element={<Dashboard />} />
        <Route path="/provider" element={<Provider />} />
      </Routes> 
    </div>
  );
}

export default App;
