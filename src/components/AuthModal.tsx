import React, { useState, useEffect, useRef } from 'react';
import {
  User,
  LogIn,
  UserPlus,
  Flame,
  Award,
  FileDown,
  LogOut,
  X,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Lock,
  Eye,
  EyeOff,
  Mail,
  Layers,
  Clock,
  KeyRound,
  ArrowLeft,
  RefreshCw,
  Send,
  ShieldCheck,
} from 'lucide-react';
import { UserProfile, ProficiencyLevel } from '../types';
import { sendVerificationOtp, verifyOtpAndSignUp, signInUser } from '../services/progressDatabase';

interface AuthModalProps {
  user: UserProfile | null;
  onClose: () => void;
  onLogin: (profile: UserProfile) => void;
  onLogout: () => void;
  onUpdateProfile: (profile: UserProfile) => void;
  savedWordsCount: number;
  mockTestsCount: number;
  currentLevel: ProficiencyLevel;
  currentLanguage: string;
}

const AVATAR_OPTIONS = ['🦊', '🦉', '🚀', '⚡', '🌸', '🐯', '💎', '🌟', '👑', '🦁'];

export const AuthModal: React.FC<AuthModalProps> = ({
  user,
  onClose,
  onLogin,
  onLogout,
  savedWordsCount,
  mockTestsCount,
  currentLevel,
  currentLanguage,
}) => {
  const [tab, setTab] = useState<'signin' | 'signup' | 'profile'>(user ? 'profile' : 'signup');
  const [step, setStep] = useState<'form' | 'otp_verify'>('form');

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState('🦊');

  // OTP Verification state
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [resendCooldown, setResendCooldown] = useState<number>(0);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // UI status
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Resend countdown timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  // Request OTP for Signup - strictly required for account creation
  const handleRequestOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!name.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (!password || password.length < 4) {
      setErrorMessage('Please choose a password with at least 4 characters.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setStatusMessage(null);

    try {
      const res = await sendVerificationOtp(cleanEmail, 'signup');
      if (res.success) {
        setStep('otp_verify');
        setResendCooldown(60);
        setStatusMessage(`Verification code sent to ${cleanEmail}. Please check your inbox.`);
        setOtpDigits(['', '', '', '', '', '']);
        setTimeout(() => {
          otpInputRefs.current[0]?.focus();
        }, 100);
      } else {
        setErrorMessage(res.error || 'Failed to send verification code.');
      }
    } catch (err: any) {
      setErrorMessage('Network error while requesting verification code.');
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (resendCooldown > 0 || isLoading) return;
    const cleanEmail = email.trim().toLowerCase();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await sendVerificationOtp(cleanEmail, 'signup');
      if (res.success) {
        setResendCooldown(60);
        setStatusMessage(`New verification code sent to ${cleanEmail}. Please check your email inbox.`);
      } else {
        setErrorMessage(res.error || 'Failed to resend code.');
      }
    } catch (err: any) {
      setErrorMessage('Network error while resending code.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle individual OTP digit change
  const handleOtpChange = (index: number, val: string) => {
    const sanitized = val.replace(/\D/g, '');
    if (!sanitized) {
      const updated = [...otpDigits];
      updated[index] = '';
      setOtpDigits(updated);
      return;
    }

    // Handle pasted 6-digit code
    if (sanitized.length >= 6) {
      const pasted = sanitized.slice(0, 6).split('');
      setOtpDigits(pasted);
      otpInputRefs.current[5]?.focus();
      return;
    }

    const updated = [...otpDigits];
    updated[index] = sanitized[sanitized.length - 1];
    setOtpDigits(updated);

    // Auto-advance to next box
    if (index < 5 && sanitized) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // Submit OTP and Complete Registration
  const handleVerifyOtpAndRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullOtp = otpDigits.join('');
    if (fullOtp.length !== 6) {
      setErrorMessage('Please enter all 6 digits of your verification code.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setStatusMessage(null);

    try {
      const res = await verifyOtpAndSignUp({
        email: email.trim().toLowerCase(),
        otp: fullOtp,
        name: name.trim(),
        password,
        avatar: selectedAvatar,
        targetLanguage: currentLanguage,
        proficiencyLevel: currentLevel,
      });

      if (res.success && res.profile) {
        onLogin(res.profile);
        setStatusMessage(`Email verified! Welcome, ${res.profile.name}!`);
        setTimeout(() => onClose(), 800);
      } else {
        setErrorMessage(res.error || 'Verification failed. Please check the code and try again.');
      }
    } catch (err: any) {
      setErrorMessage('Network error during verification.');
    } finally {
      setIsLoading(false);
    }
  };

  // Password Sign In
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMessage('Please enter your registered email address.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your account password.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setStatusMessage(null);

    try {
      const res = await signInUser({
        email: cleanEmail,
        password,
      });

      if (res.success && res.profile) {
        onLogin(res.profile);
        setStatusMessage(`Welcome back, ${res.profile.name}! Loaded your progress.`);
        setTimeout(() => onClose(), 800);
      } else {
        setErrorMessage(res.error || 'Invalid email or password. Please verify and try again.');
      }
    } catch (err: any) {
      setErrorMessage('Sign in failed. Please verify your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOutClick = () => {
    onLogout();
    setName('');
    setEmail('');
    setPassword('');
    setOtpDigits(['', '', '', '', '', '']);
    setStatusMessage(null);
    setErrorMessage(null);
    setStep('form');
    setTab('signin');
  };

  const handleExportBackup = () => {
    if (!user) return;
    const backupData = {
      user,
      savedWords: localStorage.getItem('lingolive_saved_words'),
      mockResults: localStorage.getItem('lingolive_mock_results'),
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lingolive-profile-${user.name.toLowerCase().replace(/\s+/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setStatusMessage('Profile data successfully downloaded!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-md rounded-3xl bg-[#0b0f24] border border-white/15 shadow-[0_25px_80px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center text-white shadow-[0_0_15px_rgba(236,72,153,0.4)]">
              {user ? (
                <span className="text-xl">{user.avatar}</span>
              ) : step === 'otp_verify' ? (
                <ShieldCheck className="w-5 h-5 text-pink-300" />
              ) : (
                <User className="w-5 h-5 text-white" />
              )}
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-1.5">
                {user
                  ? user.name
                  : step === 'otp_verify'
                  ? 'Verify Your Email'
                  : 'Learner Profile'}
              </h2>
              <p className="text-xs text-slate-400">
                {user
                  ? user.email
                  : step === 'otp_verify'
                  ? `Enter 6-digit code sent to ${email}`
                  : 'Create or sign in to your language account'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher (if not logged in and not on OTP step) */}
        {!user && step === 'form' && (
          <div className="px-5 pt-4 pb-1">
            <div className="grid grid-cols-2 p-1 rounded-2xl bg-white/[0.05] border border-white/10">
              <button
                type="button"
                onClick={() => {
                  setTab('signup');
                  setErrorMessage(null);
                  setStatusMessage(null);
                }}
                className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  tab === 'signup'
                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Create Profile</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setTab('signin');
                  setErrorMessage(null);
                  setStatusMessage(null);
                }}
                className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  tab === 'signin'
                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            </div>
          </div>
        )}

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Notifications */}
          {statusMessage && (
            <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{statusMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 rounded-2xl bg-rose-500/15 border border-rose-400/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* VIEW 1: LOGGED IN USER PROFILE */}
          {user && tab === 'profile' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{user.avatar}</div>
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                        <span>{user.name}</span>
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                          <ShieldCheck className="w-3 h-3 mr-0.5" /> Verified
                        </span>
                      </h3>
                      <p className="text-xs text-slate-400">{user.email}</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-pink-500/20 text-pink-300 border border-pink-500/30 uppercase tracking-wider">
                    {user.league || 'Bronze'}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/10 text-center">
                  <div className="p-2 rounded-xl bg-white/[0.03]">
                    <div className="flex items-center justify-center gap-1 text-amber-400 text-xs font-bold">
                      <Flame className="w-3.5 h-3.5 fill-amber-400" />
                      <span>{user.streakDays}d</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">Streak</p>
                  </div>

                  <div className="p-2 rounded-xl bg-white/[0.03]">
                    <div className="flex items-center justify-center gap-1 text-cyan-400 text-xs font-bold">
                      <Award className="w-3.5 h-3.5" />
                      <span>{user.xp}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">Total XP</p>
                  </div>

                  <div className="p-2 rounded-xl bg-white/[0.03]">
                    <div className="flex items-center justify-center gap-1 text-purple-400 text-xs font-bold">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{user.totalStudyMinutes}m</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">Studied</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1 text-slate-300">
                  <span className="flex items-center gap-1 text-slate-400">
                    <Layers className="w-3.5 h-3.5 text-cyan-400" /> Current Level:
                  </span>
                  <span className="font-semibold text-cyan-300">{user.proficiencyLevel.split(' - ')[0]}</span>
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={handleExportBackup}
                  className="w-full py-2.5 px-4 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-xs font-semibold text-slate-200 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <FileDown className="w-4 h-4 text-cyan-400" />
                  <span>Export Profile Backup (JSON)</span>
                </button>

                <button
                  type="button"
                  onClick={handleSignOutClick}
                  className="w-full py-2.5 px-4 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-xs font-semibold text-rose-300 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out / Switch Account</span>
                </button>
              </div>
            </div>
          )}

          {/* VIEW 2: OTP VERIFICATION SCREEN */}
          {!user && step === 'otp_verify' && (
            <form onSubmit={handleVerifyOtpAndRegister} className="space-y-4 animate-in fade-in">
              <div className="p-4 rounded-2xl bg-pink-500/10 border border-pink-500/20 text-center space-y-1.5">
                <div className="w-9 h-9 mx-auto rounded-full bg-pink-500/20 flex items-center justify-center text-pink-300 mb-1">
                  <Mail className="w-4 h-4" />
                </div>
                <p className="text-xs text-pink-200 font-semibold">
                  A 6-digit verification code was sent to:
                </p>
                <p className="text-sm font-bold text-white tracking-wide">{email}</p>
                <p className="text-[11px] text-slate-400 pt-1">
                  Please check your inbox (and spam folder) and enter the code below.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setStep('form');
                    setErrorMessage(null);
                  }}
                  className="text-[11px] text-pink-400 hover:text-pink-300 underline font-medium pt-1 cursor-pointer block mx-auto"
                >
                  Change email address
                </button>
              </div>

              {/* 6 Digit Inputs */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2 text-center">
                  Enter 6-Digit Code
                </label>
                <div className="flex items-center justify-center gap-2">
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => (otpInputRefs.current[idx] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      className="w-11 h-12 text-center text-lg font-mono font-black text-white bg-white/[0.06] border border-white/20 rounded-xl focus:outline-hidden focus:border-pink-500 focus:ring-2 focus:ring-pink-500/40 transition-all"
                    />
                  ))}
                </div>
              </div>

              {/* Verify Button */}
              <button
                type="submit"
                disabled={isLoading || otpDigits.join('').length !== 6}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white font-black text-xs shadow-[0_0_20px_rgba(236,72,153,0.4)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Verifying Code...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Verify & Create Profile</span>
                  </>
                )}
              </button>

              {/* Resend & Back Row */}
              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  type="button"
                  onClick={() => setStep('form')}
                  className="text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to details</span>
                </button>

                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendCooldown > 0 || isLoading}
                  className={`flex items-center gap-1 cursor-pointer font-bold ${
                    resendCooldown > 0
                      ? 'text-slate-500 cursor-not-allowed'
                      : 'text-pink-400 hover:text-pink-300'
                  }`}
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>{resendCooldown > 0 ? `Resend code (${resendCooldown}s)` : 'Resend code'}</span>
                </button>
              </div>
            </form>
          )}

          {/* VIEW 3: CREATE PROFILE FORM (SIGN UP) */}
          {!user && step === 'form' && tab === 'signup' && (
            <form onSubmit={handleRequestOtp} className="space-y-3.5">
              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Full Name <span className="text-pink-400">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex Morgan"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white/[0.05] border border-white/12 text-xs text-white placeholder:text-slate-500 focus:outline-hidden focus:border-pink-500 focus:ring-1 focus:ring-pink-500/40"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Email Address <span className="text-pink-400">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. alex@example.com"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white/[0.05] border border-white/12 text-xs text-white placeholder:text-slate-500 focus:outline-hidden focus:border-pink-500 focus:ring-1 focus:ring-pink-500/40"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-cyan-400 shrink-0" />
                  A 6-digit verification code will be sent to your email.
                </p>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Password <span className="text-pink-400">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={4}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a secure password"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white/[0.05] border border-white/12 text-xs text-white placeholder:text-slate-500 focus:outline-hidden focus:border-pink-500 focus:ring-1 focus:ring-pink-500/40"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Avatar Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Choose Avatar
                </label>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {AVATAR_OPTIONS.map((av) => (
                    <button
                      key={av}
                      type="button"
                      onClick={() => setSelectedAvatar(av)}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-all shrink-0 cursor-pointer ${
                        selectedAvatar === av
                           ? 'bg-pink-500/30 border-2 border-pink-400 scale-110 shadow-sm'
                          : 'bg-white/[0.05] border border-white/10 hover:bg-white/10'
                      }`}
                    >
                      {av}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit: Send 6-Digit Email Verification Code */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white font-black text-xs shadow-[0_0_20px_rgba(236,72,153,0.4)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Sending 6-Digit Code...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 text-emerald-300" />
                    <span>Send 6-Digit Verification Code</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* VIEW 4: SIGN IN */}
          {!user && step === 'form' && tab === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-3.5">
              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Email Address <span className="text-pink-400">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. yourname@gmail.com"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white/[0.05] border border-white/12 text-xs text-white placeholder:text-slate-500 focus:outline-hidden focus:border-pink-500 focus:ring-1 focus:ring-pink-500/40"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Password <span className="text-pink-400">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your account password"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white/[0.05] border border-white/12 text-xs text-white placeholder:text-slate-500 focus:outline-hidden focus:border-pink-500 focus:ring-1 focus:ring-pink-500/40"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-black text-xs shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Sign In & Load Progress</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
