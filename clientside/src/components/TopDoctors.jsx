import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { DEFAULT_DOCTORS, getInitials, getAvatarColor } from "../data/defaultDoctors";

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

const TopDoctors = () => {
  const navigate = useNavigate();
  const { doctors } = useContext(AppContext);

  // Use real backend data if available, otherwise fall back to defaults
  const displayDoctors = doctors.length > 0 ? doctors : DEFAULT_DOCTORS;

  return (
    <div className="flex flex-col items-center gap-4 my-16 text-gray-900 md:mx-10">
      <h1 className="text-3xl font-medium">Top Doctors to Book</h1>
      <p className="sm:w-1/3 text-center text-sm text-gray-500">
        Simply browse through our extensive list of trusted doctors.
      </p>

      {doctors.length === 0 && (
        <p className="text-xs text-amber-500 bg-amber-50 border border-amber-100 px-4 py-2 rounded-full">
          Showing sample doctors — connect your backend to display real data
        </p>
      )}

      <div className="w-full grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 pt-5 gap-y-6 px-3 sm:px-0">
        {displayDoctors.slice(0, 10).map((item, index) => (
          <DoctorCard
            key={item._id}
            item={item}
            index={index}
            onClick={() => {
              navigate(`/appointment/${item._id}`);
              scrollTo(0, 0);
            }}
          />
        ))}
      </div>

      <button
        onClick={() => { navigate("/doctors"); scrollTo(0, 0); }}
        className="bg-blue-50 text-gray-600 px-12 py-3 rounded-full mt-10 hover:bg-blue-100 transition-colors font-medium text-sm"
      >
        More Doctors
      </button>
    </div>
  );
};

export default TopDoctors;