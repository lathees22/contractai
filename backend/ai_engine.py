import re
import json
import logging
from typing import List, Dict, Any, Tuple, Optional
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

# =====================================================================
# SYSTEM PROMPTS FOR CLAUDE (ANTHROPIC API)
# =====================================================================

CLAUDE_ANALYSIS_SYSTEM_PROMPT = """You are ContractAI, an expert AI legal contract analyst specializing in helping small business owners, legal teams, and procurement managers who are NOT lawyers.

Your job is to read the provided contract text and output a structured JSON analysis containing:
1. Executive Summary: 2-3 sentences explaining the nature and scope of the agreement.
2. Clauses: Extract and classify key clauses into exactly one of these 12 categories:
   - Payment
   - Term & Renewal
   - Termination
   - Confidentiality
   - Liability
   - Indemnification
   - Non-Compete
   - IP (Intellectual Property)
   - Governing Law
   - Dispute Resolution
   - Warranty
   - Force Majeure
   For each clause, provide: clause_type, original_text, plain_summary (written in simple, non-legal English), section_reference, and confidence (0.0 to 1.0).

3. Risks: Identify dangerous, one-sided, or ambiguous wording. Specifically check for:
   - Unlimited liability (no financial cap, uncapped damages)
   - Auto-renewal (evergreen renewal with short notice windows)
   - One-sided termination (only one party can terminate for convenience)
   - Broad indemnity (holding harmless for third-party negligence or indirect claims)
   - Heavy penalties or liquidated damages
   - Perpetual obligations (eternal confidentiality or excessive non-compete duration)
   For each risk, provide:
   - risk_type: (e.g., "Unlimited Liability", "Trap Auto-Renewal", "One-Sided Termination", "Broad Indemnity", "Harsh Penalty", "Perpetual Obligations")
   - severity: "High" (deal-breaker/catastrophic risk), "Medium" (unfavorable/unbalanced), "Low" (ambiguity or minor caution)
   - explanation: Simple explanation of why this hurts the business.
   - safer_rewrite: A proposed balanced, industry-standard contract clause to replace the risky text.
   - clause_reference: The problematic quote.
   - section_reference: Section name/number.

4. Obligations: Extract actionable duties and deadlines.
   For each obligation, provide:
   - party: Who must perform the action (e.g., "Client", "Service Provider", "Both Parties")
   - action: Exact duty to be completed
   - deadline: The exact timeframe or condition (e.g. "Net 30 days of receipt", "Within 10 days of notice")
   - status: "Pending"

5. Overall Risk Score: Integer from 0 (Safe) to 100 (Extremely Dangerous/Predatory).

Respond ONLY with valid JSON matching the exact schema requested."""

CLAUDE_CHAT_SYSTEM_PROMPT = """You are ContractAI Assistant. You answer questions from users about their contract.
Crucial rules:
1. Always cite the exact Section Number and Clause Type relevant to the answer.
2. Provide a clear, direct answer in plain English for non-lawyers.
3. Quote the specific sentence or phrase from the contract that supports your answer.
4. Add a quick practical recommendation if the clause poses a risk.
5. If the contract does not mention the topic, clearly state that it is not covered.
Include a JSON block at the end of your response with cited clauses:
```json
[
  {
    "clause_type": "Termination",
    "section_reference": "Section 4",
    "quote": "Either party may terminate upon 30 days written notice...",
    "explanation": "Allows termination for convenience with 30 days notice."
  }
]
```"""

# =====================================================================
# RULE-BASED ENGINE (OFFLINE & VIVA DEMO FALLBACK)
# =====================================================================

