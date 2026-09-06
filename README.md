# SecureID IAM Authentication & Registration

[![Live Demo](https://img.shields.io/badge/Live_Demo-secureid--identity--access.vercel.app-blue?style=for-the-badge&logo=vercel)](https://secureid-identity-access.vercel.app)
[![GitHub Repository](https://img.shields.io/badge/GitHub-SecureID--IAM--Authentication-181717?style=for-the-badge&logo=github)](https://github.com/kumarnallana/SecureID-IAM-Authentication)
[![Node.js](https://img.shields.io/badge/Node.js-v20+-339933?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)

SecureID implements the supplied two-part assessment using vanilla HTML/CSS/JavaScript, Node.js/Express, Prisma/PostgreSQL, Playwright, server-side sessions, backend OTP/TOTP MFA, and a separate short-lived JWT protected-API demonstration.

---

## Live Deployment Details

| Property | Value |
| :--- | :--- |
| **Live Production URL** | [https://secureid-identity-access.vercel.app](https://secureid-identity-access.vercel.app) |
| **Vercel Account** | sasi-kumar-nallana ([vercel.com/sasi-kumar-nallana/secureid-identity-access](https://vercel.com/sasi-kumar-nallana/secureid-identity-access)) |
| **Vercel Project Name** | secureid-identity-access *(formerly truly-ias-assessment)* |
| **GitHub Repository** | [https://github.com/kumarnallana/SecureID-IAM-Authentication](https://github.com/kumarnallana/SecureID-IAM-Authentication) |
| **Developer** | Nallana Sasi Kumar ([sasikumarnallana956@gmail.com](mailto:sasikumarnallana956@gmail.com)) |

---

## Run locally

1. Copy .env.example to .env and replace every placeholder, especially DATABASE_URL, OTP_SECRET, TOTP_ENCRYPTION_KEY, and JWT_SECRET.
2. Install dependencies with 
pm install.
3. Apply the schema with 
pm run db:push for an existing development database, or 
px prisma migrate deploy for a fresh migration-managed database.
4. Start the full Express application with 
pm start.
5. Open http://localhost:4000 for registration or http://localhost:4000/login.html for login.

Simulated email/SMS codes are printed only to the server console. Optional test-only retrieval is described in .env.example and the architecture contract.

---

## Verification

`ash
npm run prisma:generate
npm run test:unit
npm run test:functional
npm test
`

The Playwright suite contains functional, accessibility, responsive, security, and multi-viewport visual regression coverage.

---

## Permanent project documentation

- [Part 2 architecture and security contract](docs/part-2-architecture-contract.md)
- [Corrected IAM video evidence review](docs/iam-video-evidence-review.md)
- [UI reference map](docs/ui-reference-map.md)
- [UI baseline policy](docs/ui-baseline-policy.md)

