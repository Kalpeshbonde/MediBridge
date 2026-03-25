import React, { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

// ── helpers ────────────────────────────────────────────────────────────────────
const dateKey   = (d) => `${d.getDate()}_${d.getMonth() + 1}_${d.getFullYear()}`;
const fmtTime   = (d) => d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
const fmtDisplay = (d) => `${d.getDate()} ${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;

// Generate 10:00 AM – 06:00 PM slots in 30-min steps for the next 7 days
function buildWeekSlots(slotsBooked = {}) {
  const week = [];
  const now  = new Date();

  for (let i = 0; i < 7; i++) {
    const day = new Date(now);
    day.setDate(now.getDate() + i);
    day.setHours(0, 0, 0, 0);

    const key    = dateKey(day);
    const booked = slotsBooked[key] || [];
    const slots  = [];

    for (let h = 10; h < 18; h++) {
      for (const m of [0, 30]) {
        const slot = new Date(day);
        slot.setHours(h, m);
        if (i === 0 && slot <= now) continue; // skip past slots for today
        const t = fmtTime(slot);
        slots.push({ time: t, booked: booked.includes(t) });
      }
    }

    week.push({
      date    : day,
      key,
      label   : i === 0 ? "Today" : i === 1 ? "Tomorrow" : DAY_NAMES[day.getDay()],
      dayNum  : day.getDate(),
      slots,
    });
  }
  return week;
}

// ── Component ──────────────────────────────────────────────────────────────────
const Appointment = () => {
  const { docId } = useParams();
  const { doctors, currencySymbol, backendUrl, token, selectedCity, api, backendError } = useContext(AppContext);
  const navigate                        = useNavigate();

  const [docInfo,      setDocInfo]      = useState(null);
  const [weekSlots,    setWeekSlots]    = useState([]);
  const [selectedDay,  setSelectedDay]  = useState(0);
  const [selectedTime, setSelectedTime] = useState("");
  const [booking,      setBooking]      = useState(false);
  const [fetchingDoc,  setFetchingDoc]  = useState(true);

  // ── fetch doctor (context first, then API for slots_booked) ─────────────────
  useEffect(() => {
    const load = async () => {
      setFetchingDoc(true);
      try {
        // Try context for display info (fast); also fetch full doc for slots_booked
        const cached = doctors.find((d) => d._id === docId);
        if (cached) setDocInfo(cached);

        if (!api) {
          throw new Error(backendError || "Backend not configured");
        }

        const { data } = await api.get(`/api/doctor/${docId}`);
        if (data.success) {
          setDocInfo(data.doctor);
          setWeekSlots(buildWeekSlots(data.doctor.slots_booked || {}));
        } else if (cached) {
          setWeekSlots(buildWeekSlots({}));
        } else {
          toast.error("Doctor not found");
          navigate("/doctors");
        }
      } catch (err) {
        console.error(err);
        if (doctors.find((d) => d._id === docId)) {
          setWeekSlots(buildWeekSlots({}));
        } else {
          toast.error("Could not load doctor info");
          navigate("/doctors");
        }
      } finally {
        setFetchingDoc(false);
      }
    };
    load();
  }, [docId, doctors]);

  // ── reset selected time when day changes ────────────────────────────────────
  const selectDay = (idx) => { setSelectedDay(idx); setSelectedTime(""); };

  // ── book appointment ────────────────────────────────────────────────────────
  const handleBook = async () => {
    if (!token) { toast.warn("Please login to book an appointment"); return navigate("/login"); }
    if (selectedCity && docInfo?.city && docInfo.city !== selectedCity) {
      toast.warn("Please switch to this doctor's city to book.");
      return;
    }
    if (!selectedTime) { toast.warn("Please select a time slot"); return; }

    try {
      setBooking(true);
      if (!api) {
        throw new Error(backendError || "Backend not configured");
      }

      const { data } = await api.post(
        "/api/user/book-appointment",
        { docId, slotDate: weekSlots[selectedDay].key, slotTime: selectedTime }
      );
      if (data.success) {
        toast.success("Appointment booked successfully! 🎉");
        navigate("/my-appointments");
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBooking(false);
    }
  };

  // ── loading skeleton ────────────────────────────────────────────────────────
  if (fetchingDoc || !docInfo) {
    return (
      <div className="max-w-5xl mx-auto pb-16 animate-pulse space-y-6">
        <div className="flex flex-col md:flex-row gap-6 bg-white rounded-2xl border border-gray-100 p-6">
          <div className="w-full md:w-48 h-48 bg-gray-200 rounded-xl shrink-0" />
          <div className="flex-1 space-y-3 pt-2">
            <div className="h-5 bg-gray-200 rounded w-2/5" />
            <div className="h-3 bg-gray-200 rounded w-1/3" />
            <div className="h-3 bg-gray-200 rounded w-3/4 mt-4" />
            <div className="h-3 bg-gray-200 rounded w-2/3" />
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
          <div className="h-5 bg-gray-200 rounded w-1/4" />
          <div className="flex gap-3">
            {[1,2,3,4,5,6,7].map(i => <div key={i} className="w-[70px] h-16 bg-gray-200 rounded-xl" />)}
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            {[...Array(12)].map((_, i) => <div key={i} className="w-24 h-9 bg-gray-200 rounded-xl" />)}
          </div>
        </div>
      </div>
    );
  }

  const today      = weekSlots[selectedDay];
  const freeSlots  = today?.slots.filter((s) => !s.booked) ?? [];
  const bookedCount = today?.slots.filter((s) => s.booked).length ?? 0;

  return (
    <div className="max-w-5xl mx-auto pb-16">

      {/* ── Doctor Card ───────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row gap-6 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
        {/* Photo */}
        <div className="w-full md:w-52 md:h-52 shrink-0">
          <img
            src={docInfo.image} alt={docInfo.name}
            className="w-full h-52 md:h-full object-cover rounded-xl"
          />
        </div>

        {/* Info */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-bold text-gray-800">{docInfo.name}</h2>
            {docInfo.available !== false && (
              <span className="flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-600 rounded-full text-xs font-medium">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                Available
              </span>
            )}
          </div>

          <p className="text-sm text-gray-500 mb-1">
            {docInfo.degree} · {docInfo.speciality}
            {docInfo.experience && <> · <span className="text-primary font-medium">{docInfo.experience}</span></>}
          </p>

          {docInfo.about && (
            <p className="text-sm text-gray-600 leading-relaxed mt-3 line-clamp-3">{docInfo.about}</p>
          )}

          <div className="flex flex-wrap gap-4 mt-4">
            <div className="flex items-center gap-2 bg-primary/5 px-3 py-2 rounded-xl">
              <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6
                     a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
              </svg>
              <span className="text-sm font-semibold text-primary">
                {currencySymbol}{docInfo.fees} per visit
              </span>
            </div>

            {docInfo.address?.line1 && (
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243
                       a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {docInfo.address.line1}
              </div>
            )}

            {(docInfo.city || docInfo.hospital?.name) && (
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>
                  {[docInfo.city, docInfo.hospital?.name].filter(Boolean).join(" - ")}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedCity && docInfo?.city && docInfo.city !== selectedCity && (
        <div className="mb-6 bg-amber-50 border border-amber-200 text-amber-700 text-sm px-4 py-3 rounded-xl">
          This doctor is listed in {docInfo.city}. Switch your city to book an appointment.
        </div>
      )}

      {/* ── Booking Panel ─────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-base font-bold text-gray-800 mb-5">Select Appointment Date &amp; Time</h3>

        {/* Day Picker */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none">
          {weekSlots.map((day, i) => (
            <button key={i} onClick={() => selectDay(i)}
              className={`flex flex-col items-center px-4 py-3 rounded-xl shrink-0 border-2 transition-all
                          duration-200 min-w-[72px]
                          ${selectedDay === i
                            ? "border-primary bg-primary text-white shadow-sm shadow-primary/20"
                            : "border-gray-200 text-gray-600 hover:border-primary/40 hover:bg-primary/5"}`}>
              <span className="text-[10px] font-semibold uppercase tracking-wider mb-1">{day.label}</span>
              <span className="text-lg font-bold leading-none">{day.dayNum}</span>
              <span className="text-[10px] mt-1 opacity-70">{MONTH_NAMES[day.date.getMonth()]}</span>
            </button>
          ))}
        </div>

        {/* Slot availability summary */}
        <div className="flex items-center gap-4 mb-4">
          <p className="text-sm font-semibold text-gray-700">
            {fmtDisplay(weekSlots[selectedDay]?.date)}
          </p>
          <span className="text-xs text-gray-400">
            {freeSlots.length} slot{freeSlots.length !== 1 ? "s" : ""} available
            {bookedCount > 0 && ` · ${bookedCount} booked`}
          </span>
        </div>

        {/* Time Slot Grid */}
        {freeSlots.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed border-gray-200 rounded-xl mb-6">
            <svg className="w-8 h-8 text-gray-300 mb-2" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-gray-400 font-medium">No available slots for this day</p>
            <p className="text-xs text-gray-400 mt-1">Please try another date</p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2 mb-6">
            {today?.slots.map((slot, i) => (
              <button key={i} disabled={slot.booked} onClick={() => setSelectedTime(slot.time)}
                className={`px-4 py-2.5 rounded-xl text-xs font-semibold border-2 transition-all duration-200
                            ${slot.booked
                              ? "border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed line-through"
                              : selectedTime === slot.time
                                ? "border-primary bg-primary text-white shadow-sm shadow-primary/20 scale-105"
                                : "border-gray-200 text-gray-600 hover:border-primary/50 hover:text-primary hover:bg-primary/5"}`}>
                {slot.time}
              </button>
            ))}
          </div>
        )}

        {/* Booking Summary + CTA */}
        {selectedTime && (
          <div className="bg-primary/5 border border-primary/20 rounded-xl px-4 py-3 mb-5 flex items-center gap-3">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-semibold text-primary">Appointment Summary</p>
              <p className="text-xs text-gray-600 mt-0.5">
                {docInfo.name} · {fmtDisplay(weekSlots[selectedDay]?.date)} · {selectedTime}
              </p>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <button onClick={handleBook} disabled={booking || !selectedTime}
            className="flex-1 sm:flex-none sm:px-8 py-3.5 bg-primary text-white rounded-xl font-semibold
                       text-sm tracking-wide hover:bg-primary/90 active:scale-[0.98] transition-all
                       duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center
                       justify-center gap-2">
            {booking ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Booking...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Book Appointment
              </>
            )}
          </button>

          <button onClick={() => navigate("/doctors")}
            className="flex-1 sm:flex-none sm:px-6 py-3.5 text-gray-600 border border-gray-200 rounded-xl
                       font-semibold text-sm hover:bg-gray-50 transition-colors">
            Browse Doctors
          </button>
        </div>
      </div>
    </div>
  );
};

export default Appointment;