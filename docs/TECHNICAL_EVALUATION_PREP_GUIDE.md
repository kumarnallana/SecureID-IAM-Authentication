# SECUREID TECHNICAL EVALUATION & LIVE CODING PREPARATION GUIDE

**Candidate:** Kumar  
**Project:** SecureID — Part 1 (Registration) & Part 2 (Login & Password Recovery)  
**Live Vercel URL:** https://truly-ias-assessment.vercel.app/  
**GitHub Repository:** https://github.com/kumarnallana/Truly-IAS-Assessment  
**Target Video Duration:** 15 – 25 Minutes (YouTube Unlisted)  

---

## TABLE OF CONTENTS
1. [Video Recording Structure & Timing Breakdown](#1-video-recording-structure--timing-breakdown)
2. [Part 1: Live Coding Implementation (Password Enhancement)](#2-part-1-live-coding-implementation-password-enhancement)
   - [HTML Snippet](#a-html-code-publicindexhtml)
   - [CSS Snippet](#b-css-code-publiccsscomponentsformscss-or-stylescss)
   - [JavaScript Snippet](#c-javascript-code-publicjsregistrationjs)
   - [Live Testing Demonstration](#d-live-testing-demonstration)
3. [Part 2: Architecture & Code Walkthrough Scripts](#3-part-2-architecture--code-walkthrough-scripts)
   - [Topic 1: Complete OTP Flow (End-to-End)](#topic-1-the-complete-otp-flow-button-click--backend-response)
   - [Topic 2: Authentication → Session & JWT Lifecycle](#topic-2-complete-authentication--session--jwt-architecture)
4. [Codebase Reference Map](#4-codebase-reference-map)
5. [IAM & Security Technical Interview Q&A](#5-iam--security-technical-interview-qa)
6. [Pre-Recording Checklist & Submission Template](#6-pre-recording-checklist--submission-template)

---

## 1. VIDEO RECORDING STRUCTURE & TIMING BREAKDOWN

| Section | Timestamp | Activity | What to Show on Screen |
| :--- | :--- | :--- | :--- |
| **Intro** | 00:00 – 02:00 | Self-introduction & assessment overview | Camera / Welcome slide or Project Homepage |
| **Part 1** | 02:00 – 08:00 | **Live Coding:** Show/Hide & Password Strength Indicator | Code Editor (`index.html`, `styles.css`, `registration.js`) + Browser Testing |
| **Part 2A** | 08:00 – 14:00 | **Code Walkthrough:** OTP Lifecycle (Registration & Login) | `registration.js`, `registration.routes.js`, `registration.service.js`, `otp.js` |
| **Part 2B** | 14:00 – 22:00 | **Code Walkthrough:** Auth, Session, `HttpOnly` Cookies, `/api/me`, JWT, Logout | `auth.controller.js`, `auth.service.js`, `auth.js`, `prisma/schema.prisma` |
| **Outro** | 22:00 – 24:00 | Summary of security principles implemented & conclusion | Live Vercel App / Terminal |

---

## 2. PART 1: LIVE CODING IMPLEMENTATION (PASSWORD ENHANCEMENT)

During the screen recording, you will open your project in VS Code, navigate to the relevant files, and write/insert the following code blocks while speaking through your design choices.

### A. HTML Code (`public/index.html`)
Locate the Password field inside the Registration form (`around line 106`) and place the Strength Meter right below the password input wrapper:

```html
<!-- Password Field -->
<div class="form-field">
  <label for="reg-password" class="form-field__label">Password</label>
  <div class="form-field__password-wrapper">
    <input
      type="password"
      id="reg-password"
      data-testid="reg-password"
      class="form-field__input"
      placeholder="••••••••••••"
      autocomplete="new-password"
      required
    >
    <button type="button" data-testid="toggle-password-btn" class="form-field__password-toggle" aria-label="Toggle password visibility">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
        <circle cx="12" cy="12" r="3"></circle>
      </svg>
    </button>
  </div>
  
  <!-- NEW: Password Strength Indicator Bar & Label -->
  <div class="password-strength" id="password-strength-meter">
    <div class="password-strength__bar">
      <div class="password-strength__fill" id="strength-fill"></div>
    </div>
    <span class="password-strength__label" id="strength-text">Password strength</span>
  </div>

  <span data-testid="error-reg-password" class="form-field__error-text hidden" aria-live="polite"></span>
</div>
```

---

### B. CSS Code (`public/css/components/forms.css` or `public/css/styles.css`)
Add the visual indicator states for Weak, Medium, and Strong:

```css
/* ==========================================================================
   Password Strength Meter Component
   ========================================================================== */
.password-strength {
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.password-strength__bar {
  height: 6px;
  width: 100%;
  background-color: #e2e8f0;
  border-radius: 3px;
  overflow: hidden;
}

.password-strength__fill {
  height: 100%;
  width: 0%;
  transition: width 0.3s ease, background-color 0.3s ease;
}

.password-strength__label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
}

/* Dynamic Strength Visual States */
.strength--weak .password-strength__fill {
  width: 33%;
  background-color: #ef4444; /* Red */
}
.strength--weak .password-strength__label {
  color: #ef4444;
}

.strength--medium .password-strength__fill {
  width: 66%;
  background-color: #f59e0b; /* Amber */
}
.strength--medium .password-strength__label {
  color: #f59e0b;
}

.strength--strong .password-strength__fill {
  width: 100%;
  background-color: #10b981; /* Emerald Green */
}
.strength--strong .password-strength__label {
  color: #10b981;
}
```

---

### C. JavaScript Code (`public/js/registration.js`)

#### 1. Calculation Helper & Input Event Listener:
```javascript
// Calculate Password Strength Score (0 to 4)
function calculatePasswordStrength(password) {
  if (!password) return { score: 0, label: "", stateClass: "" };

  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) {
    return { score, label: "Weak", stateClass: "strength--weak" };
  } else if (score <= 3) {
    return { score, label: "Medium", stateClass: "strength--medium" };
  } else {
    return { score, label: "Strong", stateClass: "strength--strong" };
  }
}

// Bind to password input
const passwordInput = document.querySelector('[data-testid="reg-password"]');
const meter = document.getElementById("password-strength-meter");
const strengthText = document.getElementById("strength-text");

if (passwordInput && meter && strengthText) {
  passwordInput.addEventListener("input", () => {
    const { label, stateClass } = calculatePasswordStrength(passwordInput.value);
    meter.className = `password-strength ${stateClass}`;
    strengthText.textContent = label ? `Strength: ${label}` : "Password strength";
  });
}
```

#### 2. Show / Hide Password Toggle:
```javascript
const toggleBtn = document.querySelector('[data-testid="toggle-password-btn"]');
if (toggleBtn && passwordInput) {
  toggleBtn.addEventListener("click", () => {
    const isPassword = passwordInput.type === "password";
    passwordInput.type = isPassword ? "text" : "password";
  });
}
```

#### 3. Form Submission Enforcement (Blocking Weak Passwords):
Inside `validateRegForm(formData)`:
```javascript
function validateRegForm(data) {
  const errors = {};
  
  // Existing validation checks for name, email, mobile...
  
  // Password Strength Requirement Enforcement
  const { score } = calculatePasswordStrength(data.password);
  if (score < 4) {
    errors["reg-password"] = "Password is too weak. Please satisfy all 4 security requirements.";
  }

  // Terms & Conditions consent
  if (!data.termsAccepted) {
    errors["reg-termsAccepted"] = "Please accept the Terms & Conditions to proceed.";
  }

  return errors;
}
```

---

### D. Live Testing Demonstration
1. Open `http://localhost:4000/index.html` in your browser.
2. Type `test` → Show the bar is **Red (Weak)**.
3. Type `Test1234` → Show the bar turns **Orange (Medium)**.
4. Type `Test@1234` → Show the bar turns **Green (Strong)**.
5. Click the eye icon → Show the password toggle between `••••••` and plain text.
6. Click "Create Account" with a weak password → Show the error banner blocking submission before any API call is made.

---

## 3. PART 2: ARCHITECTURE & CODE WALKTHROUGH SCRIPTS

### Topic 1: The Complete OTP Flow (Button Click → Backend Response)

**What to Say / Script:**
> *"Now I will walk you through how OTP is securely created, hashed, stored, delivered, and verified in our architecture."*

1. **Client Trigger:**
   - The user enters their credentials on the Registration or Login screen and clicks the submit button.
   - `registration.js` or `login.js` executes client validation, sets the submit button state to loading, and makes an asynchronous call via `apiRequest('/register')`.

2. **Route & Controller Layer:**
   - In `server/routes/registration.routes.js`, Express receives `POST /api/register` with strict rate limiting (`authLimiter`).
   - `registration.controller.js` parses the payload with Zod (`registerSchema`).

3. **OTP Generation & Hashing (`server/services/registration.service.js` & `server/lib/otp.js`):**
   - The service calls `generateOtp()`, which uses `crypto.randomInt(100000, 999999)` for cryptographically secure 6-digit generation.
   - **Crucial Security:** The plain OTP is **never** saved directly to the database. We hash it with HMAC-SHA256:  
     `hashOtp(otp, env.OTP_SECRET)`.

4. **Database Storage (`prisma/schema.prisma`):**
   - An `OtpChallenge` record is inserted into Neon PostgreSQL containing:
     - `userId` (foreign key)
     - `channel`: `EMAIL` or `SMS`
     - `purpose`: `REGISTRATION` or `LOGIN` or `PASSWORD_RECOVERY`
     - `otpHash`: the HMAC hex string
     - `expiresAt`: current time + 10 minutes (`env.OTP_TTL_SECONDS`)
     - `attempts`: initial 0, `maxAttempts`: 3
     - `consumedAt`: null

5. **Delivery & Transition:**
   - `delivery.service.js` simulates email or SMS dispatch.
   - The backend responds with `{ challengeId, expiresAt }`.
   - The frontend receives the ID, starts a 600s countdown timer (`startTimer`), and transitions the user to the OTP input screen.

6. **Verification & Timing-Attack Protection:**
   - User inputs 6 digits into the auto-focusing input boxes.
   - Frontend calls `POST /api/verify-email-otp` sending `{ challengeId, otp }`.
   - The server verifies `expiresAt > new Date()`, verifies `attempts < maxAttempts`, and uses `crypto.timingSafeEqual()` to compare the computed HMAC with `challenge.otpHash`.
   - Upon success, it marks `consumedAt: new Date()` so the OTP can never be reused (Replay attack protection).

---

### Topic 2: Complete Authentication → Session & JWT Architecture

**What to Say / Script:**
> *"Next, I'll explain our end-to-end Authentication lifecycle: credential checking, session creation, HttpOnly cookies, /api/me validation, Bearer tokens, and secure logout."*

1. **Step 1: Credential Verification (`POST /api/login`):**
   - Located in `server/controllers/auth.controller.js` and `auth.service.js`.
   - `prisma.user.findFirst()` locates the active user by email or username.
   - Passwords are verified against the stored hash using `bcrypt.compare()`.
   - Once verified, the server returns a temporary `loginToken` to transition the user to the required Multi-Factor Authentication step (Authenticator app / SMS / Email).

2. **Step 2: Session Creation upon MFA Completion (`server/lib/auth.js`):**
   - When the MFA code is verified, `completeLogin()` generates a high-entropy 32-byte opaque session token via `crypto.randomBytes(32).toString('base64url')`.
   - The SHA-256 hash of this token is saved in the `Session` table in PostgreSQL with `expiresAt` and `userAgent`/`ipAddress`.

3. **Step 3: Secure Cookie Storage (`Set-Cookie`):**
   - The server issues an `HttpOnly`, `SameSite=Lax`, `Secure` cookie named `secureid.sid`.
   - **Why HttpOnly?** It makes the cookie completely inaccessible to browser JavaScript (`document.cookie`), neutralizing Cross-Site Scripting (XSS) session theft.

4. **Step 4: `/api/me` State Lookup & Validation (`touchSession`):**
   - When any page loads (`dashboard.html` or `login.html`), the client calls `GET /api/me`.
   - The `requireAuth` middleware parses the incoming `Cookie` header, hashes the received token, and queries `prisma.session.findUnique` for an active, non-revoked session.
   - If valid, `touchSession()` updates the `lastActiveAt` timestamp in the database and returns `{ authenticated: true, user: publicUser(user) }`.
   - If invalid or expired, it returns `401 Unauthorized` without throwing unhandled exceptions.

5. **Step 5: Stateless JWT Token Issuance (`POST /api/token`):**
   - For downstream microservices or Bearer authentication, calling `/api/token` with an active session invokes `signAccessToken()`.
   - It builds an `HS256` token with Header, Payload (`iss`, `sub`, `aud`, `iat`, `exp`, `jti`), and HMAC signature using `env.JWT_SECRET`.
   - Protected API routes verify the JWT signature and claims using `verifyAccessToken()`.

6. **Step 6: Invalidation & Logout (`POST /api/logout`):**
   - The user clicks Logout.
   - `auth.controller.js` executes `revokeSession(req.auth.session.id)`, updating `revokedAt: new Date()` in PostgreSQL.
   - Simultaneously, `res.clearCookie('secureid.sid')` clears the cookie from the browser, ensuring the session cannot be reused from either client or server side.

---

## 4. CODEBASE REFERENCE MAP

| Component | File Path | Key Functions & Exports |
| :--- | :--- | :--- |
| **Registration Form** | `public/index.html` | `<form data-testid="registration-form">`, password field |
| **Registration Client Logic** | `public/js/registration.js` | `validateRegForm()`, `calculatePasswordStrength()`, `setupPasswordToggle()` |
| **Login Client Logic** | `public/login.html` & `public/js/login.js` | `submitLogin()`, `createChallenge()`, `verifyCode()` |
| **Password Recovery** | `public/forgot-password.html` & `public/js/forgot-password.js` | Recovery flow, challenge management |
| **Auth Controller** | `server/controllers/auth.controller.js` | `login()`, `verifyLoginOtp()`, `me()`, `logout()`, `token()` |
| **Auth Service** | `server/services/auth.service.js` | `beginLogin()`, `completeLogin()`, `touchSession()`, `revokeSession()` |
| **Security & Crypto Core** | `server/lib/auth.js` | `createOpaqueToken()`, `sessionCookieOptions()`, `signAccessToken()`, `verifyAccessToken()` |
| **OTP Utilities** | `server/lib/otp.js` | `generateOtp()`, `hashOtp()`, `safeEqualHex()` |
| **Database Schema** | `prisma/schema.prisma` | `User`, `OtpChallenge`, `Session`, `AccessToken` models |

---

## 5. IAM & SECURITY TECHNICAL INTERVIEW Q&A

### Q1: What is the difference between Authentication (AuthN) and Authorization (AuthZ)?
**Answer:**
- **Authentication (AuthN):** Verifying *who* a user is (e.g., verifying email, password, and MFA code).
- **Authorization (AuthZ):** Determining *what permissions* an authenticated user has (e.g., role-based access control, accessing admin endpoints vs. student dashboards).

---

### Q2: Why do you store passwords as bcrypt hashes rather than plain text or MD5/SHA256?
**Answer:**
Standard hash functions like MD5 or SHA-256 are fast, making them vulnerable to brute-force and GPU-accelerated rainbow table attacks. **bcrypt** is an adaptive, salted key derivation function with an adjustable work factor (salt rounds: 12), intentionally designed to be computationally expensive to prevent brute-force attacks even if the database is leaked.

---

### Q3: Why is `HttpOnly` cookie preferred over `localStorage` for session storage?
**Answer:**
`localStorage` is accessible by any JavaScript running in the browser. If the application has any Cross-Site Scripting (XSS) vulnerability, an attacker can steal the JWT or token directly. `HttpOnly` cookies cannot be read or modified by client-side JavaScript, mitigating XSS token exfiltration.

---

### Q4: Why use `crypto.timingSafeEqual` when verifying OTPs and signatures?
**Answer:**
Standard string equality (`===`) short-circuits on the first mismatched character, creating measurable timing discrepancies (nanoseconds). Attackers can analyze these differences to guess correct codes character by character. `timingSafeEqual` executes in constant time regardless of where mismatches occur, preventing side-channel timing attacks.

---

### Q5: What are the 3 parts of a JSON Web Token (JWT)?
**Answer:**
1. **Header:** Algorithm (`HS256`) and Token Type (`JWT`).
2. **Payload:** Claims such as Issuer (`iss`), Subject/User ID (`sub`), Expiration (`exp`), and JWT ID (`jti`).
3. **Signature:** Cryptographic HMAC-SHA256 signature calculated over `Base64Url(Header) + "." + Base64Url(Payload)` using a secret key to ensure integrity.

---

### Q6: What is the difference between an Opaque Session Token and a JWT?
**Answer:**
- **Opaque Session Token:** A random string containing no internal data; the backend queries the database on every request to look up the session state. Easy to revoke instantly.
- **JWT (Stateless):** Self-contained token that carries identity and expiry inside its payload. Verified without database queries, but requires token revocation lists or short TTLs for invalidation.

---

## 6. PRE-RECORDING CHECKLIST & SUBMISSION TEMPLATE

### Pre-Recording Checklist:
- [ ] Screen recording software ready (OBS Studio, Loom, or Windows `Win + G`).
- [ ] Microphone tested and clear.
- [ ] Local dev server running (`npm run dev` at `http://localhost:4000`).
- [ ] VS Code open with `public/index.html`, `public/js/registration.js`, `server/controllers/auth.controller.js`, and `server/lib/auth.js` pinned for easy navigation.
- [ ] Browser window ready on `http://localhost:4000/index.html`.

---

### YouTube Video Upload Instructions:
1. Export your recording as `.mp4`.
2. Go to **[YouTube Studio](https://studio.youtube.com/)** → **Create** → **Upload Video**.
3. Title: `Kumar — SecureID Technical Evaluation & Architecture Walkthrough`.
4. Set Visibility to: **Unlisted** *(Anyone with the link can view, but it will not appear in public search)*.
5. Copy the video link.

---

### Final Submission Message for Internshala:

```markdown
Hi Team,

I have completed the technical evaluation video task as requested!

Here are my submission details:

• Video Recording (Unlisted YouTube): [INSERT YOUR YOUTUBE LINK HERE]
• Live Vercel Deployment: https://truly-ias-assessment.vercel.app/
• GitHub Repository: https://github.com/kumarnallana/Truly-IAS-Assessment
• Candidate Details Form: Submitted

Video Summary:
1. Part 1 (Live Implementation): Implemented the Show/Hide password toggle, dynamic Weak/Medium/Strong visual meter in HTML/CSS/JS, and strict submit-blocking on weak passwords.
2. Part 2 (Architecture Walkthrough): Detailed explanation of the end-to-end OTP flow, timing-safe validation, HttpOnly session cookie lifecycle, /api/me touch verification, JWT issuance, and database session revocation on logout.

Looking forward to the next steps!

Best regards,
Kumar
```
