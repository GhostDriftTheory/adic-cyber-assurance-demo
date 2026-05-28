const scenarios = {
  normal_credit_review: {
    displayName: "Safe read-only credit check",
    actor: "Credit AI Assistant",
    target: "customer_credit:file_2048",
    risk: "LOW",
    summary: "A low-risk AI suggestion remains read-only.",
    chain: [
      "AI suggests a credit-file lookup",
      "ADIC confirms read-only scope",
      "No protected banking state is changed"
    ],
    decision: "ALLOW",
    decisionHeadline: "LOW-RISK READ-ONLY ACTION ALLOWED",
    decisionSubline: "This AI instruction is limited to read-only execution.",
    reason: "証拠チェーンが揃い、保護された銀行状態を変更しないため実行可能です。",
    bankState: "READ-ONLY",
    bankStateDetail: "Core banking remains unchanged after the credit check.",
    evidence: {
      evidence_id: true,
      user_authority: true,
      approval_record: true,
      risk_score: 12,
      threshold: 70,
      provenance_id: true,
      replay_hash: true,
      timestamp: true,
      policy_version: true
    }
  },
  add_external_account: {
    displayName: "Unauthorized external account attempt",
    actor: "Manipulated Treasury AI Agent",
    target: "external_account:new_vendor_771",
    risk: "HIGH",
    summary: "AI instruction attempts to become an external-account change.",
    chain: [
      "AI suggests adding an external beneficiary",
      "ADIC checks authority and approval",
      "Missing approval prevents execution"
    ],
    decision: "REJECT",
    decisionHeadline: "NOT EXECUTABLE",
    decisionSubline: "This AI instruction cannot become a banking operation.",
    reason: "このAI指示は、銀行操作として実行できません。承認者・対象・期限・nonceを束縛した承認記録がありません。",
    bankState: "UNCHANGED",
    bankStateDetail: "No external account was added to the banking system.",
    evidence: {
      evidence_id: true,
      user_authority: true,
      approval_record: false,
      risk_score: 62,
      threshold: 70,
      provenance_id: true,
      replay_hash: true,
      timestamp: true,
      policy_version: true
    }
  },
  change_transfer_limit: {
    displayName: "Unauthorized limit escalation",
    actor: "Manipulated Operations AI Agent",
    target: "access:wire_limit_corporate",
    risk: "HIGH",
    summary: "AI instruction attempts to become a transfer-limit escalation.",
    chain: [
      "AI suggests raising a wire-transfer limit",
      "ADIC checks whether the actor has execution authority",
      "Insufficient authority prevents execution"
    ],
    decision: "REJECT",
    decisionHeadline: "NOT EXECUTABLE",
    decisionSubline: "This AI instruction cannot become a banking operation.",
    reason: "このAI/操作者に限度額変更を実行する権限がないため、銀行操作には変換されません。",
    bankState: "UNCHANGED",
    bankStateDetail: "The transfer limit stayed at its previous value.",
    evidence: {
      evidence_id: true,
      user_authority: false,
      approval_record: true,
      risk_score: 58,
      threshold: 70,
      provenance_id: true,
      replay_hash: true,
      timestamp: true,
      policy_version: true
    }
  },
  approve_wire_transfer: {
    displayName: "High-risk wire transfer attempt",
    actor: "Payments AI Agent",
    target: "wire:overseas_9_800_000",
    risk: "CRITICAL",
    summary: "AI instruction attempts to become a high-risk wire transfer.",
    chain: [
      "AI suggests immediate wire transfer",
      "ADIC evaluates risk and policy",
      "Human decision is required before execution"
    ],
    decision: "HUMAN_REVIEW",
    decisionHeadline: "AI CANNOT COMPLETE THIS ACTION ALONE",
    decisionSubline: "The instruction is held before any banking change.",
    reason: "リスク閾値を超えています。AI単独では銀行操作として完了できません。",
    bankState: "PENDING REVIEW",
    bankStateDetail: "No wire transfer is executed while review is pending.",
    evidence: {
      evidence_id: true,
      user_authority: true,
      approval_record: true,
      risk_score: 91,
      threshold: 70,
      provenance_id: true,
      replay_hash: true,
      timestamp: true,
      policy_version: true
    }
  },
  suspicious_chain_execution: {
    displayName: "Compromised AI attack chain",
    actor: "Compromised Financial AI Agent",
    target: "chain:external_account_limit_wire",
    risk: "CRITICAL",
    summary: "Compromised AI instruction attempts unauthorized financial execution.",
    chain: [
      "AI attempts to add an external account",
      "AI attempts to raise transfer limit",
      "AI attempts immediate wire transfer",
      "ADIC blocks before banking-system change"
    ],
    decision: "REJECT",
    decisionHeadline: "NOT EXECUTABLE",
    decisionSubline: "This AI instruction cannot become a banking operation.",
    reason: "このAI指示は、銀行操作として実行できません。Provenance と Replay Hash が壊れているため、実行権限に変換されません。",
    bankState: "UNCHANGED",
    bankStateDetail: "No account, limit, or wire-transfer change reached core banking.",
    evidence: {
      evidence_id: true,
      user_authority: true,
      approval_record: true,
      risk_score: 88,
      threshold: 70,
      provenance_id: false,
      replay_hash: false,
      timestamp: true,
      policy_version: true
    }
  }
};