CLAUSE_PATTERNS = {
    "Payment": [
        r'\b(?:fee|fees|payment|invoice|invoicing|compensation|pricing|billing|rate|remittance|taxes|net\s+\d+|payable)\b',
        r'payment\s+terms',
        r'due\s+and\s+payable',
        r'late\s+charge|interest\s+rate|delinquent'
    ],
    "Term & Renewal": [
        r'\b(?:term|effective\s+date|duration|initial\s+term|renewal|renew|auto-renew|automatically\s+extend|commencement)\b',
        r'this\s+agreement\s+shall\s+commence',
        r'successive\s+periods|subsequent\s+terms'
    ],
    "Termination": [
        r'\b(?:terminate|termination|cancel|cancellation|cure\s+period|default|breach|material\s+breach|convenience|survive)\b',
        r'right\s+to\s+terminate',
        r'immediate\s+effect',
        r'upon\s+written\s+notice'
    ],
    "Confidentiality": [
        r'\b(?:confidential|confidentiality|proprietary\s+information|trade\s+secret|non-disclosure|nda|recipient|disclosing\s+party)\b',
        r'duty\s+to\s+protect',
        r'standard\s+of\s+care'
    ],
    "Liability": [
        r'\b(?:liability|limitation\s+of\s+liability|aggregate\s+liability|damages|consequential|indirect|punitive|lost\s+profits|cap\s+on\s+liability)\b',
        r'in\s+no\s+event\s+shall',
        r'maximum\s+cumulative\s+liability'
    ],
    "Indemnification": [
        r'\b(?:indemnify|indemnity|indemnification|hold\s+harmless|defend|claims|losses|damages\s+incurred)\b',
        r'shall\s+defend,\s+indemnify\s+and\s+hold\s+harmless'
    ],
    "Non-Compete": [
        r'\b(?:non-compete|non-competition|solicit|non-solicitation|restrictive\s+covenant|competitive\s+business|hire\s+away)\b',
        r'shall\s+not\s+directly\s+or\s+indirectly\s+compete'
    ],
    "IP": [
        r'\b(?:intellectual\s+property|copyright|patent|trademark|ownership|work\s+for\s+hire|license|proprietary\s+rights|inventions)\b',
        r'all\s+rights,\s+title\s+and\s+interest'
    ],
    "Governing Law": [
        r'\b(?:governing\s+law|jurisdiction|venue|laws\s+of|courts\s+of|construed\s+in\s+accordance\s+with)\b',
        r'subject\s+to\s+the\s+exclusive\s+jurisdiction'
    ],
    "Dispute Resolution": [
        r'\b(?:arbitration|dispute|mediation|litigation|jams|american\s+arbitration\s+association|neutral\s+arbitrator)\b',
        r'any\s+dispute,\s+controversy\s+or\s+claim'
    ],
    "Warranty": [
        r'\b(?:warranty|warranties|as-is|disclaimer\s+of\s+warranties|merchantability|fitness\s+for\s+a\s+particular\s+purpose|remedy)\b',
        r'express\s+or\s+implied'
    ],
    "Force Majeure": [
        r'\b(?:force\s+majeure|act\s+of\s+god|war|terrorism|pandemic|natural\s+disaster|unforeseeable|beyond\s+reasonable\s+control)\b',
        r'neither\s+party\s+shall\s+be\s+liable\s+for\s+delays'
    ]
}

