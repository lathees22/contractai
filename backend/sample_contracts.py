import os
from docx import Document
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib.units import inch

SAMPLE_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "sample_data")
os.makedirs(SAMPLE_DIR, exist_ok=True)

SAMPLE_MSA_TEXT = """MASTER SERVICES AGREEMENT

This Master Services Agreement ("Agreement") is entered into as of January 15, 2026 ("Effective Date"), by and between Apex Global Solutions LLC, with its principal office at 500 Enterprise Way, Suite 400, Austin, Texas ("Service Provider"), and Nova Retail Enterprises Inc. ("Client").

SECTION 1. SCOPE OF SERVICES
Service Provider agrees to provide cloud software infrastructure architecture, data engineering, and technical advisory services as described in Statement of Work #1 attached hereto. Service Provider shall perform all services with reasonable skill and diligence in accordance with prevailing industry customs.

SECTION 2. PAYMENT AND INVOICING
2.1 Fees. Client shall pay Service Provider the monthly recurring fee of $12,500.00 USD for infrastructure monitoring and 40 engineering hours per month.
2.2 Payment Schedule. Invoices shall be rendered on the first day of each calendar month. Client must remit full payment within fifteen (15) business days (Net 15) of receipt of invoice.
2.3 Delinquency Penalties. Overdue amounts shall accrue interest at the punitive rate of 2.5% per month or the maximum rate permissible by law, whichever is higher, plus a mandatory $500 administrative penalty fee per delinquent billing cycle.

SECTION 3. TERM AND AUTOMATIC RENEWAL
3.1 Initial Term. This Agreement shall commence on the Effective Date and continue for an initial term of twelve (12) months.
3.2 Evergreen Auto-Renewal. UPON EXPIRATION OF THE INITIAL TERM, THIS AGREEMENT SHALL AUTOMATICALLY RENEW FOR SUCCESSIVE TWELVE (12) MONTH PERIODS UNDER IDENTICAL COMMERCIAL TERMS, UNLESS EITHER PARTY DELIVERS WRITTEN NOTICE OF NON-RENEWAL TO THE OTHER PARTY AT LEAST NINETY (90) DAYS PRIOR TO THE EXPIRATION OF THE THEN-CURRENT TERM.

SECTION 4. TERMINATION FOR CONVENIENCE AND DEFAULT
4.1 Unilateral Termination for Convenience. Service Provider may terminate this Agreement at any time, with or without cause, for its sole convenience upon delivering fourteen (14) days prior written notice to Client.
4.2 Client Termination Rights. Client may only terminate this Agreement upon ninety (90) days prior written notice, and solely upon demonstrating a material uncured default by Service Provider that remains unremedied after a sixty (60) day formal cure period.

SECTION 5. CONFIDENTIALITY AND PROPRIETARY INFORMATION
Each party agrees to hold all Confidential Information of the disclosing party in strict confidence using the same degree of care it uses for its own sensitive data, but not less than reasonable care. Receiving Party shall not disclose proprietary technical drawings, customer lists, or financial data to any third party. The obligations under this Section shall survive termination of this Agreement in perpetuity.

SECTION 6. INTELLECTUAL PROPERTY RIGHTS
Client shall own all rights, title, and interest in customized client-facing deliverables specifically created under this Agreement. Service Provider retains exclusive ownership of all pre-existing tools, algorithms, underlying scripts, libraries, and proprietary platforms used to deliver the services.

SECTION 7. UNLIMITED LIABILITY AND DISCLAIMER
7.1 UNLIMITED CLIENT LIABILITY. NOTWITHSTANDING ANYTHING TO THE CONTRARY CONTAINED IN THIS AGREEMENT OR ANY STATEMENT OF WORK, CLIENT'S LIABILITY FOR ANY CLAIMS, LOSSES, OR DAMAGES ARISING OUT OF OR RELATING TO THIS AGREEMENT SHALL BE WITHOUT LIMITATION AND NO CAP ON LIABILITY SHALL APPLY TO CLIENT.
7.2 PROVIDER CAP. SERVICE PROVIDER'S TOTAL AGGREGATE LIABILITY ARISING UNDER THIS AGREEMENT SHALL NOT EXCEED THE TOTAL FEES ACTUALLY RECEIVED BY SERVICE PROVIDER IN THE ONE (1) MONTH IMMEDIATELY PRECEDING THE CLAIM.

SECTION 8. OVERLY BROAD INDEMNIFICATION
Client shall defend, indemnify, and hold harmless Service Provider, its affiliates, directors, officers, and employees against any and all third-party claims, lawsuits, liabilities, losses, costs, and attorney's fees arising out of or related to this Agreement or the use of deliverables, regardless of whether caused by Service Provider's own negligence, errors, or omissions.

SECTION 9. NON-SOLICITATION AND NON-COMPETE
During the Term of this Agreement and for a period of thirty-six (36) months following termination, Client shall not directly or indirectly solicit, recruit, or hire any engineer, contractor, or executive employed by Service Provider without prior written consent and payment of a $100,000 release penalty fee.

SECTION 10. GOVERNING LAW AND DISPUTE RESOLUTION
This Agreement shall be construed and governed in accordance with the laws of the State of Delaware, without giving effect to conflicts of laws principles. Any dispute or claim arising out of this Agreement shall be resolved through final, binding arbitration administered by the American Arbitration Association (AAA) in Dover, Delaware.

SECTION 11. FORCE MAJEURE
Neither party shall be liable for delays or non-performance caused by acts of God, strikes, armed conflicts, utility blackouts, or government decrees beyond reasonable control, provided written notice is provided within five (5) business days.
"""

