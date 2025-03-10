# Whiscash Backend API

Whiscash is a personal finance tracking application backend API built with Express.js, TypeScript, and PostgreSQL (via Neon Database). The API provides endpoints for managing wallets and transactions with user authentication powered by Clerk.

## Features

- **User Authentication**: Secure authentication using Clerk
- **Wallet Management**: Create, read, update, and delete wallets
- **Transaction Tracking**: Record financial transactions with categorization
- **Rate Limiting**: Protection against excessive requests
- **Database**: PostgreSQL with Drizzle ORM for database interactions
- **Type Safety**: Built with TypeScript for better code quality

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **ORM**: Drizzle ORM
- **Database**: PostgreSQL (Neon Database)
- **Authentication**: Clerk
- **Logging**: Consola, Morgan
- **Schema Validation**: Zod
- **Development Tools**:
  - TSX for TypeScript execution
  - Prettier for code formatting
  - Simple Git Hooks for pre-commit checks

## Project Structure

```
whiscash-be/
├── drizzle/            # Drizzle migrations
├── src/
│   ├── @types/         # TypeScript type definitions
│   ├── controllers/    # Request handlers
│   ├── dao/            # Data Access Objects
│   ├── db/             # Database setup and schema
│   ├── middleware/     # Express middleware
│   ├── routes/         # API routes
│   ├── utils/          # Utility functions
│   └── index.ts        # Application entry point
├── .env                # Environment variables
├── drizzle.config.ts   # Drizzle configuration
├── tsconfig.json       # TypeScript configuration
└── package.json        # Project dependencies
```

## Setup

### Prerequisites

- Node.js (v16 or higher)
- Yarn package manager
- PostgreSQL database (or Neon Database account)
- Clerk account for authentication

### Installation

1. Clone the repository

   ```
   git clone https://github.com/yourusername/whiscash-be.git
   cd whiscash-be
   ```

2. Install dependencies

   ```
   yarn install
   ```

3. Create a `.env` file in the root directory with the following variables:

   ```
   PORT=9000
   DATABASE_URL=your_postgres_connection_string
   CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key
   ```

4. Generate database schema

   ```
   yarn drizzle-kit generate
   ```

5. Run the development server
   ```
   yarn dev
   ```

## API Endpoints

### Health Check

- `GET /healthcheck` - Check if the server is running

### Wallets

- `GET /api/wallet` - Get all wallets for the authenticated user with optional filtering
- `GET /api/wallet/dashboard` - Get all wallets for dashboard view
- `GET /api/wallet/main` - Get all main wallets (not sub-wallets)
- `GET /api/wallet/:walletId` - Get a specific wallet by ID
- `POST /api/wallet` - Create a new wallet

### Transactions

- `GET /api/transaction` - Get transactions by wallet ID (via query parameter)
- `POST /api/transaction` - Create a new transaction
- `DELETE /api/transaction/:transactionId` - Delete a transaction

## Scripts

- `yarn dev` - Start the development server with hot reloading
- `yarn build` - Build the project for production
- `yarn start` - Start the production server
- `yarn format` - Format code with Prettier
- `yarn type-check` - Check TypeScript types

## Database Schema

### Wallets

- id (Primary Key)
- userId (from Clerk)
- name
- currency
- country
- spendingPeriod
- orderIndex
- archivedAt
- subWalletOf
- timestamps (createdAt, updatedAt, deletedAt)

### Transactions

- id (Primary Key)
- walletId (Foreign Key to Wallet)
- amount
- category
- description
- paidAt
- subscriptionId
- timestamps (createdAt, updatedAt, deletedAt)

## License

ISC License - See LICENSE file for details

## Author

Arix Phua
