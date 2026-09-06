# SwasthyaSetu - Demo Guide & Test Cases

## Quick Start

### Prerequisites
1. **Node.js 18+** installed
2. **PostgreSQL 15+** running
3. **Two browser windows** (for video call testing)

### Start the Application

```bash
# Terminal 1: Start Backend
cd backend
npm run dev

# Terminal 2: Start Frontend
cd frontend
npm run dev
```

### Access URLs
| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:5000/api |
| Health Check | http://localhost:5000/health |

---

## Demo Accounts

### Patient Accounts
| Name | Email | Password |
|------|-------|----------|
| Priya Sharma | patient@demo.com | password123 |
| Ramesh Patil | patient2@demo.com | password123 |
| Sunita Jadhav | patient3@demo.com | password123 |
| Amit Deshmukh | patient4@demo.com | password123 |

### Doctor Accounts
| Name | Email | Password | Specialization |
|------|-------|----------|----------------|
| Dr. Rajesh Kulkarni | doctor@demo.com | password123 | General Medicine |
| Dr. Anjali Desai | doctor2@demo.com | password123 | Gynecology |
| Dr. Vikram Joshi | doctor3@demo.com | password123 | Pediatrics |
| Dr. Meena Sawant | doctor4@demo.com | password123 | Cardiology |

### Other Accounts
| Role | Email | Password |
|------|-------|----------|
| Health Worker | worker@demo.com | password123 |
| Admin | admin@demo.com | password123 |

---

## Complete Test Cases

### 1. Authentication System

#### TC-1.1: Patient Registration
1. Go to http://localhost:5173/register
2. Select "Patient" role
3. Fill in details:
   - Name: Test Patient
   - Email: test@example.com
   - Phone: 9876543210
   - Password: password123
4. Click "Register"
5. **Expected**: Redirects to patient dashboard

#### TC-1.2: Patient Login
1. Go to http://localhost:5173/login
2. Enter: patient@demo.com / password123
3. Click "Login"
4. **Expected**: Redirects to /patient dashboard with "Welcome, Priya" message

#### TC-1.3: Doctor Login
1. Go to http://localhost:5173/login
2. Enter: doctor@demo.com / password123
3. Click "Login"
4. **Expected**: Redirects to /doctor dashboard

#### TC-1.4: Logout
1. Click user avatar in header
2. Click "Logout"
3. **Expected**: Redirects to login page, session cleared

---

### 2. Video Teleconsultation (WebRTC)

#### TC-2.1: Test Video Call (No Auth Required)
1. Open Window 1: http://localhost:5173/test/patient-call/test-room
2. Open Window 2: http://localhost:5173/test/doctor-call/test-room
3. In Window 1: Click "Join Call" (allow camera/mic)
4. In Window 2: Click "Start Consultation" (allow camera/mic)
5. **Expected**: 
   - Both videos visible
   - Audio working
   - "Connected" status shown
   - Call duration timer running

#### TC-2.2: Video Controls
1. During active call:
   - Click mic button → Audio mutes
   - Click camera button → Video turns off
   - Click again → Restores
2. **Expected**: Icons change, peer sees status indicators

#### TC-2.3: In-Call Chat
1. During call, type message in chat box
2. Click Send
3. **Expected**: Message appears on both sides with sender name

#### TC-2.4: End Call
1. Click "End" button
2. **Expected**: 
   - Call disconnects
   - Returns to pre-call screen or completion screen

---

### 3. AI Health Assessment

#### TC-3.1: Symptom Checker
1. Login as patient
2. Go to /patient/assessment
3. Click "Start Assessment"
4. Enter symptoms: "fever, headache, body pain"
5. Answer follow-up questions
6. **Expected**: 
   - Risk score displayed (0-100)
   - Color-coded severity (green/yellow/red)
   - Recommendations shown
   - "Consult Doctor" button if high risk

---

### 4. Health Records & Medical History

#### TC-4.1: Medical Records Timeline
1. Login as patient
2. Go to /patient/records
3. **Expected**:
   - Timeline view of medical events
   - Filter by type (consultation, hospitalization, surgery)
   - Search functionality works
   - Click record → Detail dialog opens

#### TC-4.2: Lab Reports
1. Go to /patient/lab-reports
2. **Expected**:
   - Stats cards (total, normal, abnormal, pending)
   - Expandable report cards
   - Results table with status indicators (normal=green, high=amber, critical=red)
   - Trend visualization works

#### TC-4.3: Vaccination Records
1. Go to /patient/vaccinations
2. **Expected**:
   - Completed vaccinations list
   - Upcoming/overdue alerts banner
   - Dose progress (1/2, 2/3)
   - Click vaccine → Detail dialog with certificate download

#### TC-4.4: Allergies & Conditions
1. On /patient/records, click "Allergies" tab
2. **Expected**:
   - Allergies listed with severity badges
   - Drug allergies highlighted
   - Click "Conditions" tab → Chronic conditions shown

---

### 5. Digital Prescriptions

