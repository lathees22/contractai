// API client for ContractAI with automatic GitHub Pages offline demo mode
const API_BASE = '/api';

// Preloaded mock data for static GitHub Pages hosting
const MOCK_CONTRACTS = [
  {
    id: 1,
    title: "Master Services Agreement (Apex & Nova)",
    filename: "sample_msa_contract.docx",
    file_type: "docx",
    created_at: new Date().toISOString(),
    risk_score: 98,
    risk_level: "High",
    summary: "Commercial cloud infrastructure agreement containing 20 extracted clauses across 12 numbered sections. ContractAI detected 6 high-severity risk provisions including uncapped client liability and a 90-day auto-renewal trap.",
    total_clauses: 20,
    total_risks: 6,
    total_obligations: 18,
    sections: [
      { id: 1, section_number: "Section 1", section_title: "Scope of Services", content: "Service Provider agrees to provide cloud software infrastructure architecture, data engineering, and technical advisory services." },
      { id: 2, section_number: "Section 2", section_title: "Payment and Invoicing", content: "Client shall pay monthly fee of $12,500.00 USD. Invoices payable within 15 business days (Net 15). Overdue amounts accrue interest at 2.5% per month plus $500 penalty." },
      { id: 3, section_number: "Section 3", section_title: "Term and Automatic Renewal", content: "UPON EXPIRATION OF INITIAL TERM, THIS AGREEMENT SHALL AUTOMATICALLY RENEW FOR SUCCESSIVE 12 MONTH PERIODS UNLESS WRITTEN NOTICE IS DELIVERED AT LEAST 90 DAYS PRIOR." },
      { id: 4, section_number: "Section 4", section_title: "Termination for Convenience", content: "Service Provider may terminate at any time with 14 days written notice. Client may only terminate upon 90 days notice for material uncured default after 60-day cure period." },
      { id: 5, section_number: "Section 5", section_title: "Confidentiality", content: "Each party agrees to hold proprietary data in confidence. Obligations shall survive termination in perpetuity." },
      { id: 7, section_number: "Section 7", section_title: "Unlimited Liability", content: "CLIENT'S LIABILITY FOR ANY CLAIMS ARISING OUT OF THIS AGREEMENT SHALL BE WITHOUT LIMITATION AND NO CAP ON LIABILITY SHALL APPLY TO CLIENT. Provider liability capped at 1 month fees." },
      { id: 8, section_number: "Section 8", section_title: "Overly Broad Indemnification", content: "Client shall defend, indemnify, and hold harmless Service Provider against any and all claims regardless of whether caused by Service Provider's own negligence." }
    ],
    clauses: [
      {
        id: 1,
        clause_type: "Payment",
        section_reference: "Section 2: Payment and Invoicing",
        plain_summary: "Specifies strict Net 15 payment terms and imposes steep 2.5%/month late interest fees plus $500 administrative penalties.",
        original_text: "Client must remit full payment within fifteen (15) business days (Net 15) of receipt of invoice. Overdue amounts shall accrue interest at 2.5% per month plus a mandatory $500 penalty fee.",
        confidence: 0.95
      },
      {
        id: 2,
        clause_type: "Term & Renewal",
        section_reference: "Section 3: Term and Automatic Renewal",
        plain_summary: "Contains an aggressive evergreen auto-renewal trigger requiring 90 days prior non-renewal notice, or you are locked in for another full year.",
        original_text: "THIS AGREEMENT SHALL AUTOMATICALLY RENEW FOR SUCCESSIVE TWELVE (12) MONTH PERIODS UNLESS EITHER PARTY DELIVERS WRITTEN NOTICE AT LEAST NINETY (90) DAYS PRIOR.",
        confidence: 0.96
      },
      {
        id: 3,
        clause_type: "Termination",
        section_reference: "Section 4: Termination for Convenience",
        plain_summary: "One-sided exit: Service Provider can walk away in 14 days for any reason, but Client must wait 90 days and prove a material breach after a 60-day cure window.",
        original_text: "Service Provider may terminate at any time for sole convenience upon 14 days notice. Client may only terminate upon 90 days notice and 60-day cure period.",
        confidence: 0.94
      },
      {
        id: 4,
        clause_type: "Liability",
        section_reference: "Section 7: Unlimited Liability",
        plain_summary: "CRITICAL: Leaves Client liability uncapped while capping Provider liability to just 1 month of fees. High catastrophic exposure.",
        original_text: "CLIENT'S LIABILITY FOR ANY CLAIMS SHALL BE WITHOUT LIMITATION AND NO CAP SHALL APPLY TO CLIENT. PROVIDER'S LIABILITY SHALL NOT EXCEED ONE MONTH FEES.",
        confidence: 0.98
      },
      {
        id: 5,
        clause_type: "Indemnification",
        section_reference: "Section 8: Broad Indemnification",
        plain_summary: "Requires Client to pay legal defense and settlements even if the claim was caused by Service Provider's own negligence.",
        original_text: "Client shall defend, indemnify, and hold harmless Service Provider against any and all claims regardless of whether caused by Service Provider's own negligence.",
        confidence: 0.95
      }
    ],
    risks: [
      {
        id: 1,
        risk_type: "Unlimited Liability",
        severity: "High",
        section_reference: "Section 7",
        explanation: "The contract places zero cap on Client damages while capping the Provider at 1 month of fees. A single operational mistake could result in uncapped financial lawsuits.",
        clause_reference: "CLIENT'S LIABILITY FOR ANY CLAIMS SHALL BE WITHOUT LIMITATION AND NO CAP ON LIABILITY SHALL APPLY TO CLIENT.",
        safer_rewrite: "Except for gross negligence or willful misconduct, each party's maximum aggregate liability arising under this Agreement shall be limited to the total fees actually paid or payable in the preceding twelve (12) months."
      },
      {
        id: 2,
        risk_type: "Auto-Renewal Trap",
        severity: "High",
        section_reference: "Section 3",
        explanation: "Automatically rolls over into a new 12-month commitment unless written cancellation is served at least 90 days before the contract expires.",
        clause_reference: "THIS AGREEMENT SHALL AUTOMATICALLY RENEW UNLESS WRITTEN NOTICE IS DELIVERED AT LEAST NINETY (90) DAYS PRIOR.",
        safer_rewrite: "This Agreement shall only renew upon affirmative mutual written agreement signed by both parties at least thirty (30) days prior to expiration."
      },
      {
        id: 3,
        risk_type: "One-Sided Termination",
        severity: "High",
        section_reference: "Section 4",
        explanation: "Provider can terminate for convenience in 14 days, but Client has no right to cancel for convenience and must endure a lengthy 60-day cure window.",
        clause_reference: "Service Provider may terminate at any time with or without cause for sole convenience upon delivering 14 days notice.",
        safer_rewrite: "Either party may terminate this Agreement for convenience at any time upon thirty (30) days prior written notice."
      },
      {
        id: 4,
        risk_type: "Broad Indemnification",
        severity: "High",
        section_reference: "Section 8",
        explanation: "Obligates Client to indemnify Provider even if the damages resulted from Provider's own errors or negligence.",
        clause_reference: "Client shall defend and hold harmless Service Provider regardless of whether caused by Service Provider's own negligence.",
        safer_rewrite: "Each party shall indemnify the other against third-party claims solely to the extent directly caused by the indemnifying party's material breach or gross negligence."
      }
    ],
    obligations: [
      { id: 1, party: "Client", action: "Remit full monthly invoice payment", deadline: "Net 15 days", status: "Pending", due_date: "2026-11-02" },
      { id: 2, party: "Client", action: "Deliver written notice of non-renewal if canceling", deadline: "90 days prior to term", status: "Pending", due_date: "2026-10-17" },
      { id: 3, party: "Service Provider", action: "Provide monthly cloud infrastructure monitoring & 40 engineering hours", deadline: "Monthly", status: "Done", due_date: "2026-10-31" },
      { id: 4, party: "Both Parties", action: "Maintain strict confidentiality of proprietary data", deadline: "Ongoing in perpetuity", status: "Pending", due_date: "Ongoing" }
    ]
  }
];

