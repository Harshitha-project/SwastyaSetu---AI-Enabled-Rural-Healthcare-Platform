import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { recordsService } from '../../services/recordsService'
import type { MedicineReminder } from '../../types'
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
import {
  Bell,
  CheckCircle2,
  Clock,
  Pill,
  PlusCircle,
  Calendar,
  AlertCircle,
  Check,
  Flame,
  Volume2,
} from 'lucide-react'

const MedicineReminders: React.FC = () => {
  const { t, i18n } = useTranslation()
  const [reminders, setReminders] = useState<MedicineReminder[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({
    medicineName: '',
    dosage: '1 tablet',
    frequency: 'TWICE_DAILY' as 'ONCE_DAILY' | 'TWICE_DAILY' | 'THRICE_DAILY',
    timeSlot: '09:00 AM',
    instructions: 'After meals',
  })

  useEffect(() => {
    recordsService.getReminders().then(setReminders)
  }, [])

  const todayStr = new Date().toISOString().split('T')[0]

  const handleToggle = async (id: string) => {
    const updated = await recordsService.toggleReminderStatus(id)
    setReminders(updated)
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.medicineName.trim()) return

    const newRem = await recordsService.addReminder({
      medicineName: formData.medicineName,
      dosage: formData.dosage,
      frequency: formData.frequency,
      timeSlots: [formData.timeSlot],
      instructions: formData.instructions,
    })
    setReminders(prev => [newRem, ...prev])
    setShowAddForm(false)
    setFormData({
      medicineName: '',
      dosage: '1 tablet',
      frequency: 'TWICE_DAILY',
      timeSlot: '09:00 AM',
      instructions: 'After meals',
    })
  }

  const takenCount = reminders.filter(r => r.history.some(h => h.date === todayStr && h.taken)).length
  const totalCount = reminders.length

  const isMarathi = i18n.language === 'mr'

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Bell className="w-7 h-7 text-primary-600" />
            {isMarathi ? '💊 औषधांचे स्मरणपत्र (Medicine Reminders)' : 'Daily Medicine Reminders'}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {isMarathi
              ? 'वेळेवर औषधे घ्या आणि तुमचे दैनंदिन आरोग्य ट्रॅक करा.'
              : 'Track daily dosages and maintain your medication adherence streak.'}
          </p>
        </div>

        <Button
          onClick={() => setShowAddForm(!showAddForm)}
          className="gap-2 shrink-0 bg-gradient-to-r from-primary-600 to-indigo-600 text-white"
        >
          <PlusCircle className="w-4 h-4" />
          {showAddForm ? (isMarathi ? 'रद्द करा' : 'Close Form') : (isMarathi ? '+ नवीन औषध जोडा' : '+ Add Reminder')}
        </Button>
      </div>

      {/* Progress & Streak Card */}
      <Card className="border-border/70 shadow-xs bg-gradient-to-r from-primary-500/10 via-indigo-500/5 to-transparent p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-primary-700 dark:text-primary-300 uppercase tracking-wider">
              {isMarathi ? 'आजचे औषध वेळापत्रक' : "Today's Adherence"}
            </span>
            <h3 className="text-xl font-bold text-foreground">
              {isMarathi
                ? `${totalCount} पैकी ${takenCount} औषधे पूर्ण`
                : `${takenCount} of ${totalCount} doses completed today`}
            </h3>
            <p className="text-xs text-muted-foreground">
              {takenCount === totalCount && totalCount > 0
                ? (isMarathi ? '🎉 उत्कृष्ट! आजची सर्व औषधे पूर्ण घेतली.' : '🎉 Perfect! All prescribed doses taken for today.')
                : (isMarathi ? 'वेळेवर औषधे घेतल्याने आजार लवकर बरा होतो.' : 'Consistent medication leads to faster recovery.')}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 p-3 rounded-2xl bg-card border border-border shadow-xs">
              <Flame className="w-6 h-6 text-amber-500 fill-amber-500" />
              <div>
                <span className="text-xs text-muted-foreground block">Streak</span>
                <span className="text-base font-black text-foreground">7 Days</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Add New Reminder Form */}
      {showAddForm && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
          <Card className="border-primary-500/60 shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold">
                {isMarathi ? 'नवीन औषध स्मरणपत्र जोडा' : 'Add Medication Reminder'}
              </CardTitle>
              <CardDescription>
                {isMarathi ? 'गोळीचे नाव, प्रमाण आणि वेळ निवडा' : 'Specify dosage, timing, and meal instructions'}
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleAdd}>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="medName">{isMarathi ? 'औषधाचे नाव' : 'Medicine Name'}</Label>
                  <Input
                    id="medName"
                    value={formData.medicineName}
                    onChange={e => setFormData(prev => ({ ...prev, medicineName: e.target.value }))}
                    placeholder="e.g. Paracetamol 650mg"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="medDosage">{isMarathi ? 'प्रमाण (Dosage)' : 'Dosage'}</Label>
                  <Input
                    id="medDosage"
                    value={formData.dosage}
                    onChange={e => setFormData(prev => ({ ...prev, dosage: e.target.value }))}
                    placeholder="1 tablet / 5ml"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="medTime">{isMarathi ? 'वेळ (Time)' : 'Time'}</Label>
                  <Input
                    id="medTime"
                    value={formData.timeSlot}
                    onChange={e => setFormData(prev => ({ ...prev, timeSlot: e.target.value }))}
                    placeholder="09:00 AM"
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2 pt-3 border-t border-border/50">
                <Button variant="ghost" type="button" onClick={() => setShowAddForm(false)}>
                  {isMarathi ? 'रद्द करा' : 'Cancel'}
                </Button>
                <Button type="submit" className="gap-1.5">
                  <PlusCircle className="w-4 h-4" />
                  {isMarathi ? 'जोडा' : 'Save Reminder'}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </motion.div>
      )}

      {/* Reminder Checklist Cards */}
      <div className="space-y-3">
        {reminders.map(rem => {
          const isTaken = rem.history.some(h => h.date === todayStr && h.taken)
          return (
            <Card
              key={rem.id || rem._id}
              className={`p-4 border-2 transition-all flex items-center justify-between gap-4 ${
                isTaken
                  ? 'border-emerald-300 dark:border-emerald-900 bg-emerald-50/30 dark:bg-emerald-950/10'
                  : 'border-border bg-card'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <button
                  type="button"
                  onClick={() => handleToggle(rem.id || rem._id)}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer border ${
                    isTaken
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-muted text-muted-foreground border-border hover:border-primary/60'
                  }`}
                  title={isTaken ? 'Mark as Pending' : 'Mark as Taken'}
                >
                  {isTaken ? <Check className="w-5 h-5 stroke-[3]" /> : <Clock className="w-4 h-4" />}
                </button>

                <div>
                  <div className="flex items-center gap-2">
                    <h4 className={`font-semibold text-sm ${isTaken ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                      {rem.medicineName}
                    </h4>
                    <Badge variant="outline" className="text-[10px]">
                      {rem.dosage}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                    <span className="flex items-center gap-1 font-medium text-foreground">
                      <Clock className="w-3 h-3 text-primary-600" />
                      {rem.timeSlots.join(', ')}
                    </span>
                    {rem.instructions && <span>• {rem.instructions}</span>}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant={isTaken ? 'secondary' : 'default'}
                  onClick={() => handleToggle(rem.id || rem._id)}
                  className={`text-xs gap-1.5 h-8 font-medium ${
                    !isTaken && 'bg-gradient-to-r from-primary-600 to-indigo-600 text-white'
                  }`}
                >
                  {isTaken ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      {isMarathi ? 'घेतले (Taken)' : 'Taken'}
                    </>
                  ) : (
                    <>
                      <Pill className="w-3.5 h-3.5" />
                      {isMarathi ? 'घेतले म्हणून खूण करा' : 'Mark Taken'}
                    </>
                  )}
                </Button>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

export default MedicineReminders
