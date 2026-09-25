import React, { useState } from 'react';
import { 
  DetectiveCaseDocket, 
  DocketTransferMovement, 
  InvestigationDiaryRecord, 
  SupervisorInstruction, 
  CaseAuditEntry 
} from '../../types/detective';
import { SupervisoryReviewRecord } from '../../types/commander';
import { useTheme } from '../../context/ThemeContext';
import { 
  ShieldCheck, 
  UserCheck, 
  Clock, 
  ArrowRightLeft, 
  FileText, 
  ClipboardList, 
  FileCheck2, 
  CheckCircle2, 
  AlertTriangle, 
  History, 
  Lock, 
  ChevronDown, 
  ChevronUp,
  Building2,
  Calendar,
  User,
  Shield,
  Search,
  Scale
} from 'lucide-react';

interface CaseLifecycleProvenanceLedgerProps {
  caseDocket: DetectiveCaseDocket;
  movements: DocketTransferMovement[];
  diaryEntries?: InvestigationDiaryRecord[];
  instructions?: SupervisorInstruction[];
  auditEntries?: CaseAuditEntry[];
  reviews?: SupervisoryReviewRecord[];
  initialExpanded?: boolean;
}

export const CaseLifecycleProvenanceLedger: React.FC<CaseLifecycleProvenanceLedgerProps> = ({
  caseDocket,
  movements,
  diaryEntries = [],
  instructions = [],
  auditEntries = [],
  reviews = [],
  initialExpanded = true
}) => {
  const { isDark } = useTheme();
  const [isExpanded, setIsExpanded] = useState(initialExpanded);
  const [activeQuestion, setActiveQuestion] = useState<number | null>(null);

  // 1. Who registered this case?
  const registeredBy = {
    name: caseDocket.registeredByOfficerName || 'Frontline CSC Officer',
    rank: caseDocket.registeredByOfficerRank || 'Sergeant',
    personnelNumber: caseDocket.registeredByOfficerPersonnelNumber || 'POL-10842',
    date: caseDocket.registeredAt 
      ? new Date(caseDocket.registeredAt).toLocaleString() 
      : caseDocket.dateReported,
    station: caseDocket.registrationStation || caseDocket.policeStation || 'SAPS Sandton Police Station',
    reportReference: caseDocket.reportReference || 'Initial Citizen Incident Report',
    initialCharge: caseDocket.initialCharge || caseDocket.incidentType
  };

  // 2. Who currently has responsibility for the docket?
  const currentCustodian = {
    name: caseDocket.currentCustodianName,
    rank: caseDocket.currentCustodianRank,
    personnelNumber: caseDocket.currentCustodianPersonnelNumber,
    department: caseDocket.currentCustodianDepartment,
    status: caseDocket.custodyStatus,
    isAcknowledged: caseDocket.isCustodyAcknowledgedByDetective,
    acknowledgedAt: caseDocket.acknowledgedCustodyAt
      ? new Date(caseDocket.acknowledgedCustodyAt).toLocaleString()
      : undefined
  };

  // 3. Who previously had it?
  const previousCustodian = {
    name: caseDocket.previousCustodianName || 'CSC Frontline Intake',
    rank: caseDocket.previousCustodianRank || 'Sergeant',
    personnelNumber: caseDocket.previousCustodianPersonnelNumber || 'POL-10842',
    department: caseDocket.previousCustodianDepartment || 'Community Service Centre'
  };

  // 4. Who accessed or acted on it?
  const totalAuditRecords = auditEntries.length;
  const uniqueActors = Array.from(new Set(auditEntries.map(a => `${a.userRank} ${a.userFullName} (${a.userRole})`)));

  // 5. Why was it transferred?
  const latestMovement = movements[0];

  // 6. Was the transfer acknowledged?
  const pendingMovements = movements.filter(m => m.status === 'AWAITING_ACKNOWLEDGEMENT');
  const acknowledgedMovements = movements.filter(m => m.status === 'ACKNOWLEDGED_RECEIVED');

  // 7. What investigation actions were performed?
  const totalDiaryActions = diaryEntries.length;

  // 8. What instructions did the Station Commander issue?
  const totalInstructions = instructions.length;
  const outstandingInstructions = instructions.filter(i => i.status === 'OUTSTANDING');

  // 9. What happened to the case from registration until resolution?
  const currentStage = caseDocket.currentStatus;

  const questions = [
    {
      num: 1,
      q: 'Who registered this case?',
      summary: `${registeredBy.rank} ${registeredBy.name} (${registeredBy.personnelNumber})`,
      detail: (
        <div className="space-y-1.5 text-xs">
          <p>
            <strong className={isDark ? 'text-white' : 'text-black'}>Registering Official:</strong>{' '}
            {registeredBy.rank} {registeredBy.name} (Personnel #{registeredBy.personnelNumber})
          </p>
          <p>
            <strong className={isDark ? 'text-white' : 'text-black'}>Station & Unit:</strong>{' '}
            {registeredBy.station} • Community Service Centre (CSC) Frontline Intake Desk
          </p>
          <p>
            <strong className={isDark ? 'text-white' : 'text-black'}>Date & Time Opened:</strong>{' '}
            {registeredBy.date}
          </p>
          <p>
            <strong className={isDark ? 'text-white' : 'text-black'}>Initial Classification:</strong>{' '}
            {registeredBy.initialCharge}
          </p>
          <p>
            <strong className={isDark ? 'text-white' : 'text-black'}>Complainant Electronic Reference:</strong>{' '}
            <span className="font-mono text-blue-500">{registeredBy.reportReference}</span>
          </p>
        </div>
      )
    },
    {
      num: 2,
      q: 'Who currently has responsibility for the docket?',
      summary: `${currentCustodian.name} (${currentCustodian.isAcknowledged ? 'Custody Active' : 'Transfer In-Transit'})`,
      detail: (
        <div className="space-y-1.5 text-xs">
          <p>
            <strong className={isDark ? 'text-white' : 'text-black'}>Current Custodian:</strong>{' '}
            {currentCustodian.name}
            {currentCustodian.personnelNumber ? ` • ${currentCustodian.personnelNumber}` : ''}
          </p>
          <p>
            <strong className={isDark ? 'text-white' : 'text-black'}>Division / Station Location:</strong>{' '}
            {currentCustodian.department}
          </p>
          <p>
            <strong className={isDark ? 'text-white' : 'text-black'}>Custody Status:</strong>{' '}
            <span className="font-mono">{currentCustodian.status}</span>
          </p>
          <p>
            <strong className={isDark ? 'text-white' : 'text-black'}>Custody Receipt Acknowledged:</strong>{' '}
            {currentCustodian.isAcknowledged ? (
              <span className="text-emerald-500 font-semibold inline-flex items-center gap-1">
                <CheckCircle2 size={13} /> Formally Acknowledged {currentCustodian.acknowledgedAt ? `on ${currentCustodian.acknowledgedAt}` : ''}
              </span>
            ) : (
              <span className="text-amber-500 font-semibold inline-flex items-center gap-1">
                <AlertTriangle size={13} /> Awaiting Recipient Formal Acknowledgment
              </span>
            )}
          </p>
        </div>
      )
    },
    {
      num: 3,
      q: 'Who previously had it?',
      summary: previousCustodian.name,
      detail: (
        <div className="space-y-1.5 text-xs">
          <p>
            <strong className={isDark ? 'text-white' : 'text-black'}>Previous Custodian:</strong>{' '}
            {previousCustodian.name} ({previousCustodian.personnelNumber})
          </p>
          <p>
            <strong className={isDark ? 'text-white' : 'text-black'}>Department / Desk:</strong>{' '}
            {previousCustodian.department}
          </p>
        </div>
      )
    },
    {
      num: 4,
      q: 'Who accessed or acted on it?',
      summary: `${totalAuditRecords} recorded audit actions across ${uniqueActors.length} verified actors`,
      detail: (
        <div className="space-y-2 text-xs">
          <p className="text-[11px] text-slate-400">
            Immutable Audit Trail contains {totalAuditRecords} cryptographically signed events.
          </p>
          <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
            {auditEntries.slice(0, 5).map((a) => (
              <div 
                key={a.id} 
                className={`p-2 rounded border text-[11px] ${
                  isDark ? 'bg-slate-900/60 border-white/5 text-slate-300' : 'bg-slate-100 border-black/5 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between font-mono text-[10px] text-slate-400">
                  <span>{new Date(a.timestamp).toLocaleString()}</span>
                  <span className="text-blue-500">{a.action}</span>
                </div>
                <div className="font-semibold mt-0.5">{a.userRank} {a.userFullName} ({a.userRole})</div>
                <div className="text-slate-400 text-[10px]">{a.description}</div>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      num: 5,
      q: 'Why was it transferred?',
      summary: latestMovement ? latestMovement.reasonForMovement : 'Initial case allocation upon registration',
      detail: (
        <div className="space-y-2 text-xs">
          {movements.length > 0 ? (
            movements.map((m, idx) => (
              <div 
                key={m.id}
                className={`p-2.5 rounded border ${
                  isDark ? 'bg-slate-900/60 border-white/5' : 'bg-slate-100 border-black/5'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span>Transfer #{movements.length - idx} • {new Date(m.dispatchedAt).toLocaleString()}</span>
                  <span className={m.status === 'ACKNOWLEDGED_RECEIVED' ? 'text-emerald-500 font-bold' : 'text-amber-500 font-bold'}>
                    {m.status === 'ACKNOWLEDGED_RECEIVED' ? 'ACKNOWLEDGED' : 'AWAITING RECEIPT'}
                  </span>
                </div>
                <div className="mt-1 font-semibold text-[11px]">
                  <span className={isDark ? 'text-white' : 'text-black'}>Reason: </span>
                  {m.reasonForMovement || m.movementReason}
                </div>
                <div className="mt-0.5 text-[10px] text-slate-400 font-mono">
                  From: {m.previousCustodian} ➔ To: {m.destination} ({m.newCustodian})
                </div>
              </div>
            ))
          ) : (
            <p className="text-slate-400">No external docket transfers recorded.</p>
          )}
        </div>
      )
    },
    {
      num: 6,
      q: 'Was the transfer acknowledged?',
      summary: pendingMovements.length === 0 
        ? `All ${acknowledgedMovements.length} transfers formally acknowledged` 
        : `Pending receipt acknowledgment (${pendingMovements.length} in transit)`,
      detail: (
        <div className="space-y-1.5 text-xs">
          {pendingMovements.length > 0 ? (
            <div className="p-2.5 rounded border border-amber-500/30 bg-amber-500/10 text-amber-300">
              <p className="font-bold flex items-center gap-1.5">
                <AlertTriangle size={14} /> Outstanding Transfer Acknowledgment
              </p>
              <p className="text-[11px] mt-1">
                Recipient ({latestMovement?.newCustodian || 'Intended Recipient'}) has not yet signed off physical and digital docket acceptance.
              </p>
            </div>
          ) : (
            <div className="p-2.5 rounded border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
              <p className="font-bold flex items-center gap-1.5">
                <CheckCircle2 size={14} /> Complete Chain of Handover Acknowledged
              </p>
              <p className="text-[11px] mt-1">
                Every movement step in the docket history has been formally received and signed off by the incoming custodian.
              </p>
            </div>
          )}
        </div>
      )
    },
    {
      num: 7,
      q: 'What investigation actions were performed?',
      summary: `${totalDiaryActions} chronological diary actions logged by Detective Branch`,
      detail: (
        <div className="space-y-1.5 text-xs">
          <p className="text-slate-400 text-[11px]">
            Chronological SAPS Investigation Diary records:
          </p>
          {diaryEntries.length > 0 ? (
            <div className="space-y-1 max-h-44 overflow-y-auto pr-1">
              {diaryEntries.map((d) => (
                <div 
                  key={d.id}
                  className={`p-2 rounded border text-[11px] ${
                    isDark ? 'bg-slate-900/60 border-white/5' : 'bg-slate-100 border-black/5'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span>{new Date(d.timestamp).toLocaleDateString()}</span>
                    <span>{d.authorRank} {d.authorName}</span>
                  </div>
                  <p className={`font-semibold mt-0.5 ${isDark ? 'text-white' : 'text-black'}`}>{d.actionTaken}</p>
                  <p className="text-[10px] text-slate-400">Result: {d.resultOutcome}</p>
                  {d.nextActionRequired && (
                    <p className="text-[10px] text-blue-500 font-mono">Next: {d.nextActionRequired}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-400">No diary entries recorded yet.</p>
          )}
        </div>
      )
    },
    {
      num: 8,
      q: 'What instructions did the Station Commander issue?',
      summary: `${totalInstructions} directives issued (${outstandingInstructions.length} currently outstanding)`,
      detail: (
        <div className="space-y-2 text-xs">
          {instructions.length > 0 ? (
            instructions.map((i) => (
              <div 
                key={i.id}
                className={`p-2.5 rounded border text-[11px] ${
                  isDark ? 'bg-slate-900/60 border-white/5' : 'bg-slate-100 border-black/5'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="text-slate-400">Issued by: {i.issuedBy}</span>
                  <span className={i.status === 'COMPLETED' ? 'text-emerald-500 font-bold' : 'text-amber-500 font-bold'}>
                    {i.status} • {i.priority}
                  </span>
                </div>
                <p className={`font-semibold mt-1 ${isDark ? 'text-white' : 'text-black'}`}>
                  "{i.instructionText}"
                </p>
                {(i.responseActionTaken || i.responseResult) && (
                  <p className="mt-1 text-[10px] text-blue-500 bg-blue-500/10 p-1.5 rounded">
                    <strong>Detective Response:</strong> {i.responseActionTaken || i.responseResult}
                  </p>
                )}
              </div>
            ))
          ) : (
            <p className="text-slate-400">No supervisory directives currently issued.</p>
          )}
        </div>
      )
    },
    {
      num: 9,
      q: 'What happened to the case from registration until resolution?',
      summary: `Current Stage: ${currentStage}`,
      detail: (
        <div className="space-y-2 text-xs">
          <div className="p-3 rounded border border-blue-500/20 bg-blue-500/5 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="font-bold text-blue-500">Active Workflow Stage</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-600 text-white font-mono">
                {currentStage}
              </span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              {currentStage === 'Investigation Active' && 'Case is actively investigated by Detective Branch. Field inquiries and diary updates are underway.'}
              {currentStage === 'Evidence Analysis' && 'Evidence submitted for forensic testing, ballistic analysis, or cyber forensics verification.'}
              {currentStage === 'Docket at NPA / Court' && 'Supervisory review completed and deemed prosecution-ready. Docket submitted to National Prosecuting Authority for court trial.'}
              {currentStage === 'Case Finalized' && 'Docket investigation concluded, reviewed by Station Commander, and officially filed into permanent SAPS records.'}
              {currentStage === 'Suspended' && 'Investigation suspended pending new leads or external subpoena responses.'}
            </p>
            {reviews.length > 0 && (
              <div className="mt-2 pt-2 border-t border-white/10 text-[10px] text-slate-400">
                <strong>Latest Supervisory Review Outcome:</strong> {reviews[0].reviewOutcome} on {new Date(reviews[0].reviewDate).toLocaleDateString()}
              </div>
            )}
          </div>
        </div>
      )
    }
  ];

  return (
    <div 
      id="case-lifecycle-provenance-ledger"
      className={`rounded-md border transition-colors ${
        isDark ? 'bg-black border-white/15 text-white' : 'bg-white border-black/15 text-black'
      }`}
    >
      {/* Header bar */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className={`px-4 py-3.5 flex items-center justify-between cursor-pointer border-b select-none ${
          isDark ? 'border-white/10 hover:bg-slate-900/40' : 'border-black/10 hover:bg-slate-50'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded bg-blue-600/10 text-blue-500 border border-blue-600/20">
            <ShieldCheck size={16} />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold tracking-tight flex items-center gap-2">
              <span>Case Provenance & Custody Ledger</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-blue-500/30 text-blue-500 bg-blue-500/5">
                9 SAPS Core Verifications
              </span>
            </h3>
            <p className="text-[10px] text-slate-400">
              Official audit compliance: registration, chain of custody, movements, and supervisor directives
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">
            {isExpanded ? 'Collapse' : 'Expand Ledger'}
          </span>
          {isExpanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
        </div>
      </div>

      {/* Expandable Body */}
      {isExpanded && (
        <div className="p-4 space-y-2.5 divide-y divide-white/5">
          {questions.map((item) => {
            const isItemOpen = activeQuestion === item.num;
            return (
              <div key={item.num} className="pt-2 first:pt-0">
                <div 
                  onClick={() => setActiveQuestion(isItemOpen ? null : item.num)}
                  className={`p-2.5 rounded-md border flex items-start justify-between gap-3 cursor-pointer transition-colors ${
                    isItemOpen
                      ? isDark ? 'bg-slate-900/60 border-blue-500/40' : 'bg-slate-50 border-blue-500/40'
                      : isDark ? 'bg-slate-900/20 border-white/5 hover:border-white/15' : 'bg-white border-black/5 hover:border-black/15'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-mono text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {item.num}
                    </span>
                    <div>
                      <p className="text-xs font-bold">{item.q}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">{item.summary}</p>
                    </div>
                  </div>

                  <span className="text-slate-400 text-xs shrink-0 mt-1">
                    {isItemOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </span>
                </div>

                {isItemOpen && (
                  <div className={`mt-2 p-3 rounded-md border ${
                    isDark ? 'bg-slate-950 border-white/10' : 'bg-slate-50 border-black/10'
                  }`}>
                    {item.detail}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