// Helper to check if running in static/demo mode
let isStaticMode = false;

async function apiFetch(url, options = {}) {
  try {
    const res = await fetch(url, options);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn(`[ContractAI] Backend unreachable at ${url}. Operating in Client-Side Demo mode.`);
    isStaticMode = true;
    throw err;
  }
}

export async function fetchContracts() {
  try {
    return await apiFetch(`${API_BASE}/contracts`);
  } catch {
    return MOCK_CONTRACTS;
  }
}

export async function fetchContractDetail(id) {
  try {
    return await apiFetch(`${API_BASE}/contracts/${id}`);
  } catch {
    const found = MOCK_CONTRACTS.find(c => c.id === Number(id)) || MOCK_CONTRACTS[0];
    return found;
  }
}

export async function deleteContract(id) {
  try {
    return await apiFetch(`${API_BASE}/contracts/${id}`, { method: 'DELETE' });
  } catch {
    return { message: "Contract deleted" };
  }
}

export async function uploadContractFile(formData) {
  try {
    return await apiFetch(`${API_BASE}/contracts/upload`, {
      method: 'POST',
      body: formData,
    });
  } catch {
    // In static mode, return mock contract
    return {
      contract_id: 1,
      title: "Master Services Agreement (Apex & Nova)",
      risk_score: 98,
      risk_level: "High",
      total_sections: 12,
      total_clauses: 20,
      total_risks: 6,
      total_obligations: 18
    };
  }
}

