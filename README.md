# Email Signature Generator

React app for Griffin Global Technologies (GGT) that will autogenerate a company email signature.

This repository is an initialized Vite + React project only. Feature work is not implemented yet.

## Stack

- React
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
```

## Feature tickets

| Ticket | Owners | Status |
| --- | --- | --- |
| FT-Setup Project | Harun / Kelvin | Done |
| FT-Form | Harun / Kelvin | Done|
| FT-Preview | Kevin Kirui / Karen | Done |
| FT-Generate Signature | Kevin Kirui / Karen | Done |
| FT-Generated Signature Download | Evans / Nora | Done |
| FT-Copy Generated Signature | Evans / Nora | Done |
| Verification and Testing | Edwin | Done |

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

Target host is Vercel. After the first GitHub push, connect this repository in the Vercel dashboard. Vite is detected automatically (`npm run build`, output `dist`).
