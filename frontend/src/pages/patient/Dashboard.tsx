import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Activity,
  Calendar,
  MapPin,
  FileText,
  Heart,
  Thermometer,
  Wind,
  Droplets,
  ArrowRight,
  Sparkles,
  Video,
  Clock,
  TrendingUp,
  Bell,
  BookOpen,
  Pill,
} from 'lucide-react';

import { appointmentService } from '../../services/appointmentService';
import { recordsService } from '../../services/recordsService';
import type { Appointment, MedicineReminder } from '../../types';

const PatientDashboard: React.FC = () => {
  const { user } = useAuth();
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [medicineReminders, setMedicineReminders] = useState<MedicineReminder[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    Promise.all([
      appointmentService.getUpcomingAppointments(),
      recordsService.getReminders(),
    ]).then(([apts, rems]) => {
      setUpcomingAppointments(apts.slice(0, 3));
      setMedicineReminders(rems.slice(0, 4));
      setIsLoadingData(false);
    });
  }, []);

  const handleToggleMed = async (id: string) => {
    const updated = await recordsService.toggleReminderStatus(id);
    setMedicineReminders(updated.slice(0, 4));
  };

  const todayStr = new Date().toISOString().split('T')[0];

  // Recent vitals
  const recentVitals = {
    heartRate: { value: 74, status: 'normal', trend: 'stable' },
    bloodPressure: { value: '120/80', status: 'normal', trend: 'stable' },
    temperature: { value: 98.6, status: 'normal', trend: 'stable' },
    oxygenLevel: { value: 98, status: 'normal', trend: 'up' },
  };


  const quickActions = [
    {
      title: 'AI Health Check',
      description: 'Get instant health assessment',
      icon: Activity,
      link: '/patient/assessment',
      gradient: 'from-violet-500 to-purple-600',
    },
    {
      title: 'Book Appointment',
      description: 'Schedule a consultation',
      icon: Calendar,
      link: '/patient/book-appointment',
      gradient: 'from-emerald-500 to-teal-600',
    },
    {
      title: 'Find Facility',
      description: 'Locate nearby hospitals',
      icon: MapPin,
      link: '/patient/facilities',
      gradient: 'from-blue-500 to-cyan-600',
    },
    {
      title: 'My Records',
      description: 'View medical history',
      icon: FileText,
      link: '/patient/records',
      gradient: 'from-amber-500 to-orange-600',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Welcome Section */}
      <motion.div variants={itemVariants}>
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 p-6 md:p-8 text-white">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-60 h-60 bg-secondary-400 rounded-full blur-3xl" />
          </div>
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">
                {getGreeting()}, {(user as any)?.firstName || (user as any)?.name?.split(' ')[0] || 'there'}!
              </h1>
              <p className="text-primary-100 text-sm md:text-base max-w-md">
                Welcome to your health dashboard. Track your vitals, manage appointments, and stay on top of your health.
              </p>
            </div>
            <Link to="/patient/assessment">
              <Button 
                size="lg" 
                className="bg-white text-primary-700 hover:bg-primary-50 shadow-lg"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                AI Health Check
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <Link key={index} to={action.link}>
              <Card className="group cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 overflow-hidden h-full">
                <CardContent className="p-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center text-white mb-3 group-hover:scale-110 transition-transform shadow-lg`}>
                    <action.icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{action.title}</h3>
                  <p className="text-xs text-gray-500">{action.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Vitals */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-semibold">Recent Vitals</CardTitle>
              <Link to="/patient/monitoring">
                <Button variant="ghost" size="sm" className="text-primary-600">
                  View All <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-xl p-4 border border-rose-100">
                  <div className="flex items-center gap-2 text-rose-600 mb-2">
                    <Heart className="w-5 h-5" />
                    <span className="text-sm font-medium">Heart Rate</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-gray-900">{recentVitals.heartRate.value}</span>
                    <span className="text-sm text-gray-500">bpm</span>
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp className="w-3 h-3 text-green-500" />
                    <span className="text-xs text-green-600">Normal</span>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                  <div className="flex items-center gap-2 text-blue-600 mb-2">
                    <Droplets className="w-5 h-5" />
                    <span className="text-sm font-medium">Blood Pressure</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-gray-900">{recentVitals.bloodPressure.value}</span>
                    <span className="text-sm text-gray-500">mmHg</span>
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp className="w-3 h-3 text-green-500" />
                    <span className="text-xs text-green-600">Normal</span>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl p-4 border border-amber-100">
                  <div className="flex items-center gap-2 text-amber-600 mb-2">
                    <Thermometer className="w-5 h-5" />
                    <span className="text-sm font-medium">Temperature</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-gray-900">{recentVitals.temperature.value}</span>
                    <span className="text-sm text-gray-500">°F</span>
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp className="w-3 h-3 text-green-500" />
                    <span className="text-xs text-green-600">Normal</span>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-100">
                  <div className="flex items-center gap-2 text-emerald-600 mb-2">
                    <Wind className="w-5 h-5" />
                    <span className="text-sm font-medium">SpO2</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-gray-900">{recentVitals.oxygenLevel.value}</span>
                    <span className="text-sm text-gray-500">%</span>
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp className="w-3 h-3 text-green-500" />
                    <span className="text-xs text-green-600">Excellent</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Medicine Reminders */}
        <motion.div variants={itemVariants}>
          <Card className="border-0 shadow-sm h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary-600" />
                Today's Medicines
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {medicineReminders.map((med) => {
                  const isTaken = (med.history || []).some(h => h.date === todayStr && h.taken);
                  return (
                    <div 
                      key={med.id || med._id} 
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        isTaken ? 'bg-green-50 border border-green-100' : 'bg-gray-50 border border-gray-100'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          isTaken ? 'bg-green-100' : 'bg-gray-200'
                        }`}>
                          <Pill className={`w-4 h-4 ${isTaken ? 'text-green-600' : 'text-gray-500'}`} />
                        </div>
                        <div>
                          <p className={`font-medium text-sm ${isTaken ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                            {med.medicineName}
                          </p>
                          <p className="text-xs text-gray-500">{(med.timeSlots || []).join(', ')}</p>
                        </div>
                      </div>
                      {isTaken ? (
                        <Badge variant="secondary" className="text-xs text-green-700 bg-green-100">Taken</Badge>
                      ) : (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-xs h-7"
                          onClick={() => handleToggleMed(med.id || med._id)}
                        >
                          Mark Done
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
              <Link to="/patient/reminders">
                <Button variant="ghost" className="w-full mt-3 text-primary-600">
                  Manage Reminders <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Upcoming Appointments */}
        <motion.div variants={itemVariants}>
          <Card className="border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-semibold">Upcoming Appointments</CardTitle>
              <Link to="/patient/appointments">
                <Button variant="ghost" size="sm" className="text-primary-600">
                  View All <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {upcomingAppointments.length > 0 ? (
                <div className="space-y-4">
                  {upcomingAppointments.map((apt) => {
                    const docName = (apt.doctor?.user as any)?.name || `${(apt.doctor?.user as any)?.firstName || 'Dr.'} ${(apt.doctor?.user as any)?.lastName || 'Doctor'}`;
                    const specialty = apt.doctor?.specialization || 'General Physician';
                    return (
                      <div 
                        key={apt.id || apt._id} 
                        className="flex items-start gap-4 p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl border border-gray-100"
                      >
                        <Avatar className="h-12 w-12 ring-2 ring-primary-100">
                          <AvatarFallback className="bg-primary-100 text-primary-700 font-semibold">
                            {docName.replace('Dr. ', '').charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900">{docName}</p>
                          <p className="text-sm text-gray-500">{specialty}</p>
                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <Calendar className="w-4 h-4" />
                              {apt.scheduledDate}
                            </div>
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <Clock className="w-4 h-4" />
                              {apt.scheduledTime}
                            </div>
                            <Badge variant={apt.type === 'VIDEO' ? 'default' : 'secondary'}>
                              {apt.type === 'VIDEO' ? <Video className="w-3 h-3 mr-1" /> : null}
                              {apt.type}
                            </Badge>
                          </div>
                        </div>
                        {apt.type === 'VIDEO' && (
                          <Link to={`/patient/consultation/${apt.id || apt._id}`}>
                            <Button size="sm">Join</Button>
                          </Link>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 mb-4">No upcoming appointments</p>
                  <Link to="/patient/book-appointment">
                    <Button>Book Appointment</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Health Education */}
        <motion.div variants={itemVariants}>
          <Card className="border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary-600" />
                Health Tips
              </CardTitle>
              <Link to="/patient/education">
                <Button variant="ghost" size="sm" className="text-primary-600">
                  Browse All <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { title: 'Managing Blood Pressure', category: 'Heart Health', readTime: '5 min' },
                  { title: 'Healthy Eating Habits', category: 'Nutrition', readTime: '4 min' },
                  { title: 'Importance of Regular Exercise', category: 'Lifestyle', readTime: '3 min' },
                ].map((article, i) => (
                  <Link 
                    key={i} 
                    to="/patient/education"
                    className="block p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900 group-hover:text-primary-600 transition-colors">
                          {article.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">{article.category}</Badge>
                          <span className="text-xs text-gray-500">{article.readTime} read</span>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-primary-600 transition-colors" />
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* AI Assessment CTA */}
      <motion.div variants={itemVariants}>
        <Card className="border-0 bg-gradient-to-r from-violet-50 via-purple-50 to-fuchsia-50 overflow-hidden">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-200">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-xl font-bold text-gray-900 mb-1">How are you feeling today?</h3>
                <p className="text-gray-600">
                  Get an AI-assisted health assessment based on your symptoms and vitals. Quick, private, and accurate.
                </p>
              </div>
              <Link to="/patient/assessment">
                <Button size="lg" className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 shadow-lg">
                  Start Assessment
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default PatientDashboard;
