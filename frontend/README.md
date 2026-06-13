# Frontend Service - Next.js 14

This is the Next.js 14 application providing the user interface for the **Innovation & Collaboration Hub**.

## Ownership & Responsibility
*   **Owner**: IT Team
*   **Shared Responsibilities**: Styling guidelines alignment, responsive validations.

## Setup Instructions
1. Install node dependencies:
   ```bash
   npm install
   ```
2. Copy environment files and configure values:
   ```bash
   cp .env.example .env
   ```
3. Run the development workspace:
   ```bash
   npm run dev
   ```

## Folder Layout
*   `/app`: Handles router layouts, pages, layout schemas, and global CSS themes.
*   `/components`: Holds reusable component structures segmented by functionality.
*   `/lib`: Houses clients clients, constants mappings, TS model schemas, and state stores.
