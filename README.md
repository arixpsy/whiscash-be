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

- **Runtime**: Node.js (v18+ recommended)
- **Framework**: Express.js
- **Language**: TypeScript
- **ORM & Migrations**: Drizzle ORM
- **Database**: PostgreSQL (Neon Database)
- **Authentication**: Clerk
- **AI Integration**: OpenAI (LangChain for image/receipt extraction)
- **Validation**: Zod (with zod-express-middleware)
- **Logging**: Consola, Morgan
- **File Uploads**: Multer
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

- `GET /api/wallet` - Retrieve all wallets for the authenticated user. Supports filtering via query parameters (e.g., by currency, country, or archived status).

  **Request:**
  - Requires authentication.
  - Optional query parameters for filtering.

  **Response:**
  - Returns an array of wallet objects belonging to the user.

- `GET /api/wallet/dashboard` - Retrieve wallets for dashboard view, optimized for summary or analytics display.

  **Request:**
  - Requires authentication.
  - Optional query parameters for dashboard customization.

  **Response:**
  - Returns an array of wallet objects with dashboard-specific data.

- `GET /api/wallet/main` - Retrieve all main wallets (not sub-wallets) for the authenticated user.

  **Request:**
  - Requires authentication.

  **Response:**
  - Returns an array of main wallet objects.

- `GET /api/wallet/:walletId` - Retrieve a specific wallet by its ID.

  **Request:**
  - Requires authentication.
  - Path parameter: `walletId` (integer)

  **Response:**
  - Returns the wallet object if found and owned by the user.

- `POST /api/wallet` - Create a new wallet.

  **Request:**
  - Requires authentication.
  - JSON body: `{ name, spendingPeriod, currency, country, subWalletOf (optional) }`

  **Response:**
  - Returns the created wallet object.

- `PUT /api/wallet/:walletId` - Update an existing wallet's details.

  **Request:**
  - Requires authentication.
  - Path parameter: `walletId` (integer)
  - JSON body: Fields to update (e.g., name, currency, etc.)

  **Response:**
  - Returns the updated wallet object.

- `DELETE /api/wallet/:walletId` - Delete a wallet by its ID.

  **Request:**
  - Requires authentication.
  - Path parameter: `walletId` (integer)

  **Response:**
  - Returns the deleted wallet object or a success message.

- `PUT /api/wallet/:walletId/archive` - Archive or unarchive a wallet (toggle archive status).

  **Request:**
  - Requires authentication.
  - Path parameter: `walletId` (integer)

  **Response:**
  - Returns the updated wallet object with new archive status.

- `GET /api/wallet/:walletId/chart` - Retrieve chart/analytics data for a specific wallet.

  **Request:**
  - Requires authentication.
  - Path parameter: `walletId` (integer)
  - Optional query parameters for chart customization.

  **Response:**
  - Returns chart data for the wallet.

- `GET /api/wallet/:walletId/transaction` - Retrieve transactions for a specific wallet.

  **Request:**
  - Requires authentication.
  - Path parameter: `walletId` (integer)
  - Optional query parameters: `limit`, `offset`, etc.

  **Response:**
  - Returns an array of transaction objects for the wallet.

### Transactions

- `GET /api/transaction` - Retrieve all transactions for the authenticated user. Supports filtering by date, limit, and offset.

  **Request:**
  - Requires authentication.
  - Optional query parameters: `date`, `limit`, `offset`.

  **Response:**
  - Returns an array of transaction objects.

- `GET /api/transaction/search` - Search all transactions for the authenticated user by a search phrase.

  **Request:**
  - Requires authentication.
  - Query parameter: `searchPhrase` (string)
  - Optional: `limit`, `offset`.

  **Response:**
  - Returns an array of matching transaction objects.

- `GET /api/transaction/:transactionId` - Retrieve a specific transaction by its ID.

  **Request:**
  - Requires authentication.
  - Path parameter: `transactionId` (integer)

  **Response:**
  - Returns the transaction object if found and owned by the user.

- `POST /api/transaction` - Create a new transaction.

  **Request:**
  - Requires authentication.
  - JSON body: `{ amount, category, description, walletId, paidAt }`

  **Response:**
  - Returns the created transaction object.

- `PUT /api/transaction/:transactionId` - Update an existing transaction.

  **Request:**
  - Requires authentication.
  - Path parameter: `transactionId` (integer)
  - JSON body: Fields to update (e.g., amount, category, etc.)

  **Response:**
  - Returns the updated transaction object.

- `DELETE /api/transaction/:transactionId` - Delete a transaction by its ID.

  **Request:**
  - Requires authentication.
  - Path parameter: `transactionId` (integer)

  **Response:**
  - Returns the deleted transaction object or a success message.

### Images

- `POST /api/image` - Upload an image (such as a receipt or invoice) for automated expense extraction.

  **Request:**
  - Accepts a single image file (multipart/form-data, field name: `image`).
  - Requires user authentication and that the image endpoint is enabled for the user.

  **Behavior:**
  - The uploaded image is analyzed using an AI model to extract expense details, including:
    - `amount`: The total amount spent (if explicitly shown).
    - `paidAt`: The local date and time of the expense (if shown), converted to UTC ISO 8601 format.
    - `description`: A concise description (e.g., store name or item).
    - `category`: The most suitable category from a predefined list.
  - Only fields that can be reliably extracted are included in the response.
  - The endpoint returns a JSON object with the extracted fields.
  - The uploaded file is deleted after processing.

  **Response Example:**

  ```json
  {
    "amount": 12.34,
    "category": "Food",
    "description": "Coffee Shop",
    "paidAt": "2025-07-20T06:21:00Z"
  }
  ```

  If a field cannot be reliably extracted, it is omitted from the response.

## Scripts

- `yarn dev` - Start the development server with hot reloading
- `yarn build` - Build the project for production
- `yarn start` - Start the production server
- `yarn format` - Format code with Prettier
- `yarn type-check` - Check TypeScript types

## Database Schema

### Settings

- id (Primary Key)
- userId (from Clerk)
- timezone
- imageEndpointCount
- imageEndpointInputTokenUsage
- imageEndpointEnabled

### Wallets

- id (Primary Key)
- userId (from Clerk)
- name
- currency
- country
- spendingPeriod
- orderIndex
- archivedAt (nullable)
- subWalletOf (nullable)
- createdAt
- updatedAt
- deletedAt (nullable)

### Transactions

- id (Primary Key)
- walletId (Foreign Key to Wallet)
- amount
- category
- description
- paidAt
- subscriptionId (nullable)
- createdAt
- updatedAt
- deletedAt (nullable)

## License

ISC License - See LICENSE file for details

## Author

Arix Phua