def generate_plain_english_summary(clause_type: str, text: str) -> str:
    """Generates an intuitive, non-lawyer translation for any clause."""
    lower = text.lower()
    
    if clause_type == "Payment":
        if "net 30" in lower:
            return "Specifies payment must be settled within 30 days of receiving the invoice."
        elif "net 60" in lower or "net 90" in lower:
            return "Extended payment window; client can delay payment up to 60-90 days."
        elif "interest" in lower or "late" in lower:
            return "Outlines billing cycles and imposes penalties or interest on overdue payments."
        return "Defines how and when payments, invoices, and applicable taxes must be processed."
        
    elif clause_type == "Term & Renewal":
        if "automatically renew" in lower or "automatic renewal" in lower or "evergreen" in lower:
            return "Contains an automatic renewal trigger: contract continues rolling over unless explicitly cancelled within the deadline."
        return "Establishes how long this contract lasts and how renewals or extensions occur."
        
    elif clause_type == "Termination":
        if "convenience" in lower:
            return "Allows early cancellation without having to prove any fault or breach, provided notice is given."
        elif "breach" in lower or "cure" in lower:
            return "Allows cancellation if one party breaks a promise and fails to fix it within the cure window."
        return "Details when and how either party can cancel the agreement."
        
    elif clause_type == "Confidentiality":
        if "in perpetuity" in lower or "perpetual" in lower:
            return "Imposes a perpetual secrecy duty: proprietary information must NEVER be disclosed, even decades after termination."
        return "Requires both parties to keep private business information, trade secrets, and pricing strictly confidential."
        
    elif clause_type == "Liability":
        if "unlimited" in lower or "without limitation" in lower or "no cap" in lower:
            return "CRITICAL: Leaves liability uncapped! A single error could expose the business to catastrophic financial damage."
        elif "cap" in lower or "fees paid" in lower:
            return "Caps the maximum monetary compensation one party can claim, usually limited to recent fees paid."
        return "Defines financial boundaries and limits what damages can be collected in legal claims."
        
    elif clause_type == "Indemnification":
        if "any and all claims" in lower or "defend" in lower:
            return "Requires one party to hire lawyers and pay legal settlements if a third party sues over contract work."
        return "Allocates legal defense costs and financial liabilities if a third-party lawsuit arises."
        
    elif clause_type == "Non-Compete":
        return "Restricts the ability to offer similar services, solicit clients, or hire employees from the other party."
        
    elif clause_type == "IP":
        if "work for hire" in lower or "assigns all" in lower:
            return "Transfers full ownership of all newly created work, code, or materials entirely to the client."
        return "States who owns pre-existing materials, patents, trademarks, and newly created deliverables."
        
    elif clause_type == "Governing Law":
        return "Specifies which state/country's legal system governs the contract and where disputes must be heard."
        
    elif clause_type == "Dispute Resolution":
        if "arbitration" in lower:
            return "Waives the right to a public court jury trial; disputes must go to private, binding arbitration."
        return "Sets the roadmap for settling disagreements (e.g. executive talks, mediation, or arbitration)."
        
    elif clause_type == "Warranty":
        if "as is" in lower or "disclaims all warranties" in lower:
            return "Services or software are provided 'as is' with zero guarantees of performance or fitness for purpose."
        return "Defines quality promises and promises of standard workmanship."
        
    elif clause_type == "Force Majeure":
        return "Protects parties from breach if extraordinary, uncontrollable disasters (war, flood, pandemic) prevent performance."
        
    return "Outlines standard legal terms and operational obligations between the parties."

