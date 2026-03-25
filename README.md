<div align="center">

# MediBridge
Patient-first appointment booking with doctor self-management

</div>

---

## Overview

MediBridge is a full-stack platform where patients find doctors, book appointments, and manage their history, while doctors control their profiles, fees, and availability. CareMate, an embedded assistant powered by Gemini, guides users with quick answers and booking help.

## Live

- Web: https://medi-bridge-theta.vercel.app/

## Highlights

- Patient: secure auth, browse/search doctors, book/cancel visits, view history, manage profile.
- Doctor: self-onboarding, dashboard for upcoming visits, update profile, availability, and fees.
- CareMate chatbot: quick guidance for booking and health FAQs via backend Gemini integration.
- Media handling: Cloudinary for profile uploads.
- Security: JWT auth, CORS-restricted origins.

## Tech Stack

- Frontend: React (Vite), TailwindCSS
- Backend: Node.js, Express.js
- Database: MongoDB
- Auth: JWT
- Cloud: Cloudinary for uploads; Gemini for CareMate
- Hosting: Vercel (frontend), Render (backend)

## Environment (summary)

- Backend: PORT, MONGODB_URI, MONGODB_DB_NAME, JWT_SECRET, CLOUDINARY_* keys, GEMINI_* keys, ALLOWED_ORIGINS (comma-separated).
- Frontend: VITE_BACKEND_URL (API base URL).

## Contact for Details

To get the project, drop a mail: kalpeshbonde04@gmail.com

---
