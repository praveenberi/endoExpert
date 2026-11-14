# ENDO EXPERT – MICROENDODONTICS

Public website + admin CMS, built from the shared ChatGPT spec.
Stack: React + Vite, Tailwind CSS, Framer Motion, Three.js (React Three Fiber), Supabase (Auth, Postgres, Storage).

```bash
npm install
npm run dev        # http://localhost:5173  (admin at /admin)
npm run build
```

## Two modes
- **Demo mode (default)** – no setup. Content, appointments and images live in browser localStorage.
  Admin password = `VITE_DEMO_ADMIN_PASSWORD` (default `admin123`). Demo only – not secure.
- **Supabase mode** – copy `.env.example` to `.env`, fill `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`, then:
  1. Run `supabase/schema.sql` in the Supabase SQL editor (tables, RLS, booking RPCs, `media` storage bucket).
  2. Authentication → Users → create the admin user.
  3. `insert into admin_users (user_id, role) values ('<user uuid>', 'admin');`
  4. Authentication → URL config: add your site URL (needed for password reset).

## What is where
- `src/pages` public pages · `src/components` sections, 3D tooth, magnification explorer, booking form
- `src/admin` dashboard: page content, sections & layout (drag reorder / hide / delete / add), media library,
  treatments, doctor, appointments, testimonials, FAQs, SEO, settings (branding, contact, hours), live preview, version history
- `src/lib/defaultContent.js` seed copy (all editable in admin) · `src/lib/store.js` data layer (Supabase or local)
- Draft → Publish workflow: edits auto-save to a draft; **Publish** makes them live and stores a restorable revision.

## Content you must supply (nothing is invented)
Doctor qualifications/experience/memberships, clinic address, phone/WhatsApp/email, map URL, photos, and real testimonials.
The testimonials section stays hidden until you add genuine ones. Sundays can never be booked.
