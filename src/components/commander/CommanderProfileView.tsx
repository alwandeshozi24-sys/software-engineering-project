import React, { useState } from 'react';
import { UserProfile } from '../../types/auth';
import { 
  KeyRound, 
  Lock, 
  CheckCircle2, 
  AlertCircle,
  ShieldAlert
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface CommanderProfileViewProps {
  commander: UserProfile;
}

export const CommanderProfileView: React.FC<CommanderProfileViewProps> = ({
  commander
}) => {
  const { isDark } = useTheme();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      setMessage({ text: 'Please enter your current operational password.', type: 'error' });
      return;
    }
    if (newPassword.length < 8) {
      setMessage({ text: 'New password must be at least 8 characters long.', type: 'error' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage({ text: 'New passwords do not match. Please re-enter.', type: 'error' });
      return;
    }

    setMessage({
      text: 'Operational credentials successfully updated. Cryptographic session reaffirmed.',
      type: 'success'
    });
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div id="commander-profile-view" className="space-y-6 max-w-4xl">
      
      {/* Header */}
      <div>
        <h2 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-black'}`}>
          Station Commander Profile & Credentials
        </h2>
        <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          Supervisory credentials, station jurisdiction authorization, and account security
        </p>
      </div>

      {/* Profile Overview Card */}
      <div className={`p-5 sm:p-6 rounded-md border space-y-6 ${
        isDark ? 'bg-slate-900/40 border-white/10' : 'bg-slate-50 border-black/10'
      }`}>
        <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b ${
          isDark ? 'border-white/10' : 'border-black/10'
        }`}>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded bg-blue-600 flex items-center justify-center font-bold text-lg text-white font-mono uppercase">
              {commander.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-black'}`}>
                  {commander.rank} {commander.fullName}
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono border border-blue-600 text-blue-600 bg-blue-600/10">
                  Station Commander
                </span>
              </div>
              <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Personnel Number: <strong className="text-blue-600 font-mono">{commander.personnelNumber}</strong>
              </p>
            </div>
          </div>

          <div className={`px-3.5 py-2 rounded-md border text-right ${
            isDark ? 'bg-black border-white/10' : 'bg-white border-black/10'
          }`}>
            <span className="text-[10px] uppercase font-mono text-slate-400 block">Security Clearance</span>
            <span className="text-xs font-bold font-mono text-blue-600">Level 3 Station Supervisory Clearance</span>
          </div>
        </div>

        {/* Station Particulars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className={`p-4 rounded-md border space-y-1 ${
            isDark ? 'bg-black border-white/10' : 'bg-white border-black/10'
          }`}>
            <span className="text-slate-400 block text-[11px]">Assigned Station Jurisdiction:</span>
            <strong className={`text-sm block ${isDark ? 'text-white' : 'text-black'}`}>{commander.station || 'SAPS Sandton Police Station'}</strong>
            <span className="text-[10px] text-slate-400">Gauteng Provincial Division</span>
          </div>

          <div className={`p-4 rounded-md border space-y-1 ${
            isDark ? 'bg-black border-white/10' : 'bg-white border-black/10'
          }`}>
            <span className="text-slate-400 block text-[11px]">Primary Role:</span>
            <strong className={`text-sm block ${isDark ? 'text-white' : 'text-black'}`}>Station Commander / Supervisor</strong>
            <span className="text-[10px] text-blue-600 font-mono">Case Oversight, Docket Tracking & Reviews</span>
          </div>

          <div className={`p-4 rounded-md border space-y-1 ${
            isDark ? 'bg-black border-white/10' : 'bg-white border-black/10'
          }`}>
            <span className="text-slate-400 block text-[11px]">Official Contact Email:</span>
            <strong className="block font-mono">{commander.email}</strong>
            <span className="text-[10px] text-slate-400">SFEN Government Secured CID Gateway</span>
          </div>

          <div className={`p-4 rounded-md border space-y-1 ${
            isDark ? 'bg-black border-white/10' : 'bg-white border-black/10'
          }`}>
            <span className="text-slate-400 block text-[11px]">Station Direct Line:</span>
            <strong className="block font-mono">011 555 4900 (Commander Desk)</strong>
            <span className="text-[10px] text-slate-400">24/7 Priority Command Switchboard</span>
          </div>
        </div>

        {/* Separation of Duties Notice */}
        <div className={`p-4 rounded-md border text-xs space-y-1.5 ${
          isDark ? 'bg-slate-900/30 border-white/10 text-slate-400' : 'bg-slate-100 border-black/10 text-slate-600'
        }`}>
          <div className="flex items-center gap-2 text-blue-600 font-bold">
            <ShieldAlert size={15} />
            <span>Role Separation Protocol</span>
          </div>
          <p className="leading-relaxed text-[11px]">
            Station Commanders have full supervisory authority over cases, detective workloads, docket handovers, instructions, and service complaints. System administration functions (such as creating user credentials or configuring system-wide roles) are strictly restricted to the SFEN System Administrator.
          </p>
        </div>
      </div>

      {/* Password Management Form */}
      <div className={`p-5 sm:p-6 rounded-md border space-y-4 ${
        isDark ? 'bg-slate-900/40 border-white/10' : 'bg-slate-50 border-black/10'
      }`}>
        <div className={`flex items-center gap-2.5 pb-2 border-b ${
          isDark ? 'border-white/10' : 'border-black/10'
        }`}>
          <KeyRound size={18} className="text-blue-600" />
          <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-black'}`}>
            Manage Operational Password
          </h3>
        </div>

        {message && (
          <div className={`p-3 rounded-md text-xs flex items-center gap-2 ${
            message.type === 'success'
              ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-600'
              : 'bg-red-500/15 border border-red-500/30 text-red-600'
          }`}>
            {message.type === 'success' ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
            <span>{message.text}</span>
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-4 max-w-lg">
          <div className="space-y-1">
            <label className={`block text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Current Password *
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••••••"
              className={`w-full px-3.5 py-2 rounded-md border text-xs focus:outline-none ${
                isDark ? 'bg-black border-white/15 text-white focus:border-blue-600' : 'bg-white border-black/15 text-black focus:border-blue-600'
              }`}
            />
          </div>

          <div className="space-y-1">
            <label className={`block text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              New Password *
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••••••"
              className={`w-full px-3.5 py-2 rounded-md border text-xs focus:outline-none ${
                isDark ? 'bg-black border-white/15 text-white focus:border-blue-600' : 'bg-white border-black/15 text-black focus:border-blue-600'
              }`}
            />
          </div>

          <div className="space-y-1">
            <label className={`block text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Confirm New Password *
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••••••"
              className={`w-full px-3.5 py-2 rounded-md border text-xs focus:outline-none ${
                isDark ? 'bg-black border-white/15 text-white focus:border-blue-600' : 'bg-white border-black/15 text-black focus:border-blue-600'
              }`}
            />
          </div>

          <button
            type="submit"
            className="px-4 py-2.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Lock size={14} />
            <span>Update Security Credentials</span>
          </button>
        </form>
      </div>

    </div>
  );
};
