# Motia Next.js Demo

This project demonstrates the power and simplicity of building full-stack
applications with **Motia** and Next.js.

## What is Motia?

[Motia](https://www.motia.dev/) is a revolutionary backend framework that
transforms how developers approach backend logic. It simplifies state management
by treating your backend state as a first-class citizen, allowing you to focus
on business logic rather than infrastructure boilerplate.

With Motia, you can:

- **Build reactive backends** with minimal code.
- **Manage state effortlessly** without complex database setups for prototyping.
- **Seamlessly integrate** with modern frontend frameworks like Next.js.

This demo showcases a ticketing and event management system, leveraging Motia's
state capabilities to handle bookings, events, and real-time updates.

## Project Structure

This is a monorepo workspace managed with `pnpm`:

- **`front/`**: The Next.js frontend application. It handles the UI, routing,
  and interacts with the Motia backend.
- **`motia/`**: The Motia backend application. It contains the business logic,
  API endpoints, and state management rules.

## Getting Started

Follow these steps to get the project running on your local machine.

### Prerequisites

- Node.js (v18 or higher)
- pnpm

### Installation

1. Install dependencies from the root directory:
   ```bash
   pnpm install
   ```

### Running the Application

1. Start the development server:
   ```bash
   pnpm dev
   ```
   This command concurrently starts both the Next.js frontend
   (http://localhost:3000) and the Motia backend (http://localhost:8080).

### 🌱 Important: Seeding Data

Since this demo uses Motia's ephemeral state management, the application starts
with an empty database every time you restart the backend. To populate the
application with sample events, you must run the seeding script **while the
server is running**.

1. Open a **new terminal window** (keep `pnpm dev` running in the first one).
2. Run the seed script:
   ```bash
   node seed-events.js
   ```

You should see output confirming the creation of 5 sample events. Refresh your
browser at http://localhost:3000 to see them.

## Learn More

To learn more about Motia and how it's transforming backend development, visit
the official website: 👉 **[https://www.motia.dev/](https://www.motia.dev/)**
