# NoQueue v3 — Romania’s Civic Operating System

> Built for **Cluj Hackathon 2026 — Digital Romania**  
> A modern civic platform that helps citizens avoid unnecessary queues, understand bureaucracy, auto-prepare documents, and manage life events from one digital place.

---

## Live Demo

**Live app:**   `https://cluj-queue-clear.base44.app`
**Repository:** `https://github.com/pop123-ux/NoQueuev3`

---

## What is NoQueue?

NoQueue is an AI-powered civic assistant and digital document workspace for Romanian public services.

Instead of forcing citizens to search dozens of government websites, print unclear forms, wait in the wrong queue, or return because one document is missing, NoQueue gives them a guided flow:

1. The user verifies identity once through a simulated ROeID-style flow.
2. NoQueue builds a secure Safe Profile with reusable personal data.
3. The user says what they need, for example:  
   “I lost my ID”, “I need a passport”, “I moved to Romania”, “I need a tax certificate”.
4. The app identifies the correct institution, documents, steps, appointment needs, and estimated time saved.
5. The user receives a ready case workspace, document preparation sheets, reminders, and a civic timeline.

NoQueue is not just a chatbot. It is a civic operating system that combines identity, documents, AI routing, audit history, and user-friendly workflows.

---

## The Problem

Romanian citizens waste hours because public-service flows are fragmented:

- People do not know which institution handles their problem.
- Required documents are unclear or scattered across multiple websites.
- Citizens often make repeated visits because one paper is missing.
- Government UX is usually slow, unclear, and not mobile-first.
- Personal data has to be typed again and again into different forms.
- Foreign citizens moving to Romania have an even harder time understanding the process.
- There is no unified civic dashboard for cases, documents, expiry dates, and next steps.

---

## The Solution

NoQueue turns bureaucracy into guided digital flows.

The app helps users:

- Understand what they need to do.
- Start a civic case from natural language.
- Auto-route to the correct institution or online portal.
- Generate preparation sheets and document bundles.
- Store identity and government documents in a digital vault.
- Track document expiry dates.
- Simulate secure ROeID-style identity onboarding.
- Use 2FA before sensitive actions.
- Keep an immutable civic activity timeline.
- Estimate time saved by avoiding queues and repeated visits.
- Navigate life events instead of searching legal procedures manually.

---

## Example User Flows

### 1. Lost ID Card

User says:

> “I lost my ID.”

NoQueue responds with:

- Required police declaration.
- Required documents for SPCLEP.
- Preparation checklist.
- Estimated time saved.
- Institution guidance.
- Case saved in the user dashboard.
- Civic timeline entry.

---

### 2. Passport Application

User says:

> “I need a passport.”

NoQueue responds with:

- Passport appointment guidance.
- Required documents.
- Payment information placeholder.
- Preparation sheet.
- Reminder that the official passport form is completed by the officer, not generated falsely by the app.
- Link/guidance toward the official ePașapoarte process.

---

### 3. Moving to Romania

User says:

> “I am moving to Romania.”

NoQueue responds with a relocation roadmap:

- Residency steps.
- Health insurance steps.
- Tax registration guidance.
- Local institution suggestions.
- Estimated bureaucracy timeline.
- Saved-time estimate.

---

### 4. Digital Vault

The user can store and manage:

- ID card data.
- Passport-related records.
- Government documents.
- Expiry dates.
- Generated preparation documents.
- Audit history.

---

## Core Features

### NoQueue OS Dashboard

The main civic dashboard shows:

- Estimated bureaucracy time saved.
- Active life events.
- Active cases.
- Forms prepared.
- Queues avoided.
- Trips avoided.
- Documents expiring soon.
- Immutable civic history timeline.

---

### Safe Profile

The Safe Profile stores reusable identity information so citizens do not repeatedly type the same data.

Stored profile fields may include:

- First name
- Last name
- Full name
- Date of birth
- Birth place
- Address
- City
- County
- ID series
- ID number
- ID expiry date
- Citizenship
- Signature status
- OCR verification status

Sensitive fields are encrypted or masked where appropriate in the prototype.

---

### ROeID-Style Identity Onboarding Simulation

