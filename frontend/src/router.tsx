import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'

// Layouts
import PublicLayout from './components/layout/PublicLayout'
import DashboardLayout from './components/layout/DashboardLayout'

// Public Pages
import Landing from './pages/public/Landing'
import Login from './pages/public/Login'
import Register from './pages/public/Register'
import About from './pages/public/About'
import Emergency from './pages/public/Emergency'

// Patient Pages
import PatientDashboard from './pages/patient/Dashboard'
import PatientProfile from './pages/patient/Profile'
import HealthAssessment from './pages/patient/HealthAssessment'
import PatientAppointments from './pages/patient/Appointments'
import BookAppointment from './pages/patient/BookAppointment'
import HealthRecords from './pages/patient/HealthRecords'
import MedicalRecords from './pages/patient/MedicalRecords'
import LabReports from './pages/patient/LabReports'
import VaccinationRecords from './pages/patient/VaccinationRecords'
import Prescriptions from './pages/patient/Prescriptions'
import MedicineReminders from './pages/patient/MedicineReminders'
import FindFacility from './pages/patient/FindFacility'
import PharmacyLocator from './pages/patient/PharmacyLocator'
import FindDoctor from './pages/patient/FindDoctor'
import PatientTeleconsultation from './pages/patient/Teleconsultation'
import HealthMonitoring from './pages/patient/HealthMonitoring'
import HealthEducation from './pages/patient/HealthEducation'
import PatientSettings from './pages/patient/Settings'
import EmergencySOS from './pages/patient/EmergencySOS'
import HealthAlerts from './pages/patient/HealthAlerts'
import GovernmentSchemes from './pages/patient/GovernmentSchemes'
import InsuranceClaims from './pages/patient/InsuranceClaims'

// Doctor Pages
import DoctorDashboard from './pages/doctor/Dashboard'
import DoctorPatients from './pages/doctor/Patients'
import PatientDetail from './pages/doctor/PatientDetail'
import DoctorAppointments from './pages/doctor/Appointments'
import DoctorConsultation from './pages/doctor/Consultation'
import DoctorPrescriptions from './pages/doctor/Prescriptions'
import DoctorSchedule from './pages/doctor/Schedule'

// Health Worker Pages
import WorkerDashboard from './pages/healthworker/Dashboard'
import RegisterPatient from './pages/healthworker/RegisterPatient'
import PatientSearch from './pages/healthworker/PatientSearch'
import RecordVitals from './pages/healthworker/RecordVitals'
import Screenings from './pages/healthworker/Screenings'
import PendingSync from './pages/healthworker/PendingSync'
import Referrals from './pages/healthworker/Referrals'

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard'
import AdminPatients from './pages/admin/Patients'
import AdminDoctors from './pages/admin/Doctors'
import AdminHealthWorkers from './pages/admin/HealthWorkers'
import AdminFacilities from './pages/admin/Facilities'
import AdminAppointments from './pages/admin/Appointments'
import AdminAnalytics from './pages/admin/Analytics'
import AdminSettings from './pages/admin/Settings'

// Protected Route Component
import ProtectedRoute from './components/auth/ProtectedRoute'