SAMPLE_NDA_TEXT = """MUTUAL NON-DISCLOSURE AGREEMENT

This Mutual Non-Disclosure Agreement ("NDA") is made effective this 1st day of February 2026, by and between Horizon Vanguard Labs Inc. ("Disclosing Party") and Alpha Venture Partners ("Receiving Party").

1. DEFINITION OF CONFIDENTIAL INFORMATION
"Confidential Information" encompasses any and all technical, business, marketing, financial, and strategic data disclosed verbally, visually, or in writing, including pitch decks, source code, roadmap documents, and investor materials.

2. OBLIGATIONS OF RECEIVING PARTY
Receiving Party agrees to safeguard all disclosed materials with the highest standard of care. Receiving Party shall not disclose, reproduce, or reverse-engineer any confidential documents without prior written authorization.

3. DURATION AND PERPETUAL OBLIGATIONS
The receiving party's duty to maintain secrecy shall not be subject to any sunset clause and shall continue in perpetuity until such time as the information becomes part of the public domain through no fault of Receiving Party.

4. REMEDIES AND LIQUIDATED DAMAGES
In the event of an unauthorized disclosure or leak of confidential information, the breaching party agrees to pay liquidated damages in the predetermined sum of $250,000 per occurrence as a reasonable estimate of minimum harm, in addition to injunctive relief.

5. GOVERNING LAW
This agreement is governed by the laws of the State of California, County of San Francisco.
"""

SAMPLE_SAAS_TEXT = """ENTERPRISE SAAS SUBSCRIPTION & SLA AGREEMENT

Between: CloudMatrix Systems Corp ("Vendor") and Subscriber ("Customer").

ARTICLE 1. SUBSCRIPTION GRANT
Vendor grants Customer a non-exclusive, non-transferable subscription license to access the CloudMatrix Platform.

ARTICLE 2. PAYMENT TERMS & AUTO-BILLING
Customer will be charged $4,999.00 quarterly in advance. If payments are delayed by more than ten (10) days, Vendor reserves the right to immediately suspend access and impose a $250 reinstatement fee.

ARTICLE 3. UNILATERAL MODIFICATIONS
Vendor reserves the right to amend, update, or alter service levels, acceptable use policies, and subscription pricing at its sole discretion upon posting updates to its web portal.

ARTICLE 4. INDEMNIFICATION AND WARRANTY DISCLAIMER
The Software is provided "AS IS" and Vendor disclaims all express or implied warranties of merchantability or fitness for a particular purpose. Customer agrees to indemnify Vendor against all claims resulting from Customer's uploaded data.
"""

def generate_sample_docx(filepath: str, title: str, text: str):
    """Creates a formatted Word Document for user testing."""
    doc = Document()
    doc.add_heading(title, level=0)
    for p in text.split("\n\n"):
        p_clean = p.strip()
        if p_clean.startswith("SECTION") or p_clean.startswith("ARTICLE") or (len(p_clean) < 40 and p_clean.isupper()):
            doc.add_heading(p_clean, level=2)
        else:
            doc.add_paragraph(p_clean)
    doc.save(filepath)

def generate_sample_pdf(filepath: str, title: str, text: str):
    """Creates a formatted PDF document using ReportLab."""
    c = canvas.Canvas(filepath, pagesize=letter)
    width, height = letter
    y = height - 50
    
    c.setFont("Helvetica-Bold", 16)
    c.drawString(50, y, title)
    y -= 30
    
    c.setFont("Helvetica", 9)
    for line in text.split("\n"):
        if y < 50:
            c.showPage()
            c.setFont("Helvetica", 9)
            y = height - 50
            
        line_clean = line.strip()
        if not line_clean:
            y -= 8
            continue
            
        if line_clean.startswith("SECTION") or line_clean.startswith("ARTICLE"):
            c.setFont("Helvetica-Bold", 11)
            y -= 6
            c.drawString(50, y, line_clean)
            c.setFont("Helvetica", 9)
            y -= 14
        else:
            # Wrap lines if long
            while len(line_clean) > 95:
                sub = line_clean[:95]
                c.drawString(50, y, sub)
                line_clean = line_clean[95:]
                y -= 12
                if y < 50:
                    c.showPage()
                    c.setFont("Helvetica", 9)
                    y = height - 50
            c.drawString(50, y, line_clean)
            y -= 12
            
    c.save()

def initialize_sample_files():
    """Generates sample files in DOCX, PDF, and text formats for testing."""
    msa_docx = os.path.join(SAMPLE_DIR, "sample_msa_contract.docx")
    msa_pdf = os.path.join(SAMPLE_DIR, "sample_msa_contract.pdf")
    nda_pdf = os.path.join(SAMPLE_DIR, "sample_nda_contract.pdf")
    saas_docx = os.path.join(SAMPLE_DIR, "sample_saas_agreement.docx")
    
    if not os.path.exists(msa_docx):
        generate_sample_docx(msa_docx, "Master Services Agreement (MSA)", SAMPLE_MSA_TEXT)
    if not os.path.exists(msa_pdf):
        generate_sample_pdf(msa_pdf, "Master Services Agreement", SAMPLE_MSA_TEXT)
    if not os.path.exists(nda_pdf):
        generate_sample_pdf(nda_pdf, "Mutual Non-Disclosure Agreement", SAMPLE_NDA_TEXT)
    if not os.path.exists(saas_docx):
        generate_sample_docx(saas_docx, "Enterprise SaaS Subscription Agreement", SAMPLE_SAAS_TEXT)
