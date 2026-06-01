# UniStay 🎓

> A modern full-stack student housing platform built with the MERN stack.

UniStay helps university students find furnished apartments quickly and easily. Students can browse available areas, search apartments by ID, filter listings by price range, and view detailed property information. A secure admin dashboard allows complete management of areas, apartments, pricing, availability, and images.

## Tech Stack

- **Frontend:** React · Vite · Tailwind CSS · Framer Motion · Swiper.js
- **Backend:** Node.js · Express.js
- **Database:** MongoDB · Mongoose
- **Auth:** JWT (Admin only)
- **Images:** Cloudinary

## Getting Started

### Prerequisites

- Node.js v18+
- MongoDB (local or Atlas)
- Cloudinary account (optional for image uploads)

### 1. Backend Setup

```bash
cd backend
npm install
```

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Edit `backend/.env`:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/unistay
JWT_SECRET=your_super_secret_jwt_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLIENT_URL=http://localhost:5173
```

Seed the admin account:
```bash
npm run seed
```

Start the backend:
```bash
npm run dev
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### 3. Access the App

| URL | Description |
|-----|-------------|
| http://localhost:5173 | Student-facing website |
| http://localhost:5173/admin/login | Admin dashboard |

**Default Admin Credentials:**
- Email: `admin@unistay.com`
- Password: `Admin@123`

> ⚠️ Change the default password after first login!

## API Endpoints

### Public
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/districts` | List all districts with apt count |
| GET | `/api/districts/:id` | Get single district |
| GET | `/api/apartments` | List apartments (with filters) |
| GET | `/api/apartments/featured` | Get featured apartments |
| GET | `/api/apartments/:id` | Get single apartment |
| POST | `/api/auth/login` | Admin login |

### Protected (JWT Required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/stats` | Dashboard statistics |
| POST | `/api/admin/districts` | Create district |
| PUT | `/api/admin/districts/:id` | Update district |
| DELETE | `/api/admin/districts/:id` | Delete district |
| POST | `/api/admin/apartments` | Create apartment |
| PUT | `/api/admin/apartments/:id` | Update apartment |
| DELETE | `/api/admin/apartments/:id` | Delete apartment |
| PATCH | `/api/admin/apartments/:id/toggle-featured` | Toggle featured |
| PATCH | `/api/admin/apartments/:id/toggle-available` | Toggle availability |

## Features

### Student Features
- 🏘️ Browse districts with apartment counts
- ⭐ Featured apartments homepage section
- 🔍 Search by Apartment ID
- 🎛️ Filter by price, gender, district, availability
- 📸 Full image gallery with lightbox
- 🗺️ Google Maps embed (no API key needed)
- 📱 Fully responsive (mobile, tablet, desktop)
- 🌙 Dark / Light mode

### Admin Features
- 🔐 Secure JWT login
- 🏙️ District management (create, edit, delete, cover image)
- 🏠 Apartment management (full CRUD with multi-image upload)
- ⭐ Featured listing toggle
- ✅ Availability toggle
- 📊 Dashboard stats
- 🖼️ Cloudinary image storage

## Keywords

`react` `nodejs` `express` `mongodb` `mern` `student-housing` `apartment-rental` `fullstack` `tailwindcss` `jwt-authentication` `cloudinary`
