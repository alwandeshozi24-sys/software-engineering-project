import React, { useState } from 'react';
import { CommanderDetectiveWorkload } from '../../types/commander';
import { DetectiveCaseDocket } from '../../types/detective';
import { 
  Briefcase, 
  Mail, 
  Phone, 
  ArrowRight,
  AlertTriangle
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface CommanderDetectivesViewProps {
  detectivesWorkload: CommanderDetectiveWorkload[];
  cases: DetectiveCaseDocket[];
  onOpenCase: (caseDocket: DetectiveCaseDocket, initialTab?: any) => void;
  onFilterCasesByDetective: (detectivePersonnelNumber: string) => void;
}

export const CommanderDetectivesView: React.FC<CommanderDetectivesViewProps> = ({
  detectivesWorkload,
  cases,
  onOpenCase,
  onFilterCasesByDetective
}) => {
  const { isDark } = useTheme();
  const [selectedDetectiveNumber, setSelectedDetectiveNumber] = useState<string | null>(null);

  const selectedDetectiveCases = selectedDetectiveNumber
    ? cases.filter(c => c.investigatingOfficerPersonnelNumber === selectedDetectiveNumber)
    : [];

  return (
    <div id="commander-detectives-view" className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-black'}`}>
            Station Detectives & Workload Supervision
          </h2>
          <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Supervise investigating officer caseloads, pending directives, and docket custody under station command
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className={`text-xs font-mono ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            <strong className="text-blue-600 font-bold">{detectivesWorkload.length}</strong> Authorized Investigating Officers
          </span>
        </div>
      </div>

      {/* Detectives Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {detectivesWorkload.map((item) => {
          const det = item.detective;
          const isSelected = selectedDetectiveNumber === det.personnelNumber;

          return (
            <div
              key={det.personnelNumber}
              className={`p-5 rounded-md border transition-colors flex flex-col justify-between gap-4 ${
                isSelected
                  ? isDark ? 'bg-black border-blue-600 shadow-md' : 'bg-white border-blue-600 shadow-md'
                  : isDark ? 'bg-black border-white/10 hover:border-white/20' : 'bg-white border-black/10 hover:border-black/20'
              }`}
            >
              {/* Top details */}
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded bg-blue-600 flex items-center justify-center font-bold text-sm text-white font-mono uppercase">
                      {det.fullName.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h3 className={`text-sm font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-black'}`}>
                        <span>{det.rank} {det.fullName}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded border border-blue-600 text-blue-600 bg-blue-600/5">
                          {det.personnelNumber}
                        </span>
                      </h3>
                      <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        {det.division}
                      </p>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono border border-emerald-500/30 text-emerald-600 bg-emerald-500/10">
                    {det.status}
                  </span>
                </div>

                {/* Specialization & Contact */}
                <div className={`p-3 rounded-md border space-y-1.5 text-xs ${
                  isDark ? 'bg-slate-900/40 border-white/10 text-slate-300' : 'bg-slate-50 border-black/10 text-slate-700'
                }`}>
                  <div>
                    <strong className={isDark ? 'text-slate-400' : 'text-slate-500'}>Focus:</strong> {det.specialization}
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-[11px] font-mono pt-1">
                    <span className="flex items-center gap-1">
                      <Phone size={11} className="text-slate-400" />
                      <span>{det.phone}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Mail size={11} className="text-slate-400" />
                      <span>{det.email}</span>
                    </span>
                  </div>
                </div>

                {/* Workload Metrics */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className={`p-2.5 rounded-md border ${
                    isDark ? 'bg-slate-900/30 border-white/10' : 'bg-slate-50 border-black/10'
                  }`}>
                    <span className={`text-[10px] block mb-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Active Cases</span>
                    <strong className={`text-sm font-bold font-mono ${isDark ? 'text-white' : 'text-black'}`}>
                      {item.activeAssignedCasesCount}
                    </strong>
                  </div>

                  <div className={`p-2.5 rounded-md border ${
                    isDark ? 'bg-slate-900/30 border-white/10' : 'bg-slate-50 border-black/10'
                  }`}>
                    <span className={`text-[10px] block mb-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Directives</span>
                    <strong className={`text-sm font-bold font-mono ${item.outstandingDirectivesCount > 0 ? 'text-blue-600' : isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {item.outstandingDirectivesCount}
                    </strong>
                  </div>

                  <div className={`p-2.5 rounded-md border ${
                    isDark ? 'bg-slate-900/30 border-white/10' : 'bg-slate-50 border-black/10'
                  }`}>
                    <span className={`text-[10px] block mb-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Reviews Due</span>
                    <strong className={`text-sm font-bold font-mono ${item.casesRequiringReviewCount > 0 ? 'text-red-500' : isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {item.casesRequiringReviewCount}
                    </strong>
                  </div>
                </div>

                {item.unacknowledgedDocketsCount > 0 && (
                  <div className="p-2 rounded border border-amber-500/30 text-[11px] text-amber-500 bg-amber-500/10 flex items-center gap-2">
                    <AlertTriangle size={13} className="shrink-0" />
                    <span>{item.unacknowledgedDocketsCount} docket transfer(s) awaiting detective receipt signature.</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className={`pt-2 border-t flex items-center justify-between gap-2 ${
                isDark ? 'border-white/10' : 'border-black/10'
              }`}>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedDetectiveNumber(
                      selectedDetectiveNumber === det.personnelNumber ? null : det.personnelNumber
                    );
                  }}
                  className={`text-xs font-semibold hover:underline flex items-center gap-1.5 transition-colors cursor-pointer ${
                    isDark ? 'text-slate-300' : 'text-slate-700'
                  }`}
                >
                  <span>{isSelected ? 'Hide Case List' : 'Inspect Active Dockets'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => onFilterCasesByDetective(det.personnelNumber)}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border ${
                    isDark ? 'bg-black border-white/20 text-white hover:bg-slate-900' : 'bg-white border-black/20 text-black hover:bg-slate-100'
                  }`}
                >
                  <Briefcase size={13} className="text-blue-600" />
                  <span>View in Cases</span>
                  <ArrowRight size={12} />
                </button>
              </div>

              {/* Expanded case list if selected */}
              {isSelected && (
                <div className={`mt-3 p-3 rounded-md border space-y-2 ${
                  isDark ? 'bg-slate-950 border-white/10' : 'bg-slate-50 border-black/10'
                }`}>
                  <p className="text-xs font-bold text-blue-600">
                    Assigned Dockets ({selectedDetectiveCases.length})
                  </p>
                  {selectedDetectiveCases.length === 0 ? (
                    <p className="text-xs text-slate-400">No active dockets assigned.</p>
                  ) : (
                    <div className="space-y-1 max-h-48 overflow-y-auto">
                      {selectedDetectiveCases.map((c) => (
                        <div 
                          key={c.id}
                          onClick={() => onOpenCase(c)}
                          className={`p-2 rounded border text-xs flex items-center justify-between cursor-pointer ${
                            isDark ? 'bg-black border-white/5 hover:border-white/20' : 'bg-white border-black/5 hover:border-black/20'
                          }`}
                        >
                          <div>
                            <span className="font-mono font-bold text-blue-600">{c.caseNumber}</span>
                            <span className="ml-2">{c.incidentType}</span>
                          </div>
                          <span className="text-[10px] font-mono text-slate-400">{c.currentStatus}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>
          );
        })}
      </div>

    </div>
  );
};
