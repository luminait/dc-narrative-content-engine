---
apply: always
---

## Modern Next.js (App Router) Style Guide

This guide outlines core principles for building applications using **Next.js 15 or later** with the **App Router**, emphasizing TypeScript, performance (via Server Components), and modularity.

### I. Architecture and Components (RSC Priority)

The foundation of a modern Next.js application should prioritize Server Components (RSCs) for maximum performance and simplicity.

| Principle                        | Details and Conventions                                                                                                                                                                                                         | Source Support |
|:---------------------------------|:--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|:---------------|
| **Component Default**            | Components are **RSCs by default**. Start the component tree with RSCs.                                                                                                                                                         |                |
| **Client Component Boundary**    | Components requiring browser-only features (e.g., state, effects, interactivity, or using hooks like `useState` or `useEffect`) **must be Client Components**.                                                                  |                |
| **Client Component Declaration** | Explicitly specify a Client Component by placing the **`'use client'` directive** at the very top of the file.                                                                                                                  |                |
| **Optimized Composition**        | **Maximize performance** by isolating necessary client-side functionality. Pass RSCs (which can contain complex logic/data) as **children or custom props** (e.g., an `icon` prop typed as `ReactNode`) into Client Components. |                |
| **Server Data Access**           | Utilize the ability of **RSCs to be asynchronous** (`async / await`) and perform direct data fetching or database interaction.                                                                                                  |                |
| **Server Data Mutation**         | Use **React Server Functions (Server Actions)**, marked with the **`'use server'`** directive, for mutating database data securely across the client/server network boundary.                                                   |                |

### II. Routing and Navigation

| Element                     | Convention and Usage                                                                                                                                                                          | Source Support |
|:----------------------------|:----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|:---------------|
| **Routes**                  | Defined using the **folder structure** inside the `app` directory.                                                                                                                            |                |
| **Page Files**              | The UI component for a route is defined in a file named **`Dashboard.tsx`**.                                                                                                                       |                |
| **Shared Layout**           | Shared UI elements (like a navigation bar) across routes should be implemented in **`layout.tsx`** files.                                                                                     |                |
| **Dynamic Routes**          | Use **square brackets** (e.g., `[id]`) in the folder name to define dynamic routes. Access parameters via the **`params` prop** (in RSCs) or the **`useParams` hook** (in Client Components). |                |
| **Search Parameters**       | Access URL search/query parameters via the **`searchParams` prop** (in RSCs) or the **`useSearchParams` hook** (in Client Components).                                                        |                |
| **Declarative Linking**     | Use the Next.js **`Link` component** (imported from `next/link`) for navigation between routes. This is the recommended method and works in both RSCs and Client Components.                  |                |
| **Programmatic Navigation** | Use the **`useRouter` hook** for client-side programmatic navigation (`push`, `replace`, `refresh`), ensuring the component is a Client Component.                                            |                |
| **Active Link Styling**     | Determine the active path using the **`usePathname` hook** (requiring the component to be a Client Component) to apply conditional styles.                                                    |                |

### III. Code Quality and Styling

| Area                   | Convention and Practice                                                                                                                                                                         | Source Support |
|:-----------------------|:------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|:---------------|
| **Language**           | Use **TypeScript** (`.tsx` files) for strong typing, which improves editor productivity, readability, and helps catch bugs early.                                                               |                |
| **File Naming**        | Component files should start with a **capital letter** (e.g., `Header.tsx`, `App.tsx`).                                                                                                         |                |
| **Organization**       | Use a designated **`components` folder** for reusable components, separating them from routing components in the `app` folder. For clarity, prefer creating a separate file for each component. |                |
| **Imports**            | Use **import path aliases** (e.g., `@/components/Header`) instead of relative paths (`../components/Header`) for clarity and reduced maintenance when moving files.                             |                |
| **Props/State Syntax** | Use **object destructuring** in function parameters to receive props (`{ title, item }`). Use array destructuring for state hooks (`const [value, setValue] = useState(...)`).                  |                |
| **Code Formatting**    | Utilize **Prettier** for automatic, consistent code formatting.                                                                                                                                 |                |
| **Linting**            | Use **ESLint** to check code for potential errors and adherence to coding standards.                                                                                                            |                |
| **Styling Framework**  | Use **Tailwind CSS** (configured via the `--tailwind` option). Tailwind's utility-first approach helps maintain a consistent design system and produces a very small production CSS bundle.     |                |
| **Dynamic Styling**    | Use **inline styles** only when the styling needs to be dynamically determined (e.g., conditional background colors).                                                                           |                |
| **Assets (SVGs)**      | Import SVG files and reference them as a path in an `img` element or use them as a React component if the appropriate plugin is configured.                                                     |                |
