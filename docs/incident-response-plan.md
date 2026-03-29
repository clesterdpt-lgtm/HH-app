# CareNote Incident Response Plan

**Last reviewed**: 2026-03-29
**Next review**: 2026-06-29 (quarterly)

---

## 1. Purpose and Scope

This plan defines how to detect, contain, investigate, and recover from security incidents affecting CareNote. It covers:

- The CareNote web application (GitHub Pages)
- Supabase backend (database, auth, Edge Functions, storage)
- Third-party integrations (OpenAI Whisper, Anthropic Claude)
- User accounts and clinical data

A **security incident** is any event that compromises or may compromise the confidentiality, integrity, or availability of CareNote user data. Examples include unauthorized access, data exposure, credential leaks, and service compromise.

---

## 2. Roles and Responsibilities

| Role | Person | Responsibilities |
|------|--------|-----------------|
| **Primary Responder** | Chris Lester (developer) | Detection, containment, investigation, notification, recovery |
| **Supabase Support** | Supabase team | Infrastructure incidents, database compromise, auth system issues |
| **Outside Counsel** | TBD | Legal guidance on notification obligations if breach involves PHI/PII |

As a solo-developer project, all roles currently collapse into the Primary Responder. Document them separately so they scale when a team forms.

---

## 3. Incident Severity Classification

### P1 — Critical
- Confirmed unauthorized access to user data
- Database breach with clinical data exposure
- Supabase service role key or admin credentials compromised
- Evidence of data exfiltration

**Response time**: Immediate (within 1 hour)

### P2 — High
- Suspected unauthorized access (unusual audit log entries)
- API key (OpenAI/Anthropic) exposed in public repository
- RLS policy bypass discovered
- Third-party processor reports a breach affecting CareNote data

**Response time**: Within 4 hours

### P3 — Moderate
- Failed attack attempts detected in logs
- Suspicious account activity (multiple failed logins)
- Security vulnerability discovered but not yet exploited
- Dependency vulnerability alert from GitHub

**Response time**: Within 24 hours

### P4 — Low
- Minor configuration issue identified
- Non-sensitive data exposure (e.g., public anon key in repo — by design)
- General security improvement findings

**Response time**: Within 1 week

---

## 4. Detection and Reporting

### Monitoring Sources

| Source | What to Look For | How to Check |
|--------|-----------------|--------------|
| **audit_log table** | Unexpected operations, unusual volume, operations without user_id | `SELECT * FROM audit_log ORDER BY created_at DESC` |
| **Supabase Dashboard** | Auth logs, failed login spikes, unusual API traffic | https://supabase.com/dashboard/project/bctqzflbykwozbanyamp |
| **GitHub Security Alerts** | Dependency vulnerabilities, secret scanning alerts | Repository Security tab |
| **OpenAI/Anthropic Dashboards** | Unusual API usage spikes | Provider dashboards |
| **User Reports** | Users reporting unauthorized changes or access | Email: clesterdpt@gmail.com |

### Recommended Review Schedule

- **Weekly**: Review audit_log for anomalies, check Supabase auth logs
- **Monthly**: Review GitHub security alerts, check API usage dashboards
- **Quarterly**: Full review of this incident response plan

---

## 5. Containment Steps

### P1/P2 — Immediate Actions

1. **Credential rotation** (do all that apply):
   - Supabase: Regenerate anon key and service role key in Dashboard > Settings > API
   - OpenAI: Rotate API key at platform.openai.com
   - Anthropic: Rotate API key at console.anthropic.com
   - Update all rotated keys in Supabase Edge Function secrets: `supabase secrets set KEY=value --project-ref bctqzflbykwozbanyamp`

2. **If user accounts compromised**:
   - Disable affected accounts via Supabase Dashboard > Authentication > Users
   - Force password reset for affected users
   - Review audit_log for the affected user_id to assess data access scope

3. **If RLS bypass discovered**:
   - Add emergency restrictive policy: `CREATE POLICY "emergency_lockdown" ON [table] FOR ALL USING (false);`
   - Investigate and patch the bypass
   - Remove emergency policy after fix is verified

4. **If API key leaked in Git**:
   - Rotate the key immediately (see step 1)
   - Remove from Git history: `git filter-branch` or use BFG Repo Cleaner
   - Review API usage logs for unauthorized calls during exposure window

### P3/P4 — Standard Actions

- Document the finding
- Create a fix plan with timeline
- No emergency action required unless risk escalates

---

## 6. Investigation Procedures

### Step 1: Establish Timeline
- When was the incident first detected?
- When did the incident likely begin? (check audit_log timestamps)
- What is the current status?

### Step 2: Assess Scope
```sql
-- Check audit_log for affected timeframe
SELECT table_name, operation, record_id, user_id, created_at
FROM audit_log
WHERE created_at BETWEEN '[start_time]' AND '[end_time]'
ORDER BY created_at;

-- Check for operations without a user_id (potential service key misuse)
SELECT * FROM audit_log WHERE user_id IS NULL ORDER BY created_at DESC;

-- Check for unusual volume by user
SELECT user_id, COUNT(*) as op_count
FROM audit_log
WHERE created_at > now() - interval '24 hours'
GROUP BY user_id
ORDER BY op_count DESC;
```