def detect_risks_in_text(text: str, section_name: str) -> List[Dict[str, Any]]:
    """Analyzes text for predatory, risky, or one-sided contract clauses."""
    risks = []
    lower = text.lower()
    
    # 1. Unlimited Liability Risk (HIGH)
    if re.search(r'\b(?:without\s+limitation|unlimited\s+liability|no\s+limitation\s+of\s+liability|shall\s+not\s+apply\s+to\s+liability)\b', lower) or \
       (re.search(r'\bliable\s+for\s+any\s+and\s+all\b', lower) and not re.search(r'\bshall\s+not\s+exceed\b', lower)):
        risks.append({
            "risk_type": "Unlimited Liability",
            "severity": "High",
            "explanation": "The contract does not establish a monetary ceiling on potential damages. In the event of a dispute, your business could be held liable for damages that exceed the total value of the contract.",
            "safer_rewrite": "Except for gross negligence or willful misconduct, each party's maximum aggregate liability arising under this Agreement shall be limited to the total fees actually paid or payable by Client in the preceding twelve (12) months.",
            "clause_reference": text[:200] + ("..." if len(text) > 200 else ""),
            "section_reference": section_name
        })

    # 2. Trap Auto-Renewal (HIGH / MEDIUM)
    if re.search(r'\b(?:automatically\s+renew|automatic\s+renewal|evergreen)\b', lower):
        is_hard_cancel = bool(re.search(r'\b(?:60|90|120)\s+days\b', lower))
        risks.append({
            "risk_type": "Auto-Renewal Trap",
            "severity": "High" if is_hard_cancel else "Medium",
            "explanation": f"The agreement automatically renews into a new billing commitment unless cancelled well in advance ({'requires 60-90+ days advance notice!' if is_hard_cancel else 'requires advance written notice'}). If you miss this narrow calendar window, you remain locked in.",
            "safer_rewrite": "This Agreement shall only renew upon mutual written agreement signed by both parties at least thirty (30) days prior to the expiration of the current Term.",
            "clause_reference": text[:200] + ("..." if len(text) > 200 else ""),
            "section_reference": section_name
        })

    # 3. One-Sided Termination (HIGH)
    if re.search(r'\b(?:sole\s+discretion|at\s+convenience\s+without\s+cause)\b', lower) and \
       ("company may terminate" in lower or "vendor may terminate" in lower or "client may terminate" in lower):
        if not ("either party may terminate" in lower or "mutual" in lower):
            risks.append({
                "risk_type": "One-Sided Termination",
                "severity": "High",
                "explanation": "Only one party has the right to terminate the contract for convenience, while the other party is locked in with no exit rights unless they prove a costly material breach.",
                "safer_rewrite": "Either party may terminate this Agreement for convenience at any time upon thirty (30) days prior written notice to the other party.",
                "clause_reference": text[:200] + ("..." if len(text) > 200 else ""),
                "section_reference": section_name
            })

    # 4. Broad Indemnity (HIGH / MEDIUM)
    if re.search(r'\b(?:defend,\s+indemnify\s+and\s+hold\s+harmless|indemnify\s+and\s+hold\s+harmless)\b', lower):
        if "any and all" in lower or "regardless of" in lower or "negligence" in lower:
            risks.append({
                "risk_type": "Overly Broad Indemnification",
                "severity": "High",
                "explanation": "This indemnification clause requires you to defend and pay for third-party claims without excluding claims caused by the other party's own negligence, faults, or omissions.",
                "safer_rewrite": "Party A shall indemnify Party B against third-party claims solely to the extent directly caused by Party A's material breach of this Agreement, excluding any claims arising from Party B's own negligence or misconduct.",
                "clause_reference": text[:200] + ("..." if len(text) > 200 else ""),
                "section_reference": section_name
            })

    # 5. Heavy Penalties or Liquidated Damages (MEDIUM)
    if re.search(r'\b(?:liquidated\s+damages|penalty|forfeiture|forfeit|penalty\s+fee)\b', lower):
        risks.append({
            "risk_type": "Heavy Penalty & Liquidated Damages",
            "severity": "Medium",
            "explanation": "Imposes predetermined financial penalties or non-refundable deposit forfeitures upon termination or minor delays, which may be disproportionate to actual damages suffered.",
            "safer_rewrite": "In the event of a verified breach, damages shall be limited to direct, provable out-of-pocket costs reasonably incurred, with no speculative or punitive penalties.",
            "clause_reference": text[:200] + ("..." if len(text) > 200 else ""),
            "section_reference": section_name
        })

    # 6. Perpetual Obligations (MEDIUM / LOW)
    if re.search(r'\b(?:in\s+perpetuity|perpetual|survive\s+indefinitely|for\s+all\s+time)\b', lower):
        risks.append({
            "risk_type": "Perpetual Obligations",
            "severity": "Medium",
            "explanation": "Certain obligations (such as non-disclosure or non-compete restrictions) are stated to survive forever with no expiration date, creating an ongoing legal risk.",
            "safer_rewrite": "The obligations of confidentiality under this Section shall survive termination of this Agreement for a period of three (3) years.",
            "clause_reference": text[:200] + ("..." if len(text) > 200 else ""),
            "section_reference": section_name
        })

    # 7. Unilateral Modification (MEDIUM)
    if re.search(r'\b(?:modify\s+these\s+terms\s+at\s+any\s+time|unilateral|at\s+our\s+sole\s+discretion)\b', lower):
        risks.append({
            "risk_type": "Unilateral Contract Changes",
            "severity": "Medium",
            "explanation": "Allows one party to change prices, terms, or service scopes without requiring explicit written agreement from the other party.",
            "safer_rewrite": "No amendment or modification of this Agreement shall be valid unless in writing and signed by authorized representatives of both parties.",
            "clause_reference": text[:200] + ("..." if len(text) > 200 else ""),
            "section_reference": section_name
        })

    return risks

