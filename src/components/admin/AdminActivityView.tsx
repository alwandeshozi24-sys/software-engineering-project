import React, { useState, useMemo } from 'react';
import { AdminActivityLog, AdminActivityType } from '../../types/admin';
import { 
  Activity, 
  Search, 
  Calendar, 
  User, 
  Download, 
  CheckCircle2, 
  KeyRound, 
  RefreshCw, 
  Building2, 
  UserPlus, 
  XCircle,
  X
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface AdminActivityViewProps {
  activityLogs: AdminActivityLog[];
}

export const AdminActivityView: React.FC<AdminActivityViewProps> = ({ activityLogs }) => {
  const { isDark } = useTheme();
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLogs = useMemo(() => {
    return activityLogs.filter((log) => {
      if (filterType !== 'ALL' && log.actionType !== filterType) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = log.title.toLowerCase().includes(q);
        const matchesDesc = log.description.toLowerCase().includes(q);
        const matchesUser = log.affectedUser ? log.affectedUser.toLowerCase().includes(q) : false;
        const matchesAdmin = log.adminName.toLowerCase().includes(q) || log.adminPersonnelNumber.toLowerCase().includes(q);
        return matchesTitle || matchesDesc || matchesUser || matchesAdmin;
      }
      return true;
    });
  }, [activityLogs, filterType, searchQuery]);

  const handleExportLogs = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(activityLogs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `sfen_admin_audit_log_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const getActionBadge = (type: AdminActivityType) => {
    switch (type) {
      case 'ACCOUNT_CREATED':
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 border border-blue-600/30 bg-blue-600/10 text-blue-600 text-[10px] font-mono font-bold">
            <UserPlus size={11} />
            <span>Account Created</span>
          </span>
        );
      case 'ACCOUNT_ACTIVATED':
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 border border-emerald-600/30 bg-emerald-600/10 text-emerald-600 text-[10px] font-mono font-bold">
            <CheckCircle2 size={11} />
            <span>Account Activated</span>
          </span>
        );
      case 'ACCOUNT_DEACTIVATED':
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 border border-red-600/30 bg-red-600/10 text-red-600 text-[10px] font-mono font-bold">
            <XCircle size={11} />
            <span>Account Deactivated</span>
          </span>
        );
      case 'ROLE_CHANGED':
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 border border-blue-600/30 bg-blue-600/10 text-blue-600 text-[10px] font-mono font-bold">
            <RefreshCw size={11} />
            <span>Role Reassigned</span>
          </span>
        );
      case 'PASSWORD_RESET':
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 border border-amber-600/30 bg-amber-600/10 text-amber-600 text-[10px] font-mono font-bold">
            <KeyRound size={11} />
            <span>Password Reset</span>
          </span>
        );
      case 'STATION_UPDATED':
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 border border-blue-600/30 bg-blue-600/10 text-blue-600 text-[10px] font-mono font-bold">
            <Building2 size={11} />
            <span>Station Updated</span>
          </span>
        );
      case 'PROFILE_UPDATED':
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 border border-slate-500/30 bg-slate-500/10 text-slate-400 text-[10px] font-mono font-bold">
            <User size={11} />
            <span>Profile Updated</span>
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 border border-slate-500/30 text-slate-400 text-[10px] font-mono">
            {type}
          </span>
        );
    }
  };

  return (
    <div id="admin-activity-view" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1 pb-1">
        <div>
          <h2 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-black'}`}>
            System Activity & Audit Log
          </h2>
          <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Immutable trace of administrative events, account modifications, and security operations.
          </p>
        </div>

        <button
          type="button"
          id="btn-export-audit-log"
          onClick={handleExportLogs}
          className={`px-4 py-2 rounded-md border text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer self-start sm:self-center ${
            isDark 
              ? 'bg-black border-white/20 text-white hover:bg-slate-900' 
              : 'bg-white border-black/20 text-black hover:bg-slate-100'
          }`}
        >
          <Download size={14} className="text-blue-600" />
          <span>Export Audit Log (JSON)</span>
        </button>
      </div>

      {/* Control Bar: Filters & Search */}
      <div className={`p-4 rounded-md border flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between ${
        isDark ? 'bg-slate-900/40 border-white/10' : 'bg-slate-50 border-black/10'
      }`}>
        {/* Filter Dropdown */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-xs font-bold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Filter Event:</span>
          <select
            aria-label="Filter events by action type"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className={`px-3 py-2 rounded-md border text-xs font-medium focus:outline-none ${
              isDark 
                ? 'bg-black border-white/15 text-white focus:border-blue-600' 
                : 'bg-white border-black/15 text-black focus:border-blue-600'
            }`}
          >
            <option value="ALL">All Event Types ({activityLogs.length})</option>
            <option value="ACCOUNT_CREATED">Account Created</option>
            <option value="ACCOUNT_ACTIVATED">Account Activated</option>
            <option value="ACCOUNT_DEACTIVATED">Account Deactivated</option>
            <option value="ROLE_CHANGED">Role Reassigned</option>
            <option value="PASSWORD_RESET">Password Reset</option>
            <option value="STATION_UPDATED">Station Updated</option>
            <option value="PROFILE_UPDATED">Profile Updated</option>
          </select>
        </div>

        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search action, affected user, or administrator..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-9 pr-3.5 py-2 rounded-md border text-xs placeholder-slate-500 focus:outline-none ${
              isDark 
                ? 'bg-black border-white/15 text-white focus:border-blue-600' 
                : 'bg-white border-black/15 text-black focus:border-blue-600'
            }`}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Activity Log List */}
      <div className={`rounded-md border overflow-hidden ${
        isDark ? 'bg-black border-white/10' : 'bg-white border-black/10'
      }`}>
        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <Activity size={28} className="mx-auto text-slate-500" />
            <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-black'}`}>No activity records found</p>
            <p className="text-xs text-slate-500">
              No audit records match the current filter or search criteria.
            </p>
          </div>
        ) : (
          <div className={`divide-y ${isDark ? 'divide-white/10' : 'divide-black/10'}`}>
            {filteredLogs.map((log) => (
              <div
                key={log.id}
                className={`p-4 sm:p-5 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs ${
                  isDark ? 'hover:bg-slate-900/40' : 'hover:bg-slate-50'
                }`}
              >
                {/* Event Details */}
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className={`font-bold text-sm ${isDark ? 'text-white' : 'text-black'}`}>
                      {log.title}
                    </span>
                    {getActionBadge(log.actionType)}
                  </div>

                  <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    {log.description}
                  </p>

                  {log.affectedUser && (
                    <div className="flex items-center gap-1.5 text-[11px] pt-0.5">
                      <span className="font-semibold text-slate-500">Affected User:</span>
                      <span className="font-mono text-blue-600 font-bold">{log.affectedUser}</span>
                    </div>
                  )}
                </div>

                {/* Metadata: Administrator & Date/Time */}
                <div className={`flex flex-row md:flex-col md:items-end justify-between text-[11px] shrink-0 font-mono gap-1 border-t md:border-t-0 pt-2 md:pt-0 ${
                  isDark ? 'border-white/10 text-slate-400' : 'border-black/10 text-slate-600'
                }`}>
                  <div className="flex items-center gap-1.5 font-medium">
                    <User size={13} className="text-blue-600" />
                    <span>{log.adminName}</span>
                    <span className="text-slate-500">({log.adminPersonnelNumber})</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-slate-500">
                    <Calendar size={12} />
                    <span>{log.timestamp}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
