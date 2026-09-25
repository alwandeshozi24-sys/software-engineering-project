import React, { useState } from 'react';
import { AdminTab, AdminActivityLog, ConfiguredPoliceStation } from '../../types/admin';
import { 
  Users, 
  ShieldCheck, 
  UserCheck, 
  UserX, 
  Building2, 
  UserPlus, 
  MapPin, 
  Phone, 
  Clock, 
  User, 
  Navigation, 
  ExternalLink, 
  X,
  Sparkles
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface AdminDashboardViewProps {
  stats: {
    totalUsers: number;
    activePersonnel: number;
    complainantAccounts: number;
    inactiveAccounts: number;
    personnelCount: number;
    recentActivity: AdminActivityLog[];
  };
  station: ConfiguredPoliceStation;
  onNavigate: (tab: AdminTab) => void;
  onOpenAddPersonnel: () => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  stats,
  station,
  onNavigate,
  onOpenAddPersonnel
}) => {
  const { isDark } = useTheme();
  const [isStationModalOpen, setIsStationModalOpen] = useState(false);

  return (
    <div id="admin-dashboard-view" className="space-y-6">
      {/* Floating Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1 pb-1">
        <div>
          <h2 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-black'}`}>
            Administrative Overview
          </h2>
          <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            System administration, user account metrics, and station governance for SFEN.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            id="btn-dash-add-personnel"
            onClick={onOpenAddPersonnel}
            className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer shadow-sm"
          >
            <UserPlus size={15} />
            <span>Add Personnel</span>
          </button>
        </div>
      </div>

      {/* 4 Core Administrative Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <div className={`p-4 sm:p-5 rounded-md border space-y-2 ${
          isDark ? 'bg-slate-900/40 border-white/10' : 'bg-slate-50 border-black/10'
        }`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Total Users</span>
            <div className="p-1.5 rounded bg-blue-600/10 text-blue-600 border border-blue-600/20">
              <Users size={16} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl sm:text-3xl font-extrabold font-mono ${isDark ? 'text-white' : 'text-black'}`}>
              {stats.totalUsers}
            </span>
            <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>All registered</span>
          </div>
          <p className={`text-[11px] pt-1 border-t ${isDark ? 'text-slate-400 border-white/10' : 'text-slate-600 border-black/10'}`}>
            Personnel + Complainants
          </p>
        </div>

        {/* Active Personnel Accounts */}
        <div className={`p-4 sm:p-5 rounded-md border space-y-2 ${
          isDark ? 'bg-slate-900/40 border-white/10' : 'bg-slate-50 border-black/10'
        }`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Active Personnel</span>
            <div className="p-1.5 rounded bg-emerald-600/10 text-emerald-600 border border-emerald-600/20">
              <ShieldCheck size={16} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl sm:text-3xl font-extrabold font-mono ${isDark ? 'text-white' : 'text-black'}`}>
              {stats.activePersonnel}
            </span>
            <span className="text-[11px] text-blue-600 font-semibold">Authorized</span>
          </div>
          <p className={`text-[11px] pt-1 border-t ${isDark ? 'text-slate-400 border-white/10' : 'text-slate-600 border-black/10'}`}>
            Across police roles
          </p>
        </div>

        {/* Complainant Accounts */}
        <div className={`p-4 sm:p-5 rounded-md border space-y-2 ${
          isDark ? 'bg-slate-900/40 border-white/10' : 'bg-slate-50 border-black/10'
        }`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Complainants</span>
            <div className="p-1.5 rounded bg-blue-600/10 text-blue-600 border border-blue-600/20">
              <UserCheck size={16} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl sm:text-3xl font-extrabold font-mono ${isDark ? 'text-white' : 'text-black'}`}>
              {stats.complainantAccounts}
            </span>
            <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Public accounts</span>
          </div>
          <p className={`text-[11px] pt-1 border-t ${isDark ? 'text-slate-400 border-white/10' : 'text-slate-600 border-black/10'}`}>
            Verified docket access
          </p>
        </div>

        {/* Inactive Accounts */}
        <div className={`p-4 sm:p-5 rounded-md border space-y-2 ${
          isDark ? 'bg-slate-900/40 border-white/10' : 'bg-slate-50 border-black/10'
        }`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Inactive Accounts</span>
            <div className="p-1.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <UserX size={16} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl sm:text-3xl font-extrabold font-mono ${isDark ? 'text-white' : 'text-black'}`}>
              {stats.inactiveAccounts}
            </span>
            <span className="text-[11px] text-amber-500 font-semibold">Disabled</span>
          </div>
          <p className={`text-[11px] pt-1 border-t ${isDark ? 'text-slate-400 border-white/10' : 'text-slate-600 border-black/10'}`}>
            Pending review or suspended
          </p>
        </div>
      </div>

      {/* Managed Police Station Card */}
      <div className={`p-5 sm:p-6 rounded-md border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
        isDark ? 'bg-slate-900/40 border-white/10' : 'bg-slate-50 border-black/10'
      }`}>
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-12 h-12 rounded-md bg-blue-600/10 border border-blue-600/20 text-blue-600 flex items-center justify-center shrink-0">
            <Building2 size={24} />
          </div>

          <div className="space-y-1">
            <span className={`text-[10px] font-bold uppercase tracking-wider block font-mono ${
              isDark ? 'text-slate-400' : 'text-slate-500'
            }`}>
              Designated Police Station
            </span>
            <h3 className={`text-xl sm:text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-black'}`}>
              {station.name}
            </h3>
            <p className={`text-xs ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              Station Commander: <strong className={isDark ? 'text-white' : 'text-black'}>{station.stationCommander}</strong> • {station.address}, {station.suburb}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-center shrink-0">
          <button
            type="button"
            id="btn-dash-view-station-info"
            onClick={() => setIsStationModalOpen(true)}
            className={`px-4 py-2 rounded-md border text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer ${
              isDark 
                ? 'bg-black border-white/20 text-white hover:bg-slate-900' 
                : 'bg-white border-black/20 text-black hover:bg-slate-100'
            }`}
          >
            <Building2 size={15} className="text-blue-600" />
            <span>Station Directory</span>
          </button>
        </div>
      </div>

      {/* Administrative Scope & Boundaries Notice */}
      <div className={`p-4 rounded-md border text-xs flex items-start gap-3 ${
        isDark ? 'bg-slate-900/20 border-white/10 text-slate-300' : 'bg-slate-50 border-black/10 text-slate-700'
      }`}>
        <ShieldCheck size={18} className="text-blue-600 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className={`font-bold ${isDark ? 'text-white' : 'text-black'}`}>
            System Administration Role Boundary
          </p>
          <p className={`text-[11px] leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            In compliance with SAPS security directives, the System Administrator role is strictly restricted to user account administration, credentials security, and system activity logs. Case registration, docket movement, criminal investigation, and supervisory review are restricted to verified operational police roles.
          </p>
        </div>
      </div>

      {/* =========================================================================
          MODAL: VIEW STATION DETAILS
          ========================================================================= */}
      {isStationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className={`w-full max-w-xl rounded-md border shadow-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto ${
            isDark ? 'bg-black border-white/15 text-white' : 'bg-white border-black/15 text-black'
          }`}>
            {/* Modal Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-md bg-blue-600/10 border border-blue-600/20 text-blue-600 flex items-center justify-center shrink-0">
                  <Building2 size={20} />
                </div>
                <div>
                  <h3 className={`text-lg sm:text-xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>
                    {station.name}
                  </h3>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Station Details & Contact Directory
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsStationModalOpen(false)}
                className={`p-1.5 rounded-md border cursor-pointer ${
                  isDark ? 'border-white/10 text-slate-400 hover:text-white hover:bg-slate-900' : 'border-black/10 text-slate-600 hover:text-black hover:bg-slate-100'
                }`}
              >
                <X size={16} />
              </button>
            </div>

            {/* Station Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* Station Commander */}
              <div className={`p-3.5 rounded-md border space-y-1 ${
                isDark ? 'bg-slate-900/40 border-white/10' : 'bg-slate-50 border-black/10'
              }`}>
                <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600">
                  <User size={13} />
                  <span>Station Commander</span>
                </div>
                <p className="text-xs font-semibold">
                  {station.stationCommander}
                </p>
              </div>

              {/* Operating Hours */}
              <div className={`p-3.5 rounded-md border space-y-1 ${
                isDark ? 'bg-slate-900/40 border-white/10' : 'bg-slate-50 border-black/10'
              }`}>
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                  <Clock size={13} />
                  <span>Operating Hours</span>
                </div>
                <p className="text-xs font-semibold">
                  {station.operatingHours}
                </p>
              </div>

              {/* Physical Address */}
              <div className={`p-3.5 rounded-md border space-y-1 sm:col-span-2 ${
                isDark ? 'bg-slate-900/40 border-white/10' : 'bg-slate-50 border-black/10'
              }`}>
                <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600">
                  <MapPin size={13} />
                  <span>Physical Address</span>
                </div>
                <p className="text-xs">
                  {station.address}, {station.suburb}, {station.city}, {station.province} {station.postalCode}
                </p>
              </div>

              {/* Station Lines */}
              <div className={`p-3.5 rounded-md border space-y-1 ${
                isDark ? 'bg-slate-900/40 border-white/10' : 'bg-slate-50 border-black/10'
              }`}>
                <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600">
                  <Phone size={13} />
                  <span>Main Station Phone</span>
                </div>
                <p className="text-xs font-mono font-bold">
                  {station.phone}
                </p>
              </div>

              {/* Emergency Patrol Line */}
              <div className={`p-3.5 rounded-md border space-y-1 ${
                isDark ? 'bg-slate-900/40 border-white/10' : 'bg-slate-50 border-black/10'
              }`}>
                <div className="flex items-center gap-1.5 text-xs font-bold text-red-500">
                  <Phone size={13} />
                  <span>Sector Patrol Line</span>
                </div>
                <p className="text-xs font-mono font-bold text-red-500">
                  {station.emergencyPhone}
                </p>
              </div>

              {/* GPS Coordinates */}
              <div className={`p-3.5 rounded-md border space-y-1 sm:col-span-2 ${
                isDark ? 'bg-slate-900/40 border-white/10' : 'bg-slate-50 border-black/10'
              }`}>
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-500">
                  <Navigation size={13} />
                  <span>Geographic Coordinates</span>
                </div>
                <p className="text-xs font-mono">
                  Lat: {station.latitude.toFixed(4)}, Lng: {station.longitude.toFixed(4)}
                </p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className={`flex items-center justify-between gap-3 pt-3 border-t ${
              isDark ? 'border-white/10' : 'border-black/10'
            }`}>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(station.name + ' ' + station.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:underline flex items-center gap-1.5 font-medium"
              >
                <ExternalLink size={13} />
                <span>Open in Google Maps</span>
              </a>

              <button
                type="button"
                onClick={() => setIsStationModalOpen(false)}
                className={`px-4 py-2 rounded-md border text-xs font-semibold cursor-pointer ${
                  isDark ? 'border-white/20 hover:bg-slate-900' : 'border-black/20 hover:bg-slate-100'
                }`}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