#### TC-5.1: View Prescriptions (Patient)
1. Login as patient
2. Go to /patient/prescriptions
3. **Expected**:
   - List of prescriptions with status (Valid/Expired)
   - Filter by status works
   - Search by diagnosis/medicine works

#### TC-5.2: Prescription Details
1. Click on a prescription
2. **Expected**:
   - Medications list with dosage, frequency, duration
   - Doctor info and facility
   - QR code visible
   - Download PDF button works
   - Print button works

#### TC-5.3: Create Prescription (Doctor)
1. Login as doctor
2. During consultation, use prescription builder
3. Add diagnosis, medicines, instructions
4. Click "Issue Prescription"
5. **Expected**: Prescription created and visible to patient

---

### 6. Pharmacy Locator

#### TC-6.1: Find Pharmacies
1. Login as patient
2. Go to /patient/pharmacies
3. **Expected**:
   - Map view with pharmacy markers
   - List view with pharmacy cards
   - Distance shown for each

#### TC-6.2: Pharmacy Filters
1. Apply filters:
   - Type: Jan Aushadhi Kendra
   - Open Now: ON
   - Home Delivery: ON
2. **Expected**: Filtered results displayed

#### TC-6.3: Pharmacy Actions
1. Click on a pharmacy
2. **Expected**:
   - Details shown (address, phone, hours)
   - "Get Directions" button works
   - "WhatsApp Order" button works

---

### 7. Emergency Services

#### TC-7.1: Emergency SOS
1. Go to /patient/emergency
2. Click large SOS button
3. Select emergency type (Cardiac, Accident, etc.)
4. **Expected**:
   - Location detected automatically
   - Emergency contacts notified (simulated)
   - Nearby hospitals listed
   - Emergency numbers displayed (112, 108)

#### TC-7.2: Health Alerts
1. Go to /patient/health-alerts
2. **Expected**:
   - Active advisories displayed
   - Disease outbreak alerts
   - Vaccination camps nearby
   - Severity color coding (red=critical, amber=warning)

---

### 8. Government Schemes & Insurance

#### TC-8.1: Browse Schemes
1. Go to /patient/schemes
2. **Expected**:
   - 8+ schemes listed (Ayushman Bharat, MJPJAY, etc.)
   - Search/filter works
   - Category icons displayed

#### TC-8.2: Eligibility Check
1. Click "Check Eligibility" on a scheme
2. Fill eligibility form
3. **Expected**:
   - Eligibility result shown (Eligible/Not Eligible)
   - Required documents listed

#### TC-8.3: Insurance Cards
1. Go to /patient/insurance
2. Click "My Cards" tab
3. **Expected**:
   - Insurance cards displayed
   - Coverage amount shown
   - QR code visible
   - Card verification works

#### TC-8.4: Claims Tracking
1. Click "Claims" tab
2. **Expected**:
   - Claims list with status
   - Timeline view of claim progress
   - Pre-authorization option available

---

### 9. Appointments

#### TC-9.1: Book Appointment
1. Login as patient
2. Go to /patient/book-appointment
3. Select doctor, date, time slot
4. Choose appointment type (Video/In-Person)
5. Add reason for visit
6. Click "Book Appointment"
7. **Expected**: Confirmation shown, appears in appointments list

#### TC-9.2: View Appointments
1. Go to /patient/appointments
2. **Expected**:
   - Upcoming appointments listed
   - Past appointments in separate section
   - Status badges (Confirmed, Completed, Cancelled)

#### TC-9.3: Cancel Appointment
1. Click on an upcoming appointment
2. Click "Cancel"
3. Confirm cancellation
4. **Expected**: Status changes to "Cancelled"

---

### 10. Health Worker Dashboard

#### TC-10.1: Offline Mode Indicator
1. Login as health worker
2. Go to /worker
3. Open DevTools → Network → Check "Offline"
4. **Expected**:
   - Offline banner appears
   - Data still visible (cached)
   - "Pending Sync" counter updates

#### TC-10.2: Patient Registration
1. Go to /worker/register
2. Fill patient details
3. Submit
4. **Expected**: Patient registered (or queued if offline)

#### TC-10.3: Record Vitals
1. Go to /worker/vitals
2. Search patient
3. Enter vitals (BP, pulse, temp, SpO2)
4. Submit
5. **Expected**: Vitals saved, appear in patient's record

#### TC-10.4: Sync Data
1. Go back online
2. Go to /worker/sync
3. Click "Sync All"
4. **Expected**: Pending items synced, counter resets

---

### 11. Admin Dashboard

#### TC-11.1: Real-time Stats
1. Login as admin
2. Go to /admin
3. **Expected**:
   - Live stats (patients, doctors, workers, facilities)
   - Charts and graphs
   - Real-time activity feed

#### TC-11.2: User Management
1. Go to /admin/patients
2. **Expected**:
   - Patient list with search/filter
   - Click patient → Details view
   - Edit/disable options

#### TC-11.3: Facility Management
1. Go to /admin/facilities
2. **Expected**:
   - Facilities list
   - Add new facility option
   - Edit facility details

