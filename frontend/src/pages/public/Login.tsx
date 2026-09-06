import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  Heart, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  AlertCircle,
  ArrowRight,
  Phone,
  Shield,
  Stethoscope,
  Users,
  Building2
} from 'lucide-react';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password) {
      setError('Please enter your email and password');
      return;
    }

    try {
      await login({ email: formData.email, password: formData.password });
      navigate(from, { replace: true });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed. Please try again.';
      setError(errorMessage);
    }
  };

  const fillDemoCredentials = (role: string) => {
    const credentials: Record<string, { email: string; password: string }> = {
      patient: { email: 'patient@demo.com', password: 'password123' },
      doctor: { email: 'doctor@demo.com', password: 'password123' },
      worker: { email: 'worker@demo.com', password: 'password123' },
      admin: { email: 'admin@demo.com', password: 'password123' },
    };
    setFormData(credentials[role]);
    setError('');
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.4,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 },
    },
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding & Info */}
      <motion.div 
        className="hidden lg:flex lg:w-1/2 xl:w-[55%] bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 relative overflow-hidden"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Background patterns */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-secondary-400 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white rounded-full blur-3xl" />
        </div>
        
        {/* Grid pattern overlay */}
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
                Healthcare
                <br />
                Beyond Distance
              </h1>
              <p className="mt-4 text-lg text-white/80 max-w-md">
                Connecting rural communities with quality healthcare through AI-powered diagnostics and telemedicine.
              </p>
            </motion.div>

            {/* Features */}
            <motion.div 
              className="grid grid-cols-2 gap-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              {[
                { icon: Stethoscope, label: 'AI Health Assessment' },
                { icon: Users, label: 'Expert Consultations' },
                { icon: Building2, label: 'Facility Locator' },
                { icon: Shield, label: 'Secure & Private' },
              ].map((feature, index) => (
                <div 
                  key={index} 
                  className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3"
                >
                  <feature.icon className="w-5 h-5 text-secondary-300" />
                  <span className="text-sm font-medium">{feature.label}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Bottom info */}
          <motion.div
            className="flex items-center gap-4 text-sm text-white/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <span>Trusted by 50+ healthcare facilities</span>
            <span className="w-1 h-1 bg-white/40 rounded-full" />
            <span>10,000+ patients served</span>
          </motion.div>
        </div>
      </motion.div>

      {/* Right side - Login Form */}
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
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/25">
                <Heart className="w-7 h-7 text-white" fill="currentColor" />
              </div>
              <span className="text-2xl font-bold text-gray-900">SwasthyaSetu</span>
            </Link>
          </motion.div>

          <Card className="border-0 shadow-xl shadow-gray-200/50">
            <CardHeader className="space-y-1 pb-4">
              <motion.div variants={itemVariants}>
                <CardTitle className="text-2xl font-bold text-center text-gray-900">
                  Welcome back
                </CardTitle>
                <CardDescription className="text-center text-gray-600">
                  Sign in to access your healthcare dashboard
                </CardDescription>
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

              <motion.form variants={itemVariants} onSubmit={handleSubmit} className="space-y-4">
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
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-gray-700">Password</Label>
                    <Link 
                      to="/forgot-password" 
                      className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
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
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="remember"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <label htmlFor="remember" className="ml-2 text-sm text-gray-600">
                    Remember me for 30 days
                  </label>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-11 text-base"
                  isLoading={isLoading}
                  rightIcon={!isLoading && <ArrowRight className="h-4 w-4" />}
                >
                  {isLoading ? 'Signing in...' : 'Sign in'}
                </Button>
              </motion.form>

              <motion.div variants={itemVariants} className="relative">
                <Separator className="my-4" />
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-xs text-gray-500 uppercase tracking-wider">
                  Demo Accounts
                </span>
              </motion.div>

              <motion.div variants={itemVariants} className="grid grid-cols-2 gap-2">
                {[
                  { role: 'patient', icon: Users, label: 'Patient' },
                  { role: 'doctor', icon: Stethoscope, label: 'Doctor' },
                  { role: 'worker', icon: Shield, label: 'Health Worker' },
                  { role: 'admin', icon: Building2, label: 'Admin' },
                ].map(({ role, icon: Icon, label }) => (
                  <Button
                    key={role}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fillDemoCredentials(role)}
                    className="h-9 text-xs font-medium"
                    leftIcon={<Icon className="h-3.5 w-3.5" />}
                  >
                    {label}
                  </Button>
                ))}
              </motion.div>

              <motion.p variants={itemVariants} className="text-center text-sm text-gray-600">
                Don't have an account?{' '}
                <Link 
                  to="/register" 
                  className="text-primary-600 hover:text-primary-700 font-semibold"
                >
                  Create account
                </Link>
              </motion.p>
            </CardContent>
          </Card>

          {/* Emergency Link */}
          <motion.div variants={itemVariants} className="mt-6 text-center">
            <Link 
              to="/emergency" 
              className="inline-flex items-center gap-2 text-red-600 hover:text-red-700 text-sm font-medium bg-red-50 hover:bg-red-100 px-4 py-2 rounded-lg transition-colors"
            >
              <Phone className="h-4 w-4" />
              Emergency Helpline - 112
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