NoQueue includes a simulated identity verification flow inspired by ROeID:

1. Email entry.
2. ID upload.
3. OCR processing.
4. User review of extracted data.
5. 2FA verification.
6. Safe Profile creation.
7. Civic timeline logging.

This is a prototype simulation and not an official government authentication system.

---

### Romanian ID OCR

The app includes a Romanian ID OCR flow that extracts identity data from uploaded documents and lets the user verify the extracted fields before saving.

OCR output is never blindly trusted. The user must review and confirm the data.

---

### Two-Factor Authentication

NoQueue includes a Google Authenticator-compatible TOTP simulation:

- QR code setup.
- Manual secret option.
- 6-digit verification.
- Backup codes.
- 2FA confirmation before profile generation.

For production, the TOTP secret should be generated and stored server-side. In this hackathon prototype, it is handled client-side for demonstration purposes.

---

### AI Civic Case Classifier

The user can describe a problem in normal language.

Examples:

- “I need to renew my ID.”
- “My driving license expired.”
- “I need a criminal record.”
- “I want to register a company.”
- “I need health insurance proof.”
- “I want to get divorced.”
- “I moved to Romania.”

The app classifies the request and returns:

- Procedure title.
- Institution.
- Required documents.
- Whether it can be done online.
- Best time or channel.
- Risks and warnings.
- Next action.
- Case workspace.

---

### Document Router

NoQueue maps user intent to document templates and preparation sheets.

Supported procedure categories include:

- ID renewal.
- Lost or stolen ID.
- Domicile/address change.
- Passport.
- Urgent passport.
- Passport history request.
- RNEPS data request.
- Generic request.
- Declaration on own responsibility.
- Notary-related flows.
- Driving license.
- ANAF/tax certificate.
- Company registration.
- Divorce.
- Criminal record.
- Health insurance.

---

### Document Generation

NoQueue generates **preparation sheets** and support documents for the citizen.

Important legal/product principle:

> NoQueue must not generate fake official government documents.

When an official form is completed only by a public servant or inside an official government system, NoQueue generates a clearly marked preparation sheet instead of pretending to produce an official document.

Generated files can be downloaded and attached to a case.

---

### Life Events

Instead of forcing users to know bureaucratic terms, NoQueue lets users start from life events:

- I lost my ID.
- I moved to a new address.
- I moved to Romania.
- I got married.
- I had a child.
- I need healthcare access.
- I started a company.
- I changed jobs.
- I need a passport.
- I need residency.
- I became a student.
- I need tax registration.
- I need social assistance.
- Someone passed away.

Each life event maps to one or more workflows and shows estimated time saved.

---

### Digital Vault

The Digital Vault is a single place for government-issued documents and personal records.

It is designed to help users:

- Store documents.
- Search documents.
- Track expiry dates.
- Download prepared files.
- Reuse verified profile data.
- Avoid storing everything physically at home.

---

### Civic Timeline Ledger

NoQueue records important actions in a civic timeline:

- Identity verified.
- Demo run executed.
- Life event started.
- Document generated.
- Signature approved.
- Case created.
- Profile updated.

This simulates the “data is not silently deleted or modified” requirement expected in serious public-service apps.

---

### Secure LLM Gateway

NoQueue includes a secure AI gateway pattern designed around this principle:

> The LLM should not receive raw personal identity data.

Security features include:

- PII sanitization before AI calls.
- Placeholder replacement for sensitive fields.
- Prompt-injection detection.
- Rate-limiting checks.
- Audit logging.
- Response validation to block accidental CNP or ID leakage.

---

### Prompt Injection Protection

The app checks user text and OCR-extracted text for suspicious instructions such as:

- “Ignore previous instructions”
- “Reveal system prompt”
- “Dump database”
- “Developer mode”
- Script injection attempts

Suspicious content is rejected or sanitized before reaching the AI layer.

---

### Audit Logging

Security-relevant actions are logged without exposing sensitive values.

Examples:

- File uploaded.
- File rejected.
- Document generated.
- Rate limit hit.
- Injection attempt detected.
- Vault save.
- Data export.
- Vault deletion.

Sensitive patterns like CNPs, ID numbers, phone numbers, and emails are redacted from audit details.

---