export async function updateObligationStatus(obligationId, status) {
  try {
    return await apiFetch(`${API_BASE}/obligations/${obligationId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
  } catch {
    return { message: `Obligation status updated to ${status}` };
  }
}

export async function sendChatMessage(contractId, message) {
  try {
    return await apiFetch(`${API_BASE}/contracts/${contractId}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });
  } catch {
    // Client-side Q&A fallback
    const q = message.toLowerCase();
    if (q.includes('cancel') || q.includes('terminate')) {
      return {
        id: Date.now(),
        role: "assistant",
        content: "**Based on Section 4: Termination for Convenience (Termination Clause):**\nAllows early cancellation, but only Service Provider may terminate for convenience with 14 days notice. Client can only terminate upon 90 days notice for material uncured breach after a 60-day cure period.\n\n> *\"Service Provider may terminate at any time for sole convenience upon 14 days notice...\"*",
        cited_clauses: [
          {
            clause_type: "Termination",
            section_reference: "Section 4",
            quote: "Service Provider may terminate at any time for sole convenience upon 14 days notice. Client may only terminate upon 90 days notice and 60-day cure period.",
            explanation: "One-sided convenience termination right."
          }
        ]
      };
    } else if (q.includes('renew') || q.includes('auto')) {
      return {
        id: Date.now(),
        role: "assistant",
        content: "**Based on Section 3: Term and Automatic Renewal (Term & Renewal Clause):**\nThis contract automatically renews for successive 12-month periods unless written notice of non-renewal is delivered at least 90 days prior to the expiration date.\n\n> *\"THIS AGREEMENT SHALL AUTOMATICALLY RENEW FOR SUCCESSIVE TWELVE (12) MONTH PERIODS UNLESS WRITTEN NOTICE AT LEAST NINETY (90) DAYS PRIOR...\"*",
        cited_clauses: [
          {
            clause_type: "Term & Renewal",
            section_reference: "Section 3",
            quote: "THIS AGREEMENT SHALL AUTOMATICALLY RENEW FOR SUCCESSIVE 12 MONTH PERIODS UNLESS WRITTEN NOTICE IS DELIVERED AT LEAST 90 DAYS PRIOR.",
            explanation: "Evergreen auto-renewal trap."
          }
        ]
      };
    } else if (q.includes('liab') || q.includes('cap') || q.includes('damage')) {
      return {
        id: Date.now(),
        role: "assistant",
        content: "**Based on Section 7: Unlimited Liability (Liability Clause):**\nClient liability is completely uncapped and without limitation! In contrast, Service Provider liability is capped at just one month of fees received.\n\n> *\"CLIENT'S LIABILITY FOR ANY CLAIMS SHALL BE WITHOUT LIMITATION AND NO CAP ON LIABILITY SHALL APPLY TO CLIENT...\"*",
        cited_clauses: [
          {
            clause_type: "Liability",
            section_reference: "Section 7",
            quote: "CLIENT'S LIABILITY FOR ANY CLAIMS SHALL BE WITHOUT LIMITATION AND NO CAP SHALL APPLY TO CLIENT.",
            explanation: "Uncapped liability risk on client."
          }
        ]
      };
    } else {
      return {
        id: Date.now(),
        role: "assistant",
        content: `I analyzed your inquiry about "${message}". Reviewing the agreement, key terms are established under Section 2 (Payment: Net 15), Section 3 (90-day Auto-Renewal), and Section 7 (Liability). Check the 'Risk Radar' tab for safer negotiation rewrites.`,
        cited_clauses: [
          {
            clause_type: "Payment",
            section_reference: "Section 2",
            quote: "Client must remit full payment within fifteen (15) business days (Net 15).",
            explanation: "Standard payment window."
          }
        ]
      };
    }
  }
}

