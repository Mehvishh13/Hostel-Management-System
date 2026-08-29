# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Students and one admin role at a single hostel. Students raise complaints, upvote/comment on others' complaints, list items for sale/rent in a marketplace, and create or join social/event groups. The admin (also acting as warden — no separate role) resolves complaints, marking them updated/solved, and moderates groups/marketplace. Primary usage is on phones, in English.

## Product Purpose

Digitizes three things that currently happen informally in the hostel: complaint reporting to the warden/admin, peer-to-peer buying/selling of items among residents, and organizing/announcing social events or interest groups. Success is students actually using it instead of word-of-mouth/WhatsApp — complaints get tracked and resolved visibly, marketplace listings connect buyer and seller by room number, and events reach the whole hostel instead of just one group chat.

## Positioning

Not a generic ticketing tool — it's scoped specifically to one hostel's shared life: complaints are visible and upvotable by all residents (social pressure + prioritization signal), marketplace payment/handoff is peer-to-peer via room number (no payment processing needed), and "groups" double as both persistent clubs and one-off event notices.

## Operating Context

Single hostel, single deployment. All students and the admin share one pool of complaints, marketplace listings, and groups — no multi-hostel/multi-tenant scoping. Deployed for real day-to-day use (not a demo); students will hit it from their phones primarily.

## Capabilities and Constraints

- Auth: JWT-based register/login, roles are `student` / `admin` (schema also allows `warden` but product decision is admin-only, single authority role for now)
- Complaints: create, upvote, comment/reply with like-dislike, admin marks status/resolution
- Marketplace: list items for sale/rent, buyer expresses interest, contact/payment handled peer-to-peer via room number (no in-app payment)
- Groups: create/join public or private groups, category includes `events` — used both as ongoing clubs and as event/notice announcements
- No forgot-password flow yet (open gap, not yet decided if needed before launch)
- No image upload on complaints/listings yet (text only)
- Mobile-first is the primary constraint — most real usage will be on phones, not desktop
- English only, no localization requirement

## Evidence on Hand

Existing implemented codebase (MERN: Express/Mongoose backend, React/Vite frontend) with complaints, groups, and rentals modules already functional end-to-end (verified via smoke test, 34/34 passing as of last session). No existing brand assets, logo, or visual design system — frontend currently uses plain per-page CSS files with no documented design language.

## Product Principles

- Visibility over ticketing: complaints and events should be seen by the whole hostel, not siloed — upvoting and public groups are core, not optional
- Peer-to-peer, not platform-mediated: marketplace payment/logistics stay outside the app (room number contact) — don't build payment processing
- Mobile is the real usage context — every surface must work first on a phone screen
- One authority role: don't split admin/warden permissions unless a real need shows up
- Ship what's needed for the three core loops (complaints, marketplace, groups/events) before adding new modules
