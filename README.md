# HWS Portal, organisation side

The organisation-facing half of the HWS Portal. Organisations onboard, get
verified, and post solutions that women find through the search flow in
[hws-global](https://github.com/colarroid/hws-global).

Their primary goal is to post solutions, so onboarding is the shortest path to
a first listing rather than a profile-building exercise.

## The three repositories

The platform is three front ends over **one Supabase database**:

| Repository | What it is | Deployed at |
| --- | --- | --- |
| [hws-global](https://github.com/colarroid/hws-global) | The woman-facing flow and the landing page | the bare domain |
| **hws-organization** (this one) | The organisation portal | `organisations.` |
| [hws-admin](https://github.com/colarroid/hws-admin) | Review queue, verification, Access Zone management | `administrator.` |

**The database schema lives in `hws-global/supabase/migrations` and nowhere
else.** Three repositories writing migrations against one database would
produce three divergent histories, so all schema changes go there regardless of
which front end needs them. The same goes for the development seed script.

## Shared code

`src/components/ui`, `src/lib/supabase`, `src/lib/design/taxonomy.ts` and the
tokens in `src/app/globals.css` are duplicated across the three repositories
rather than published as a package. That is a deliberate trade: a private
registry costs more than it returns before launch.

The consequence is real and worth naming. **Changes to the token layer or the
shared primitives have to be applied in each repository.** Keep that surface
small and stable. If it starts drifting, extract it to a package rather than
letting three versions diverge quietly.

One component is genuinely shared rather than incidentally duplicated: the
woman-facing result card. Screen 11 here renders the real card, not a mock of
it, so it exists in both this repository and hws-global and the two must match.

## Running locally

```bash
npm install
npm run dev
```

Runs on <http://localhost:3001>, so it can run alongside the other two.

Copy `.env.example` to `.env.local` and fill it in. Both values come from the
same Supabase project as the other repositories.

## Screens

Thirteen, in three groups.

**A. Account and recovery.** Sign up, confirm email, sign in, request a reset,
set a new password. There is no Google sign-in by decision, so every account
goes through a work address plus a confirmed link.

**B. Onboarding**, four steps at 25/50/75/100%. About your organisation,
Access Zones, verification, then the dashboard. Verification gates publishing,
not access, so drafting starts immediately.

**C. Posting and management.** Dashboard, post a solution, preview as she will
see it, submitted, organisation.

## Design

Tokens are in `src/app/globals.css` as Tailwind theme variables. Playfair
Display for headings, Inter for everything else, self-hosted via `next/font`.
Icons are Lucide.

WCAG 2.2 AA: 44px minimum targets, 2px gold focus rings, errors inline with
focus moved to the message, and a real label tied to every input.

Decisions and their reasons are logged in `hws-global/docs/DECISIONS.md`.