export async function fetchChatHistory(contractId) {
  try {
    return await apiFetch(`${API_BASE}/contracts/${contractId}/chat`);
  } catch {
    return [];
  }
}

export async function fetchSamples() {
  try {
    return await apiFetch(`${API_BASE}/samples`);
  } catch {
    return [
      { id: "msa", title: "Master Services Agreement (MSA)", description: "Contains 90-day auto-renewal, uncapped liability, and one-sided termination.", file_type: "docx", risk_preview: "High Risk (98/100)" },
      { id: "nda", title: "Mutual Non-Disclosure Agreement (NDA)", description: "Contains perpetual confidentiality and $250k liquidated damages.", file_type: "pdf", risk_preview: "Medium Risk (57/100)" },
      { id: "saas", title: "Enterprise SaaS Subscription Agreement", description: "Contains unilateral terms changes and 'as-is' warranty disclaimers.", file_type: "docx", risk_preview: "Medium Risk (45/100)" }
    ];
  }
}

export async function loadSample(sampleId) {
  try {
    return await apiFetch(`${API_BASE}/samples/load/${sampleId}`, { method: 'POST' });
  } catch {
    return {
      contract_id: 1,
      title: "Master Services Agreement (Apex & Nova)",
      risk_score: 98,
      risk_level: "High",
      total_sections: 12,
      total_clauses: 20,
      total_risks: 6,
      total_obligations: 18
    };
  }
}

export async function fetchDashboardStats() {
  try {
    return await apiFetch(`${API_BASE}/dashboard/stats`);
  } catch {
    return {
      total_contracts: 1,
      average_risk_score: 98,
      pending_obligations: 18,
      critical_risks: 6,
      high_risk_contracts: 1,
      medium_risk_contracts: 0,
      low_risk_contracts: 0,
      contracts: MOCK_CONTRACTS
    };
  }
}

export async function fetchSettings() {
  try {
    return await apiFetch(`${API_BASE}/settings`);
  } catch {
    return {
      ai_mode: "rule_based",
      has_api_key: false,
      masked_api_key: "",
      engine_status: "Rule-Based Offline Heuristic Engine (Active)"
    };
  }
}

export async function saveSettings(payload) {
  try {
    return await apiFetch(`${API_BASE}/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch {
    return { message: "Settings saved" };
  }
}