### Step 3: Identify Affected Data
- Which tables were accessed?
- Which records (record_ids) were read, modified, or deleted?
- How many users are affected?
- Was any clinical data (notes, medications, goals) exposed?

### Step 4: Determine Root Cause
- Check Supabase auth logs for how access was obtained
- Review recent code changes/deployments
- Check if third-party processors reported issues
- Review GitHub commit history for accidental credential exposure

### Step 5: Document Everything
- Maintain a running incident log with timestamps
- Save screenshots of dashboards and logs
- Preserve audit_log data (do not delete)

---

## 7. Notification Requirements

### Legal Obligations

US state breach notification laws generally require notification when **unencrypted personal information** is accessed by unauthorized parties. Key points:

- **Most states**: Notification required within 30-60 days of discovery
- **California** (Cal. Civ. Code 1798.82): "In the most expedient time possible and without unreasonable delay"
- **Health data**: Some states (WA, CT, NV) have specific health data privacy laws with stricter requirements
- **HIPAA**: CareNote disclaims HIPAA compliance, but if users entered PHI, consult legal counsel on obligations

### When to Notify

Notify affected users if:
- Confirmed unauthorized access to their clinical data (notes, medications, goals)
- Account credentials were compromised
- Data was exfiltrated or exposed

### Notification Template

```
Subject: CareNote Security Notice

Dear [User],

We are writing to inform you of a security incident affecting your CareNote account.

WHAT HAPPENED:
[Brief description of the incident and timeline]

WHAT DATA WAS AFFECTED:
[Specific types of data — clinical notes, medication records, etc.]

WHAT WE DID:
[Actions taken to contain and resolve the incident]

WHAT YOU SHOULD DO:
- Change your CareNote password immediately
- Review your recent activity in the app
- If you used the same password elsewhere, change those as well
- [Additional steps as applicable]

We take the security of your data seriously and have implemented additional
safeguards to prevent this from happening again.

If you have questions, contact us at clesterdpt@gmail.com.

Sincerely,
CareNote Team
```

### Regulatory Notification

If the breach affects 500+ individuals in a single state, some states require notification to the state Attorney General. Consult outside counsel to determine specific obligations.

---

## 8. Recovery Steps

1. **Verify containment**: Confirm the vulnerability is patched and credentials rotated
2. **Restore service**: If any service was taken offline, bring it back after verification
3. **Verify data integrity**: Compare audit_log records against current data state
4. **Monitor for recurrence**: Increase audit_log review frequency to daily for 2 weeks
5. **Update security controls**: Implement any additional mitigations identified during investigation
6. **Communicate resolution**: Notify affected users that the incident is resolved

---

## 9. Post-Incident Review

Conduct within **72 hours** of resolution. Document:

1. **Root cause**: What allowed the incident to happen?
2. **Timeline**: From initial compromise to detection to resolution
3. **Detection gap**: How long between compromise and detection? How can this be shortened?
4. **What worked**: Which procedures and tools were effective?
5. **What didn't work**: Where did the response fall short?
6. **Action items**: Specific improvements with owners and deadlines
7. **Plan updates**: What changes should be made to this incident response plan?

Store post-incident reports in `docs/incident-reports/` directory.

---

## 10. Key Contacts and Resources

| Contact | Purpose | URL/Info |
|---------|---------|----------|
| **Chris Lester** | Primary responder | clesterdpt@gmail.com |
| **Supabase Support** | Infrastructure/database incidents | https://supabase.com/support |
| **OpenAI Security** | API key compromise, data concerns | https://openai.com/security |
| **Anthropic Security** | API key compromise, data concerns | https://anthropic.com/security |
| **GitHub Security** | Repository compromise, secret scanning | https://github.com/security |
| **State AG Breach Notification** | Breach reporting by state | https://www.ncsl.org/technology-and-communication/security-breach-notification-laws |
| **Outside Counsel** | Legal guidance on breach notification | TBD — engage health data privacy specialist |

### Quick Reference: Credential Rotation

| Credential | Where to Rotate | Where to Update |
|-----------|----------------|-----------------|
| Supabase anon key | Dashboard > Settings > API | `app/index.html` (line ~3326), redeploy |
| Supabase service role key | Dashboard > Settings > API | Edge Function secrets only |
| OpenAI API key | platform.openai.com | `supabase secrets set OPENAI_API_KEY=...` |
| Anthropic API key | console.anthropic.com | `supabase secrets set ANTHROPIC_API_KEY=...` |

---

## 11. Plan Maintenance

- Review this plan **quarterly** or after any incident
- Update contact information when team changes
- Test the plan annually with a tabletop exercise (walk through a hypothetical scenario)
- Keep this document in version control (`docs/incident-response-plan.md`)
