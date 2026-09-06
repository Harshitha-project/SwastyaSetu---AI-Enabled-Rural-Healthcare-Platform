import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { useAuth } from '../../hooks/useAuth'
import { patientService } from '../../services/patientService'
import type { Patient } from '../../types'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  User,
  MapPin,
  Phone,
  Heart,
  AlertCircle,
  Save,
  CheckCircle2,
  Shield,
  Activity,
  Calendar,
  Sparkles,
} from 'lucide-react'

const Profile: React.FC = () => {
  const { t, i18n } = useTranslation()
  const { user } = useAuth()
  const [profile, setProfile] = useState<Patient | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [savedSuccess, setSavedSuccess] = useState(false)

  // Form states
  const [formData, setFormData] = useState({
    dateOfBirth: '1992-05-14',
    gender: 'F' as 'M' | 'F' | 'OTHER',
    bloodGroup: 'B+',
    village: 'Khed',
    taluka: 'Shirur',
    district: 'Pune',
    state: 'Maharashtra',
    pincode: '410501',
    emergencyName: 'Sanjay Sharma',
    emergencyPhone: '9822012345',
    emergencyRelation: 'Spouse',
    allergies: 'Penicillin, Dust mites',
    medicalHistory: 'Mild Seasonal Allergies',
    currentMedications: 'Cetirizine 10mg',
  })

  useEffect(() => {
    async function loadData() {
      setIsLoading(true)
      try {
        const data = await patientService.getMyProfile()
        setProfile(data)
        setFormData({
          dateOfBirth: data.dateOfBirth ? data.dateOfBirth.split('T')[0] : '1992-05-14',
          gender: data.gender || 'F',
          bloodGroup: data.bloodGroup || 'B+',
          village: data.address?.village || 'Khed',
          taluka: data.address?.taluka || 'Shirur',
          district: data.address?.district || 'Pune',
          state: data.address?.state || 'Maharashtra',
          pincode: data.address?.pincode || '410501',
          emergencyName: data.emergencyContact?.name || 'Sanjay Sharma',
          emergencyPhone: data.emergencyContact?.phone || '9822012345',
          emergencyRelation: data.emergencyContact?.relation || 'Spouse',
          allergies: data.allergies?.join(', ') || 'Penicillin',
          medicalHistory: data.medicalHistory?.join(', ') || 'None',
          currentMedications: data.currentMedications?.join(', ') || 'None',
        })
      } catch (e) {
        console.error('Failed to load profile', e)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setSavedSuccess(false)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      const updated = await patientService.updateProfile({
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        bloodGroup: formData.bloodGroup,
        address: {
          village: formData.village,
          taluka: formData.taluka,
          district: formData.district,
          state: formData.state,
          pincode: formData.pincode,
        },
        emergencyContact: {
          name: formData.emergencyName,
          phone: formData.emergencyPhone,
          relation: formData.emergencyRelation,
        },
        allergies: formData.allergies.split(',').map(s => s.trim()).filter(Boolean),
        medicalHistory: formData.medicalHistory.split(',').map(s => s.trim()).filter(Boolean),
        currentMedications: formData.currentMedications.split(',').map(s => s.trim()).filter(Boolean),
      })
      setProfile(updated)
      setSavedSuccess(true)
      setTimeout(() => setSavedSuccess(false), 4000)
    } catch (err) {
      console.error('Failed to update profile', err)
    } finally {
      setIsSaving(false)
    }
  }

  const isMarathi = i18n.language === 'mr'

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header Banner */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary-600 via-primary-700 to-indigo-800 p-6 md:p-8 text-white shadow-lg"
      >
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl font-bold border border-white/30 text-white shadow-inner">
              {user?.firstName?.charAt(0) || 'P'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight">
                  {user?.firstName} {user?.lastName}
                </h1>
                <Badge className="bg-emerald-500/20 text-emerald-200 border-emerald-400/30 text-xs">
                  ABHA ID: 91-8402-9182-3841
                </Badge>
              </div>
              <p className="text-primary-100 text-sm mt-1 flex items-center gap-2">
                <Phone className="w-3.5 h-3.5" /> +91 {user?.phone || '9876543210'} • {formData.village}, {formData.district}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20 text-center">
              <span className="text-xs text-primary-200 block">{isMarathi ? 'रक्तगट' : 'Blood Group'}</span>
              <span className="text-lg font-bold text-white">{formData.bloodGroup}</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20 text-center">
              <span className="text-xs text-primary-200 block">{isMarathi ? 'आरोग्य जोखीम' : 'Risk Profile'}</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 border border-emerald-400/40">
                {profile?.riskLevel || 'LOW'}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {savedSuccess && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <Alert className="bg-emerald-50 border-emerald-300 text-emerald-800">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            <AlertTitle className="font-semibold">{isMarathi ? 'माहिती सेव्ह झाली!' : 'Profile Updated Successfully!'}</AlertTitle>
            <AlertDescription className="text-sm">
              {isMarathi ? 'तुमचे आरोग्य प्रोफाइल सुरक्षितपणे अद्ययावत केले गेले आहे.' : 'Your rural health card information has been saved securely to SwasthyaSetu.'}
            </AlertDescription>
          </Alert>
        </motion.div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Basic Health Information */}
        <Card className="border-border/60 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2 text-primary-600">
              <User className="w-5 h-5" />
              <CardTitle className="text-lg">{isMarathi ? 'मूलभूत वैयक्तिक माहिती' : 'Basic Demographics'}</CardTitle>
            </div>
            <CardDescription>
              {isMarathi ? 'तुमची मूलभूत माहिती आणि रक्तगट तपशील' : 'Key demographic details used during doctor consultations'}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="dateOfBirth">{isMarathi ? 'जन्मतारीख' : 'Date of Birth'}</Label>
              <Input
                id="dateOfBirth"
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="gender">{isMarathi ? 'लिंग' : 'Gender'}</Label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="M">Male / पुरुष</option>
                <option value="F">Female / महिला</option>
                <option value="OTHER">Other / इतर</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bloodGroup">{isMarathi ? 'रक्तगट' : 'Blood Group'}</Label>
              <select
                id="bloodGroup"
                name="bloodGroup"
                value={formData.bloodGroup}
                onChange={handleChange}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="A+">A Positive (A+)</option>
                <option value="A-">A Negative (A-)</option>
                <option value="B+">B Positive (B+)</option>
                <option value="B-">B Negative (B-)</option>
                <option value="AB+">AB Positive (AB+)</option>
                <option value="AB-">AB Negative (AB-)</option>
                <option value="O+">O Positive (O+)</option>
                <option value="O-">O Negative (O-)</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Rural Address & Location */}
        <Card className="border-border/60 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2 text-primary-600">
              <MapPin className="w-5 h-5" />
              <CardTitle className="text-lg">{isMarathi ? 'पत्ता व गाव तपशील' : 'Village & Geographical Location'}</CardTitle>
            </div>
            <CardDescription>
              {isMarathi ? 'जवळचे प्राथमिक आरोग्य केंद्र (PHC) जोडण्यासाठी आवश्यक' : 'Assists in locating the nearest PHC/CHC and field health worker'}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="village">{isMarathi ? 'गाव' : 'Village'}</Label>
              <Input
                id="village"
                name="village"
                value={formData.village}
                onChange={handleChange}
                placeholder="e.g. Khed"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="taluka">{isMarathi ? 'तालुका' : 'Taluka'}</Label>
              <Input
                id="taluka"
                name="taluka"
                value={formData.taluka}
                onChange={handleChange}
                placeholder="e.g. Shirur"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="district">{isMarathi ? 'जिल्हा' : 'District'}</Label>
              <Input
                id="district"
                name="district"
                value={formData.district}
                onChange={handleChange}
                placeholder="e.g. Pune"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="state">{isMarathi ? 'राज्य' : 'State'}</Label>
              <Input
                id="state"
                name="state"
                value={formData.state}
                disabled
                className="bg-muted"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pincode">{isMarathi ? 'पिनकोड' : 'Pincode'}</Label>
              <Input
                id="pincode"
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
                placeholder="e.g. 410501"
              />
            </div>
          </CardContent>
        </Card>

        {/* Emergency Contact */}
        <Card className="border-border/60 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2 text-rose-600">
              <Phone className="w-5 h-5" />
              <CardTitle className="text-lg">{isMarathi ? 'आपत्कालीन संपर्क' : 'Emergency Contact'}</CardTitle>
            </div>
            <CardDescription>
              {isMarathi ? 'आपत्कालीन परिस्थितीत संपर्क करण्यासाठी व्यक्ती' : 'Contact person notified during high-risk health alerts or ambulance dispatches'}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="emergencyName">{isMarathi ? 'नातेवाईकाचे नाव' : 'Contact Name'}</Label>
              <Input
                id="emergencyName"
                name="emergencyName"
                value={formData.emergencyName}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="emergencyRelation">{isMarathi ? 'नाते' : 'Relationship'}</Label>
              <Input
                id="emergencyRelation"
                name="emergencyRelation"
                value={formData.emergencyRelation}
                onChange={handleChange}
                placeholder="e.g. Spouse, Brother, Mother"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="emergencyPhone">{isMarathi ? 'मोबाईल नंबर' : 'Phone Number'}</Label>
              <Input
                id="emergencyPhone"
                name="emergencyPhone"
                value={formData.emergencyPhone}
                onChange={handleChange}
              />
            </div>
          </CardContent>
        </Card>

        {/* Clinical History & Allergies */}
        <Card className="border-border/60 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2 text-amber-600">
              <AlertCircle className="w-5 h-5" />
              <CardTitle className="text-lg">{isMarathi ? 'वैद्यकीय इतिहास आणि ॲलर्जी' : 'Medical History & Allergies'}</CardTitle>
            </div>
            <CardDescription>
              {isMarathi ? 'डॉक्टरांना योग्य औषधे देण्यास मदत होते' : 'Prevents adverse drug interactions during teleconsultation'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="allergies">{isMarathi ? 'औषध किंवा अन्नाची ॲलर्जी' : 'Known Drug & Food Allergies'}</Label>
              <Input
                id="allergies"
                name="allergies"
                value={formData.allergies}
                onChange={handleChange}
                placeholder="e.g. Penicillin, Sulfa, Peanuts (comma separated)"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="medicalHistory">{isMarathi ? 'मागील आजार / जुनाट व्याधी' : 'Chronic Medical Conditions'}</Label>
              <Input
                id="medicalHistory"
                name="medicalHistory"
                value={formData.medicalHistory}
                onChange={handleChange}
                placeholder="e.g. Hypertension, Asthma, Diabetes, Thyroid"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="currentMedications">{isMarathi ? 'सध्या सुरू असलेली औषधे' : 'Current Daily Medications'}</Label>
              <Input
                id="currentMedications"
                name="currentMedications"
                value={formData.currentMedications}
                onChange={handleChange}
                placeholder="e.g. Amlodipine 5mg, Metformin 500mg"
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end pt-4 border-t border-border/40">
            <Button type="submit" disabled={isSaving} className="gap-2 px-6">
              {isSaving ? (
                <>
                  <Activity className="w-4 h-4 animate-spin" />
                  {isMarathi ? 'जतन करत आहे...' : 'Saving...'}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {isMarathi ? 'माहिती सेव्ह करा' : 'Save Health Profile'}
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}

export default Profile