---

### 12. PWA & Offline Features

#### TC-12.1: Install PWA
1. Open app in Chrome
2. Click install icon in address bar (or menu → Install)
3. **Expected**: App installs, icon appears on desktop/home

#### TC-12.2: Offline Functionality
1. Open DevTools → Application → Service Workers
2. Check "Offline"
3. Navigate the app
4. **Expected**:
   - Cached pages load
   - Offline indicator shows
   - Forms queue for sync

#### TC-12.3: Background Sync
1. Make changes while offline
2. Go back online
3. **Expected**: Changes sync automatically

---

### 13. Multilingual Support

#### TC-13.1: Switch Language
1. Click globe icon in header
2. Select "मराठी" (Marathi)
3. **Expected**: 
   - UI labels change to Marathi
   - Content in Marathi
   - Dates in Marathi format

#### TC-13.2: Hindi Support
1. Select "हिंदी" (Hindi)
2. **Expected**: UI changes to Hindi

---

## Demo Script for Presentation

### 5-Minute Quick Demo

1. **Landing Page (30s)**
   - Show hero section
   - Highlight key features
   - Show language switcher

2. **Patient Journey (2min)**
   - Login as patient
   - Show dashboard with health summary
   - Quick AI health assessment
   - Show medical records timeline
   - Show prescription history

3. **Video Consultation (1.5min)**
   - Open two browser windows
   - Join test call as patient and doctor
   - Show video/audio working
   - Show AI analysis panel (doctor side)
   - Show in-call chat

4. **Emergency & Schemes (1min)**
   - Show Emergency SOS page
   - Show Government Schemes browser
   - Show Insurance cards

### 15-Minute Full Demo

1. **Introduction (1min)**
   - Problem statement: Rural healthcare access
   - Solution overview

2. **Patient Features (4min)**
   - Registration/Login
   - Dashboard walkthrough
   - AI Health Assessment
   - Medical Records, Lab Reports, Vaccinations
   - Prescriptions & Pharmacy Locator
   - Emergency SOS

3. **Teleconsultation (3min)**
   - Book appointment
   - Join video call
   - Doctor's AI analysis view
   - Create prescription
   - End call with summary

4. **Health Worker (2min)**
   - Offline-first dashboard
   - Patient registration
   - Vitals recording
   - Sync demonstration

5. **Admin Dashboard (2min)**
   - Real-time monitoring
   - User management
   - Analytics

6. **Technical Highlights (2min)**
   - PWA installation
   - Offline mode demo
   - WebRTC architecture
   - Security features

7. **Q&A (1min)**

---

## Known Limitations (Demo Notes)

1. **AI Analysis**: Uses simulated data for demo (real ML models needed for production)
2. **SMS/Notifications**: Simulated in demo (real gateway needed)
3. **Payment Gateway**: Not integrated (placeholder for claims)
4. **Video Recording**: Feature available but storage not configured
5. **Geolocation**: Requires HTTPS in production for accurate GPS

---

## Troubleshooting

### Backend Won't Start
```bash
# Check if PostgreSQL is running
# Check .env file has correct DATABASE_URL
cd backend
npx prisma db push
npm run seed
npm run dev
```

### WebSocket Connection Failed
```bash
# Ensure backend is running on port 5000
# Check VITE_SOCKET_URL in frontend/.env
# Clear browser cache and refresh
```

### Video Not Working
1. Allow camera/microphone permissions
2. Use Chrome/Edge (best WebRTC support)
3. Both windows must use same room ID
4. Check console for errors

### Offline Mode Issues
```bash
# Clear service worker cache
# DevTools → Application → Storage → Clear site data
# Reload page
```

---

## API Testing with curl

### Health Check
```bash
curl http://localhost:5000/health
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"patient@demo.com","password":"password123"}'
```

### Get Schemes
```bash
curl http://localhost:5000/api/schemes
```

### Get Health Records
```bash
curl http://localhost:5000/api/health-records/records/pat-001
```

### Get Lab Reports
```bash
curl http://localhost:5000/api/health-records/labs/pat-001
```

### Get Vaccinations
```bash
curl http://localhost:5000/api/health-records/vaccinations/pat-001
```

---

## Feature Checklist for Demo

### Must Show
- [ ] Patient login & dashboard
- [ ] Video teleconsultation (both sides)
- [ ] AI health assessment
- [ ] Medical records timeline
- [ ] Digital prescription with PDF
- [ ] Emergency SOS
- [ ] Government schemes
- [ ] Multilingual (switch to Marathi)

### Nice to Show
- [ ] Health worker offline mode
- [ ] Admin real-time dashboard
- [ ] Lab reports with trends
- [ ] Vaccination records
- [ ] Pharmacy locator
- [ ] PWA installation

---

<p align="center">
<strong>SwasthyaSetu - Healthcare Beyond Distance</strong><br>
<em>स्वास्थ्यसेतू - अंतराच्या पलीकडे आरोग्यसेवा</em>
</p>
