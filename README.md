# Sprkclub UI

Next.js App Router port of the dark Sprkclub demo UI (DAO + NFT proposals, voting, crowdfunding).

## Stack

- Next.js (App Router) + React 19
- Tailwind CSS v4 (`src/styles.css`)
- Zustand (demo wallet / proposals state)
- Radix UI + lucide-react + sonner

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

- `npm run dev` — local Next.js server
- `npm run build` — production build
- `npm run typecheck` — `tsc --noEmit`

## App routes

| Path | Page |
|------|------|
| `/` | Home |
| `/launch/create-proposal` | Create proposal |
| `/launch/convert-proposal` | Convert passed proposal |
| `/explore/ongoing-proposals` | Voting proposals |
| `/explore/crowdfunding-events` | Crowdfunding list |
| `/explore/crowdfunding-events/[id]` | Event detail |
| `/dashboard/crowdfunding-events` | Backed events |
| `/dashboard/started-events` | Started events + operator queue |
| `/proposal/[id]` | Proposal detail |

UI components live under `src/components`; shared lib under `src/lib`.
