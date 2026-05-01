# 🚦 Roadports AI — Pothole Reporting Platform

> A civic tech platform that enables citizens to report potholes with AI-powered verification, real-time mapping, and automated email notifications for status updates. Built for **Zimbabwe** and **South Africa**.

---

## 📸 Features

- 📷 **AI-Powered Pothole Detection** — Integrates Roboflow to verify uploaded images before submission
- 🗺️ **Interactive Map** — Live incident map powered by Leaflet.js showing all reported potholes with status overlays
- 🔔 **Automated Email Notifications** — Citizens receive email updates whenever the status of their report changes
- 🧑‍💼 **Ministry Admin Dashboard** — Admins can review, verify, assign and update pothole statuses
- 📋 **Manual Review Fallback** — If the AI is unavailable or doesn't detect a pothole, users can still submit their report for human review
- 🌍 **Multi-Region Support** — Supports reporting in Zimbabwe and South Africa with auto-centered maps
- 🔐 **Google Authentication** — Firebase-powered sign-in for citizens
- 🛡️ **Security Hardened** — Rate limiting, Helmet, CORS, HPP, and Mongo sanitization

---

## 🗂️ Project Structure

```
roadports/
├── Backend/               # Node.js + Express REST API
└── Frontend/              # React (Vite) SPA
```

---

## 🖥️ Frontend

### Tech Stack

| Technology | Description |
|---|---|
| **React 18** | Core UI library |
| **Vite 5** | Next-gen build tool and dev server |
| **Tailwind CSS 3** | Utility-first CSS framework |
| **shadcn/ui** | Accessible, unstyled UI component primitives |

### NPM Packages

#### Dependencies

| Package | Version | Purpose |
|---|---|---|
| `react` | ^18.2.0 | Core UI framework |
| `react-dom` | ^18.2.0 | DOM rendering |
| `react-router-dom` | ^6.30.3 | Client-side routing |
| `axios` | ^1.6.0 | HTTP client for API requests |
| `firebase` | ^12.12.0 | Google Authentication (Firebase Auth) |
| `leaflet` | ^1.9.4 | Interactive maps |
| `react-leaflet` | ^4.2.1 | React bindings for Leaflet |
| `react-dropzone` | ^14.2.3 | Drag-and-drop file upload |
| `lucide-react` | ^0.292.0 | Icon library |
| `gsap` | ^3.14.2 | High-performance animations |
| `motion` | ^12.38.0 | Declarative animation library |
| `shadcn` | ^4.1.2 | UI component system |
| `radix-ui` | ^1.4.3 | Unstyled accessible UI primitives |
| `clsx` | ^2.1.1 | Conditional className utility |
| `class-variance-authority` | ^0.7.1 | Component variant management |
| `tailwind-merge` | ^3.5.0 | Merge Tailwind class conflicts |
| `tw-animate-css` | ^1.4.0 | Tailwind animation utilities |
| `@fontsource-variable/geist` | ^5.2.8 | Geist variable font |

#### Dev Dependencies

| Package | Version | Purpose |
|---|---|---|
| `vite` | ^5.0.0 | Build tool and dev server |
| `@vitejs/plugin-react` | ^4.2.1 | React Fast Refresh plugin for Vite |
| `tailwindcss` | ^3.3.5 | Tailwind CSS framework |
| `autoprefixer` | ^10.4.16 | PostCSS autoprefixer |
| `postcss` | ^8.4.31 | CSS transformation tooling |

### Environment Variables

Create a `.env` file in the `/Frontend` directory:

```env
VITE_ROBOFLOW_API_KEY=your_roboflow_api_key
VITE_ROBOFLOW_MODEL=roadports
VITE_ROBOFLOW_VERSION=1
```

### Running the Frontend

```bash
cd Frontend
npm install
npm run dev
```

> Runs on `http://localhost:5173` by default.

---

## ⚙️ Backend

### Tech Stack

| Technology | Description |
|---|---|
| **Node.js** | JavaScript runtime |
| **Express 5** | Web framework for the REST API |
| **MongoDB + Mongoose** | NoSQL database and ODM |
| **MongoDB Atlas** | Cloud-hosted database |
| **Agenda** | MongoDB-backed background job queue |
| **Nodemailer** | Email delivery |
| **Firebase Admin** | Token-based authentication verification |

### NPM Packages

