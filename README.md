<div align="center">

# **MediBridge** 🏥🩺  
_Patient-first appointment booking with doctor self-management_

</div>

---

## 🔍 Overview

**MediBridge** is a full-stack appointment booking system built for clinics and independent practitioners. Patients can find doctors and book appointments, while doctors manage their profiles and schedules directly from their dashboard.

### 👤 Patient Features
- Secure registration and login  
- Book, view, and cancel appointments  
- Appointment history and profile management

### 🩺 Doctor Features
- Doctor onboarding from a patient account  
- Doctor dashboard with upcoming appointments  
- Update profile, availability, and fees

## 🤖 CareMate Chatbot

**CareMate** provides instant guidance for booking and general health FAQs. It is powered by Google Gemini and runs from the backend API.

---

## 🌐 Live Demo

- **User Interface**: [Click to View](https://prescripto-frontend-lovat.vercel.app)

---

## 🖥️ Screenshots

### 🔹 User Dashboard
<img src="" alt="User Dashboard" />

---

### 🔹 Doctor Panel
<img src="" alt="Doctor Dashboard" />

---

## 🚀 Tech Stack

- **Frontend**: React.js, TailwindCSS  
- **Backend**: Node.js, Express.js  
- **Database**: MongoDB  
- **Authentication**: JWT  
- **Cloud Services**: Cloudinary (for profile uploads)  
- **Chatbot**: CareMate (Google Gemini)  
- **Hosting**: Vercel

---

## ⚙️ Environment Variables

Create these env files:

- `backend/.env`
- `clientside/.env`

**Backend (.env)**
```
PORT=4000
MONGODB_URI=your_mongodb_uri
MONGODB_DB_NAME=prescripto
JWT_SECRET=your_jwt_secret
CLOUDINARY_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_SECRET_KEY=your_cloudinary_secret_key
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-1.5-flash
GEMINI_API_VERSION=v1
```

**Client (.env)**
```
VITE_BACKEND_URL=http://localhost:4000
```

---

## ▶️ Run Locally

**Backend**
```
cd backend
npm install
npm start
```

**Client**
```
cd clientside
npm install
npm run dev
```

---

## 🔐 Security Notes

- Do not commit real API keys to git.
- Rotate keys if they were exposed.

---

## 🧑‍💻 Author

Developed by [Kalpesh Bonde](https://github.com/Kalpeshbonde) 👨‍💻  
Feel free to connect and collaborate!

---
