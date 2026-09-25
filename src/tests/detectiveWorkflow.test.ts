import { describe, it, expect } from 'vitest';
import { detectiveService } from '../services/detectiveService';
import { commanderService, AUTHORISED_STATION_DETECTIVES } from '../services/commanderService';
import { UserProfile } from '../types/auth';

describe('Detective & Station Commander Workflow Tests', () => {
  const testDetectivePersonnelNumber = 'POL-20491'; // Det. Insp. David Khumalo

  const mockDetectiveUser: UserProfile = {
    id: 'usr_pol_20491',
    personnelNumber: 'POL-20491',
    fullName: 'David Khumalo',
    rank: 'Detective Inspector',
    email: 'd.khumalo@saps.gov.za',
    station: 'SAPS Sandton Police Station',
    division: 'General & Serious Crime Investigations',
    role: 'DETECTIVE',
    clearanceLevel: 'Level 2 - Investigating Officer & Evidence Management',
    lastLogin: '2026-09-24T08:00:00Z',
    token: 'jwt_mock_detective_token_sfen_2026'
  };

  const mockCommanderUser: UserProfile = {
    id: 'usr_cmd_01',
    personnelNumber: 'POL-50012',
    fullName: 'Elena Vance',
    rank: 'Senior Superintendent',
    email: 'e.vance@saps.gov.za',
    station: 'SAPS Sandton Police Station',
    division: 'Station Command & Executive Management',
    role: 'COMMANDER',
    clearanceLevel: 'Level 3 - Station Command & Supervisory Review',
    lastLogin: '2026-09-24T08:00:00Z',
    token: 'jwt_mock_commander_token_sfen_2026'
  };

  it('retrieves assigned cases specifically for the authenticated detective', () => {
    const cases = detectiveService.getAssignedCases(testDetectivePersonnelNumber);
    expect(cases.length).toBeGreaterThan(0);
    cases.forEach(c => {
      expect(c.investigatingOfficerPersonnelNumber).toBe(testDetectivePersonnelNumber);
    });
  });

  it('allows detective to acknowledge docket custody and records audit log', () => {
    const cases = detectiveService.getAssignedCases(testDetectivePersonnelNumber);
    const targetCase = cases[0];

    const result = detectiveService.acknowledgeDocketCustody(
      targetCase.caseNumber,
      mockDetectiveUser,
      'Physical docket received in good condition from CSC counter'
    );

    expect(result.success).toBe(true);

    const updatedCase = detectiveService.getCaseByNumber(targetCase.caseNumber, testDetectivePersonnelNumber);
    expect(updatedCase).toBeDefined();
    expect(updatedCase?.isCustodyAcknowledgedByDetective).toBe(true);
    expect(updatedCase?.custodyStatus).toBe('HELD_BY_INVESTIGATING_OFFICER');

    // Verify audit trail contains the acknowledgement
    const audits = detectiveService.getCaseAuditTrail(targetCase.caseNumber);
    expect(audits.some(a => a.action === 'DOCKET_RECEIPT_ACKNOWLEDGED')).toBe(true);
  });

  it('allows detective to respond to supervisor directives', () => {
    const instructions = detectiveService.getSupervisorInstructions({ 
      detectivePersonnelNumber: testDetectivePersonnelNumber 
    });
    expect(instructions.length).toBeGreaterThan(0);

    const targetInstruction = instructions[0];
    const res = detectiveService.respondToInstruction(
      targetInstruction.id,
      'Subpoena drafted and dispatched to cellular service provider legal liaison.',
      'Section 205 compliance acknowledged by network provider. Tower data pending.',
      false,
      mockDetectiveUser
    );

    expect(res.success).toBe(true);
    expect(res.instruction?.status).toBe('IN_PROGRESS');
    expect(res.instruction?.responseActionTaken).toContain('Subpoena drafted');
  });

  it('computes detective workload accurately for station commander oversight', () => {
    const workloads = commanderService.getDetectivesWorkload();
    expect(workloads.length).toBe(AUTHORISED_STATION_DETECTIVES.length);

    const khumaloWorkload = workloads.find(w => w.detective.personnelNumber === testDetectivePersonnelNumber);
    expect(khumaloWorkload).toBeDefined();
    expect(khumaloWorkload?.activeAssignedCasesCount).toBeGreaterThan(0);
  });

  it('allows commander to issue directives and resolve complaints', () => {
    const complaints = commanderService.getStationComplaints();
    expect(complaints.length).toBeGreaterThan(0);

    const targetComplaint = complaints[0];
    const outcome = commanderService.handleComplaint({
      complaintId: targetComplaint.id,
      status: 'Under Investigation',
      commanderNotes: 'Contacted complainant and reviewed docket entries with investigating officer.',
      outcomeResponse: 'The docket has been audited and the detective is instructed to prioritize fingerprint results.',
      commander: mockCommanderUser
    });

    expect(outcome.success).toBe(true);
    expect(outcome.updatedComplaint?.status).toBe('Under Investigation');
    expect(outcome.updatedComplaint?.commanderNotes).toContain('Contacted complainant');
  });

  it('supports full supervisory inspection cycle: Detective transfers to Commander -> Commander acknowledges -> Commander records review & issues instructions -> returns to Detective -> Detective re-acknowledges', () => {
    const cases = detectiveService.getAssignedCases(testDetectivePersonnelNumber);
    const targetCase = cases[0];
    const caseNumber = targetCase.caseNumber;

    // 1. Detective initiates transfer to Station Commander for inspection
    const reqRes = detectiveService.transferDocketToCommander({
      caseNumber,
      movementReason: 'Investigation milestone completed; requesting formal supervisory review before court referral.'
    }, mockDetectiveUser, mockCommanderUser.fullName, mockCommanderUser.personnelNumber, mockCommanderUser.rank);

    expect(reqRes.success).toBe(true);

    // Verify docket state is now awaiting receipt by Commander
    let currentCase = detectiveService.getCaseByNumber(caseNumber);
    expect(currentCase).toBeDefined();
    expect(currentCase?.custodyStatus).toBe('TRANSFERRED_AWAITING_RECEIPT');
    expect(currentCase?.currentCustodianPersonnelNumber).toBe(mockCommanderUser.personnelNumber);

    // 2. Station Commander acknowledges receipt
    const ackRes = commanderService.acknowledgeDocketReceipt(caseNumber, mockCommanderUser);
    expect(ackRes.success).toBe(true);

    currentCase = detectiveService.getCaseByNumber(caseNumber);
    expect(currentCase?.custodyStatus).toBe('HELD_BY_SUPERVISOR');
    expect(currentCase?.isCustodyAcknowledgedByDetective).toBe(true);

    // 3. Station Commander records supervisory review
    const reviewRes = commanderService.recordSupervisoryReview({
      caseNumber,
      reviewNotes: 'Case docket inspected. Sworn witness statements in order. Need certified ballistics report before NPA submission.',
      furtherActionRequired: 'Obtain certified ballistics report from Forensic Science Laboratory.',
      nextReviewDate: '2026-10-15',
      reviewOutcome: 'Further Directives Issued',
      commander: mockCommanderUser
    });
    expect(reviewRes.success).toBe(true);
    expect(reviewRes.review.reviewOutcome).toBe('Further Directives Issued');

    // 4. Station Commander issues directive
    const instRes = commanderService.issueInstruction({
      caseNumber,
      instructionText: 'Expedite certified ballistics report from Silverton Forensic Science Laboratory.',
      priority: 'Urgent',
      requiredReviewDate: '2026-10-10',
      commander: mockCommanderUser
    });
    expect(instRes.success).toBe(true);
    expect(instRes.instruction).toBeDefined();

    // 5. Station Commander returns docket to Detective for further investigation
    const returnRes = commanderService.returnDocketToDetective({
      caseNumber,
      commander: mockCommanderUser,
      returnReason: 'Docket returned with SAPS 5 directives for ballistics report retrieval.'
    });
    expect(returnRes.success).toBe(true);

    currentCase = detectiveService.getCaseByNumber(caseNumber);
    expect(currentCase?.custodyStatus).toBe('TRANSFERRED_AWAITING_RECEIPT');
    expect(currentCase?.currentCustodianPersonnelNumber).toBe(testDetectivePersonnelNumber);
    expect(currentCase?.isCustodyAcknowledgedByDetective).toBe(false);

    // 6. Detective receives and acknowledges custody again
    const detAck = detectiveService.acknowledgeDocketCustody(
      caseNumber,
      mockDetectiveUser,
      'Docket received back from Station Commander with instructions.'
    );
    expect(detAck.success).toBe(true);

    currentCase = detectiveService.getCaseByNumber(caseNumber);
    expect(currentCase?.custodyStatus).toBe('HELD_BY_INVESTIGATING_OFFICER');
    expect(currentCase?.isCustodyAcknowledgedByDetective).toBe(true);

    // 7. Verify permanent movement records and audit trail contain full lifecycle provenance
    const movements = detectiveService.getDocketMovements(caseNumber);
    expect(movements.length).toBeGreaterThanOrEqual(2);

    // Verify all movements have full provenance fields
    movements.forEach(m => {
      expect(m.previousCustodian).toBeDefined();
      expect(m.newCustodian).toBeDefined();
      expect(m.senderPersonnelNumber).toBeDefined();
      expect(m.reasonForMovement).toBeDefined();
      expect(m.dispatchedAt).toBeDefined();
      expect(m.currentDocketCustodian).toBeDefined();
    });

    const audits = detectiveService.getCaseAuditTrail(caseNumber);
    expect(audits.some(a => a.action === 'SUPERVISORY_REVIEW_RECORDED')).toBe(true);
    expect(audits.some(a => a.action === 'DOCKET_RETURNED_WITH_INSTRUCTIONS')).toBe(true);
    expect(audits.some(a => a.action === 'DOCKET_RECEIPT_ACKNOWLEDGED')).toBe(true);

    // Check that who registered is recorded
    expect(currentCase?.registeredByOfficerName).toBeDefined();
  });
});
