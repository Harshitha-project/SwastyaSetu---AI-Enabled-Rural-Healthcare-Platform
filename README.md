# 🏥 SwasthyaSetu - AI-Enabled Rural Healthcare Platform

> **Smart India Hackathon 2024 | Problem Statement 26133 | Government of Maharashtra**

स्वास्थ्यसेतू - Healthcare Beyond Distance | अंतराच्या पलीकडे आरोग्यसेवा | दूरी से परे स्वास्थ्य सेवा

[![React](https://img.shields.io/badge/React-18.2-61DAFB?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?logo=postgresql)](https://www.postgresql.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)
[![PWA](https://img.shields.io/badge/PWA-Ready-5A0FC8?logo=pwa)](https://web.dev/progressive-web-apps/)

---

## 📋 Table of Contents

- [Problem Statement](#-problem-statement)
- [Solution Overview](#-solution-overview)
- [Key Features](#-key-features)
- [Live Demo](#-live-demo)
- [Tech Stack](#️-tech-stack)
- [Project Architecture](#-project-architecture)
- [Getting Started](#-getting-started)
- [Feature Details](#-feature-details)
- [API Documentation](#-api-documentation)
- [PWA & Offline Support](#-pwa--offline-support)
- [Screenshots](#-screenshots)
- [Contributing](#-contributing)

---

## 📋 Problem Statement

**Ministry:** Government of Maharashtra  
**Theme:** Healthcare & Biomedical Devices  
**PS ID:** 26133

**Challenge:** Rural and underserved areas in Maharashtra face significant barriers to accessing quality healthcare services:
- 🏔️ Geographic distance from healthcare facilities
- 👨‍⚕️ Limited availability of doctors and specialists
- 🏥 Poor health infrastructure
- 📚 Low health awareness
- 🗣️ Language barriers
- 📶 Unreliable internet connectivity

---

## 🎯 Solution Overview

**SwasthyaSetu** is a comprehensive AI-enabled digital healthcare platform that bridges the gap between rural communities and quality healthcare services through:

- **Real-time Video Teleconsultation** with WebRTC
- **AI-Powered Health Assessment** with symptom analysis
- **Offline-First PWA** for areas with poor connectivity
- **Multilingual Support** (English, मराठी, हिंदी)
- **Real-time AI Analysis** during consultations

---

## ✨ Key Features

### 🎥 Live Video Teleconsultation
| Feature | Description |
|---------|-------------|
| **WebRTC Video Calls** | Real-time HD video between patient and doctor |
| **Live Chat** | Instant messaging during consultations |
| **AI Analysis** | Real-time facial analysis and vitals estimation |
| **Screen Recording** | Consultation recording for medical records |
| **Multi-device Support** | Works on desktop, tablet, and mobile |

### 🤖 AI-Powered Features
| Feature | Description |
|---------|-------------|
| **Symptom Checker** | AI-based preliminary health risk assessment |
| **Facial Analysis** | Real-time stress and fatigue detection |
| **Vitals Estimation** | Heart rate and SpO2 estimation from video |
| **Risk Scoring** | Automated patient triage and prioritization |
| **Smart Alerts** | High-risk patient notifications |

### 📴 Offline-First PWA
| Feature | Description |
|---------|-------------|
| **Install as App** | Add to home screen on any device |
| **Offline Mode** | Full functionality without internet |
| **Background Sync** | Auto-sync when connection restored |
| **Push Notifications** | Appointment and medicine reminders |
| **Local Storage** | IndexedDB for offline data persistence |

### 👥 User Roles
| Role | Capabilities |
|------|--------------|
| **Patient** | Health assessment, video consultation, appointments, records, reminders, digital prescriptions, pharmacy locator |
| **Doctor** | Video consultations, digital prescriptions with PDF, patient management, AI-assisted diagnosis |
| **Health Worker** | Patient registration, vitals recording, field screenings, offline sync |
| **Admin** | User management, facility management, analytics, system monitoring |

### 💊 Digital Prescriptions & E-Pharmacy
| Feature | Description |
|---------|-------------|
| **Digital Prescriptions** | Doctors create verified digital prescriptions with QR codes |
| **Medicine Database** | 25+ common medications with dosage guidelines |
| **PDF Generation** | Professional prescription PDFs with download/print |
| **QR Verification** | Scan to verify prescription authenticity |
| **Prescription History** | Patients view all prescriptions with search/filter |
| **Pharmacy Locator** | Find nearby pharmacies, Jan Aushadhi Kendras |
| **Home Delivery** | Filter pharmacies with delivery service |
| **Digital Rx Support** | Pharmacies accepting digital prescriptions marked |

### 🚨 Emergency Services & Health Alerts
| Feature | Description |
|---------|-------------|
| **One-Tap SOS** | Large emergency button for instant alert dispatch |
| **Emergency Types** | Cardiac, accident, breathing, pregnancy, snakebite, poisoning, etc. |
| **Geolocation Sharing** | Auto-detect and share GPS coordinates with responders |
| **Family Contact Alerts** | Automatically notify emergency contacts |
| **Nearby Hospitals** | Find closest hospitals with distance and ambulance services |
| **Health Advisories** | Government health alerts and disease outbreak notifications |
| **Vaccination Camps** | Nearby health camps and vaccination drive information |
| **Emergency Contacts** | Quick access to 112, 108, 100, 101, 104 helplines |

---

### 🌟 Latest Platform Enhancements (v2.1)

#### 1. 🌐 Full Multilingual Persistence (मराठी | हिंदी | English)
- **Comprehensive Dictionaries**: Deep Marathi (`mr`), Hindi (`hi`), and English (`en`) coverage for all navigation sidebars, OPD token statuses, teleconsultation controls, upload dialogs, and clinical cards.
- **Dual-Storage Persistence**: Synced across `localStorage.getItem('language')` and `i18nextLng` to ensure consistent language rendering across page reloads and tab navigations.
- **Dynamic Helper**: `useLocalizedText` hook providing clean localized fallbacks throughout the application.

#### 2. 📄 Lab Reports & Records PDF Download + Manual PC Upload
- **Instant Clinical PDF Downloads**: Patients and doctors can download professional, clinical-grade PDF reports for lab investigations and health records with one click, generated using `jspdf`.
- **Manual Upload from PC (Lab Reports)**: Upload lab tests directly from local storage with diagnostic values, reference ranges, abnormal indicators, and file attachments (PDF/images).
- **Manual Upload from PC (Medical Records)**: Upload clinical consultation notes, imaging summaries, hospital discharge records, and vaccination certificates from local device with custom provider and facility metadata.

#### 3. 🎫 OPD Token Queue & Live Doctor Availability
- **Real-Time Doctor Status**: Live visual status badges:
  - 🟢 **Available / Free (उपलब्ध)**: Ready for immediate patient consultations.
  - 🟡 **In Consultation (सल्लामसलत सुरू)**: Currently in an active video session with a patient.
  - ☕ **On Break (विश्रांती)**: Temporarily paused.
  - ⚪ **Offline (ऑफलाइन)**: Doctor currently unavailable.
- **Live Token Queue Tracker**: Displays current token being served (e.g., `#A-12`), patient's active token (e.g., `#A-14`), remaining queue wait time, and queue position.
- **Doctor Queue Controller**: Doctors can advance tokens, call the next patient, and update consultation availability directly from their dashboard.

#### 4. 📞 Real-Time Doctor Call Initiation & Incoming Ringtone Modal
- **Doctor Initiates Call**: When a doctor joins a teleconsultation room, the system broadcasts a live signaling event across browser tabs and devices via `BroadcastChannel` and storage events.
- **Patient Ringing Alert**: Patients on any page of the portal receive an instant, high-priority ringing alert modal featuring a synthesized hospital chime (Web Audio API) and the doctor's name.
- **1-Click Direct Join**: Clicking **"Join Consultation Now"** directs the patient straight into the active consultation room.

#### 5. 💊 Immediate Prescription & Medicine Schedule Synchronization
- **Zero-Lag Reflection**: When a doctor completes a consultation and prescribes medications, the system automatically creates corresponding `MedicineReminder` items in the database/storage.
- **Real-Time Dashboard Sync**: Dispatches `swasthyasetu:records_sync` and `BroadcastChannel('swasthyasetu_records_bus')`, instantly refreshing the patient's dashboard medicine schedule without requiring manual page reload.

#### 6. 📱 Native Mobile App Experience (PWA & Bottom Navigation)
- **Tactile Mobile Bottom Nav**: Fixed bottom navigation bar with safe-area insets (`lg:hidden`) offering thumb-friendly access to Home, Appointments/Token Queue, Doctor Video Call, Records, and Lab Reports.
- **Standalone PWA Web App**: Progressive Web App manifest (`manifest.json`) and crisp vector icons (192x192 & 512x512) allowing users to "Add to Home Screen" for a full-screen, native smartphone experience.
- **Touch & Responsive Polish**: Smooth mobile tap highlights, responsive card grids, and viewport cover configuration.

#### 7. 🔒 Multi-Tab Auth Session Isolation
- **Tab-Isolated Authentication**: Prioritizes `sessionStorage` with cross-tab fallback, preventing role collision when testing a patient dashboard in Tab 1 and a doctor dashboard in Tab 2 simultaneously.
- **Quick Role Switcher**: Interactive role switch menu in the profile dropdown for frictionless testing across Patient, Doctor, Health Worker, and Admin roles.

## 🚀 Live Demo

### Test URLs (Development)
| Page | URL |
|------|-----|
| **Landing** | http://localhost:5173/ |
| **Patient Dashboard** | http://localhost:5173/patient |
| **Medical Records** | http://localhost:5173/patient/records |
| **Lab Reports** | http://localhost:5173/patient/lab-reports |
| **Vaccination Records** | http://localhost:5173/patient/vaccinations |
| **Patient Prescriptions** | http://localhost:5173/patient/prescriptions |
| **Pharmacy Locator** | http://localhost:5173/patient/pharmacies |
| **Emergency SOS** | http://localhost:5173/patient/emergency |
| **Health Alerts** | http://localhost:5173/patient/health-alerts |
| **Government Schemes** | http://localhost:5173/patient/schemes |
| **Insurance & Claims** | http://localhost:5173/patient/insurance |
| **Doctor Dashboard** | http://localhost:5173/doctor |
| **Health Worker** | http://localhost:5173/worker |
| **Admin Dashboard** | http://localhost:5173/admin |

### Test Video Call (No Auth Required)
| Role | URL |
|------|-----|
| **Patient Call** | http://localhost:5173/test/patient-call/test-room |
| **Doctor Call** | http://localhost:5173/test/doctor-call/test-room |

> Open both URLs in separate browser windows to test video calling

### Demo Accounts

#### Patients (4 Test Accounts)
| Name | Email | Password | Location |
|------|-------|----------|----------|
| Priya Sharma | patient@demo.com | password123 | Phaltan, Satara |
| Ramesh Patil | patient2@demo.com | password123 | Shirur, Pune |
| Sunita Jadhav | patient3@demo.com | password123 | Baramati, Pune |
| Amit Deshmukh | patient4@demo.com | password123 | Kolhapur |

#### Doctors (4 Test Accounts)
| Name | Email | Password | Specialization |
|------|-------|----------|----------------|
| Dr. Rajesh Kulkarni | doctor@demo.com | password123 | General Medicine |
| Dr. Anjali Desai | doctor2@demo.com | password123 | Gynecology & Obstetrics |
| Dr. Vikram Joshi | doctor3@demo.com | password123 | Pediatrics |
| Dr. Meena Sawant | doctor4@demo.com | password123 | Cardiology |

#### Staff Accounts
| Role | Email | Password |
|------|-------|----------|
| **Health Worker** | worker@demo.com | password123 |
| **Admin** | admin@demo.com | password123 |

---

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.2 | UI Framework |
| TypeScript | 5.0 | Type Safety |
| Vite | 5.4 | Build Tool |
| Tailwind CSS | 3.4 | Styling |
| shadcn/ui | Latest | UI Components |
| Framer Motion | 11.0 | Animations |
| React Router | 6.x | Routing |
| i18next | 23.x | Internationalization |
| Socket.IO Client | 4.x | Real-time Communication |
| WebRTC | Native | Video Calls |
| IndexedDB (idb) | 8.x | Offline Storage |
| Workbox | 7.x | Service Worker |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 18+ | Runtime |
| Express | 4.x | Web Framework |
| TypeScript | 5.0 | Type Safety |
| PostgreSQL | 15 | Database |
| Prisma | 5.x | ORM |
| Socket.IO | 4.x | WebSocket Server |
| JWT | - | Authentication |
| bcrypt | - | Password Hashing |

### AI Service
| Technology | Version | Purpose |
|------------|---------|---------|
| Python | 3.11 | Runtime |
| FastAPI | 0.100+ | Web Framework |
| Rule-based Engine | - | Health Assessment |

### DevOps
| Technology | Purpose |
|------------|---------|
| Docker | Containerization |
| Docker Compose | Orchestration |
| Vite PWA Plugin | PWA Generation |

---

## 🏗️ Project Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                    │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  React + TypeScript + Vite + Tailwind CSS                           │   │
│  │  • Progressive Web App (PWA)                                         │   │
│  │  • Offline-first with IndexedDB + Service Workers                    │   │
│  │  • WebRTC for Video Calls                                            │   │
│  │  • i18n (EN/MR/HI)                                                   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                    ┌─────────────────┼─────────────────┐
                    │ REST API        │ WebSocket       │
                    ▼                 ▼                 ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              API LAYER                                       │
│  ┌────────────────────────────┐    ┌────────────────────────────┐          │
│  │  Backend (Node.js)         │    │  AI Service (Python)       │          │
│  │  • Express + TypeScript    │◄──►│  • FastAPI                 │          │
│  │  • JWT Authentication      │    │  • Rule-based Assessment   │          │
│  │  • Socket.IO Signaling     │    │  • Vital Analysis          │          │
│  │  • WebRTC Coordination     │    │  • Symptom Matching        │          │
│  └────────────────────────────┘    └────────────────────────────┘          │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              DATA LAYER                                      │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  PostgreSQL + Prisma ORM                                             │   │
│  │  • 15+ Models (Users, Patients, Doctors, Appointments, etc.)        │   │
│  │  • Relations and Indexes optimized                                   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
SwasthyaSetu/
├── frontend/                          # React + Vite + Tailwind PWA
│   ├── public/
│   │   ├── icons/                     # PWA icons (72-512px)
│   │   └── favicon.svg
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/                    # shadcn/ui components
│   │   │   ├── common/                # Shared components
│   │   │   ├── layout/                # Layout components
│   │   │   ├── auth/                  # Auth components
│   │   │   ├── consultation/          # Video call components
│   │   │   │   └── AIAnalysisPanel.tsx
│   │   │   ├── prescription/          # Prescription components
│   │   │   │   ├── PrescriptionBuilder.tsx  # Doctor prescription creation
│   │   │   │   └── PrescriptionView.tsx     # Prescription display
│   │   │   └── pwa/                   # PWA components
│   │   │       ├── OfflineIndicator.tsx
│   │   │       └── InstallPrompt.tsx
│   │   ├── pages/
│   │   │   ├── public/                # Landing, Login, Register
│   │   │   ├── patient/               # Patient dashboard & features
│   │   │   │   ├── Dashboard.tsx
│   │   │   │   ├── Teleconsultation.tsx  # Video call page
│   │   │   │   ├── Prescriptions.tsx     # Prescription history
│   │   │   │   ├── PharmacyLocator.tsx   # Find pharmacies
│   │   │   │   └── ...
│   │   │   ├── doctor/                # Doctor dashboard & features
│   │   │   │   ├── Dashboard.tsx
│   │   │   │   ├── Consultation.tsx   # Video call + AI analysis
│   │   │   │   └── ...
│   │   │   ├── healthworker/          # Health worker features
│   │   │   │   └── Dashboard.tsx      # Offline-first dashboard
│   │   │   └── admin/                 # Admin dashboard
│   │   │       └── Dashboard.tsx      # Real-time monitoring
│   │   ├── context/
│   │   │   ├── AuthContext.tsx
│   │   │   ├── ToastContext.tsx
│   │   │   └── OfflineContext.tsx     # Offline state management
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   ├── useOffline.ts
│   │   │   ├── useWebRTC.ts           # WebRTC video call hook
│   │   │   └── useAIAnalysis.ts       # AI analysis hook
│   │   ├── services/
│   │   │   ├── api.ts                 # Axios instance
│   │   │   ├── webrtcService.ts       # WebRTC peer connection
│   │   │   ├── aiAnalysisService.ts   # Real-time AI analysis
│   │   │   ├── prescriptionService.ts # Prescription & PDF generation
│   │   │   ├── medicineService.ts     # Medicine database
│   │   │   ├── db.ts                  # IndexedDB service
│   │   │   ├── syncService.ts         # Background sync
│   │   │   └── notificationService.ts # Push notifications
│   │   ├── locales/                   # i18n translations
│   │   │   ├── en.ts
│   │   │   ├── mr.ts
│   │   │   └── hi.ts
│   │   ├── types/
│   │   └── utils/
│   ├── vite.config.ts                 # Vite + PWA config
│   └── package.json
│
├── backend/                           # Node.js + Express + Prisma
│   ├── prisma/
│   │   └── schema.prisma              # Database schema
│   ├── src/
│   │   ├── controllers/               # Route handlers
│   │   │   ├── auth.controller.ts
│   │   │   ├── patient.controller.ts
│   │   │   ├── doctor.controller.ts
│   │   │   ├── appointment.controller.ts
│   │   │   ├── consultation.controller.ts
│   │   │   ├── prescription.controller.ts
│   │   │   ├── ai.controller.ts
│   │   │   └── ...
│   │   ├── routes/                    # API routes
│   │   │   ├── prescription.routes.ts # Digital prescription endpoints
│   │   │   └── ...
│   │   ├── middleware/                # Auth, validation, security
│   │   ├── services/
│   │   │   └── webrtc.service.ts      # Socket.IO signaling server
│   │   ├── config/
│   │   └── utils/
│   └── package.json
│
├── ai-service/                        # Python FastAPI
│   ├── routes/
│   │   └── predict.py
│   ├── services/
│   │   └── predictor.py
│   ├── main.py
│   └── requirements.txt
│
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## 🚦 Getting Started

### Prerequisites
- **Node.js** 18+ 
- **PostgreSQL** 15+
- **Python** 3.11+ (for AI service)
- **Git**

### Quick Start

#### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/SwasthyaSetu.git
cd SwasthyaSetu
```

#### 2. Setup Backend
```bash
cd backend

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your database credentials

# Setup database
npx prisma generate
npx prisma db push

# Seed demo data
npm run seed

# Start server
npm run dev
```

#### 3. Setup Frontend
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

#### 4. (Optional) Setup AI Service
```bash
cd ai-service

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start server
uvicorn main:app --reload --port 8000
```

### Access Points
| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:5000/api |
| WebSocket | ws://localhost:5000 |
| AI Service | http://localhost:8000 |

---

## 📱 Feature Details

### 🎥 Video Teleconsultation

**WebRTC Implementation:**
- Peer-to-peer video/audio streaming
- Socket.IO signaling server
- ICE candidate exchange with STUN servers
- Automatic reconnection handling
- Picture-in-Picture local video

**How to Test:**
1. Open patient URL: `http://localhost:5173/test/patient-call/test-room`
2. Open doctor URL in another window: `http://localhost:5173/test/doctor-call/test-room`
3. Both must use the **same room ID** in the URL
4. Click "Join Call" on both sides
5. Allow camera/microphone permissions

**Features During Call:**
- Toggle audio/video on/off
- Real-time chat messaging
- AI analysis panel (doctor side)
- Call duration timer
- Connection status indicator

### 🤖 Real-time AI Analysis

During video consultations, the doctor sees real-time AI analysis of the patient:

| Analysis Type | Description |
|--------------|-------------|
| **Facial Analysis** | Stress level, fatigue, pain indicators |
| **Vitals Estimation** | Heart rate, SpO2, temperature estimates |
| **Symptom Detection** | Visible symptom indicators |
| **Risk Score** | Overall health risk (0-100) |
| **Recommendations** | AI-suggested actions |

> ⚠️ **Note:** AI analysis is simulated for demo purposes. Production would use trained ML models.

### 📴 Offline-First PWA

**Service Worker Features:**
- Precaches all static assets
- Runtime caching strategies:
  - API: NetworkFirst (24hr cache)
  - Images: CacheFirst (30 days)
  - Fonts: CacheFirst (1 year)
  - JS/CSS: StaleWhileRevalidate

**IndexedDB Storage:**
| Store | Purpose |
|-------|---------|
| `pendingSync` | Queued offline operations |
| `patients` | Cached patient records |
| `vitals` | Offline vitals entries |
| `appointments` | Cached appointments |
| `articles` | Health education content |
| `notifications` | Local notification queue |

**Background Sync:**
- Automatic sync when online
- Retry logic with exponential backoff
- Progress tracking
- Conflict resolution

### 🏥 Health Worker Dashboard

Designed for field workers with unreliable connectivity:

- **Offline Banner**: Clear indicator when offline
- **Sync Status**: Pending items count and sync button
- **Patient Cards**: Risk-level color coding
- **Vitals Display**: BP, pulse, temp, SpO2 at a glance
- **Follow-up Management**: Priority-based task list
- **Marathi/English**: Full bilingual support

### 🛡️ Admin Dashboard

Real-time platform monitoring:

- **Live Stats**: Patients, doctors, workers, facilities
- **Activity Feed**: Real-time events via Socket.IO
- **System Health**: API, database, AI service status
- **District Analytics**: Region-wise distribution
- **High-Risk Alerts**: Critical patient notifications

---

## 📡 API Documentation

### Authentication
```
POST   /api/auth/register     Register new user
POST   /api/auth/login        Login and get JWT
POST   /api/auth/logout       Logout user
GET    /api/auth/me           Get current user
POST   /api/auth/refresh      Refresh access token
```

### Patients
```
GET    /api/patients          List patients
GET    /api/patients/:id      Get patient details
GET    /api/patients/me       Get my profile
PUT    /api/patients/:id      Update patient
GET    /api/patients/:id/health-summary
```

### Doctors
```
GET    /api/doctors           List doctors
GET    /api/doctors/:id       Get doctor details
GET    /api/doctors/:id/slots Available time slots
GET    /api/doctors/me/stats  Dashboard statistics
```

### Appointments
```
GET    /api/appointments      List appointments
POST   /api/appointments      Book appointment
PUT    /api/appointments/:id  Update appointment
DELETE /api/appointments/:id  Cancel appointment
GET    /api/appointments/today Today's queue
```

### Consultations
```
POST   /api/consultations/start       Start consultation
GET    /api/consultations/:id         Get consultation
POST   /api/consultations/:id/messages Send message
PUT    /api/consultations/:id/end     End consultation
```

### AI Assessment
```
POST   /api/ai/assessment     Get health risk assessment
POST   /api/ai/symptom-check  Quick symptom analysis
GET    /api/ai/history        Assessment history
```

### WebSocket Events
```
join-room       Join consultation room
offer           Send WebRTC offer
answer          Send WebRTC answer
ice-candidate   Send ICE candidate
chat-message    Send chat message
end-call        End consultation
```

---

## 📲 PWA Installation

### Desktop (Chrome/Edge)
1. Visit the app URL
2. Click the install icon in the address bar
3. Or: Menu → Install SwasthyaSetu

### Android
1. Visit the app URL in Chrome
2. Tap "Add to Home Screen" prompt
3. Or: Menu → Add to Home Screen

### iOS
1. Visit the app URL in Safari
2. Tap the Share button
3. Tap "Add to Home Screen"
4. Tap "Add"

---

## 🧪 Testing

### Test Video Calls
```bash
# Open two browser windows (or tabs)
# Window 1 (Patient):
http://localhost:5173/test/patient-call/my-test-room

# Window 2 (Doctor):
http://localhost:5173/test/doctor-call/my-test-room

# Both windows should see each other's video
```

### Test Offline Mode
1. Open app in Chrome
2. Open DevTools (F12) → Application → Service Workers
3. Check "Offline" checkbox
4. App should still work with cached data
5. Make changes (queued in IndexedDB)
6. Uncheck "Offline" → data syncs automatically

### Test Push Notifications
```javascript
// In browser console
Notification.requestPermission().then(p => console.log('Permission:', p))
```

---

## 🔐 Security Features

- **JWT Authentication** with refresh tokens
- **Role-Based Access Control** (RBAC)
- **Input Validation** with express-validator
- **XSS Prevention** with sanitization
- **CORS Configuration** for API security
- **Rate Limiting** on all endpoints
- **Helmet.js** security headers
- **bcrypt** password hashing

---

## 🌐 Multilingual Support

| Language | Code | Status |
|----------|------|--------|
| English | en | ✅ Complete |
| मराठी (Marathi) | mr | ✅ Complete |
| हिंदी (Hindi) | hi | ✅ Complete |

Switch language using the globe icon in the navigation bar.

---

## 📊 Implementation Progress

| Phase | Feature | Status |
|-------|---------|--------|
| 1 | Project Setup & Configuration | ✅ Complete |
| 2 | UI Components & Layout | ✅ Complete |
| 3 | Public Pages | ✅ Complete |
| 4 | Dashboard Pages | ✅ Complete |
| 5 | Authentication System | ✅ Complete |
| 6 | Database Models & Seeding | ✅ Complete |
| 7 | Backend Controllers | ✅ Complete |
| 8 | Teleconsultation & Health Metrics | ✅ Complete |
| 9 | Security Hardening | ✅ Complete |
| 10 | **WebRTC Video Calls** | ✅ Complete |
| 11 | **Real-time Chat** | ✅ Complete |
| 12 | **AI Analysis During Calls** | ✅ Complete |
| 13 | **PWA & Offline Support** | ✅ Complete |
| 14 | **Push Notifications** | ✅ Complete |
| 15 | **Admin Real-time Dashboard** | ✅ Complete |
| 16 | **Health Worker Offline Dashboard** | ✅ Complete |
| 17 | **Digital Prescriptions & E-Pharmacy** | ✅ Complete |
| 18 | **Emergency Services & Health Alerts** | ✅ Complete |
| 19 | **Government Schemes & Insurance** | ✅ Complete |
| 20 | **Health Records & Medical History** | ✅ Complete |

**Overall Progress: 100%** ✅

---

## 💊 Phase 4: Digital Prescriptions & E-Pharmacy

### Digital Prescriptions
| Feature | Description |
|---------|-------------|
| **Prescription Builder** | Doctors can create prescriptions with medicine search, dosage, frequency, and duration |
| **Medicine Database** | 25+ common medications with categories, generic names, and dosage options |
| **PDF Generation** | Professional prescription PDFs with jsPDF - includes facility header, patient/doctor info, medications table |
| **QR Code Verification** | Each prescription has a scannable QR code for authenticity verification |
| **Prescription History** | Patients can view all prescriptions - filter by status (valid/expired), search by diagnosis/medicine |
| **Download & Print** | One-click PDF download and print functionality |
| **Multilingual Support** | Prescription interface in English and Marathi |

### E-Pharmacy Features
| Feature | Description |
|---------|-------------|
| **Pharmacy Locator** | Find nearby pharmacies with filters (type, open now, delivery, etc.) |
| **Jan Aushadhi Kendras** | Highlighted government generic medicine stores with 50-90% savings |
| **Digital Rx Support** | Pharmacies that accept digital prescriptions are marked |
| **Home Delivery** | Filter pharmacies offering home delivery service |
| **WhatsApp Ordering** | Quick order via WhatsApp for supported pharmacies |
| **Google Maps Integration** | Get directions to any pharmacy |
| **24x7 Pharmacies** | Filter for always-open pharmacies |
| **Ratings & Reviews** | User ratings to find trusted pharmacies |

### Technical Implementation
```
Frontend:
├── services/
│   ├── prescriptionService.ts   # PDF generation, QR codes, API calls
│   └── medicineService.ts       # Medicine database, search, categories
├── components/prescription/
│   ├── PrescriptionBuilder.tsx  # Doctor's prescription creation UI
│   └── PrescriptionView.tsx     # Patient prescription view with actions
└── pages/patient/
    ├── Prescriptions.tsx        # Prescription history page
    └── PharmacyLocator.tsx      # Find nearby pharmacies

Backend:
├── routes/
│   └── prescription.routes.ts   # Prescription API endpoints
└── controllers/
    └── prescription.controller.ts # Create, read, verify prescriptions
```

### API Endpoints
```
POST   /api/prescriptions              Create prescription (Doctor)
GET    /api/prescriptions/:id          Get prescription by ID
GET    /api/prescriptions/patient/:id  Get patient prescriptions
GET    /api/prescriptions/doctor/:id   Get doctor prescriptions
GET    /api/prescriptions/verify/:id   Verify prescription (Public)
PUT    /api/prescriptions/:id          Update prescription
```

### Prescription PDF Features
- Professional medical layout
- Facility header with logo area
- Doctor credentials and registration number
- Patient details with age/gender
- Vitals section (BP, pulse, temp, weight, SpO2)
- Diagnosis and symptoms
- Medications table with dosage, frequency, duration
- QR code for verification
- Validity period
- Doctor signature area
- Emergency contact footer

---

## 🚨 Phase 5: Emergency Services & Health Alerts

### Emergency SOS System
| Feature | Description |
|---------|-------------|
| **One-Tap SOS** | Large emergency button for instant alert dispatch |
| **Emergency Types** | Cardiac, accident, breathing, pregnancy, snakebite, poisoning, burn, drowning, medical, other |
| **Geolocation Sharing** | Auto-detect and share GPS coordinates with responders |
| **Family Contact Alerts** | Automatically notify emergency contacts via SMS/call |
| **Nearby Hospital Finder** | Find closest hospitals with distance and ratings |
| **Ambulance Locator** | Locate available ambulances with ETA |
| **Emergency Contacts Directory** | Quick access to 112, 108 (ambulance), 100 (police), 101 (fire), 104 (health helpline), 181 (women), 1098 (children) |
| **Maharashtra-Specific Numbers** | State health helpline, AIIMS, district hospitals |

### Health Alerts System
| Feature | Description |
|---------|-------------|
| **Real-time Advisories** | Government health advisories and warnings |
| **Disease Outbreak Alerts** | Dengue, malaria, COVID-19 outbreak notifications with affected areas |
| **Weather Health Alerts** | Heat wave, cold wave, and monsoon health advisories |
| **Vaccination Camps** | Nearby vaccination and health camp information |
| **Government Health Schemes** | Ayushman Bharat, Jan Arogya updates |
| **Alert Severity Levels** | Critical (red), warning (orange), info (blue) color coding |
| **Location-Based Alerts** | District and taluka-specific health notifications |

### Technical Implementation
```
Frontend:
├── services/
│   ├── emergencyService.ts      # SOS alerts, geolocation, contact dispatch
│   └── healthAlertService.ts    # Advisories, outbreaks, camps
└── pages/patient/
    ├── EmergencySOS.tsx         # One-tap SOS with emergency types
    └── HealthAlerts.tsx         # Alerts, outbreaks, camps tabs

Backend:
├── routes/
│   └── emergency.routes.ts      # Emergency API endpoints
└── controllers/
    └── emergency.controller.ts  # SOS, alerts, hospitals, ambulances
```

### API Endpoints
```
POST   /api/emergency/sos              Trigger SOS alert with location
GET    /api/emergency/alerts           Get health alerts for region
GET    /api/emergency/hospitals        Find nearby hospitals
GET    /api/emergency/ambulances       Find available ambulances
POST   /api/emergency/contacts         Update emergency contacts
GET    /api/emergency/contacts         Get user's emergency contacts
```

### Emergency Response Flow
1. Patient taps SOS button
2. App captures GPS coordinates
3. Emergency type selection (cardiac, accident, etc.)
4. Alert dispatched to:
   - Nearest hospital
   - Ambulance services
   - Family emergency contacts
   - Local health authorities
5. Real-time tracking until help arrives

---

## 🏛️ Phase 6: Government Schemes & Insurance Integration

### Government Health Schemes
| Feature | Description |
|---------|-------------|
| **Scheme Browser** | Browse 8+ government health schemes with search and filters |
| **Ayushman Bharat (PMJAY)** | Rs. 5 lakh coverage for secondary/tertiary care hospitalization |
| **MJPJAY** | Maharashtra state scheme with Rs. 1.5-5 lakh coverage |
| **Janani Suraksha Yojana** | Maternal health scheme for safe institutional delivery |
| **PMSBY/PMJJBY** | Accident and life insurance at affordable premiums |
| **Eligibility Checker** | AI-powered eligibility assessment based on user profile |
| **Application Tracking** | Track scheme application status and approvals |
| **Bilingual Support** | English and Marathi descriptions for all schemes |

### Insurance & Claims Management
| Feature | Description |
|---------|-------------|
| **Insurance Cards** | View Ayushman Bharat and MJPJAY cards with QR codes |
| **Coverage Tracking** | Real-time tracking of used/available coverage amounts |
| **Family Members** | View all covered family members under one policy |
| **Card Verification** | Verify beneficiary eligibility for cashless treatment |
| **Claims Dashboard** | Track insurance claims with status timeline |
| **Pre-Authorization** | Initiate hospital pre-auth requests |
| **Empaneled Hospitals** | Find NABH-accredited hospitals accepting schemes |
| **Coverage Packages** | Browse 1350+ medical packages with rates |

### Technical Implementation
```
Frontend:
├── services/
│   ├── governmentSchemesService.ts  # Scheme data, eligibility checker
│   └── insuranceService.ts          # Cards, claims, verification
└── pages/patient/
    ├── GovernmentSchemes.tsx        # Scheme browser, eligibility check
    └── InsuranceClaims.tsx          # Cards, claims, hospitals tabs

Backend:
├── routes/
│   └── schemes.routes.ts            # Schemes & insurance API endpoints
└── controllers/
    └── schemes.controller.ts        # Eligibility, cards, claims, hospitals
```

### API Endpoints
```
GET    /api/schemes                    Get all government schemes
GET    /api/schemes/:id                Get scheme by ID
POST   /api/schemes/:id/eligibility    Check eligibility for scheme
GET    /api/schemes/applications/me    Get user's applications
GET    /api/schemes/insurance/cards    Get user's insurance cards
GET    /api/schemes/insurance/verify/:cardNumber  Verify card
GET    /api/schemes/insurance/claims   Get user's claims
POST   /api/schemes/insurance/preauth  Initiate pre-authorization
GET    /api/schemes/hospitals          Get empaneled hospitals
GET    /api/schemes/packages           Get coverage packages
```

### Supported Schemes
| Scheme | Coverage | Category |
|--------|----------|----------|
| Ayushman Bharat (PMJAY) | Rs. 5,00,000 | National |
| MJPJAY | Rs. 1,50,000 - 5,00,000 | State |
| Janani Suraksha Yojana | Rs. 1,400 - 6,000 | Maternal |
| PMSBY | Rs. 2,00,000 | Accident |
| PMJJBY | Rs. 2,00,000 | Life Insurance |
| RSBY | Rs. 30,000 | National |
| IGMSY | Rs. 5,000 | Maternal |
| NHM | Free Services | National |

---

## 🏥 Phase 7: Health Records & Medical History Management

### Medical Records Timeline
| Feature | Description |
|---------|-------------|
| **Timeline View** | Chronological display of all medical events with visual timeline |
| **Record Types** | Consultations, hospitalizations, surgeries, lab reports, prescriptions, vaccinations |
| **Category Icons** | Visual icons for each record type with color coding |
| **Search & Filter** | Search by diagnosis, doctor, facility; filter by record type |
| **Record Details** | Detailed view with diagnosis, doctor info, facility, and metadata |
| **Share Records** | Share specific records with doctors for teleconsultation |
| **Export Options** | Download records as PDF or JSON format |
| **Bilingual Support** | Full English and Marathi support for all records |

### Lab Reports Dashboard
| Feature | Description |
|---------|-------------|
| **Report Browser** | View all lab reports with expandable result tables |
| **Categories** | Blood tests, lipid profile, diabetes, thyroid, kidney, liver, etc. |
| **Result Status** | Color-coded indicators for normal, low, high, critical values |
| **Normal Ranges** | Display reference ranges alongside actual values |
| **Trend Analysis** | Historical trend visualization for key parameters |
| **Abnormal Alerts** | Highlighted reports with abnormal findings |
| **Download & Print** | Export individual reports as PDF |
| **Stats Dashboard** | Summary cards for total, normal, abnormal, pending reports |

### Vaccination Records
| Feature | Description |
|---------|-------------|
| **Immunization History** | Complete vaccination history with dose tracking |
| **Dose Progress** | Visual progress for multi-dose vaccines (1/2, 2/3, etc.) |
| **Upcoming Reminders** | Alert banner for scheduled and overdue vaccinations |
| **CoWIN Integration** | Synced with government vaccination portal |
| **Certificate Download** | Download vaccination certificates with QR codes |
| **Manufacturer Info** | Batch numbers, manufacturer details for each vaccine |
| **Recommended Vaccines** | Age-appropriate vaccine recommendations |
| **Facility Tracking** | Record of where each vaccine was administered |

### Allergies & Chronic Conditions
| Feature | Description |
|---------|-------------|
| **Allergy Registry** | Track drug, food, environmental, insect allergies |
| **Severity Levels** | Mild, moderate, severe, life-threatening classification |
| **Reaction Details** | Documented allergic reactions for each allergen |
| **Chronic Conditions** | Track conditions like hypertension, diabetes, etc. |
| **ICD Codes** | Medical coding for conditions |
| **Medication Tracking** | Current medications for each condition |
| **Review Dates** | Last and next review date scheduling |
| **Doctor Alerts** | Important notices displayed to healthcare providers |

### Technical Implementation
```
Frontend:
├── services/
│   └── healthRecordsService.ts      # Records, labs, vaccines, allergies
└── pages/patient/
    ├── MedicalRecords.tsx           # Timeline, allergies, conditions, docs
    ├── LabReports.tsx               # Lab results, trends, categories
    └── VaccinationRecords.tsx       # Immunization history, reminders

Backend:
├── routes/
│   └── healthRecords.routes.ts      # Health records API endpoints
└── controllers/
    └── healthRecords.controller.ts  # Records, labs, vaccines, allergies
```

### API Endpoints
```
GET    /api/health-records/records/:patientId       Get medical records
GET    /api/health-records/records/detail/:id       Get record by ID
GET    /api/health-records/labs/:patientId          Get lab reports
GET    /api/health-records/labs/detail/:id          Get lab report by ID
GET    /api/health-records/labs/:patientId/trends   Get lab parameter trends
GET    /api/health-records/vaccinations/:patientId  Get vaccinations
GET    /api/health-records/vaccinations/:patientId/upcoming  Get upcoming vaccines
GET    /api/health-records/allergies/:patientId     Get allergies
POST   /api/health-records/allergies                Add new allergy
GET    /api/health-records/conditions/:patientId    Get chronic conditions
GET    /api/health-records/summary/:patientId       Get health summary
POST   /api/health-records/share/:patientId         Share records with doctor
GET    /api/health-records/export/:patientId        Export records
```

---

## 📸 Screenshots

### Landing Page
![Landing Page](docs/screenshots/landing.png)

### Patient Dashboard
![Patient Dashboard](docs/screenshots/patient-dashboard.png)

### Video Consultation
![Video Call](docs/screenshots/video-call.png)

### AI Analysis Panel
![AI Analysis](docs/screenshots/ai-analysis.png)

### Health Worker (Offline Mode)
![Health Worker](docs/screenshots/health-worker.png)

### Admin Dashboard
![Admin Dashboard](docs/screenshots/admin-dashboard.png)

---

## ⚠️ Important Disclaimer

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                              MEDICAL DISCLAIMER                               ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  SwasthyaSetu provides AI-assisted PRELIMINARY health risk assessment.       ║
║                                                                              ║
║  THIS IS NOT A SUBSTITUTE FOR PROFESSIONAL MEDICAL ADVICE, DIAGNOSIS,        ║
║  OR TREATMENT.                                                               ║
║                                                                              ║
║  • Always consult a qualified healthcare provider                            ║
║  • In emergencies, call 112 or visit nearest hospital                        ║
║  • AI assessments are for guidance only, not diagnosis                       ║
║  • The platform facilitates consultations, does not replace doctors          ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Team

**SwasthyaSetu Development Team**

Built with ❤️ for Smart India Hackathon 2024

---

## 🙏 Acknowledgments

- Government of Maharashtra for the problem statement
- Smart India Hackathon 2024 organizers
- Open source community for amazing tools and libraries

---

<p align="center">
  <strong>SwasthyaSetu - Healthcare Beyond Distance</strong><br>
  <em>Bridging the gap between rural communities and quality healthcare</em>
</p>