const labels = {
  evidence_id: "Evidence ID",
  user_authority: "User Authority",
  approval_record: "Approval Record",
  risk_score: "Risk Score",
  provenance_id: "Provenance ID",
  replay_hash: "Replay Hash",
  timestamp: "Timestamp",
  policy_version: "Policy Version"
};

const descriptions = {
  evidence_id: "この判断を証拠台帳に結びつける",
  user_authority: "このAI/操作者に実行権限があるか",
  approval_record: "承認者・対象・期限・nonceが正しいか",
  risk_score: "リスクが閾値を超えたらAI単独では実行不可",
  provenance_id: "この指示が正しい前段階から来たか",
  replay_hash: "第三者が後から同じ条件で再検証できるか",
  timestamp: "実行前に検証した順序を固定する",
  policy_version: "どの時点のルールで止めたかを固定する"
};

function evaluateEvidence(scenario) {
  const e = scenario.evidence;
  const checks = [
    ["evidence_id", e.evidence_id],
    ["user_authority", e.user_authority],
    ["approval_record", e.approval_record],
    ["risk_score", e.risk_score <= e.threshold ? "pass" : "review"],
    ["provenance_id", e.provenance_id],
    ["replay_hash", e.replay_hash],
    ["timestamp", e.timestamp],
    ["policy_version", e.policy_version]
  ];

  return checks.map(([key, value]) => {
    const status = value === true || value === "pass" ? "pass" : value === "review" ? "review" : "fail";
    const detail = key === "risk_score" ? `${e.risk_score} / threshold ${e.threshold}` : descriptions[key];
    return { key, status, detail };
  });
}

function classForDecision(decision) {
  if (decision === "ALLOW") return "allow";
  if (decision === "HUMAN_REVIEW") return "review";
  return "reject";
}

function renderScenario(id) {
  const scenario = scenarios[id];

  document.querySelectorAll(".scenario-button").forEach((button) => {
    button.classList.toggle("active", button.dataset.scenario === id);
  });

  document.getElementById("scenario-name").textContent = scenario.displayName;
  document.getElementById("attack-summary").textContent = scenario.summary;

  const attackChain = document.getElementById("attack-chain");
  attackChain.innerHTML = "";
  scenario.chain.forEach((step) => {
    const item = document.createElement("li");
    item.textContent = step;
    attackChain.appendChild(item);
  });

  const gateStack = document.getElementById("gate-stack");
  gateStack.innerHTML = "";
  evaluateEvidence(scenario).forEach((gate) => {
    const row = document.createElement("div");
    row.className = `gate ${gate.status}`;
    const mark = gate.status === "pass" ? "OK" : gate.status === "review" ? "RV" : "NO";
    row.innerHTML = `
      <span class="gate-symbol">${mark}</span>
      <span>
        <span class="gate-name">${labels[gate.key]}</span>
        <span class="gate-detail">${gate.detail}</span>
      </span>
      <span class="gate-status">${gate.status.toUpperCase()}</span>
    `;
    gateStack.appendChild(row);
  });

  document.getElementById("decision-label").textContent = scenario.decisionHeadline;
  document.getElementById("decision-code").textContent = scenario.decisionHeadline;
  document.getElementById("decision-subline").textContent = scenario.decisionSubline;
  document.getElementById("decision-reason").textContent = scenario.reason;

  const decisionCard = document.getElementById("decision-card");
  decisionCard.className = `decision-card ${classForDecision(scenario.decision)}`;

  document.getElementById("bank-state-label").textContent = scenario.bankState;
  document.getElementById("bank-state-detail").textContent = scenario.bankStateDetail;
}

document.querySelectorAll(".scenario-button").forEach((button) => {
  button.addEventListener("click", () => renderScenario(button.dataset.scenario));
});

renderScenario("suspicious_chain_execution");
