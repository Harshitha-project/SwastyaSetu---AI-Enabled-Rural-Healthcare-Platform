import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Heart, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  User,
  Phone,
  ArrowRight,
  ArrowLeft,
  Check,
  AlertCircle,
  Shield,
  Stethoscope,
  Users
} from 'lucide-react';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register, isLoading } = useAuth();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'PATIENT',
    // Doctor-specific fields
    specialization: '',
    qualification: '',
    registrationNumber: '',
    experience: '',
  });
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const roleOptions = [
    { value: 'PATIENT', label: 'Patient', icon: Users, description: 'Access healthcare services' },
    { value: 'DOCTOR', label: 'Doctor', icon: Stethoscope, description: 'Provide medical consultations' },
    { value: 'HEALTH_WORKER', label: 'Health Worker', icon: Shield, description: 'Community health support' },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleRoleChange = (value: string) => {
    setFormData(prev => ({ ...prev, role: value }));
  };

  const validateStep1 = () => {
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setError('Please enter your full name');
      return false;
    }
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    if (!formData.phone || !/^[6-9]\d{9}$/.test(formData.phone)) {
      setError('Please enter a valid 10-digit Indian phone number');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      setError('Password must contain uppercase, lowercase, and number');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    setError('');
    if (step === 1 && validateStep1()) {
      setStep(2);
    }
  };

  const handleBack = () => {
    setError('');
    setStep(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateStep2()) return;

    try {
      await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: formData.role as 'PATIENT' | 'DOCTOR' | 'HEALTH_WORKER',
        ...(formData.role === 'DOCTOR' && {
          specialization: formData.specialization || 'General Medicine',
          qualification: formData.qualification || 'MBBS',
          registrationNumber: formData.registrationNumber,
          experience: formData.experience ? parseInt(formData.experience) : 1,
        }),
      } as any);
      // Redirect to role-specific dashboard
      const dashboardMap: Record<string, string> = {
        PATIENT: '/patient',
        DOCTOR: '/doctor',
        HEALTH_WORKER: '/worker',
        ADMIN: '/admin',
      }
      navigate(dashboardMap[formData.role] || '/patient', { replace: true });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed. Please try again.';
      setError(errorMessage);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.4, staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 50 : -50,
      opacity: 0,
    }),
  };

  const passwordStrength = () => {
    const password = formData.password;
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;
    return strength;
  };

  const strengthColors = ['bg-gray-200', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500', 'bg-green-600'];
  const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];

  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <motion.div 
        className="hidden lg:flex lg:w-1/2 xl:w-[55%] bg-gradient-to-br from-secondary-600 via-secondary-700 to-secondary-900 relative overflow-hidden"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Background patterns */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-primary-400 rounded-full blur-3xl" />
        </div>
        
        <div className="absolute inset-0 opacity-5 bg-[linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] bg-[size:4rem_4rem]" />

        <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
          {/* Logo */}
          <motion.div 
            className="flex items-center gap-3"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Heart className="w-7 h-7 text-white" fill="currentColor" />
            </div>
            <span className="text-2xl font-bold">SwasthyaSetu</span>
          </motion.div>

          {/* Main content */}
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h1 className="text-4xl xl:text-5xl font-bold leading-tight">
                Join Our
                <br />
                Healthcare Network
              </h1>
              <p className="mt-4 text-lg text-white/80 max-w-md">
                Create your account and get access to AI-powered health assessments, expert consultations, and comprehensive healthcare services.
              </p>
            </motion.div>

            {/* Benefits */}
            <motion.div 
              className="space-y-3"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              {[
                'Free AI health risk assessment',
                'Connect with verified doctors',
                'Track your health metrics',
                'Find nearby healthcare facilities',
              ].map((benefit, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                    <Check className="w-3 h-3" />
                  </div>
                  <span className="text-white/90">{benefit}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Bottom */}
          <motion.div
            className="text-sm text-white/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Already have an account?{' '}
            <Link to="/login" className="text-white hover:underline font-medium">
              Sign in
            </Link>
          </motion.div>
        </div>
      </motion.div>

      {/* Right side - Registration Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 bg-gradient-to-br from-slate-50 to-gray-100">
        <motion.div 
          className="w-full max-w-md"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Mobile Logo */}
          <motion.div variants={itemVariants} className="text-center mb-8 lg:hidden">
            <Link to="/" className="inline-flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-secondary-500 to-secondary-700 rounded-xl flex items-center justify-center shadow-lg shadow-secondary-500/25">
                <Heart className="w-7 h-7 text-white" fill="currentColor" />
              </div>
              <span className="text-2xl font-bold text-gray-900">SwasthyaSetu</span>
            </Link>
          </motion.div>

          <Card className="border-0 shadow-xl shadow-gray-200/50">
            <CardHeader className="space-y-1 pb-4">
              <motion.div variants={itemVariants}>
                <CardTitle className="text-2xl font-bold text-center text-gray-900">
                  Create your account
                </CardTitle>
                <CardDescription className="text-center text-gray-600">
                  {step === 1 ? 'Enter your personal details' : 'Set your password'}
                </CardDescription>
              </motion.div>

              {/* Step indicator */}
              <motion.div variants={itemVariants} className="flex items-center justify-center gap-2 pt-4">
                <div className={`w-3 h-3 rounded-full transition-colors ${step >= 1 ? 'bg-secondary-600' : 'bg-gray-300'}`} />
                <div className={`w-12 h-1 rounded-full transition-colors ${step >= 2 ? 'bg-secondary-600' : 'bg-gray-300'}`} />
                <div className={`w-3 h-3 rounded-full transition-colors ${step >= 2 ? 'bg-secondary-600' : 'bg-gray-300'}`} />
              </motion.div>
            </CardHeader>

            <CardContent className="space-y-5">
              <AnimatePresence mode="wait">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, y: -10, height: 0 }}
                  >
                    <Alert variant="error">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSubmit}>
                <AnimatePresence mode="wait" custom={step}>
                  {step === 1 ? (
                    <motion.div
                      key="step1"
                      custom={1}
                      variants={slideVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{ duration: 0.3 }}
                      className="space-y-4"
                    >
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label htmlFor="firstName" className="text-gray-700">First Name</Label>
                          <Input
                            id="firstName"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            placeholder="John"
                            leftIcon={<User className="h-4 w-4" />}
                            className="h-11"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName" className="text-gray-700">Last Name</Label>
                          <Input
                            id="lastName"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            placeholder="Doe"
                            className="h-11"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-gray-700">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="you@example.com"
                          leftIcon={<Mail className="h-4 w-4" />}
                          className="h-11"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-gray-700">Phone Number</Label>
                        <Input
                          id="phone"
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="9876543210"
                          leftIcon={<Phone className="h-4 w-4" />}
                          className="h-11"
                          maxLength={10}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-gray-700">I am a</Label>
                        <Select value={formData.role} onValueChange={handleRoleChange}>
                          <SelectTrigger className="h-11">
                            <SelectValue placeholder="Select your role" />
                          </SelectTrigger>
                          <SelectContent>
                            {roleOptions.map(option => (
                              <SelectItem key={option.value} value={option.value}>
                                <div className="flex items-center gap-2">
                                  <option.icon className="h-4 w-4 text-gray-500" />
                                  <span>{option.label}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Doctor-specific fields */}
                      {formData.role === 'DOCTOR' && (
                        <div className="space-y-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                          <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Doctor Profile Details</p>
                          <div className="space-y-2">
                            <Label className="text-gray-700 text-sm">Specialization</Label>
                            <Input
                              name="specialization"
                              value={formData.specialization}
                              onChange={handleChange}
                              placeholder="e.g. General Medicine, Pediatrics"
                              className="h-10"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-2">
                              <Label className="text-gray-700 text-sm">Qualification</Label>
                              <Input
                                name="qualification"
                                value={formData.qualification}
                                onChange={handleChange}
                                placeholder="e.g. MBBS, MD"
                                className="h-10"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-gray-700 text-sm">Experience (yrs)</Label>
                              <Input
                                name="experience"
                                type="number"
                                value={formData.experience}
                                onChange={handleChange}
                                placeholder="5"
                                className="h-10"
                                min="0"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-gray-700 text-sm">Medical Registration No.</Label>
                            <Input
                              name="registrationNumber"
                              value={formData.registrationNumber}
                              onChange={handleChange}
                              placeholder="e.g. MMC-2018-12345"
                              className="h-10"
                            />
                          </div>
                        </div>
                      )}

                      <Button 
                        type="button" 
                        onClick={handleNext} 
                        className="w-full h-11 text-base mt-2"
                        rightIcon={<ArrowRight className="h-4 w-4" />}
                      >
                        Continue
                      </Button>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="step2"
                      custom={-1}
                      variants={slideVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{ duration: 0.3 }}
                      className="space-y-4"
                    >
                      <div className="space-y-2">
                        <Label htmlFor="password" className="text-gray-700">Password</Label>
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          placeholder="Create a strong password"
                          leftIcon={<Lock className="h-4 w-4" />}
                          rightIcon={
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="hover:text-gray-700 transition-colors"
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          }
                          className="h-11"
                          required
                        />
                        {/* Password strength meter */}
                        {formData.password && (
                          <div className="space-y-1">
                            <div className="flex gap-1">
                              {[1, 2, 3, 4, 5].map((level) => (
                                <div
                                  key={level}
                                  className={`h-1.5 flex-1 rounded-full transition-colors ${
                                    level <= passwordStrength() ? strengthColors[passwordStrength()] : 'bg-gray-200'
                                  }`}
                                />
                              ))}
                            </div>
                            <p className="text-xs text-gray-500">
                              Password strength: <span className="font-medium">{strengthLabels[passwordStrength()]}</span>
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword" className="text-gray-700">Confirm Password</Label>
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          placeholder="Confirm your password"
                          leftIcon={<Lock className="h-4 w-4" />}
                          rightIcon={
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="hover:text-gray-700 transition-colors"
                            >
                              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          }
                          className="h-11"
                          required
                        />
                        {formData.confirmPassword && formData.password === formData.confirmPassword && (
                          <p className="text-xs text-green-600 flex items-center gap-1">
                            <Check className="h-3 w-3" /> Passwords match
                          </p>
                        )}
                      </div>

                      <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600">
                        <p className="font-medium text-gray-700 mb-2">Password requirements:</p>
                        <ul className="space-y-1">
                          {[
                            { met: formData.password.length >= 8, text: 'At least 8 characters' },
                            { met: /[a-z]/.test(formData.password), text: 'One lowercase letter' },
                            { met: /[A-Z]/.test(formData.password), text: 'One uppercase letter' },
                            { met: /\d/.test(formData.password), text: 'One number' },
                          ].map((req, i) => (
                            <li key={i} className={`flex items-center gap-2 ${req.met ? 'text-green-600' : ''}`}>
                              {req.met ? <Check className="h-3 w-3" /> : <div className="w-3 h-3" />}
                              {req.text}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="flex gap-3 mt-2">
                        <Button 
                          type="button" 
                          variant="outline"
                          onClick={handleBack} 
                          className="flex-1 h-11"
                          leftIcon={<ArrowLeft className="h-4 w-4" />}
                        >
                          Back
                        </Button>
                        <Button 
                          type="submit"
                          className="flex-1 h-11"
                          isLoading={isLoading}
                        >
                          {isLoading ? 'Creating account...' : 'Create account'}
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </form>

              <motion.p variants={itemVariants} className="text-center text-sm text-gray-600 pt-2">
                Already have an account?{' '}
                <Link to="/login" className="text-secondary-600 hover:text-secondary-700 font-semibold">
                  Sign in
                </Link>
              </motion.p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
