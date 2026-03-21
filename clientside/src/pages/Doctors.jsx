import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { DEFAULT_DOCTORS, getInitials, getAvatarColor } from "../data/defaultDoctors";

const SPECIALITIES = [
  "General physician",
  "Gynecologist",
  "Dermatologist",
  "Pediatricians",
  "Neurologist",
  "Gastroenterologist",
];

const DoctorCard = ({ item, index, onClick }) => {
  const initials = getInitials(item.name);
  const { bg, text } = getAvatarColor(index);

  return (
    <div
      onClick={onClick}
      className="border border-blue-100 rounded-2xl overflow-hidden cursor-pointer hover:-translate-y-2 transition-all duration-300 bg-white shadow-sm hover:shadow-md group"
    >
      {/* Image / Avatar */}
      <div className="overflow-hidden aspect-square" style={{ background: bg }}>
        {item.image ? (
          <img
            className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
            src={item.image}
            alt={item.name}
            onError={(e) => {
              e.target.style.display = "none";
              e.target.parentElement.innerHTML = `
                <div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:${bg};">
                  <span style="font-size:2.5rem;font-weight:700;color:${text};">${initials}</span>
                </div>`;
            }}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2">
            <span style={{ fontSize: "2.5rem", fontWeight: 700, color: text }}>{initials}</span>
            <span style={{ fontSize: "0.65rem", color: text, opacity: 0.7, fontWeight: 500 }}>
              Photo not added
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3.5">
        <div className={`flex items-center gap-1.5 text-xs font-medium mb-1.5 ${
          item.available ? "text-green-500" : "text-gray-400"
        }`}>
          <span className={`w-2 h-2 rounded-full ${item.available ? "bg-green-500" : "bg-gray-300"}`} />
          {item.available ? "Available" : "Not Available"}
        </div>
        <p className="text-gray-900 font-semibold text-sm leading-tight">{item.name}</p>
        <p className="text-gray-500 text-xs mt-0.5">{item.speciality}</p>
        {(item.experience || item.fees) && (
          <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-gray-100">
            {item.experience && <span className="text-xs text-gray-400">{item.experience}</span>}
            {item.fees && <span className="text-xs font-semibold text-primary">₹{item.fees}</span>}
          </div>
        )}
      </div>
    </div>
  );
};

const Doctors = () => {
  const { speciality } = useParams();
  const [filterDoc, setFilterDoc] = useState([]);
  const [showFilter, setShowFilter] = useState(false);
  const navigate = useNavigate();
  const { doctors } = useContext(AppContext);

  // Use real backend data if available, otherwise fall back to defaults
  const sourceData = doctors.length > 0 ? doctors : DEFAULT_DOCTORS;

  useEffect(() => {
    if (speciality) {
      setFilterDoc(sourceData.filter((doc) => doc.speciality === speciality));
    } else {
      setFilterDoc(sourceData);
    }
  }, [doctors, speciality]);

  return (
    <div className="pb-10">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Top Doctors to Book</h1>
        <p className="text-gray-500 text-sm">Simply browse through our extensive list of trusted doctors.</p>
        {doctors.length === 0 && (
          <p className="text-xs text-amber-500 bg-amber-50 border border-amber-100 px-4 py-2 rounded-full inline-block mt-3">
            Showing sample doctors — connect your backend to display real data
          </p>
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-start gap-6 mt-5">

        {/* Mobile filter toggle */}
        <button
          className={`py-1.5 px-4 border rounded-lg text-sm font-medium transition-all sm:hidden ${
            showFilter ? "bg-primary text-white border-primary" : "border-gray-300 text-gray-600"
          }`}
          onClick={() => setShowFilter((prev) => !prev)}
        >
          {showFilter ? "Hide Filters" : "Filters"}
        </button>

        {/* Sidebar */}
        <div className={`flex-col gap-2 text-sm ${showFilter ? "flex" : "hidden sm:flex"}`}>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1 pl-3 hidden sm:block">
            Speciality
          </p>
          {SPECIALITIES.map((spec) => (
            <p
              key={spec}
              onClick={() =>
                speciality === spec ? navigate("/doctors") : navigate(`/doctors/${spec}`)
              }
              className={`w-[94vw] sm:w-52 pl-4 py-2.5 pr-4 border rounded-xl transition-all cursor-pointer text-sm font-medium ${
                speciality === spec
                  ? "bg-indigo-50 border-indigo-300 text-indigo-700"
                  : "border-gray-200 text-gray-600 hover:border-primary hover:text-primary hover:bg-primary/5"
              }`}
            >
              {spec}
            </p>
          ))}
          {speciality && (
            <button
              onClick={() => navigate("/doctors")}
              className="mt-2 pl-4 py-2 text-sm text-red-400 hover:text-red-600 text-left transition-colors"
            >
              ✕ Clear filter
            </button>
          )}
        </div>

        {/* Cards grid */}
        <div className="w-full grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 gap-y-6">
          {filterDoc.length === 0 ? (
            <div className="col-span-full text-center py-20 text-gray-400">
              <p className="text-lg font-medium">No doctors found</p>
              <p className="text-sm mt-1">Try selecting a different speciality</p>
            </div>
          ) : (
            filterDoc.map((item, index) => (
              <DoctorCard
                key={item._id}
                item={item}
                index={index}
                onClick={() => navigate(`/appointment/${item._id}`)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Doctors;