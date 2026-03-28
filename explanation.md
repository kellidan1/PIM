# Codebase Explanation: PIM System Integration

This guide provides a detailed walkthrough of the PIM System codebase, explaining how the components interact to manage product data and synchronize it with WooCommerce.

## 1. Directory Structure

- `src/app/`: The core Next.js application logic using the App Router.
  - `page.tsx`: The main **Dashboard Overview**, aggregating stats and recent activity.
  - `products/page.tsx`: The master **Product Catalog** showing all inventory.
  - `attributes/page.tsx`: Management interface for **Global Attributes**.
  - `sync/page.tsx`: A dedicated view for the **Synchronization Audit Logs**.
  - `api/`: Backend routes handling Prisma database operations and WooCommerce API calls.
- `src/components/`: Reusable UI components (Sidebar, StatusBadge, SyncButton).
- `src/lib/`: Utility services (Prisma client and WooCommerce integration wrapper).
- `prisma/`: Database schema and seeding scripts.

---

## 2. Core Logic Walkthrough

### Database Mastery (Prisma)
The heart of the PIM is `prisma/schema.prisma`. It defines four key models:
1. **Product**: The central record for title, price, and SKU.
2. **Attribute**: Global definitions (e.g., "Color").
3. **AttributeValue**: A join-model that links specific values (e.g., "Space Gray") to a product and an attribute.
4. **SyncLog**: Tracking the history of all outgoing sync events.

### WooCommerce Synchronization (`src/lib/woocommerce.ts`)
The `syncProductToWoo` function is the engine of the integration:
- **SKU Matching**: It first queries WooCommerce for an existing product with the same SKU.
- **POST/PUT Logic**: If the SKU exists, it uses `PUT` to update the product; otherwise, it uses `POST` to create it.
- **Schema Mapping**: It transforms the PIM's normalized attribute structure into the `attributes` array format required by the WooCommerce REST API.

### Dashboard Stats (`src/app/page.tsx`)
The dashboard uses **Parallel Data Fetching** with `Promise.all` to retrieve products, logs, and total counts from the database simultaneously. This ensures the fastest possible initial page load.

---

## 3. How Synchronization Works

1. **User Action**: When you click the **Sync** button in the dashboard or catalog.
2. **API Trigger**: A `POST` request is sent to `/api/products/[id]/sync`.
3. **PIM Retrieval**: The API fetches the full product record from SQLite, including its linked attributes.
4. **Outbound Call**: The `woocommerce.ts` service communicates with the external WordPress store.
5. **Finalization**: 
   - On success, the PIM status updates to **'synced'**.
   - A success/failure entry is added to `SyncLog`.
   - The user interface reflects the change immediately via `router.refresh()`.

---

## 4. Key Scripts

- `npm run dev`: Starts the Next.js development server.
- `npx prisma db push`: Pushes the current schema to the SQLite database.
- `npx tsx prisma/seed.ts`: Populates the PIM with initial demonstration data.

> [!IMPORTANT]
> **Extensibility**: To add support for another channel (like Shopify), simply create a new service in `src/lib/` and add a corresponding sync button to the UI.
