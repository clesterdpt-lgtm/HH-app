# CareNote — Legal, Clinical, and Product Guardrails

## Goal

Reduce legal/compliance risk and clinician mistrust **without** making the app feel stiff, defensive, or unusable.

The principle should be:

> CareNote assists with documentation and workflow. The clinician remains responsible for clinical judgment, accuracy, and final sign-off.

---

## 1. Core Guardrail Positioning

CareNote should **never** present itself as:
- diagnosing
- making autonomous clinical decisions
- replacing the clinician's judgment
- guaranteeing reimbursement-safe documentation
- guaranteeing regulatory compliance

CareNote **should** present itself as:
- a documentation and workflow assistant
- a drafting / structuring / organization tool
- a clinical admin support tool
- something that helps clinicians document more efficiently and consistently

---

## 2. In-App Product Guardrails

## A. Review-Required Label on Generated Output

Every generated note, summary, goal set, medication parse, or AI-rewritten content should include a visible cue such as:

**AI-generated draft — clinician review required before use.**

This should appear:
- above generated notes
- above HEP-generated documentation blocks
- above care plan goals
- above medication parsing results
- above any rewrite / assist output

This is the single highest-value UX guardrail.

---

## B. Explicit Finalization Step

Instead of implying that generated output is ready immediately, use a workflow like:
- Draft generated
- Review required
- Edit / approve
- Export / copy

Suggested UI language:
- **Generate Draft** instead of **Generate Final Note**
- **Review & Finalize** instead of just **Copy**
- **Clinician Approved** toggle/check before final export (optional but strong)

---

## C. Missing Information / Low Confidence Warnings

If the source note is sparse, ambiguous, or contradictory, the app should say so clearly.

Examples:
- **Missing important visit details**
- **This draft may need clarification before use**
- **The source note did not clearly support assessment/plan details**
- **Medication details may require manual verification**

This matters more than pretending the output is always polished.

---

## D. No Silent Hallucination Tone

The app should avoid sounding overly certain when data is weak.

The AI should prefer:
- asking for clarification
- flagging uncertainty
- using placeholders or explicit gaps

Instead of inventing:
- exact functional status changes
- medication specifics not actually stated
- patient education details not documented
- unsupported response-to-treatment claims

---

## E. Sensitive Content Flags

Flag content that may need special attention, such as:
- PHI accidentally entered into places where it should be stripped
- contradictory medication information
- unsupported fall history statements
- wound data that sounds incomplete
- risk statements with unclear support

Do not block the user unnecessarily. Just flag it and explain why.

---

## 3. Documentation / Compliance Guardrails

## A. Privacy / PHI Language

You already mention HIPAA-aware stripping. Good. But the language should be careful.

Avoid promising:
- "HIPAA compliant" unless the whole stack and legal posture support that claim
- "fully secure" or "guaranteed privacy"

Safer language:
- **Designed to reduce unnecessary identifying information before AI processing**
- **Built with privacy-aware workflows**
- **Users remain responsible for appropriate documentation and data handling practices**

---

## B. Audit Trail

Long term, the app should track:
- original raw note
- generated draft
- final edited version
- time of generation
- time of export
- whether the clinician modified the draft

Even a simple internal history helps with trust and defensibility.

Recommended future feature:
- **Draft History / Revision History**

---

## C. Clinical Judgment Boundary

Suggested text for settings/help/about page:

> CareNote is an assistive documentation tool. It does not make diagnoses, replace clinical reasoning, or substitute for professional judgment. Clinicians are responsible for reviewing, editing, and approving all documentation before use.

This should appear somewhere persistent but not obnoxious.

---

## D. Medication Parsing Disclaimer

Medication parsing is useful and risky.

Suggested language:

> Parsed medication entries should be reviewed against the source list before saving or using clinically.

Do not imply the med parser is authoritative.

---

## E. Goal Generation Disclaimer

SMART goals are useful, but generated goals should be clearly framed as drafts.

Suggested language:

> Goals are suggested drafts based on the note and should be reviewed for accuracy, appropriateness, and payer/discipline requirements.

---

## 4. Specific UI Copy Recommendations

## Generated Note Banner
**AI-generated draft — review for accuracy, completeness, and discipline-specific requirements before export or use.**

## Medication Parse Banner
**Medication list drafted from recording/transcript — verify against the source medication list before saving.**

## Care Plan Goals Banner
**Suggested goals only — clinician review required before use.**

## Assist Feature Helper Text
**CareNote can help surface missing details and improve structure, but it does not replace your clinical judgment.**

## Export Helper Text
**Only export documentation after clinician review and approval.**

---

## 5. Product Risks to Avoid in Marketing

Do **not** market the app with claims like:
- "Writes your documentation for you"
- "Fully automates home health charting"
- "HIPAA compliant AI documentation" (unless formally validated and supported)
- "Eliminates documentation review"
- "Accurate every time"

Better framing:
- **Speeds up documentation**
- **Helps structure visit notes**
- **Supports clinical workflow**
- **Reduces after-hours charting burden**
- **Keeps clinicians in control of final documentation**

---

## 6. Best Near-Term Guardrail Priorities

If prioritizing implementation, do these first:

1. **AI-generated draft banner everywhere**
2. **Review-required framing before export**
3. **Medication verification warning**
4. **Low-confidence / missing-info alerts**
5. **About/help text clarifying clinician responsibility**

---

## 7. Recommended Philosophy

The best posture is not fear-based. It is **professional assistive tooling**.

That means:
- practical
- transparent
- useful
- respectful of clinician judgment
- clear about where the responsibility still sits

If the app feels honest, clinicians will trust it more.
