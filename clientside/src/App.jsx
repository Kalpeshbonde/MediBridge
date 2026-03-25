import { Route, Routes } from "react-router-dom";
import { Suspense, lazy, useCallback, useState } from "react";
import Home from "./pages/Home";
import Doctors from "./pages/Doctors";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Contact from "./pages/Contact";
import MyProfile from "./pages/MyProfile";
import MyAppointments from "./pages/MyAppointments";
import Appointment from "./pages/Appointment";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DoctorDashboard from "./pages/DoctorDashboard";
import HospitalLogin from "./pages/HospitalLogin";
import HospitalRegister from "./pages/HospitalRegister";
import HospitalDashboard from "./pages/HospitalDashboard";

const CareMate = lazy(() => import("./components/CareMate"));

const App = () => {
  const [careMateMounted, setCareMateMounted] = useState(false);
  const [careMateShouldOpen, setCareMateShouldOpen] = useState(false);

  // Only mount/open CareMate when explicitly requested (logo or Need help button).
  const handleOpenCareMate = useCallback((openImmediately = false) => {
    setCareMateMounted(true);
    setCareMateShouldOpen(openImmediately);
  }, []);

  return (
    <>
      <ToastContainer />
      <Navbar onOpenCareMate={() => handleOpenCareMate(true)} />
      <div className="mx-4 sm:mx-[10%]">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/doctors" element={<Doctors />} />
          <Route path="/doctors/:speciality" element={<Doctors />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/my-profile" element={<MyProfile />} />
          <Route path="/my-appointments" element={<MyAppointments />} />
          <Route path="/appointment/:docId" element={<Appointment />} />
          <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
          <Route path="/hospital/login" element={<HospitalLogin />} />
          <Route path="/hospital/register" element={<HospitalRegister />} />
          <Route path="/hospital/dashboard" element={<HospitalDashboard />} />
        </Routes>
      </div>
      <Footer />

      {/* CareMate Floating Widget - lazy mounted on demand */}
      <div className="fixed bottom-4 right-4 z-50">
        {careMateMounted ? (
          <Suspense fallback={null}>
            <CareMate initialMinimized={!careMateShouldOpen} />
          </Suspense>
        ) : (
          <button
            onClick={() => handleOpenCareMate(true)}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-3 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
          >
            Need help? Open CareMate
          </button>
        )}
      </div>
    </>
  );
};

export default App;