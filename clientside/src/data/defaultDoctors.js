// defaultDoctors.js
// ─────────────────────────────────────────────────────────────────────────────
// These are placeholder doctors shown when the backend hasn't loaded data yet
// or when no image is provided.
// Doctors can replace these after onboarding once the backend is live.
// ─────────────────────────────────────────────────────────────────────────────

export const DEFAULT_DOCTORS = [
  {
    _id: "default_1",
    name: "Dr. Richard James",
    speciality: "General physician",
    available: true,
    experience: "8 Years",
    fees: 500,
    about: "A trusted general physician with 8 years of experience in primary care.",
    city: "Pune",
    image: null,
  },
  {
    _id: "default_2",
    name: "Dr. Emily Larson",
    speciality: "Gynecologist",
    available: true,
    experience: "5 Years",
    fees: 700,
    about: "Specialist in women's health and reproductive medicine.",
    city: "Mumbai",
    image: null,
  },
  {
    _id: "default_3",
    name: "Dr. Sarah Patel",
    speciality: "Dermatologist",
    available: true,
    experience: "6 Years",
    fees: 600,
    about: "Expert in skin conditions, cosmetic dermatology and skin care.",
    city: "Bangalore",
    image: null,
  },
  {
    _id: "default_4",
    name: "Dr. Christopher Lee",
    speciality: "Pediatricians",
    available: true,
    experience: "10 Years",
    fees: 800,
    about: "Dedicated pediatrician caring for children from newborns to teens.",
    city: "Pune",
    image: null,
  },
  {
    _id: "default_5",
    name: "Dr. Jennifer Garcia",
    speciality: "Neurologist",
    available: true,
    experience: "12 Years",
    fees: 1000,
    about: "Specialist in neurological disorders, headaches and brain health.",
    city: "Delhi",
    image: null,
  },
  {
    _id: "default_6",
    name: "Dr. Andrew Williams",
    speciality: "Gastroenterologist",
    available: true,
    experience: "7 Years",
    fees: 750,
    about: "Expert in digestive health, gut conditions and endoscopy.",
    city: "Hyderabad",
    image: null,
  },
  {
    _id: "default_7",
    name: "Dr. Christopher Davis",
    speciality: "General physician",
    available: false,
    experience: "9 Years",
    fees: 450,
    about: "Experienced general physician focused on preventive care.",
    city: "Mumbai",
    image: null,
  },
  {
    _id: "default_8",
    name: "Dr. Timothy White",
    speciality: "Gynecologist",
    available: true,
    experience: "4 Years",
    fees: 650,
    about: "Compassionate gynecologist specializing in maternal health.",
    city: "Pune",
    image: null,
  },
  {
    _id: "default_9",
    name: "Dr. Ava Mitchell",
    speciality: "Dermatologist",
    available: true,
    experience: "6 Years",
    fees: 600,
    about: "Focused on treating acne, eczema and advanced skin treatments.",
    city: "Bangalore",
    image: null,
  },
  {
    _id: "default_10",
    name: "Dr. Jeffrey King",
    speciality: "Pediatricians",
    available: false,
    experience: "11 Years",
    fees: 900,
    about: "Senior pediatrician with expertise in child development.",
    city: "Delhi",
    image: null,
  },
  {
    _id: "default_11",
    name: "Dr. Olivia Brown",
    speciality: "Neurologist",
    available: true,
    experience: "8 Years",
    fees: 950,
    about: "Neurologist specializing in epilepsy and movement disorders.",
    city: "Hyderabad",
    image: null,
  },
  {
    _id: "default_12",
    name: "Dr. Marcus Turner",
    speciality: "Gastroenterologist",
    available: true,
    experience: "15 Years",
    fees: 1200,
    about: "Senior gastroenterologist with expertise in liver and colon health.",
    city: "Pune",
    image: null,
  },
];

// Returns initials from a doctor name e.g. "Dr. Richard James" → "RJ"
export const getInitials = (name = "") => {
  return name
    .replace(/^Dr\.\s*/i, "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
};

// Soft background colors cycled by index for avatar placeholders
const AVATAR_COLORS = [
  { bg: "#DBEAFE", text: "#1D4ED8" }, // blue
  { bg: "#D1FAE5", text: "#065F46" }, // green
  { bg: "#EDE9FE", text: "#5B21B6" }, // purple
  { bg: "#FEE2E2", text: "#991B1B" }, // red
  { bg: "#FEF3C7", text: "#92400E" }, // amber
  { bg: "#E0F2FE", text: "#0369A1" }, // sky
];

export const getAvatarColor = (index) => AVATAR_COLORS[index % AVATAR_COLORS.length];