| Package | Version | Purpose |
|---|---|---|
| `express` | ^5.2.1 | HTTP server and routing |
| `mongoose` | ^9.4.1 | MongoDB object modeling (ODM) |
| `mongodb` | ^7.1.1 | Native MongoDB driver |
| `dotenv` | ^17.4.0 | Environment variable loader |
| `cors` | ^2.8.6 | Cross-Origin Resource Sharing |
| `helmet` | ^8.1.0 | Security HTTP headers |
| `express-rate-limit` | ^8.3.2 | Rate limiting (10 reports/day per IP) |
| `express-mongo-sanitize` | ^2.2.0 | Prevents NoSQL injection attacks |
| `hpp` | ^0.2.3 | HTTP Parameter Pollution protection |
| `multer` | ^2.1.1 | Multipart/form-data file upload handling |
| `node-geocoder` | ^4.4.1 | Reverse geocoding via OpenStreetMap |
| `firebase-admin` | ^13.8.0 | Firebase token verification |
| `zod` | ^4.3.6 | Schema validation for request bodies |
| `agenda` | ^5.0.0 | Background job queue (MongoDB-backed) |
| `nodemailer` | ^8.0.5 | SMTP email sending |
| `aws-sdk` | ^2.1693.0 | S3-compatible storage (MinIO) |

### Directory Structure

```
Backend/
├── Index.js                          # App entry point — Express setup, middleware, routes
├── serviceRoute/
│   ├── router.js                     # API route definitions
│   └── controller.js                 # Route handler logic
└── common/
    ├── config/
    │   └── db.js                     # MongoDB connection
    ├── middlewares/
    │   ├── errorHandler.js           # Global error handler
    │   ├── asyncCatch.js             # Async error wrapper
    │   ├── authMiddleware.js         # Firebase token verification
    │   └── geocode.js                # Reverse geocoding middleware
    ├── models/
    │   └── Potholes.js               # Mongoose schema/model
    ├── validations/
    │   └── validation.js             # Zod request validation schemas
    ├── utils/
    │   └── AppError.js               # Custom operational error class
    ├── services/
    │   └── minio.js                  # MinIO/S3 storage service
    └── jobs/
        ├── agenda.js                 # Agenda queue initialization
        └── emailJob.js               # Email notification job definition
```

### Environment Variables

Create a `.env` file in the `/Backend` directory:

```env
PORT=5002
MONGO_URI=your_mongodb_atlas_connection_string

# Email (Gmail SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-gmail@gmail.com
SMTP_PASS=your_gmail_app_password

# Optional: Production frontend URL for CORS
# FRONTEND_URL=https://your-app.vercel.app
```

> **Note:** For Gmail, you must generate an **App Password** from [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords). Regular Gmail passwords will not work.

### Running the Backend

```bash
cd Backend
npm install
node Index.js
```

> Runs on `http://localhost:5002` by default.

---

## 🗃️ Database Schema (MongoDB)

The core `Pothole` document is structured as follows:

```js
{
  userId: String,           // Firebase UID of the reporter
  imageUrl: String,         // URL to the uploaded pothole image (MinIO/S3)
  location: {               // GeoJSON Point
    type: 'Point',
    coordinates: [lng, lat]
  },
  address: {
    street: String,
    surburb: String,
    city: String,           // Default: 'Harare'
    province: String,
    country: String         // 'Zimbabwe' | 'South Africa'
  },
  verification: {
    isPothole: Boolean,     // AI or human confirmed
    confidenceScore: Number,// 0.0 - 1.0
    severity: String,       // 'low' | 'medium' | 'high' | 'critical'
    verifiedBy: String,     // 'ai' | 'human'
    verifiedAt: Date
  },
  status: String,           // 'reported' | 'verified' | 'assigned' | 'in_progress' | 'repaired' | 'rejected'
  reportedBy: {
    email: String,          // For email notifications
    name: String,
    phone: String
  },
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔔 Background Jobs (Agenda)

The app uses **Agenda** (a MongoDB-backed job queue) to handle email notifications asynchronously. This ensures the API always responds instantly without waiting for the email provider.

### `send-status-email`
Triggered whenever:
- A citizen **submits** a new pothole report (sends a confirmation email)
- A Ministry Admin **updates** the status of a report (sends a status update email)

---

## 🔒 Security

| Measure | Implementation |
|---|---|
| Auth on Protected Routes | Firebase Admin JWT verification |
| Rate Limiting | 20 reports/day per IP, 100 general requests/15 min |
| XSS / Header Security | `helmet` |
| NoSQL Injection | `express-mongo-sanitize` |
| HTTP Parameter Pollution | `hpp` |
| CORS | Configured with an allowlist |

---

## 🌍 Supported Regions

| Country | Default City | Map Center |
|---|---|---|
| 🇿🇼 Zimbabwe | Harare | -17.8248, 31.0530 |
| 🇿🇦 South Africa | Johannesburg | -26.2041, 28.0473 |

---

## 📄 License

MIT — Built by Tawana Ryan Muendesi
