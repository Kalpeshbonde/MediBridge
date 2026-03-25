import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const fmtDate = (slotDate) => {
  if (!slotDate) return "—";
  const [d, m, y] = slotDate.split("_");
  return `${d} ${MONTHS[parseInt(m, 10) - 1]} ${y}`;
};

const STATUS = {
  upcoming  : { bg: "bg-blue-50",   text: "text-blue-700",  dot: "bg-blue-500",   label: "Upcoming"   },
  completed : { bg: "bg-green-50",  text: "text-green-700", dot: "bg-green-500",  label: "Completed"  },
  cancelled : { bg: "bg-red-50",    text: "text-red-600",   dot: "bg-red-400",    label: "Cancelled"  },
};

const getStatus = (apt) =>
  apt.cancelled ? "cancelled" : apt.isCompleted ? "completed" : "upcoming";

// ── Component ──────────────────────────────────────────────────────────────────
const MyAppointments = () => {
  const { api, backendError, token } = useContext(AppContext);
  const navigate              = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [activeTab,    setActiveTab]    = useState("upcoming");
  const [cancellingId, setCancellingId] = useState(null);

  // ── fetch ──────────────────────────────────────────────────────────────────
  const fetchAppointments = async () => {
    try {
      setLoading(true);
      if (!api) {
        throw new Error(backendError || "Backend not configured");
      }

      const { data } = await api.get("/api/user/appointments");
      if (data.success) {
        setAppointments([...data.appointments].reverse());
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchAppointments();
    else navigate("/login");
  }, [token]);

  // ── cancel ─────────────────────────────────────────────────────────────────
  const cancelAppointment = async (appointmentId) => {
    try {
      setCancellingId(appointmentId);
      if (!api) {
        throw new Error(backendError || "Backend not configured");
      }

      const { data } = await api.post("/api/user/cancel-appointment", { appointmentId });
      if (data.success) {
        toast.success("Appointment cancelled.");
        fetchAppointments();
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setCancellingId(null);
    }
  };

  // ── categorise ─────────────────────────────────────────────────────────────
  const groups = {
    upcoming  : appointments.filter((a) => !a.cancelled && !a.isCompleted),
    completed : appointments.filter((a) =>  a.isCompleted),
    cancelled : appointments.filter((a) =>  a.cancelled),
  };

  const tabs = [
    { key: "upcoming",  label: "Upcoming",  icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
    { key: "completed", label: "Completed", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
    { key: "cancelled", label: "Cancelled", icon: "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" },
  ];

  // ── skeleton ────────────────────────────────────────────────────────────────
  const Skeleton = () => (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
          <div className="flex gap-4">
            <div className="w-16 h-16 bg-gray-200 rounded-xl shrink-0" />
            <div className="flex-1 space-y-2.5 py-1">
              <div className="h-4  bg-gray-200 rounded w-1/3" />
              <div className="h-3  bg-gray-200 rounded w-1/4" />
              <div className="h-3  bg-gray-200 rounded w-1/2 mt-1" />
            </div>
            <div className="w-20 h-6 bg-gray-200 rounded-full self-start" />
          </div>
        </div>
      ))}
    </div>
  );

  // ── empty state ─────────────────────────────────────────────────────────────
  const Empty = ({ tab }) => (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
        <svg className="w-7 h-7 text-gray-300" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
      <p className="text-gray-500 font-semibold">No {tab} appointments</p>
      <p className="text-gray-400 text-sm mt-1">
        {tab === "upcoming" ? "You have no upcoming bookings." : `Nothing here yet.`}
      </p>
      {tab === "upcoming" && (
        <button onClick={() => navigate("/doctors")}
          className="mt-5 px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold
                     hover:bg-primary/90 transition-colors shadow-sm shadow-primary/20">
          Book an Appointment
        </button>
      )}
    </div>
  );

  // ── appointment card ────────────────────────────────────────────────────────
  const AppointmentCard = ({ apt }) => {
    const status = getStatus(apt);
    const cfg    = STATUS[status];
    const isCancelling = cancellingId === apt._id;

    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md
                      transition-all duration-200 overflow-hidden">
        <div className="p-5">
          <div className="flex gap-4 items-start">
            {/* Doctor avatar */}
            <div className="shrink-0">
              {apt.docData?.image ? (
                <img src={apt.docData.image} alt={apt.docData?.name}
                  className="w-16 h-16 rounded-xl object-cover border border-gray-100" />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center">
                  <span className="text-lg font-bold text-primary">
                    {apt.docData?.name?.[0] ?? "D"}
                  </span>
                </div>
              )}
            </div>

            {/* Main info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 flex-wrap">
                <div>
                  <h3 className="font-semibold text-gray-800 text-sm">{apt.docData?.name ?? "Doctor"}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{apt.docData?.speciality ?? "Specialist"}</p>
                </div>
                {/* Status badge */}
                <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text} shrink-0`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                  {cfg.label}
                </span>
              </div>

              {/* Meta row */}
              <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3">
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {fmtDate(apt.slotDate)}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {apt.slotTime}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2
                         m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1
                         c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Fee: ${apt.amount}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action bar — upcoming only */}
        {status === "upcoming" && (
          <div className="flex gap-3 px-5 py-3 bg-gray-50 border-t border-gray-100">
            <button
              onClick={() => cancelAppointment(apt._id)}
              disabled={isCancelling}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-red-500
                         border border-red-200 rounded-xl hover:bg-red-50 transition-colors
                         disabled:opacity-50 disabled:cursor-not-allowed">
              {isCancelling ? (
                <>
                  <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Cancelling…
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Cancel Appointment
                </>
              )}
            </button>
          </div>
        )}
      </div>
    );
  };

  // ── render ──────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-3xl mx-auto pb-16">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">My Appointments</h1>
        <p className="text-sm text-gray-500 mt-1">Track and manage all your bookings</p>
      </div>

      {/* Tab Bar */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-xl mb-6 w-fit overflow-x-auto">
        {tabs.map((tab) => {
          const count  = groups[tab.key].length;
          const active = activeTab === tab.key;
          return (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold
                          transition-all duration-200 whitespace-nowrap
                          ${active ? "bg-white text-primary shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d={tab.icon} />
              </svg>
              {tab.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold
                                ${active ? "bg-primary/10 text-primary" : "bg-gray-200 text-gray-500"}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      {loading ? (
        <Skeleton />
      ) : groups[activeTab].length === 0 ? (
        <Empty tab={activeTab} />
      ) : (
        <div className="space-y-4">
          {groups[activeTab].map((apt) => (
            <AppointmentCard key={apt._id} apt={apt} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyAppointments;