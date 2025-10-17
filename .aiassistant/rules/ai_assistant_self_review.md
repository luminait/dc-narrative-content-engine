---
apply: always
---

# luminAIt AI Self-Review Rules
_Ensures all generated code aligns with luminAIt standards, Next.js 15.5.3 best practices, and secure Supabase/n8n integration._

---

## 1️⃣ Architecture Compliance
✅ Confirm that:
- All **routes** live in `app/` and follow the structure:
  `/campaigns`, `/campaigns/[id]`, `/campaigns/[id]/posts`, `/campaigns/[id]/posts/[id]`
- All **business logic** lives under `src/` (never in `app/`).
- **Server-only code** resides in `src/server/` or server actions/route handlers.
- **Client components** declare `"use client"` at the top.
- Shared UI is reusable, not duplicated (`src/components/` or `packages/ui`).

❌ Reject if:
- Logic is mixed in client components.
- Supabase admin/service key appears in client code.

---

## 2️⃣ Security & Data Integrity
✅ Ensure:
- Supabase RLS is assumed ON.
- Service keys are used only in server context.
- n8n webhooks include HMAC or JWT verification.
- Sensitive env vars never referenced in browser bundles.

❌ Reject if:
- Any `process.env.SUPABASE_SERVICE_ROLE_KEY` used in client code.
- Webhook POSTs lack signature verification.

---

## 3️⃣ Caching, Data Fetching, and Performance
✅ For each data fetch:
- Reads use `fetch(..., { next: { tags: ['resource'] } })`.
- Writes call `revalidateTag('resource')`.
- Route handlers default to **dynamic**; opt-in static only for safe GETs.

❌ Reject if:
- No `revalidateTag()` after writes.
- Uncached expensive GETs in client components.

---

## 4️⃣ Type Safety & Validation
✅ Always:
- Use **Zod** schemas for any form, input, or payload validation.
- Infer types with `z.infer`.
- Keep schemas in `src/lib/zod` or feature-level `*.schema.ts`.

❌ Reject if:
- Manual string parsing or untyped input handling.

---

## 5️⃣ File & Folder Hygiene
✅ Check:
- Naming uses lowerCamelCase for files, PascalCase for components.
- Folders align with luminAIt structure.
- Each new feature includes `schema.ts`, `List.tsx`, and `Details.tsx`.

❌ Reject if:
- Ad-hoc folders outside `app/` or `src/features/`.

---

## 6️⃣ Code Style & Tooling
✅ Require:
- ESLint/Prettier compatible syntax.
- Tailwind classes readable and scoped.
- Strict TypeScript types; no `any`.

❌ Reject if:
- Missing type annotations or inconsistent Tailwind classes.

---

## 7️⃣ Self-Reflection Checklist
After generating code, the AI should self-ask:
1. Does this code respect server/client boundaries?
2. Did I use Zod for validation?
3. Did I include `revalidateTag` after mutations?
4. Are secrets confined to the server?
5. Is the output modular, reusable, and readable?

If any “No,” regenerate or fix before returning.

---

**Goal:**  
Every AI output must be *secure, modular, type-safe, and production-ready* — in line with luminAIt’s “Discover → Empower → Transform” philosophy.
