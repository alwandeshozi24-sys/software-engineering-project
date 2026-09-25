import React, { useState } from 'react';
import { UserProfile } from '../../types/auth';
import { evaluatePasswordStrength } from '../../services/authService';
import { 
  User, 
  ShieldCheck, 
  KeyRound, 
  CheckCircle2, 
  AlertCircle, 
  Lock,
  Save
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface AdminProfileViewProps {
  currentUser: UserProfile;
  onUpdateProfile: (updates: { fullName: string; email: string; phoneNumber?: string }) => void;
  onChangePassword: (oldPassword: string, newPassword: string) => { success: boolean; message: string };
}

export const AdminProfileView: React.FC<AdminProfileViewProps> = ({
  currentUser,
  onUpdateProfile,
  onChangePassword
}) => {
  const { isDark } = useTheme();

  // Personal Info Form
  const [fullName, setFullName] = useState(currentUser.fullName);
  const [email, setEmail] = useState(currentUser.email);
  const [phoneNumber, setPhoneNumber] = useState('081 222 4019');
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);

  // Password Change Form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  const strength = evaluatePasswordStrength(newPassword);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) return;

    onUpdateProfile({
      fullName: fullName.trim(),
      email: email.trim(),
      phoneNumber: phoneNumber.trim()
    });

    setProfileSuccess('Profile information updated successfully.');
    setTimeout(() => setProfileSuccess(null), 3000);
  };

  const handleChangePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (!currentPassword) {
      setPasswordError('Please enter your current administrator password.');
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters in length.');
      return;
    }

    if (strength.score < 3) {
      setPasswordError('New password must meet departmental security requirements (numbers, letters, symbols).');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    const res = onChangePassword(currentPassword, newPassword);
    if (!res.success) {
      setPasswordError(res.message);
      return;
    }

    setPasswordSuccess(res.message);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setPasswordSuccess(null), 4000);
  };

  return (
    <div id="admin-profile-view" className="space-y-6">
      {/* Header */}
      <div className="pt-1 pb-1">
        <h2 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-black'}`}>
          Administrator Account Profile
        </h2>
        <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          Manage your personal credentials, contact details, and cryptographic password authentication.
        </p>
      </div>

      {/* Security Credentials Banner */}
      <div className={`p-6 rounded-md border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
        isDark ? 'bg-slate-900/40 border-white/10' : 'bg-slate-50 border-black/10'
      }`}>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-md bg-blue-600 flex items-center justify-center text-white font-bold text-xl uppercase">
            {currentUser.fullName.charAt(0)}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-black'}`}>
                {currentUser.fullName}
              </h3>
              <span className="px-2 py-0.5 border border-blue-600 text-blue-600 text-xs font-mono font-bold">
                {currentUser.personnelNumber}
              </span>
              <span className="px-2 py-0.5 border border-emerald-600 text-emerald-600 text-xs font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Level 4 Clearance</span>
              </span>
            </div>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              {currentUser.rank} • {currentUser.division}
            </p>
          </div>
        </div>

        <div className={`flex flex-col md:items-end text-xs font-mono ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          <span>Station: {currentUser.station}</span>
          <span>Role: System Administrator (SFEN)</span>
          <span className="text-blue-600 font-semibold mt-1">Active Administrative Session</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Personal Information Form */}
        <div className={`p-6 rounded-md border space-y-5 ${
          isDark ? 'bg-slate-900/40 border-white/10' : 'bg-slate-50 border-black/10'
        }`}>
          <div className="flex items-center gap-2 text-blue-600 font-bold text-sm">
            <User size={16} />
            <h4 className={`font-bold text-base ${isDark ? 'text-white' : 'text-black'}`}>
              Personal Account Information
            </h4>
          </div>

          {profileSuccess && (
            <div className="p-3 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 text-xs flex items-center gap-2">
              <CheckCircle2 size={15} className="shrink-0" />
              <span>{profileSuccess}</span>
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="space-y-1.5">
              <label className={`text-xs font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Full Legal Name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={`w-full px-3.5 py-2 rounded-md border text-xs focus:outline-none ${
                  isDark ? 'bg-black border-white/15 text-white focus:border-blue-600' : 'bg-white border-black/15 text-black focus:border-blue-600'
                }`}
              />
            </div>

            <div className="space-y-1.5">
              <label className={`text-xs font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Personnel Number (Locked)
              </label>
              <input
                type="text"
                disabled
                value={currentUser.personnelNumber}
                className={`w-full px-3.5 py-2 rounded-md border text-xs font-mono cursor-not-allowed ${
                  isDark ? 'bg-slate-900 border-white/10 text-slate-500' : 'bg-slate-100 border-black/10 text-slate-500'
                }`}
              />
              <span className="text-[10px] text-slate-400">
                Police ID cannot be altered without departmental authorization.
              </span>
            </div>

            <div className="space-y-1.5">
              <label className={`text-xs font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Official Departmental Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full px-3.5 py-2 rounded-md border text-xs focus:outline-none ${
                  isDark ? 'bg-black border-white/15 text-white focus:border-blue-600' : 'bg-white border-black/15 text-black focus:border-blue-600'
                }`}
              />
            </div>

            <div className="space-y-1.5">
              <label className={`text-xs font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Direct Contact Phone
              </label>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className={`w-full px-3.5 py-2 rounded-md border text-xs focus:outline-none ${
                  isDark ? 'bg-black border-white/15 text-white focus:border-blue-600' : 'bg-white border-black/15 text-black focus:border-blue-600'
                }`}
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                id="btn-save-admin-profile"
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-bold transition-colors cursor-pointer flex items-center gap-2"
              >
                <Save size={14} />
                <span>Save Profile Changes</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Change Password Form */}
        <div className={`p-6 rounded-md border space-y-5 ${
          isDark ? 'bg-slate-900/40 border-white/10' : 'bg-slate-50 border-black/10'
        }`}>
          <div className="flex items-center gap-2 text-blue-600 font-bold text-sm">
            <KeyRound size={16} />
            <h4 className={`font-bold text-base ${isDark ? 'text-white' : 'text-black'}`}>
              Change Administrator Password
            </h4>
          </div>

          <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            For security, system administrators should maintain strong passwords to protect RBAC access.
          </p>

          {passwordError && (
            <div className="p-3 rounded-md bg-red-500/10 border border-red-500/30 text-red-500 text-xs flex items-center gap-2">
              <AlertCircle size={15} className="shrink-0" />
              <span>{passwordError}</span>
            </div>
          )}

          {passwordSuccess && (
            <div className="p-3 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 text-xs flex items-center gap-2">
              <CheckCircle2 size={15} className="shrink-0" />
              <span>{passwordSuccess}</span>
            </div>
          )}

          <form onSubmit={handleChangePasswordSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className={`text-xs font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Current Password *
              </label>
              <input
                type="password"
                required
                placeholder="Enter current password (demo: DocketSecure2026!)"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className={`w-full px-3.5 py-2 rounded-md border text-xs focus:outline-none ${
                  isDark ? 'bg-black border-white/15 text-white focus:border-blue-600' : 'bg-white border-black/15 text-black focus:border-blue-600'
                }`}
              />
            </div>

            <div className="space-y-1.5">
              <label className={`text-xs font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                New Password *
              </label>
              <input
                type="password"
                required
                placeholder="At least 8 characters with numbers & symbols"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={`w-full px-3.5 py-2 rounded-md border text-xs focus:outline-none ${
                  isDark ? 'bg-black border-white/15 text-white focus:border-blue-600' : 'bg-white border-black/15 text-black focus:border-blue-600'
                }`}
              />

              {newPassword && (
                <div className="pt-1 space-y-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-slate-400">Password Strength:</span>
                    <span className="font-bold text-blue-600">{strength.label}</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        strength.score <= 1
                          ? 'w-1/4 bg-red-500'
                          : strength.score === 2
                          ? 'w-2/4 bg-amber-500'
                          : strength.score === 3
                          ? 'w-3/4 bg-blue-500'
                          : 'w-full bg-emerald-500'
                      }`}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className={`text-xs font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Confirm New Password *
              </label>
              <input
                type="password"
                required
                placeholder="Re-type new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full px-3.5 py-2 rounded-md border text-xs focus:outline-none ${
                  isDark ? 'bg-black border-white/15 text-white focus:border-blue-600' : 'bg-white border-black/15 text-black focus:border-blue-600'
                }`}
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                id="btn-update-admin-password"
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-bold transition-colors cursor-pointer flex items-center gap-2"
              >
                <Lock size={14} />
                <span>Update Password</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
