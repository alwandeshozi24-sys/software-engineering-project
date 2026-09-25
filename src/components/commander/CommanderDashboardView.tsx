import React from 'react';
import { UserProfile } from '../../types/auth';
import { DetectiveCaseDocket, SupervisorInstruction } from '../../types/detective';
import { StationComplaintRecord } from '../../types/commander';
import { 
  Briefcase, 
  UserPlus, 
  Clock, 
  ClipboardList, 
  ArrowRightLeft, 
  ArrowRight, 
  AlertTriangle, 
  ShieldCheck, 
  CheckCircle2, 
  FileText,
  UserCheck
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface CommanderDashboardViewProps {
  commander: UserProfile;
  cases: DetectiveCaseDocket[];
  instructions: SupervisorInstruction[];
  complaints: StationComplaintRecord[];
  onOpenCase: (caseDocket: DetectiveCaseDocket, initialTab?: any) => void;
  onNavigateToCases: (filter?: string) => void;
  onNavigateToDetectives: () => void;
  onNavigateToComplaints: () => void;
  onOpenAssignModal: (caseDocket: DetectiveCaseDocket) => void;
}

export const CommanderDashboardView: React.FC<CommanderDashboardViewProps> = ({
  commander,
  cases,
  instructions,
  complaints,
  onOpenCase,
  onNavigateToCases,
  onNavigateToDetectives,
  onNavigateToComplaints,
  onOpenAssignModal
}) => {
  const { isDark } = useTheme();
  const today = new Date().toISOString().split('T')[0];

  // 1. Cases Awaiting Detective Assignment
  const unassignedCases = cases.filter(
    c => !c.investigatingOfficerPersonnelNumber || c.investigatingOfficerName === 'Unassigned' || c.investigatingOfficerRank === 'Awaiting Allocation'
  );

  // 2. Cases Requiring Review (scheduled review date <= today)
  const casesRequiringReview = cases.filter(
    c => c.scheduledReviewDate && c.scheduledReviewDate <= today
  );

  // 3. Outstanding Supervisor Instructions
  const outstandingInstructions = instructions.filter(i => i.status === 'OUTSTANDING');

  // 4. Dockets Awaiting Acknowledgement
  const docketsAwaitingAck = cases.filter(
    c => !c.isCustodyAcknowledgedByDetective || c.custodyStatus === 'TRANSFERRED_AWAITING_RECEIPT'
  );

  // Cases Requiring Commander's Immediate Attention
  const immediateAttentionCases = cases.filter(c => {
    const isUnassigned = !c.investigatingOfficerPersonnelNumber || c.investigatingOfficerName === 'Unassigned';
    const isCommanderCustodyPending = c.currentCustodianPersonnelNumber === commander.personnelNumber && !c.isCustodyAcknowledgedByDetective;
    const isReviewDue = c.scheduledReviewDate && c.scheduledReviewDate <= today;
    const isCritical = c.priorityLevel === 'Critical';
    return isUnassigned || isCommanderCustodyPending || isReviewDue || isCritical;
  });

  return (
    <div id="commander-dashboard-view" className="space-y-6">
      
      {/* Context Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1 pb-1">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-blue-600" />
            <span className="text-[10px] font-mono uppercase tracking-wider text-blue-600 font-bold">
              Station Command Supervision • Active Session
            </span>
          </div>
          <h2 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-black'}`}>
            Supervisory Command Overview
          </h2>
          <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            {commander.rank} {commander.fullName} ({commander.personnelNumber}) • {commander.station || 'SAPS Sandton Police Station'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onNavigateToCases('unassigned')}
            className="px-3.5 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer shadow-sm"
          >
            <UserPlus size={15} />
            <span>Assign Dockets ({unassignedCases.length})</span>
          </button>
        </div>
      </div>

      {/* 5 Core Supervisory Operational Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
        
        {/* 1. Cases Under Supervision */}
        <div 
          onClick={() => onNavigateToCases('all')}
          className={`p-4 rounded-md border transition-colors cursor-pointer group space-y-2 ${
            isDark ? 'bg-slate-900/40 border-white/10 hover:border-white/20' : 'bg-slate-50 border-black/10 hover:border-black/20'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Under Supervision</span>
            <div className="p-1.5 rounded bg-blue-600/10 text-blue-600 border border-blue-600/20">
              <Briefcase size={16} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl sm:text-3xl font-extrabold font-mono ${isDark ? 'text-white' : 'text-black'}`}>
              {cases.length}
            </span>
            <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>cases</span>
          </div>
          <p className={`text-[10px] pt-1 border-t flex items-center justify-between ${
            isDark ? 'text-slate-400 border-white/10' : 'text-slate-600 border-black/10'
          }`}>
            <span>Station dockets</span>
            <ArrowRight size={11} className="text-blue-600" />
          </p>
        </div>

        {/* 2. Cases Awaiting Detective Assignment */}
        <div 
          onClick={() => onNavigateToCases('unassigned')}
          className={`p-4 rounded-md border transition-colors cursor-pointer group space-y-2 ${
            isDark ? 'bg-slate-900/40 border-white/10 hover:border-amber-500/40' : 'bg-slate-50 border-black/10 hover:border-amber-500/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Awaiting Assignment</span>
            <div className={`p-1.5 rounded ${unassignedCases.length > 0 ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-slate-500/10 text-slate-400'}`}>
              <UserPlus size={16} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl sm:text-3xl font-extrabold font-mono ${unassignedCases.length > 0 ? 'text-amber-500' : isDark ? 'text-white' : 'text-black'}`}>
              {unassignedCases.length}
            </span>
            <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>pending</span>
          </div>
          <p className={`text-[10px] pt-1 border-t flex items-center justify-between ${
            isDark ? 'text-slate-400 border-white/10' : 'text-slate-600 border-black/10'
          }`}>
            <span>Needs investigator</span>
            <ArrowRight size={11} className="text-amber-500" />
          </p>
        </div>

        {/* 3. Cases Requiring Review */}
        <div 
          onClick={() => onNavigateToCases('review_due')}
          className={`p-4 rounded-md border transition-colors cursor-pointer group space-y-2 ${
            isDark ? 'bg-slate-900/40 border-white/10 hover:border-red-500/40' : 'bg-slate-50 border-black/10 hover:border-red-500/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Requiring Review</span>
            <div className={`p-1.5 rounded ${casesRequiringReview.length > 0 ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-slate-500/10 text-slate-400'}`}>
              <Clock size={16} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl sm:text-3xl font-extrabold font-mono ${casesRequiringReview.length > 0 ? 'text-red-500' : isDark ? 'text-white' : 'text-black'}`}>
              {casesRequiringReview.length}
            </span>
            <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>due</span>
          </div>
          <p className={`text-[10px] pt-1 border-t flex items-center justify-between ${
            isDark ? 'text-slate-400 border-white/10' : 'text-slate-600 border-black/10'
          }`}>
            <span>Scheduled review date</span>
            <ArrowRight size={11} className="text-red-500" />
          </p>
        </div>

        {/* 4. Outstanding Supervisor Instructions */}
        <div 
          onClick={() => onNavigateToCases('all')}
          className={`p-4 rounded-md border transition-colors cursor-pointer group space-y-2 ${
            isDark ? 'bg-slate-900/40 border-white/10 hover:border-blue-500/40' : 'bg-slate-50 border-black/10 hover:border-blue-500/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Directives Issued</span>
            <div className={`p-1.5 rounded ${outstandingInstructions.length > 0 ? 'bg-blue-600/10 text-blue-600 border border-blue-600/20' : 'bg-slate-500/10 text-slate-400'}`}>
              <ClipboardList size={16} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl sm:text-3xl font-extrabold font-mono ${outstandingInstructions.length > 0 ? 'text-blue-600' : isDark ? 'text-white' : 'text-black'}`}>
              {outstandingInstructions.length}
            </span>
            <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>active</span>
          </div>
          <p className={`text-[10px] pt-1 border-t flex items-center justify-between ${
            isDark ? 'text-slate-400 border-white/10' : 'text-slate-600 border-black/10'
          }`}>
            <span>SAPS 5 instructions</span>
            <ArrowRight size={11} className="text-blue-600" />
          </p>
        </div>

        {/* 5. Dockets Awaiting Acknowledgement */}
        <div 
          onClick={() => onNavigateToCases('awaiting_ack')}
          className={`p-4 rounded-md border transition-colors cursor-pointer group space-y-2 col-span-2 sm:col-span-1 ${
            isDark ? 'bg-slate-900/40 border-white/10 hover:border-emerald-500/40' : 'bg-slate-50 border-black/10 hover:border-emerald-500/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Transfers Pending</span>
            <div className={`p-1.5 rounded ${docketsAwaitingAck.length > 0 ? 'bg-emerald-600/10 text-emerald-600 border border-emerald-600/20' : 'bg-slate-500/10 text-slate-400'}`}>
              <ArrowRightLeft size={16} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl sm:text-3xl font-extrabold font-mono ${docketsAwaitingAck.length > 0 ? 'text-emerald-600' : isDark ? 'text-white' : 'text-black'}`}>
              {docketsAwaitingAck.length}
            </span>
            <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>in-transit</span>
          </div>
          <p className={`text-[10px] pt-1 border-t flex items-center justify-between ${
            isDark ? 'text-slate-400 border-white/10' : 'text-slate-600 border-black/10'
          }`}>
            <span>Custody handover</span>
            <ArrowRight size={11} className="text-emerald-600" />
          </p>
        </div>

      </div>

      {/* CASES REQUIRING COMMANDER'S IMMEDIATE ATTENTION */}
      <div className={`rounded-md border overflow-hidden ${
        isDark ? 'bg-black border-white/10' : 'bg-white border-black/10'
      }`}>
        
        {/* Header */}
        <div className={`p-4 sm:p-5 border-b flex items-center justify-between gap-3 ${
          isDark ? 'border-white/10 bg-slate-900/40' : 'border-black/10 bg-slate-50'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <AlertTriangle size={16} />
            </div>
            <div>
              <h3 className={`text-sm sm:text-base font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-black'}`}>
                <span>Cases Requiring Commander Attention</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-amber-500/30 text-amber-500 bg-amber-500/10 font-bold">
                  {immediateAttentionCases.length} priority items
                </span>
              </h3>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Unassigned cases, custody handovers, overdue reviews, and critical incidents
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigateToCases('all')}
            className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>View All Cases</span>
            <ArrowRight size={13} />
          </button>
        </div>

        {/* Content Table / Cards */}
        {immediateAttentionCases.length === 0 ? (
          <div className="p-10 text-center space-y-2">
            <CheckCircle2 size={32} className="text-emerald-500 mx-auto" />
            <h4 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-black'}`}>All supervisory actions up to date</h4>
            <p className={`text-xs max-w-md mx-auto ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              No unassigned dockets, overdue supervisory reviews, or pending commander handovers.
            </p>
          </div>
        ) : (
          <div className={`divide-y ${isDark ? 'divide-white/10' : 'divide-black/10'}`}>
            {immediateAttentionCases.map((c) => {
              const isUnassigned = !c.investigatingOfficerPersonnelNumber || c.investigatingOfficerName === 'Unassigned';
              const isReviewDue = c.scheduledReviewDate && c.scheduledReviewDate <= today;

              return (
                <div
                  key={c.id}
                  className={`p-4 sm:p-5 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    isDark ? 'hover:bg-slate-900/40' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-blue-600">
                        {c.caseNumber}
                      </span>
                      <span className={`text-xs font-semibold ${isDark ? 'text-white' : 'text-black'}`}>
                        {c.incidentType}
                      </span>
                      {isUnassigned && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono border border-red-500/30 text-red-500 bg-red-500/10">
                          Awaiting Detective Assignment
                        </span>
                      )}
                      {!c.isCustodyAcknowledgedByDetective && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono border border-amber-500/30 text-amber-500 bg-amber-500/10">
                          Custody Receipt Pending
                        </span>
                      )}
                      {isReviewDue && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono border border-blue-600/30 text-blue-600 bg-blue-600/10">
                          Supervisory Review Due
                        </span>
                      )}
                    </div>

                    <p className={`text-xs line-clamp-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      Complainant: <span className={isDark ? 'text-slate-200' : 'text-slate-800'}>{c.complainant.fullName}</span> • {c.incidentLocation.address}, {c.incidentLocation.suburb}
                    </p>

                    <div className={`flex flex-wrap items-center gap-3 text-[11px] font-mono ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      <span>Investigator: <strong className={isUnassigned ? 'text-red-500' : isDark ? 'text-slate-200' : 'text-slate-800'}>{c.investigatingOfficerName}</strong></span>
                      <span>•</span>
                      <span>Custodian: <strong className="text-emerald-600">{c.currentCustodianName}</strong></span>
                      {c.scheduledReviewDate && (
                        <>
                          <span>•</span>
                          <span className={isReviewDue ? 'text-red-500 font-bold' : ''}>
                            Review Date: {c.scheduledReviewDate}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {isUnassigned ? (
                      <button
                        type="button"
                        onClick={() => onOpenAssignModal(c)}
                        className="px-3.5 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <UserPlus size={14} />
                        <span>Assign Detective</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onOpenCase(c, isReviewDue ? 'supervisory-review' : 'overview')}
                        className={`px-3.5 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border ${
                          isDark ? 'bg-black border-white/20 text-white hover:bg-slate-900' : 'bg-white border-black/20 text-black hover:bg-slate-100'
                        }`}
                      >
                        <span>Open Workspace</span>
                        <ArrowRight size={13} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* QUICK WORKSPACE LINKS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Detectives Under Supervision Summary */}
        <div className={`p-5 rounded-md border space-y-4 ${
          isDark ? 'bg-slate-900/40 border-white/10' : 'bg-slate-50 border-black/10'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded bg-blue-600/10 text-blue-600 border border-blue-600/20">
                <UserCheck size={18} />
              </div>
              <div>
                <h4 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-black'}`}>Station Detectives Roster</h4>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Investigating officers under station command</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onNavigateToDetectives}
              className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Manage Detectives</span>
              <ArrowRight size={12} />
            </button>
          </div>

          <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Monitor active case assignments, ensure balanced caseloads, inspect pending directives, and track docket receipts without arbitrary automatic rules.
          </p>

          <div className={`p-3.5 rounded-md border flex items-center justify-between text-xs ${
            isDark ? 'bg-black border-white/10' : 'bg-white border-black/10'
          }`}>
            <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Station Authorized Detectives:</span>
            <span className="font-mono font-bold text-blue-600">4 Active Investigators</span>
          </div>
        </div>

        {/* Station Complaints Summary */}
        <div className={`p-5 rounded-md border space-y-4 ${
          isDark ? 'bg-slate-900/40 border-white/10' : 'bg-slate-50 border-black/10'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded bg-blue-600/10 text-blue-600 border border-blue-600/20">
                <FileText size={18} />
              </div>
              <div>
                <h4 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-black'}`}>Service & Case Complaints</h4>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Complainant accountability & conduct logs</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onNavigateToComplaints}
              className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View Complaints ({complaints.length})</span>
              <ArrowRight size={12} />
            </button>
          </div>

          <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Review service delivery grievances, investigate delays, record formal supervisory responses, and maintain transparent accountability for complainants.
          </p>

          <div className={`p-3.5 rounded-md border flex items-center justify-between text-xs ${
            isDark ? 'bg-black border-white/10' : 'bg-white border-black/10'
          }`}>
            <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Complaints Pending Review:</span>
            <span className="font-mono font-bold text-amber-500">
              {complaints.filter(c => c.status === 'Pending Review' || c.status === 'Under Investigation').length} Pending Action
            </span>
          </div>
        </div>

      </div>

      {/* CORE SFEN ACCOUNTABILITY BANNER */}
      <div className={`p-4 sm:p-5 rounded-md border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
        isDark ? 'bg-slate-900/20 border-white/10 text-slate-400' : 'bg-slate-50 border-black/10 text-slate-600'
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-blue-600/10 border border-blue-600/20 text-blue-600 flex items-center justify-center shrink-0">
            <ShieldCheck size={18} />
          </div>
          <div>
            <p className={`font-bold text-xs ${isDark ? 'text-white' : 'text-black'}`}>
              SFEN Supervisory Accountability Framework
            </p>
            <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              No docket can be transferred or closed without documented supervisory oversight and cryptographic verification.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 font-mono text-[11px] text-blue-600">
          <span>Commander Clearance: Level 3</span>
        </div>
      </div>

    </div>
  );
};
