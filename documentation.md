# PIM System Documentation

This document provides a deep dive into the technical design decisions, assumptions, and architectural choices made during the development of the PIM System Integration.

## 1. Design Decisions & Rationale

### Next.js 16 & App Router
The App Router was selected for its native support for **Server Components**, allowing the PIM to fetch product and attribute data directly from the SQLite database with zero client-side overhead. This ensures the dashboard loads instantly even with a large product catalog.

### Prisma ORM + SQLite
For a hackathon setting, portability is key. **SQLite** was chosen because it stores everything in a single `.db` file, requiring no complex database setup (Postgres/MySQL) for the judges or future developers to run the project. **Prisma** provides type-safe database access, reducing potential runtime errors in the sync logic.

### Tailwind CSS & Lucide Icons
To achieve a **premium, industrial aesthetic**, we used highly customized Tailwind utilities, including:
- **Glassmorphism**: Using `bg-slate-900/50` and `backdrop-blur`.
- **Vibrant Badges**: HSL-tailored status colors for immediate visual hierarchy.
- **Responsive Layout**: A fluid sidebar and main container design.

---

## 2. Technical Assumptions

- **One-Way Mastery**: It is assumed that the PIM is the primary source of truth. Manual edits made in the WooCommerce dashboard will be overwritten if the PIM record is re-synced.
- **REST API Version**: The system is built against **WooCommerce REST API v3**. 
- **SKU Uniqueness**: The synchronization logic relies on the `SKU` field being globally unique and consistent across both systems.
- **Authentication**: Authentication is assumed to be handled via **Basic Auth** over an HTTPS connection to ensure Consumer Secrets are never transmitted in plain text.

---

## 3. Data Flow Architecture

1. **Input**: User creates or edits a product in the Next.js frontend.
2. **Storage**: Data is committed to the local SQLite database via Prisma.
3. **Trigger**: User clicks "Sync" which hits a Next.js API route (`/api/products/[id]/sync`).
4. **Processing**: The `syncProductToWoo` service maps PIM schemas to WooCommerce schemas.
5. **Output**: The WooCommerce REST API is called (POST for new, PUT for updates).
6. **Logging**: The result (Success/Error) is logged back to the PIM `SyncLog` table for auditability.
