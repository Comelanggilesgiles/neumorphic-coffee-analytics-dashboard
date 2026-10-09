# Beanora Neumorphic Coffee Analytics Dashboard

A soft, neumorphic market-intelligence dashboard for a coffee business, built with React, Vite and Tailwind CSS.

## Description

Beanora is a single-page analytics dashboard that shows sales, products, customers, inventory and market trends for a fictional coffee brand. It uses a neumorphic (soft raised and pressed) design with a warm ivory theme and a deep forest-green theme. All data is simulated, so there is no backend and no API key to set up.

This project teaches how to build a data dashboard with React and TypeScript, how to draw charts with Recharts, how to create a neumorphic design system with Tailwind CSS, and how to export data as a CSV file in the browser.

## Screenshot

![Beanora dashboard](/pic/dashboard.jpeg)

Replace `docs/screenshot.png` with a screenshot of your running app (see "Add your screenshot" below).

## Key Features

- KPI cards with count-up animations and change versus the previous period
- Revenue, beverage mix, product performance and customer growth charts
- Market trends panel
- Date range switch: last 7, 30 or 90 days
- Product table with search, category filter, sortable columns and pagination
- Inventory and supplies overview
- AI-style business insights panel
- Light (warm ivory) and dark (forest green) themes
- Collapsible sidebar with scroll-spy navigation, plus a mobile menu
- One-click CSV export of the product performance report
- Loading skeleton screen and responsive layout

## Tech Stack

- React 19
- TypeScript 5
- Vite 7
- Tailwind CSS 4
- Recharts 3
- clsx and tailwind-merge
- vite-plugin-singlefile (builds the app into one HTML file)

## Install and Run (about 5 minutes)

### Requirements

- Node.js 18 or newer (download from https://nodejs.org)
- Git (optional, only needed to clone)

### Steps

1. Get the code.

   ```bash
   git clone https://github.com/Comelanggilesgiles/neumorphic-coffee-analytics-dashboard.git
   cd neumorphic-coffee-analytics-dashboard
   ```

2. Install dependencies.

   ```bash
   npm install
   ```

3. Start the development server.

   ```bash
   npm run dev
   ```

4. Open the address shown in the terminal (usually http://localhost:5173).

### Build for production

```bash
npm run build
npm run preview
```

The build creates a single self-contained file at `dist/index.html`.

## Usage

- Use the sidebar to jump between Overview, Sales Analytics, Products, Customers, Inventory, Market Trends, Reports and Settings.
- Pick Last 7, 30 or 90 days in the header to update every chart and KPI.
- Search, filter and sort the product table.
- Open Settings and Reports to switch theme, collapse the sidebar, or download the CSV report.

## Add your screenshot

1. Run the app and open it in your browser.
2. Take a screenshot of the dashboard.
3. Save it as `screenshot.png` and put it in the `docs` folder.
4. Commit and push the file.

## Project Structure

```
src/
  App.tsx              Page layout, settings, CSV export
  index.css            Neumorphic styles and animations
  components/          Header, Sidebar, Kpis, Charts, ProductTable, Inventory, Icons
  lib/data.ts          Simulated data and calculations
  lib/theme.tsx        Theme provider and chart colors
  utils/cn.ts          Class name helper
```

## Notes

All numbers are generated sample data and do not represent a real business.