export default function AppRouter() {
  const { user } = useAuth()

  // Redirect based on user role
  const getDashboardRoute = () => {
    if (!user) return '/login'
    switch (user.role) {
      case 'PATIENT':
        return '/patient'
      case 'DOCTOR':
        return '/doctor'
      case 'HEALTH_WORKER':
        return '/worker'
      case 'ADMIN':
        return '/admin'
      default:
        return '/login'
    }
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/about" element={<About />} />
        <Route path="/emergency" element={<Emergency />} />
      </Route>

      {/* Public Test Routes for WebRTC (no auth required) */}
      <Route path="/test/doctor-call/:id" element={<DoctorConsultation />} />
      <Route path="/test/patient-call/:id" element={<PatientTeleconsultation />} />

      {/* Patient Routes */}
      <Route
        path="/patient"
        element={
          <ProtectedRoute allowedRoles={['PATIENT']}>
            <DashboardLayout role="PATIENT" />
          </ProtectedRoute>
        }
      >
        <Route index element={<PatientDashboard />} />
        <Route path="dashboard" element={<PatientDashboard />} />
        <Route path="profile" element={<PatientProfile />} />
        <Route path="assessment" element={<HealthAssessment />} />
        <Route path="appointments" element={<PatientAppointments />} />
        <Route path="book-appointment" element={<BookAppointment />} />
        <Route path="records" element={<MedicalRecords />} />
        <Route path="lab-reports" element={<LabReports />} />
        <Route path="vaccinations" element={<VaccinationRecords />} />
        <Route path="prescriptions" element={<Prescriptions />} />
        <Route path="reminders" element={<MedicineReminders />} />
        <Route path="facilities" element={<FindFacility />} />
        <Route path="pharmacies" element={<PharmacyLocator />} />
        <Route path="doctors" element={<FindDoctor />} />
        <Route path="consultation" element={<PatientTeleconsultation />} />
        <Route path="consultation/:id" element={<PatientTeleconsultation />} />
        <Route path="teleconsultation" element={<PatientTeleconsultation />} />
        <Route path="teleconsultation/:id" element={<PatientTeleconsultation />} />
        <Route path="monitoring" element={<HealthMonitoring />} />
        <Route path="education" element={<HealthEducation />} />
        <Route path="settings" element={<PatientSettings />} />
        <Route path="emergency" element={<EmergencySOS />} />
        <Route path="health-alerts" element={<HealthAlerts />} />
        <Route path="schemes" element={<GovernmentSchemes />} />
        <Route path="insurance" element={<InsuranceClaims />} />
      </Route>

      {/* Doctor Routes */}
      <Route
        path="/doctor"
        element={
          <ProtectedRoute allowedRoles={['DOCTOR']}>
            <DashboardLayout role="DOCTOR" />
          </ProtectedRoute>
        }
      >
        <Route index element={<DoctorDashboard />} />
        <Route path="dashboard" element={<DoctorDashboard />} />
        <Route path="patients" element={<DoctorPatients />} />
        <Route path="patients/:id" element={<PatientDetail />} />
        <Route path="appointments" element={<DoctorAppointments />} />
        <Route path="consultation" element={<DoctorConsultation />} />
        <Route path="consultation/:id" element={<DoctorConsultation />} />
        <Route path="prescriptions" element={<DoctorPrescriptions />} />
        <Route path="schedule" element={<DoctorSchedule />} />
      </Route>

      {/* Health Worker Routes */}
      <Route
        path="/worker"
        element={
          <ProtectedRoute allowedRoles={['HEALTH_WORKER']}>
            <DashboardLayout role="HEALTH_WORKER" />
          </ProtectedRoute>
        }
      >
        <Route index element={<WorkerDashboard />} />
        <Route path="dashboard" element={<WorkerDashboard />} />
        <Route path="register" element={<RegisterPatient />} />
        <Route path="search" element={<PatientSearch />} />
        <Route path="vitals" element={<RecordVitals />} />
        <Route path="vitals/:patientId" element={<RecordVitals />} />
        <Route path="screenings" element={<Screenings />} />
        <Route path="sync" element={<PendingSync />} />
        <Route path="referrals" element={<Referrals />} />
      </Route>

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <DashboardLayout role="ADMIN" />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="patients" element={<AdminPatients />} />
        <Route path="doctors" element={<AdminDoctors />} />
        <Route path="workers" element={<AdminHealthWorkers />} />
        <Route path="facilities" element={<AdminFacilities />} />
        <Route path="appointments" element={<AdminAppointments />} />
        <Route path="analytics" element={<AdminAnalytics />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>

      {/* Dashboard redirect */}
      <Route path="/dashboard" element={<Navigate to={getDashboardRoute()} replace />} />

      {/* 404 - Redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
