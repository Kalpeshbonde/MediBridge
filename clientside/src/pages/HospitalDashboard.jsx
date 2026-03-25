import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const inputCls =
  "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-500 transition-all";

const HospitalDashboard = () => {
  const { backendUrl } = useContext(AppContext);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState("profile");

  const [hospital, setHospital] = useState(null);
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [description, setDescription] = useState("");
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  const [doctorId, setDoctorId] = useState("");
  const [doctorEmail, setDoctorEmail] = useState("");
  const [doctors, setDoctors] = useState([]);

  const token = localStorage.getItem("hospitalToken");

  const logout = () => {
    localStorage.removeItem("hospitalToken");
    window.dispatchEvent(new Event("hospital-token-changed"));
    navigate("/hospital/login");
  };

  const loadProfile = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/hospital/profile", {
        headers: { token },
      });
      if (data.success) {
        setHospital(data.hospital);
        setName(data.hospital.name || "");
        setCity(data.hospital.city || "");
        setDescription(data.hospital.description || "");
        setLogoPreview(data.hospital.logo || null);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const loadDoctors = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/hospital/doctors", {
        headers: { token },
      });
      if (data.success) setDoctors(data.doctors);
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (!token) {
      navigate("/hospital/login");
      return;
    }
    const load = async () => {
      setLoading(true);
      await Promise.all([loadProfile(), loadDoctors()]);
      setLoading(false);
    };
    load();
  }, [token]);

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Logo must be under 5MB.");
      return;
    }
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    if (!name || !city) {
      toast.error("Hospital name and city are required.");
      return;
    }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("name", name);
      fd.append("city", city);
      fd.append("description", description);
      if (logoFile) fd.append("logo", logoFile);

      const { data } = await axios.post(
        backendUrl + "/api/hospital/update-profile",
        fd,
        { headers: { token } }
      );
      if (data.success) {
        toast.success("Profile updated");
        await loadProfile();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  const linkDoctor = async (e) => {
    e.preventDefault();
    if (!doctorId && !doctorEmail) {
      toast.error("Enter doctor ID or email.");
      return;
    }
    try {
      const { data } = await axios.post(
        backendUrl + "/api/hospital/link-doctor",
        { doctorId, doctorEmail },
        { headers: { token } }
      );
      if (data.success) {
        toast.success("Doctor linked");
        setDoctorId("");
        setDoctorEmail("");
        await loadDoctors();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const unlinkDoctor = async (doctorId) => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/hospital/unlink-doctor",
        { doctorId },
        { headers: { token } }
      );
      if (data.success) {
        toast.success("Doctor unlinked");
        await loadDoctors();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
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
          <p className="text-sm">Loading hospital dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center">
          <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 4H7a2 2 0 01-2-2V5a2 2 0 012-2h5l5 5v12a2 2 0 01-2 2z" />
          </svg>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Hospital Dashboard</h1>
          <p className="text-sm text-gray-500">Manage your hospital profile and doctors</p>
        </div>
        <button
          onClick={logout}
          className="ml-auto text-xs font-semibold text-red-500 border border-red-200 px-3 py-1.5 rounded-full hover:bg-red-50"
        >
          Logout
        </button>
      </div>

      <div className="flex border-b border-gray-200 mb-8">
        {[
          { id: "profile", label: "Hospital Profile" },
          { id: "doctors", label: `Doctors${doctors.length ? " (" + doctors.length + ")" : ""}` },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setTab(item.id)}
            className={`px-6 py-3 text-sm font-semibold transition-all border-b-2 ${
              tab === item.id
                ? "border-emerald-600 text-emerald-600"
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === "profile" && (
        <form onSubmit={saveProfile} className="space-y-6">
          <div className="bg-gray-50 rounded-2xl p-6 flex items-center gap-6">
            <div className="w-24 h-24 rounded-2xl overflow-hidden bg-emerald-100 flex items-center justify-center border-2 border-emerald-200 shrink-0">
              {logoPreview ? (
                <img src={logoPreview} alt="logo" className="w-full h-full object-cover" />
              ) : (
                <svg className="w-10 h-10 text-emerald-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7V5a2 2 0 00-2-2H7a2 2 0 00-2 2v2m14 0v12a2 2 0 01-2 2H7a2 2 0 01-2-2V7m14 0H5m4 4h6m-6 4h6" />
                </svg>
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-700 mb-1">Hospital Logo</p>
              <p className="text-xs text-gray-400 mb-3">JPG or PNG, max 5MB.</p>
              <label className="cursor-pointer inline-flex items-center gap-2 text-xs font-semibold text-emerald-600 border border-emerald-200 rounded-lg px-4 py-2 hover:bg-emerald-50 transition-colors">
                Upload logo
                <input type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
              </label>
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Hospital Name
                </label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  City
                </label>
                <input type="text" value={city} onChange={(e) => setCity(e.target.value)} required className={inputCls} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className={inputCls + " resize-none"}
                placeholder="Brief description of your hospital"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-emerald-600 text-white py-4 rounded-xl font-semibold text-sm tracking-wide hover:bg-emerald-700 active:scale-[0.98] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      )}

      {tab === "doctors" && (
        <div className="space-y-6">
          <div className="bg-white border border-gray-100 rounded-2xl p-6">
            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4">Link a Doctor</h2>
            <form onSubmit={linkDoctor} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                value={doctorId}
                onChange={(e) => setDoctorId(e.target.value)}
                placeholder="Doctor ID"
                className={inputCls}
              />
              <input
                type="email"
                value={doctorEmail}
                onChange={(e) => setDoctorEmail(e.target.value)}
                placeholder="Doctor Email"
                className={inputCls}
              />
              <button
                type="submit"
                className="sm:col-span-2 bg-emerald-600 text-white py-3 rounded-xl font-semibold text-sm tracking-wide hover:bg-emerald-700 transition-all"
              >
                Link Doctor
              </button>
            </form>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Doctors</h2>
              <span className="text-xs text-gray-400">Hospital ID: {hospital?._id}</span>
            </div>

            {doctors.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                <p className="font-medium">No doctors linked yet</p>
                <p className="text-sm mt-1">Link doctors by ID or email to show under your hospital</p>
              </div>
            ) : (
              <div className="space-y-3">
                {doctors.map((doc) => (
                  <div key={doc._id} className="flex items-center justify-between border border-gray-100 rounded-xl px-4 py-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{doc.name}</p>
                      <p className="text-xs text-gray-400">{doc.speciality} · {doc.city || "City not set"}</p>
                      <p className="text-[11px] text-gray-300">{doc._id}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => unlinkDoctor(doc._id)}
                      className="text-xs font-semibold text-red-500 border border-red-200 px-3 py-1.5 rounded-full hover:bg-red-50"
                    >
                      Unlink
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default HospitalDashboard;
