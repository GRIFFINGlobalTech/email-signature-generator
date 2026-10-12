# Email Signature Generator

React app for Griffin Global Technologies (GGT) that will autogenerate a company email signature.

This Vite + React + TypeScript app creates email signature previews and PNG downloads. Company email is suggested from the first and last name, and phone numbers are validated against the selected country's numbering plan.

## Stack

- React
- TypeScript
- HTML
- CSS
- Vite
- GitHub (version control)
- Vercel (planned deployment)

## Getting started

Requires Node.js 20.19 or later.

```bash
npm install
npm run dev
```

Other scripts:

```bash
npm run build
npm run preview
npm run lint
npm run typecheck
```

## Feature tickets

| Ticket | Owners | Status |
| --- | --- | --- |
| FT-Setup Project | Harun / Kelvin | In progress (this repo) |
| FT-Form | Harun / Kelvin | Not started |
| FT-Preview | Kevin Kirui / Karen | Not started |
| FT-Generate Signature | Kevin Kirui / Karen | Not started |
| FT-Generated Signature Download | Evans / Nora | Not started |
| FT-Copy Generated Signature | Evans / Nora | Not started |
| Verification and Testing | Edwin | Not started |

## Product backlog (do not implement in this setup commit)

- Restrict access to GGT members only
- Login if user search is available (TBD)
- Mandatory fields: first name, surname, job title, valid company email, valid phone
- Generated signature: transparent company logo, full name, job title, email, phone, company name linked to the website, border between logo and text
- Preview before generation
- Copy generated signature
- Download generated signature
- Re-enter details and regenerate
- Dark and light mode
- Transparent logo / signature assets

## Deployment

This app is configured for Vercel. To connect it:

1. In Vercel, select **Add New... > Project** and import `GRIFFINGlobalTech/email-signature-generator` from GitHub.
2. Keep the project root as the repository root. Vercel detects Vite; confirm the build command is `npm run build` and the output directory is `dist`.
3. In **Project Settings > Git**, set **Production Branch** to `main`.
4. Deploy the project. Commits and merges to `main` create production deployments. Commits to `develop` create preview deployments for staging; Vercel provides a stable branch URL in the deployment details.

If you want a custom staging URL, add a domain under **Project Settings > Domains** and assign it to the `develop` branch. Keep production domains assigned to the production environment. Configure any environment variables separately for the Production and Preview environments under **Project Settings > Environment Variables**.