def extract_obligations_from_text(text: str, section_name: str) -> List[Dict[str, Any]]:
    """Identifies concrete obligations, responsible parties, and deadlines."""
    obligations = []
    sentences = re.split(r'(?<=[.!?])\s+', text)
    
    obligation_keywords = [
        r'\b(?:shall|must|is\s+required\s+to|agrees\s+to|will|obligated\s+to|responsible\s+for)\b'
    ]
    deadline_patterns = [
        (r'\bwithin\s+(\d+)\s+(?:business\s+)?days\b', "Within {} days"),
        (r'\bwithin\s+(\d+)\s+hours\b', "Within {} hours"),
        (r'\bnet\s+(\d+)\b', "Net {} days"),
        (r'\bat\s+least\s+(\d+)\s+days\s+prior\b', "{} days in advance"),
        (r'\bmonthly\b', "Monthly"),
        (r'\bannually\b', "Annually"),
        (r'\bupon\s+(?:written\s+)?notice\b', "Upon written notice"),
        (r'\bupon\s+execution\b', "Upon signing"),
        (r'\bupon\s+termination\b', "Upon termination")
    ]
    
    for s in sentences:
        s_clean = s.strip()
        if len(s_clean) < 25 or len(s_clean) > 350:
            continue
            
        is_obligation = any(re.search(kw, s_clean, re.IGNORECASE) for kw in obligation_keywords)
        if not is_obligation:
            continue
            
        # Determine responsible party
        party = "Contract Party"
        s_lower = s_clean.lower()
        if "client shall" in s_lower or "client must" in s_lower or "customer shall" in s_lower or "customer agrees" in s_lower:
            party = "Client"
        elif "service provider shall" in s_lower or "vendor shall" in s_lower or "company shall" in s_lower or "contractor shall" in s_lower:
            party = "Service Provider"
        elif "receiving party" in s_lower:
            party = "Receiving Party"
        elif "both parties" in s_lower or "each party" in s_lower:
            party = "Both Parties"
        elif "party a" in s_lower:
            party = "Party A"
        elif "party b" in s_lower:
            party = "Party B"
            
        # Extract deadline
        deadline = "Ongoing / As specified"
        for d_regex, d_fmt in deadline_patterns:
            m = re.search(d_regex, s_lower)
            if m:
                if "{}" in d_fmt:
                    deadline = d_fmt.format(m.group(1))
                else:
                    deadline = d_fmt
                break
                
        # Clean up action text
        action_text = s_clean
        # Trim introductory words
        action_text = re.sub(r'^(?:furthermore,|in\s+addition,|provided\s+that,|notwithstanding\s+the\s+foregoing,)\s*', '', action_text, flags=re.IGNORECASE)
        
        # Calculate simulated due date for timeline/calendar display
        now = datetime.now()
        days_offset = 30
        if "10 days" in deadline or "15 days" in deadline:
            days_offset = 15
        elif "within 48 hours" in deadline:
            days_offset = 2
        elif "60 days" in deadline:
            days_offset = 60
        elif "annually" in deadline:
            days_offset = 365
        simulated_due_date = (now + timedelta(days=days_offset)).strftime("%Y-%m-%d")

        obligations.append({
            "party": party,
            "action": action_text,
            "deadline": deadline,
            "status": "Pending",
            "due_date": simulated_due_date
        })
        
    return obligations[:10]  # Cap per section to avoid clutter

def calculate_overall_risk_score(risks: List[Dict[str, Any]]) -> Tuple[int, str]:
    """Calculates overall risk score (0-100) and severity category."""
    if not risks:
        return 12, "Low"
        
    score = 15  # baseline
    for r in risks:
        sev = r.get("severity", "Medium")
        if sev == "High":
            score += 24
        elif sev == "Medium":
            score += 12
        else:
            score += 6
            
    score = min(score, 98)
    
    if score >= 70:
        level = "High"
    elif score >= 35:
        level = "Medium"
    else:
        level = "Low"
        
    return score, level

# =====================================================================
# HYBRID PIPELINE DISPATCHER
# =====================================================================

