import React, { useState } from 'react';
import { UserProfile } from '../../types/auth';
import { CommanderDetectiveWorkload, StationComplaintRecord } from '../../types/commander';
import { DetectiveCaseDocket } from '../../types/detective';
import { CommanderDetectivesView } from './CommanderDetectivesView';
import { CommanderComplaintsView } from './CommanderComplaintsView';
import { Users, AlertCircle } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface CommanderDetectivesAndComplaintsViewProps {
  commander: UserProfile;
  detectivesWorkload: CommanderDetectiveWorkload[];
  complaints: StationComplaintRecord[];
  cases: DetectiveCaseDocket[];
  initialSubTab?: 'detectives' | 'complaints';
  onOpenCase: (caseDocket: DetectiveCaseDocket, initialTab?: any) => void;
  onOpenCaseByNumber?: (caseNumber: string) => void;
  onFilterCasesByDetective: (detectivePersonnelNumber: string) => void;
  onRefreshComplaints: () => void;
}

export const CommanderDetectivesAndComplaintsView: React.FC<CommanderDetectivesAndComplaintsViewProps> = ({
  commander,
  detectivesWorkload,
  complaints,
  cases,
  initialSubTab = 'detectives',
  onOpenCase,
  onOpenCaseByNumber,
  onFilterCasesByDetective,
  onRefreshComplaints
}) => {
  const { isDark } = useTheme();
  const [subTab, setSubTab] = useState<'detectives' | 'complaints'>(initialSubTab);

  const pendingComplaintsCount = complaints.filter(
    c => c.status === 'Pending Review' || c.status === 'Under Investigation'
  ).length;

  return (
    <div id="commander-detectives-and-complaints-view" className="space-y-6">
      
      {/* Combined Header & Sub-Tab Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1 pb-1">
        <div>
          <h2 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
            isDark ? 'text-white' : 'text-black'
          }`}>
            Personnel & Grievances Oversight
          </h2>
          <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Supervise CID detective caseload allocations alongside citizen service delivery complaints
          </p>
        </div>

        {/* Sub-Tab Switcher */}
        <div className={`flex items-center gap-1.5 p-1.5 rounded-md border shadow-sm ${
          isDark ? 'bg-black border-white/10' : 'bg-white border-black/10'
        }`}>
          <button
            type="button"
            id="btn-subtab-detectives"
            onClick={() => setSubTab('detectives')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-bold transition-all cursor-pointer ${
              subTab === 'detectives'
                ? 'bg-blue-600 text-white shadow-xs'
                : isDark 
                  ? 'text-slate-400 hover:text-white hover:bg-slate-900' 
                  : 'text-slate-600 hover:text-black hover:bg-slate-100'
            }`}
          >
            <Users size={15} />
            <span>Detectives</span>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md ${
              subTab === 'detectives' 
                ? 'bg-black/20 text-white' 
                : isDark ? 'bg-slate-900 text-slate-400' : 'bg-slate-100 text-slate-600'
            }`}>
              {detectivesWorkload.length}
            </span>
          </button>

          <button
            type="button"
            id="btn-subtab-complaints"
            onClick={() => setSubTab('complaints')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-bold transition-all cursor-pointer ${
              subTab === 'complaints'
                ? 'bg-blue-600 text-white shadow-xs'
                : isDark 
                  ? 'text-slate-400 hover:text-white hover:bg-slate-900' 
                  : 'text-slate-600 hover:text-black hover:bg-slate-100'
            }`}
          >
            <AlertCircle size={15} />
            <span>Complaints</span>
            {pendingComplaintsCount > 0 ? (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-rose-600 text-white font-extrabold">
                {pendingComplaintsCount} new
              </span>
            ) : (
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md ${
                subTab === 'complaints' 
                  ? 'bg-black/20 text-white' 
                  : isDark ? 'bg-slate-900 text-slate-400' : 'bg-slate-100 text-slate-600'
              }`}>
                {complaints.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Dynamic Sub-View Render */}
      {subTab === 'detectives' && (
        <CommanderDetectivesView
          detectivesWorkload={detectivesWorkload}
          cases={cases}
          onOpenCase={onOpenCase}
          onFilterCasesByDetective={onFilterCasesByDetective}
        />
      )}

      {subTab === 'complaints' && (
        <CommanderComplaintsView
          commander={commander}
          complaints={complaints}
          onOpenCaseByNumber={onOpenCaseByNumber}
          onRefreshComplaints={onRefreshComplaints}
        />
      )}
    </div>
  );
};
