import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const SPECIALITIES = [
  "General physician", "Gynecologist", "Dermatologist",
  "Pediatricians", "Neurologist", "Gastroenterologist",
];

const EXPERIENCE_OPTIONS = [
  "1 Year", "2 Years", "3 Years", "4 Years", "5 Years",
  "6 Years", "7 Years", "8 Years", "9 Years", "10+ Years",
];

const inputCls = "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-500 transition-all";

const Field = ({ label, required, children }) => (
  <div>
    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
      {label} {required && <span className="text-red-400">*</span>}
    </label>
    {children}
  </div>
);

const DoctorDashboard = () => {
  const { backendUrl, token, userData, loadUserProfileData } = useContext(AppContext);
  const navigate = useNavigate();

  const [profileExists, setProfileExists] = useState(false);
  const [loading, setLoading]             = useState(true);
  const [saving, setSaving]               = useState(false);
  const [isUploading, setIsUploading]     = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [activeTab, setActiveTab]         = useState("profile");

  const [imageFile, setImageFile]         = useState(null);
  const [imagePreview, setImagePreview]   = useState(null);
  const [speciality, setSpeciality]       = useState("");
  const [degree, setDegree]               = useState("");
  const [experience, setExperience]       = useState("");
  const [fees, setFees]                   = useState("");
  const [about, setAbout]                 = useState("");
  const [available, setAvailable]         = useState(true);
  const [city, setCity]                   = useState("");
  const [hospitalId, setHospitalId]       = useState("");
  const [addressLine1, setAddressLine1]   = useState("");
  const [addressLine2, setAddressLine2]   = useState("");
  const [appointments, setAppointments]   = useState([]);

  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    if (userData) {
      if (userData.role !== "doctor") {
        toast.error("Access denied. Doctors only.");
        navigate("/");
        return;
      }
      if (userData.doctorId) {
        setProfileExists(true);
        fetchDoctorProfile();
        fetchAppointments();
      } else {
        if (userData.city) setCity(userData.city);
        setLoading(false);
      }
    }
  }, [token, userData]);

  const fetchDoctorProfile = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(backendUrl + "/api/doctor/profile-by-user", {
        headers: { token },
      });
      if (data.success) {
        const p = data.profileData;
        setImagePreview(p.image || null);
        setSpeciality(p.speciality || "");
        setDegree(p.degree || "");
        setExperience(p.experience || "");
        setFees(p.fees || "");
        setAbout(p.about || "");
        setAvailable(p.available ?? true);
        setCity(p.city || "");
        setHospitalId(p.hospitalId || "");
        setAddressLine1(p.address?.line1 || "");
        setAddressLine2(p.address?.line2 || "");
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error("Could not load profile.");
    } finally {
      setLoading(false);
    }
  };

  const fetchAppointments = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/doctor/appointments-by-user", {
        headers: { token },
      });
      if (data.success) setAppointments(data.appointments);
    } catch {}
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("Image must be under 5MB."); return; }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!speciality || !degree || !experience || !fees || !city) {
      toast.error("Please fill all required fields.");
      return;
    }
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("fees", fees);
      formData.append("about", about);
      formData.append("experience", experience);
      formData.append("available", available);
      formData.append("city", city);
      if (hospitalId) formData.append("hospitalId", hospitalId);
      formData.append("address", JSON.stringify({ line1: addressLine1, line2: addressLine2 }));
      if (imageFile) formData.append("image", imageFile);

      if (!profileExists) {
        formData.append("name", userData.name);
        formData.append("email", userData.email);
        formData.append("speciality", speciality);
        formData.append("degree", degree);

        if (imageFile) setIsUploading(true);
        const { data } = await axios.post(
          backendUrl + "/api/doctor/register",
          formData,
          {
            headers: { token },
            onUploadProgress: (e) => setUploadProgress(Math.round((e.loaded * 100) / e.total)),
          }
        );
        setIsUploading(false);

        if (data.success) {
          toast.success("Doctor profile created! You now appear in the city listing.");
          setProfileExists(true);
          await loadUserProfileData();
        } else {
          toast.error(data.message);
        }
      } else {
        if (imageFile) setIsUploading(true);
        const { data } = await axios.post(
          backendUrl + "/api/doctor/update-profile-by-user",
          formData,
          {
            headers: { token },
            onUploadProgress: (e) => setUploadProgress(Math.round((e.loaded * 100) / e.total)),
          }
        );
        setIsUploading(false);

        if (data.success) {
          toast.success("Profile updated!");
          setImageFile(null);
        } else {
          toast.error(data.message);
        }
      }
    } catch (err) {
      toast.error(err.message);
      setIsUploading(false);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <svg className="w-8 h-8 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-sm">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">

      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center">
          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Doctor Dashboard</h1>
          <p className="text-sm text-gray-500">
            {profileExists ? `Welcome back, ${userData?.name}` : "Complete your profile to appear in listings"}
          </p>
        </div>
        {profileExists && (
          <div className={`ml-auto flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full ${available ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-500"}`}>
            <span className={`w-2 h-2 rounded-full ${available ? "bg-green-500" : "bg-gray-400"}`} />
            {available ? "Listed & Available" : "Not Available"}
          </div>
        )}
      </div>

      <div className="flex border-b border-gray-200 mb-8">
        {[
          { id: "profile", label: "My Profile" },
          { id: "appointments", label: `Appointments${appointments.length > 0 ? ` (${appointments.length})` : ""}` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 text-sm font-semibold transition-all border-b-2 ${activeTab === tab.id ? "border-blue-600 text-blue-600" : "border-transparent text-gray-400 hover:text-gray-600"}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "profile" && (
        <form onSubmit={handleSave} className="space-y-8">

          {!profileExists && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 text-sm text-amber-700 flex items-start gap-3">
              <svg className="w-5 h-5 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="font-semibold mb-0.5">Profile not set up yet</p>
                <p className="text-amber-600">Fill in your details below to appear in the MediBridge city listing.</p>
              </div>
            </div>
          )}

          <div className="bg-gray-50 rounded-2xl p-6 flex items-center gap-6">
            <div className="w-24 h-24 rounded-2xl overflow-hidden bg-blue-100 flex items-center justify-center border-2 border-blue-200 shrink-0">
              {imagePreview ? (
                <img src={imagePreview} alt="profile" className="w-full h-full object-cover" />
              ) : (
                <svg className="w-10 h-10 text-blue-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-700 mb-1">Profile Photo</p>
              <p className="text-xs text-gray-400 mb-3">JPG or PNG, max 5MB. Stored on Cloudinary.</p>
              <label className="cursor-pointer inline-flex items-center gap-2 text-xs font-semibold text-blue-600 border border-blue-200 rounded-lg px-4 py-2 hover:bg-blue-50 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {imagePreview ? "Change photo" : "Upload photo"}
                <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              </label>
              {isUploading && (
                <div className="mt-2">
                  <div className="h-1.5 w-full bg-blue-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${uploadProgress}%` }} />
                  </div>
                  <p className="text-xs text-blue-500 mt-1">Uploading... {uploadProgress}%</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-5">
            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Professional Info</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field label="Speciality" required>
                <select value={speciality} onChange={(e) => setSpeciality(e.target.value)} disabled={profileExists} required className={inputCls + (profileExists ? " bg-gray-50 cursor-not-allowed" : "")}>
                  <option value="">Select speciality</option>
                  {SPECIALITIES.map((s) => <option key={s}>{s}</option>)}
                </select>
                {profileExists && <p className="text-xs text-gray-400 mt-1">Cannot be changed after setup.</p>}
              </Field>
              <Field label="Degree / Qualification" required>
                <input type="text" value={degree} onChange={(e) => setDegree(e.target.value)} placeholder="MBBS, MD, etc." disabled={profileExists} required className={inputCls + (profileExists ? " bg-gray-50 cursor-not-allowed" : "")} />
              </Field>
              <Field label="Experience" required>
                <select value={experience} onChange={(e) => setExperience(e.target.value)} required className={inputCls}>
                  <option value="">Select experience</option>
                  {EXPERIENCE_OPTIONS.map((o) => <option key={o}>{o}</option>)}
                </select>
              </Field>
              <Field label="Consultation Fees (₹)" required>
                <input type="number" value={fees} onChange={(e) => setFees(e.target.value)} placeholder="e.g. 500" min="0" required className={inputCls} />
              </Field>
              <Field label="City" required>
                <input type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Pune" required className={inputCls} />
              </Field>
              <Field label="Hospital ID (optional)">
                <input type="text" value={hospitalId} onChange={(e) => setHospitalId(e.target.value)} placeholder="Paste hospital ID" className={inputCls} />
              </Field>
            </div>
            <Field label="About / Bio">
              <textarea value={about} onChange={(e) => setAbout(e.target.value)} placeholder="Tell patients about your expertise, approach, and experience..." rows={4} className={inputCls + " resize-none"} />
            </Field>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-5">
            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Clinic / Hospital Address</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field label="Address Line 1">
                <input type="text" value={addressLine1} onChange={(e) => setAddressLine1(e.target.value)} placeholder="Street, Building" className={inputCls} />
              </Field>
              <Field label="Address Line 2">
                <input type="text" value={addressLine2} onChange={(e) => setAddressLine2(e.target.value)} placeholder="City, State, PIN" className={inputCls} />
              </Field>
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-gray-700">Available for appointments</p>
                <p className="text-xs text-gray-400 mt-0.5">Toggle off to temporarily hide yourself from listings</p>
              </div>
              <button type="button" onClick={() => setAvailable((v) => !v)} className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${available ? "bg-green-500" : "bg-gray-300"}`}>
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 ${available ? "translate-x-6" : ""}`} />
              </button>
            </div>
          </div>

          <button type="submit" disabled={saving || isUploading} className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold text-sm tracking-wide hover:bg-blue-700 active:scale-[0.98] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {saving ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                {profileExists ? "Saving changes..." : "Creating profile..."}
              </>
            ) : profileExists ? "Save Changes" : "Create My Profile"}
          </button>
        </form>
      )}

      {activeTab === "appointments" && (
        <div>
          {appointments.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <svg className="w-12 h-12 mx-auto mb-3 opacity-40" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="font-medium">No appointments yet</p>
              <p className="text-sm mt-1">Appointments will appear here once patients book with you.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {appointments.map((appt, i) => (
                <div key={i} className="flex items-center justify-between bg-white border border-gray-100 rounded-xl px-5 py-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                      {appt.userData?.name?.[0] || "P"}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{appt.userData?.name || "Patient"}</p>
                      <p className="text-xs text-gray-400">{appt.slotDate} · {appt.slotTime}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {appt.cancelled ? (
                      <span className="text-xs font-semibold text-red-400 bg-red-50 px-3 py-1 rounded-full">Cancelled</span>
                    ) : appt.isCompleted ? (
                      <span className="text-xs font-semibold text-green-600 bg-green-50 px-3 py-1 rounded-full">Completed</span>
                    ) : (
                      <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">Upcoming</span>
                    )}
                    <span className="text-sm font-bold text-gray-700">₹{appt.amount}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DoctorDashboard;