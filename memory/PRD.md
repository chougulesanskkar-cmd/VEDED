# VEDED Creative Suite + Book Stream — PRD

## Problem Statement (Verbatim summary)
Unified dual-app ecosystem:
- **VEDED**: AI Media Creation Platform (Images, Short Videos, Audio, Long-Form Movie Compiler) with tiered pricing (Free/Standard $12/Pro $29/Team $199) and top-up credit packs.
- **BOOKSTREAM**: OTT Book-to-Video/Audio Streaming Platform with tiered pricing (Standard $7.49 / Pro $14.99 / Family $29.99), 1-video free trial (device fingerprinted), and dubbing credit packs (Pocket $2.99 / Binge $7.49 / Ultimate $19.49).

User uploaded a "Vivid Cinematic" design (dark charcoal + lime green Montserrat) and wants **Book Stream as a section INSIDE the unified VEDED Creative Suite** (single app shell), backed by a shared user/credit system.

## Architecture (delivered in iteration 1)
- **Backend**: FastAPI + Motor (async MongoDB). Modules: `server.py`, `auth.py` (JWT+bcrypt), `plans.py` (pricing/content catalog), `routes_auth.py`, `routes_veded.py`, `routes_bookstream.py`, `routes_payments.py`.
- **Frontend**: React 19 + React Router 7, Tailwind + Shadcn UI, Sonner toasts, Framer Motion available. Single `AppShell` with sidebar + top bar + outlet. All 7 studios reuse `GenerationStudio` component.
- **Payments**: Stripe via `emergentintegrations` (Flow B, `STRIPE_API_KEY=sk_test_emergent`). Webhook at `/api/webhook/stripe`; polling at `/api/payments/status/{sid}`. Idempotent credit granting.
- **AI**: Real image gen via `emergentintegrations.llm.openai.image_generation.OpenAIImageGeneration` (gpt-image-1) with automatic Unsplash placeholder fallback. Video/audio/movie return curated placeholder URLs (**MOCKED** — no real Higgsfield / Sarvam yet).
- **Design system**: `#131313` background, `#c3f400` lime primary, Montserrat display / Inter body, `.v-card` / `.v-glass` / glow utilities in `index.css`.

## Personas
1. **Solo creator** (Free/Standard) — quick image/video generation for social.
2. **Pro creator** (Pro) — 4K, commercial rights, priority queue.
3. **Team/Studio** (Team) — long-format movie compiler, shared workspace.
4. **BookStream consumer** — audiobooks, AI web series, cinematic movies with on-demand dubbing.

## Core Requirements
- JWT email/password auth with wallet (image, video, audio_chars, dubbing, cash_balance).
- 7 creation studios (Images, Video, Audio, Movies, Web Series, Shorts, Book Stream).
- BookStream browse + detail + free-trial (device+account fingerprint) + on-demand dubbing (10 Indian languages catalog).
- Stripe checkout for VEDED plans, BookStream plans, and top-up packs.
- Credit deduction on generation; 402 on insufficient balance.

## Delivered — Iteration 1 (2026-07-28)
- ✅ Landing page, signup, login, dashboard, all 7 studio pages
- ✅ Wallet system, credit deduction, creation gallery
- ✅ Book Stream browse + detail + trial + dubbing UI
- ✅ Pricing page with 3 tabs (VEDED / BookStream / Top-Ups), Stripe checkout wired
- ✅ Payment success/cancel pages with polling
- ✅ 25/25 backend tests + E2E Playwright pass at 100%

## P0 / P1 Backlog (deferred)
- **P0** — Real Higgsfield video generation integration (currently placeholder MP4s).
- **P0** — Real Sarvam AI Bulbul v3 TTS + dubbing integration (currently placeholder MP3s).
- **P1** — Razorpay/UPI gateway alongside Stripe for INR (Stripe sandbox doesn't support IN country).
- **P1** — Long-format Movie Compiler pipeline (script segmenter + parallel dispatch + FFmpeg stitching on AWS Lambda / Railway).
- **P1** — Webhook + WebSocket for async job completion notifications.
- **P2** — Team plan seat management, shared workspace, BookStream creator upload flow with 10% kickback tracking.
- **P2** — Kids profile filters, offline downloads, "Read-Along" live sessions.

## Config Notes
- Merchant display name enforced client-side via app branding (Stripe checkout inherits sandbox display name; live-mode branding is set on the claimed Stripe account).
- The Razorpay payout phone `9673856312` is documented in `.env` but not yet wired — pending live Razorpay credentials.