def analyze_contract_text(text: str, sections: List[Dict[str, str]], api_key: Optional[str] = None) -> Dict[str, Any]:
    """
    Main Agent Pipeline:
    1. READ: Receives parsed sections & text
    2. EXTRACT: Classifies 12 clause categories
    3. DETECT: Flags risk triggers with High/Med/Low severity & rewrites
    4. TRACK: Extracts actionable obligations & deadlines
    """
    # If API key provided, try Claude
    if api_key and api_key.strip() and not api_key.startswith("mock"):
        try:
            return analyze_with_claude(text, sections, api_key)
        except Exception as e:
            logger.warning(f"Claude API failed or rate limited: {e}. Falling back to Rule-Based Engine.")

    # Rule-Based Heuristic Analysis (Guaranteed 100% offline & reproducible for viva)
    all_clauses = []
    all_risks = []
    all_obligations = []
    
    for sec in sections:
        sec_num = sec.get("section_number", "Section")
        sec_title = sec.get("section_title", "")
        sec_content = sec.get("content", "")
        sec_label = f"{sec_num}: {sec_title}" if sec_title else sec_num
        
        # 1. Match Clauses
        for clause_type, patterns in CLAUSE_PATTERNS.items():
            matched = False
            for pat in patterns:
                if re.search(pat, sec_content, re.IGNORECASE) or re.search(pat, sec_title, re.IGNORECASE):
                    matched = True
                    break
            if matched:
                summary = generate_plain_english_summary(clause_type, sec_content)
                all_clauses.append({
                    "clause_type": clause_type,
                    "original_text": sec_content[:450] + ("..." if len(sec_content) > 450 else ""),
                    "plain_summary": summary,
                    "section_reference": sec_label,
                    "confidence": 0.94
                })
                
        # 2. Detect Risks
        sec_risks = detect_risks_in_text(sec_content, sec_label)
        all_risks.extend(sec_risks)
        
        # 3. Track Obligations
        sec_obs = extract_obligations_from_text(sec_content, sec_label)
        all_obligations.extend(sec_obs)
        
    # Deduplicate clauses by type & section
    seen_clauses = set()
    unique_clauses = []
    for c in all_clauses:
        key = (c["clause_type"], c["section_reference"])
        if key not in seen_clauses:
            seen_clauses.add(key)
            unique_clauses.append(c)
            
    risk_score, risk_level = calculate_overall_risk_score(all_risks)
    
    # Generate executive summary
    title_hint = sections[0].get("section_title", "Commercial Agreement") if sections else "Contract"
    summary = f"This contract encompasses {len(unique_clauses)} extracted clauses across {len(sections)} sections. ContractAI detected {len(all_risks)} potential risk provisions (Risk Score: {risk_score}/100 - {risk_level} Risk) and identified {len(all_obligations)} concrete operational deadlines."

    return {
        "summary": summary,
        "risk_score": risk_score,
        "risk_level": risk_level,
        "clauses": unique_clauses,
        "risks": all_risks,
        "obligations": all_obligations
    }

def analyze_with_claude(text: str, sections: List[Dict[str, str]], api_key: str) -> Dict[str, Any]:
    """Calls Anthropic Claude API with structured JSON output."""
    import anthropic
    
    client = anthropic.Anthropic(api_key=api_key)
    
    user_prompt = f"""Please analyze this contract text thoroughly.
Extract all relevant clauses from the 12 specified categories, pinpoint all risks with safer rewrites, extract all obligations with deadlines, and calculate an overall risk score.

CONTRACT TEXT (First 15,000 characters):
{text[:15000]}
"""

    response = client.messages.create(
        model="claude-3-5-sonnet-20241022",
        max_tokens=4000,
        system=CLAUDE_ANALYSIS_SYSTEM_PROMPT,
        messages=[{"role": "user", "content": user_prompt}]
    )
    
    response_text = response.content[0].text
    # Parse json block
    json_match = re.search(r'\{[\s\S]*\}', response_text)
    if json_match:
        return json.loads(json_match.group(0))
    else:
        return json.loads(response_text)

# =====================================================================
# CHAT ENGINE WITH CLAUSE CITATION
# =====================================================================

