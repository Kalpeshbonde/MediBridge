import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

// ── Reusable field components ──────────────────────────────────────────────────
const FieldLabel = ({ children }) => (
  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
    {children}
  </label>
);

const ReadValue = ({ value }) => (
  <p className="text-sm text-gray-800 font-medium py-2">{value || <span className="text-gray-300">—</span>}</p>
);

const TextInput = ({ value, onChange, placeholder, type = "text", ...rest }) => (
  <input
    type={type} value={value ?? ""} onChange={onChange} placeholder={placeholder}
    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800
               placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/30
               focus:border-primary transition-all"
    {...rest}
  />
);

// ── Component ──────────────────────────────────────────────────────────────────
const MyProfile = () => {
  const { userData, backendUrl, token, loadUserProfileData } = useContext(AppContext);

  const [isEdit,        setIsEdit]        = useState(false);
  const [imageFile,     setImageFile]     = useState(null);
  const [imagePreview,  setImagePreview]  = useState(null);
  const [saving,        setSaving]        = useState(false);

  const [form, setForm] = useState({
    name   : "",
    phone  : "",
    city   : "",
    dob    : "",
    gender : "",
    address: { line1: "", line2: "" },
  });

  // Pre-fill form whenever userData changes
  useEffect(() => {
    if (userData) {
      setForm({
        name   : userData.name    ?? "",
        phone  : userData.phone   ?? "",
        city   : userData.city    ?? "",
        dob    : userData.dob     ?? "",
        gender : userData.gender  ?? "",
        address: {
          line1: userData.address?.line1 ?? "",
          line2: userData.address?.line2 ?? "",
        },
      });
    }
  }, [userData]);

  const patch = (key, val) => setForm((f) => ({ ...f, [key]: val }));
  const patchAddress = (key, val) =>
    setForm((f) => ({ ...f, address: { ...f.address, [key]: val } }));

  // ── image handling ──────────────────────────────────────────────────────────
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("Image must be under 5 MB"); return; }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  // ── save ────────────────────────────────────────────────────────────────────
  const saveProfile = async () => {
    try {
      setSaving(true);
      const fd = new FormData();
      fd.append("name",    form.name);
      fd.append("phone",   form.phone);
      fd.append("city",    form.city);
      fd.append("dob",     form.dob);
      fd.append("gender",  form.gender);
      fd.append("address", JSON.stringify(form.address));
      if (imageFile) fd.append("image", imageFile);

      const { data } = await axios.post(
        `${backendUrl}/api/user/update-profile`,
        fd,
        { headers: { token } }
      );

      if (data.success) {
        toast.success("Profile updated!");
        await loadUserProfileData();
        setIsEdit(false);
        setImageFile(null);
        setImagePreview(null);
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const cancelEdit = () => {
    setIsEdit(false);
    setImageFile(null);
    if (imagePreview) { URL.revokeObjectURL(imagePreview); setImagePreview(null); }
    // reset form back to saved userData
    if (userData) {
      setForm({
        name   : userData.name    ?? "",
        phone  : userData.phone   ?? "",
        city   : userData.city    ?? "",
        dob    : userData.dob     ?? "",
        gender : userData.gender  ?? "",
        address: { line1: userData.address?.line1 ?? "", line2: userData.address?.line2 ?? "" },
      });
    }
  };

  // ── loading ─────────────────────────────────────────────────────────────────
  if (!userData) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const displayImage = imagePreview || userData.image;

  return (
    <div className="max-w-2xl mx-auto pb-16">

      {/* Page heading */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your personal information</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

        {/* ── Hero / Photo Banner ─────────────────────────────────────────── */}
        <div className="bg-gradient-to-br from-primary to-blue-500 px-6 py-8">
          <div className="flex items-center gap-5">
            {/* Avatar + upload overlay */}
            <div className="relative shrink-0">
              <img
                src={displayImage} alt={userData.name}
                className="w-20 h-20 rounded-2xl object-cover ring-4 ring-white/30"
              />
              {isEdit && (
                <label
                  htmlFor="profile-image-input"
                  title="Change photo"
                  className="absolute -bottom-2 -right-2 w-7 h-7 bg-white rounded-full
                             flex items-center justify-center cursor-pointer shadow-md
                             hover:scale-110 transition-transform">
                  <svg className="w-3.5 h-3.5 text-primary" fill="none" stroke="currentColor"
                    strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536
                         L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  <input id="profile-image-input" type="file" accept="image/*"
                    className="hidden" onChange={handleImageChange} />
                </label>
              )}
            </div>

            {/* Name + meta */}
            <div>
              <h2 className="text-xl font-bold text-white leading-tight">{userData.name}</h2>
              <p className="text-white/70 text-sm">{userData.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="px-2.5 py-0.5 bg-white/20 text-white text-xs rounded-full capitalize font-medium">
                  {userData.role ?? "patient"}
                </span>
                {userData.gender && (
                  <span className="px-2.5 py-0.5 bg-white/20 text-white text-xs rounded-full capitalize font-medium">
                    {userData.gender}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Image preview notice */}
          {imagePreview && (
            <p className="text-xs text-white/80 mt-3 flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              New photo selected — save to apply
            </p>
          )}
        </div>

        {/* ── Form Body ───────────────────────────────────────────────────── */}
        <div className="p-6 space-y-6">

          {/* Full Name */}
          <div>
            <FieldLabel>Full Name</FieldLabel>
            {isEdit
              ? <TextInput value={form.name} onChange={(e) => patch("name", e.target.value)}
                  placeholder="Your full name" />
              : <ReadValue value={userData.name} />}
          </div>

          {/* Email — always read-only */}
          <div>
            <FieldLabel>Email Address</FieldLabel>
            <p className="text-sm text-gray-400 py-2 flex items-center gap-2">
              {userData.email}
              <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Read-only</span>
            </p>
          </div>

          {/* Phone */}
          <div>
            <FieldLabel>Phone Number</FieldLabel>
            {isEdit
              ? <TextInput value={form.phone} onChange={(e) => patch("phone", e.target.value)}
                  placeholder="+91 98765 43210" type="tel" />
              : <ReadValue value={userData.phone} />}
          </div>

          {/* City */}
          <div>
            <FieldLabel>City</FieldLabel>
            {isEdit
              ? <TextInput value={form.city} onChange={(e) => patch("city", e.target.value)}
                  placeholder="Pune" />
              : <ReadValue value={userData.city} />}
          </div>

          {/* DOB + Gender — 2-col grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <FieldLabel>Date of Birth</FieldLabel>
              {isEdit
                ? <TextInput value={form.dob} onChange={(e) => patch("dob", e.target.value)} type="date" />
                : <ReadValue value={userData.dob} />}
            </div>
            <div>
              <FieldLabel>Gender</FieldLabel>
              {isEdit ? (
                <select value={form.gender} onChange={(e) => patch("gender", e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800
                             focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
                             transition-all appearance-none bg-white">
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              ) : (
                <ReadValue value={userData.gender ? userData.gender.charAt(0).toUpperCase() + userData.gender.slice(1) : ""} />
              )}
            </div>
          </div>

          {/* Address */}
          <div>
            <FieldLabel>Address</FieldLabel>
            {isEdit ? (
              <div className="space-y-2">
                <TextInput
                  value={form.address.line1}
                  onChange={(e) => patchAddress("line1", e.target.value)}
                  placeholder="Address line 1 (street, building)"
                />
                <TextInput
                  value={form.address.line2}
                  onChange={(e) => patchAddress("line2", e.target.value)}
                  placeholder="Address line 2 (city, state, pincode)"
                />
              </div>
            ) : (
              <ReadValue
                value={
                  userData.address?.line1
                    ? [userData.address.line1, userData.address.line2].filter(Boolean).join(", ")
                    : ""
                }
              />
            )}
          </div>
        </div>

        {/* ── Action Bar ──────────────────────────────────────────────────── */}
        <div className="px-6 pb-6 flex items-center gap-3 flex-wrap">
          {isEdit ? (
            <>
              <button onClick={saveProfile} disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl
                           text-sm font-semibold hover:bg-primary/90 transition-colors
                           disabled:opacity-60 disabled:cursor-not-allowed shadow-sm shadow-primary/20">
                {saving ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Saving…
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Save Changes
                  </>
                )}
              </button>

              <button onClick={cancelEdit}
                className="px-6 py-2.5 text-gray-600 border border-gray-200 rounded-xl text-sm
                           font-semibold hover:bg-gray-50 transition-colors">
                Cancel
              </button>
            </>
          ) : (
            <button onClick={() => setIsEdit(true)}
              className="flex items-center gap-2 px-6 py-2.5 border border-primary text-primary
                         rounded-xl text-sm font-semibold hover:bg-primary/5 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536
                     L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              Edit Profile
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyProfile;