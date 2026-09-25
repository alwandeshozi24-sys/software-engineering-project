import React, { useState } from 'react';
import { CommanderNotification } from '../../types/commander';
import { 
  Bell, 
  CheckCheck, 
  Briefcase, 
  ArrowRightLeft, 
  Clock, 
  ClipboardList, 
  AlertTriangle, 
  ShieldCheck, 
  ArrowRight
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface CommanderNotificationsViewProps {
  notifications: CommanderNotification[];
  onMarkNotificationAsRead: (id: string) => void;
  onMarkAllNotificationsAsRead: () => void;
  onOpenCaseByNumber: (caseNumber: string) => void;
  onOpenComplaint: (complaintId: string) => void;
}

export const CommanderNotificationsView: React.FC<CommanderNotificationsViewProps> = ({
  notifications,
  onMarkNotificationAsRead,
  onMarkAllNotificationsAsRead,
  onOpenCaseByNumber,
  onOpenComplaint
}) => {
  const { isDark } = useTheme();
  const [filterMode, setFilterMode] = useState<'all' | 'unread' | 'urgent'>('all');

  const filteredNotifications = notifications.filter((n) => {
    if (filterMode === 'unread') return !n.read;
    if (filterMode === 'urgent') return n.priority === 'urgent';
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotifIcon = (type: CommanderNotification['type']) => {
    switch (type) {
      case 'CASE_AWAITING_ASSIGNMENT':
        return <Briefcase size={16} className="text-amber-500" />;
      case 'DOCKET_AWAITING_ACKNOWLEDGEMENT':
        return <ArrowRightLeft size={16} className="text-blue-500" />;
      case 'CASE_REQUIRES_REVIEW':
        return <Clock size={16} className="text-emerald-500" />;
      case 'INSTRUCTION_RESPONDED':
        return <ClipboardList size={16} className="text-blue-500" />;
      case 'SERVICE_COMPLAINT':
        return <AlertTriangle size={16} className="text-rose-500" />;
      default:
        return <ShieldCheck size={16} className="text-slate-400" />;
    }
  };

  const handleNotificationClick = (item: CommanderNotification) => {
    if (!item.read) {
      onMarkNotificationAsRead(item.id);
    }

    if (item.caseNumber) {
      onOpenCaseByNumber(item.caseNumber);
    } else if (item.complaintId) {
      onOpenComplaint(item.complaintId);
    }
  };

  return (
    <div id="commander-notifications-view" className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-black'}`}>
            Supervisory Notifications & Action Alerts
          </h2>
          <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Real-time alerts for unassigned dockets, custody transfers, scheduled review milestones, and service complaints
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={onMarkAllNotificationsAsRead}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold border flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto ${
              isDark
                ? 'bg-slate-900 border-white/20 text-white hover:bg-slate-800'
                : 'bg-slate-100 border-black/20 text-black hover:bg-slate-200'
            }`}
          >
            <CheckCheck size={14} className="text-blue-600" />
            <span>Mark All Read ({unreadCount})</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        {[
          { id: 'all' as const, label: 'All Alerts', count: notifications.length },
          { id: 'unread' as const, label: 'Unread Only', count: unreadCount, highlight: unreadCount > 0 },
          { id: 'urgent' as const, label: 'Urgent Priority', count: notifications.filter(n => n.priority === 'urgent').length }
        ].map((tab) => {
          const isActive = filterMode === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterMode(tab.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 border ${
                isActive
                  ? 'border-blue-600 text-blue-600 font-bold bg-blue-600/10'
                  : isDark
                  ? 'bg-black border-white/10 text-slate-400 hover:text-white'
                  : 'bg-white border-black/10 text-slate-600 hover:text-black'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-md ${
                tab.highlight && !isActive
                  ? 'bg-blue-600 text-white font-bold'
                  : isDark ? 'bg-slate-900 text-slate-300' : 'bg-slate-100 text-slate-700'
              }`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* List */}
      {filteredNotifications.length === 0 ? (
        <div className={`p-12 text-center rounded-md border space-y-3 ${
          isDark ? 'bg-slate-950 border-white/10' : 'bg-slate-50 border-black/10'
        }`}>
          <Bell size={36} className="text-slate-400 mx-auto" />
          <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-black'}`}>No notifications in this view</h3>
          <p className="text-xs text-slate-400">
            You are fully caught up with all supervisory command events.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((n) => (
            <div
              key={n.id}
              onClick={() => handleNotificationClick(n)}
              className={`p-4 rounded-md border transition-all cursor-pointer flex items-start justify-between gap-4 group ${
                !n.read
                  ? isDark 
                    ? 'bg-slate-900/60 border-blue-500/50 hover:border-blue-500' 
                    : 'bg-blue-50/50 border-blue-400 hover:border-blue-600'
                  : isDark
                    ? 'bg-black border-white/10 hover:border-white/25'
                    : 'bg-white border-black/10 hover:border-black/25'
              }`}
            >
              <div className="flex items-start gap-3.5 flex-1 min-w-0">
                <div className={`p-2.5 rounded-md border shrink-0 mt-0.5 ${
                  isDark ? 'bg-slate-900 border-white/10' : 'bg-slate-100 border-black/10'
                }`}>
                  {getNotifIcon(n.type)}
                </div>

                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-black'}`}>
                      {n.title}
                    </span>
                    {!n.read && (
                      <span className="px-1.5 py-0.2 rounded-md text-[9px] font-bold font-mono bg-blue-600 text-white">
                        NEW
                      </span>
                    )}
                    {n.priority === 'urgent' && (
                      <span className="px-1.5 py-0.2 rounded-md text-[9px] font-bold font-mono bg-rose-600/20 text-rose-500 border border-rose-500/30">
                        URGENT
                      </span>
                    )}
                  </div>

                  <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    {n.message}
                  </p>

                  <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-500 font-mono">
                    {n.caseNumber && (
                      <span className="text-amber-500 font-bold">
                        {n.caseNumber}
                      </span>
                    )}
                    <span>{new Date(n.timestamp).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-center">
                <button
                  type="button"
                  className={`px-3 py-1.5 rounded-md text-xs font-bold border flex items-center gap-1 transition-colors ${
                    isDark 
                      ? 'bg-slate-900 text-slate-300 border-white/10 hover:bg-slate-800 hover:text-white' 
                      : 'bg-slate-100 text-slate-700 border-black/10 hover:bg-slate-200 hover:text-black'
                  }`}
                >
                  <span>Inspect</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