def chat_with_contract(contract_text: str, sections: List[Dict], clauses: List[Dict], user_message: str, api_key: Optional[str] = None) -> Dict[str, Any]:
    """
    Answers questions about a contract and cites specific clause numbers.
    Works with Claude or the built-in intelligent search & citation engine.
    """
    # If Claude key present, try Claude
    if api_key and api_key.strip() and not api_key.startswith("mock"):
        try:
            return chat_with_claude(contract_text, sections, clauses, user_message, api_key)
        except Exception as e:
            logger.warning(f"Claude chat failed: {e}. Falling back to Rule-Based QA.")

    # Rule-Based QA & Citation Search
    q = user_message.lower()
    
    # Keyword routing to find relevant clauses
    target_clause_types = []
    if any(w in q for w in ["cancel", "termination", "terminate", "end the contract", "exit", "quit"]):
        target_clause_types.append("Termination")
    if any(w in q for w in ["pay", "payment", "price", "fee", "invoice", "late fee", "cost", "billing"]):
        target_clause_types.append("Payment")
    if any(w in q for w in ["renew", "auto-renewal", "duration", "length", "how long", "term"]):
        target_clause_types.append("Term & Renewal")
    if any(w in q for w in ["secret", "confidential", "nda", "disclosure", "leak"]):
        target_clause_types.append("Confidentiality")
    if any(w in q for w in ["liable", "liability", "sue", "damages", "responsible if"]):
        target_clause_types.append("Liability")
    if any(w in q for w in ["indemn", "hold harmless", "lawsuit", "legal fees"]):
        target_clause_types.append("Indemnification")
    if any(w in q for w in ["compete", "solicit", "poach", "client work"]):
        target_clause_types.append("Non-Compete")
    if any(w in q for w in ["ip", "intellectual property", "ownership", "copyright", "code", "work for hire"]):
        target_clause_types.append("IP")
    if any(w in q for w in ["law", "state", "court", "jurisdiction", "country"]):
        target_clause_types.append("Governing Law")
    if any(w in q for w in ["dispute", "arbitration", "mediate", "settle"]):
        target_clause_types.append("Dispute Resolution")
    if any(w in q for w in ["warranty", "guarantee", "as is", "defects"]):
        target_clause_types.append("Warranty")

    # Match clauses
    matching_clauses = [c for c in clauses if c.get("clause_type") in target_clause_types]
    if not matching_clauses and clauses:
        # Fallback keyword match across original text
        words = [w for w in re.findall(r'\w+', q) if len(w) > 3]
        for c in clauses:
            score = sum(1 for w in words if w in c.get("original_text", "").lower())
            if score > 0:
                matching_clauses.append(c)

    cited_clauses = []
    answer_parts = []
    
    if matching_clauses:
        for mc in matching_clauses[:2]:
            c_type = mc.get("clause_type", "General")
            c_ref = mc.get("section_reference", "General Section")
            c_text = mc.get("original_text", "")
            c_summary = mc.get("plain_summary", "")
            
            cited_clauses.append({
                "clause_type": c_type,
                "section_reference": c_ref,
                "quote": c_text[:180] + ("..." if len(c_text) > 180 else ""),
                "explanation": c_summary
            })
            
            answer_parts.append(
                f"**Based on {c_ref} ({c_type} Clause):**\n"
                f"{c_summary}\n\n"
                f"> *\"{c_text[:220]}...\"*"
            )
            
        final_answer = "\n\n".join(answer_parts) + "\n\n*Tip: Check the 'Risk Radar' tab to see if our agent flagged any risky terms for this clause.*"
    else:
        # Generic response with search across sections
        final_answer = f"I scanned the contract for **'{user_message}'**, but did not find an explicit clause directly addressing this topic. Please check the 'Full Contract Text' tab or review the complete sections."
        
    return {
        "content": final_answer,
        "cited_clauses": cited_clauses
    }

def chat_with_claude(contract_text: str, sections: List[Dict], clauses: List[Dict], user_message: str, api_key: str) -> Dict[str, Any]:
    """Uses Claude to answer contract queries with exact citations."""
    import anthropic
    
    client = anthropic.Anthropic(api_key=api_key)
    
    context_clauses = json.dumps([{
        "type": c.get("clause_type"),
        "section": c.get("section_reference"),
        "text": c.get("original_text")[:300]
    } for c in clauses[:15]], indent=2)
    
    prompt = f"""Here are key clauses from the contract:
{context_clauses}

User question: "{user_message}"

Answer the user clearly and provide citations."""

    response = client.messages.create(
        model="claude-3-5-sonnet-20241022",
        max_tokens=1500,
        system=CLAUDE_CHAT_SYSTEM_PROMPT,
        messages=[{"role": "user", "content": prompt}]
    )
    
    raw_content = response.content[0].text
    cited_clauses = []
    
    # Extract json block if present
    match = re.search(r'```json\s*(\[[\s\S]*?\])\s*```', raw_content)
    if match:
        try:
            cited_clauses = json.loads(match.group(1))
            cleaned_content = raw_content[:match.start()].strip()
        except Exception:
            cleaned_content = raw_content
    else:
        cleaned_content = raw_content
        
    return {
        "content": cleaned_content,
        "cited_clauses": cited_clauses
    }
