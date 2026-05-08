# Currency Conversion API

A RESTful API built with NestJS that provides real-time currency conversion services. The API fetches exchange rates from an external source, caches them for optimal performance, and stores conversion history in a PostgreSQL database.

## Table of Contents

- [Technologies Used](#technologies-used)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Setup Instructions](#setup-instructions)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Project Structure](#project-structure)
- [Assumptions Made](#assumptions-made)

## Technologies Used

- **Framework**: NestJS v11.0.1
- **Language**: TypeScript v5.7.3
- **Database**: PostgreSQL (Neon Cloud Database)
- **ORM**: TypeORM v0.3.28
- **Caching**: Cache Manager v7.2.8
- **Validation**: Class Validator & Class Transformer
- **HTTP Client**: Axios v1.16.0
- **Testing**: Jest v30.0.0
- **Code Quality**: ESLint & Prettier

## Features

- Real-time currency conversion using external exchange rates API
- Intelligent caching mechanism (5-minute TTL) to reduce external API calls
- Conversion history tracking with PostgreSQL
- Input validation using class-validator
- Comprehensive error handling
- Unit tests with Jest
- RESTful API design
- TypeORM migrations for database schema management

## Prerequisites

Before setting up the project, ensure you have the following installed:

- **Node.js**: v18.x or higher
- **npm**: v9.x or higher
- **Neon Account**: Free account at [neon.tech](https://neon.tech) for PostgreSQL database
- **Git**: For cloning the repository

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd currency-conversion
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Database Configuration
DB_HOST=your-database-host
DB_PORT=5432
DB_USERNAME=your-database-username
DB_PASSWORD=your-database-password
DB_DATABASE=your-database-name
DATABASE_LOGGING=false

# External API
CURRENCY_RATES_API_URL=https://staging-api.payfusion.io/transactions/public/v1/currency-rates
```

**Note**: The project includes environment validation using Joi. Missing required variables will prevent the application from starting.

## Database Setup

This project uses **Neon** as the PostgreSQL cloud database provider.

### Steps:

1. **Sign up for Neon**:
   - Visit [neon.tech](https://neon.tech) and create an account

2. **Create a New Project**:
   - Click "Create Project" in the Neon dashboard
   - Choose a project name and region
   - Note down the connection details provided

3. **Configure Environment Variables**:
   - Copy the connection details from Neon
   - Update your `.env` file with the Neon credentials:
   ```env
   DB_HOST=your-neon-host.neon.tech
   DB_PORT=5432
   DB_USERNAME=your_neon_username
   DB_PASSWORD=your_neon_password
   DB_DATABASE=neondb
   ```

### Run Database Migrations

Run migrations to create the required database tables:

```bash
npm run migration:run
```

This will create the `conversions` table with the following schema:

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key (auto-generated) |
| fromCurrency | varchar | Source currency code (e.g., USD) |
| toCurrency | varchar | Target currency code (e.g., EUR) |
| amount | decimal | Original amount to convert |
| exchangeRate | decimal | Exchange rate used |
| convertedAmount | decimal | Calculated result |
| createdAt | timestamp | Record creation time |

### Additional Migration Commands

```bash
# Generate new migration from entity changes
npm run migration:generate --name=MigrationName

# Create empty migration file
npm run migration:create --name=MigrationName

# Revert last migration
npm run migration:revert
```

## Running the Application

### Development Mode

```bash
# Start with file watching
npm run start:dev
```

The API will be available at `http://localhost:3001`

### Production Mode

```bash
# Build the application
npm run build

# Start production server
npm run start:prod
```

### Other Available Scripts

```bash
# Start without watching
npm run start

# Start with debugger
npm run start:debug

# Lint code
npm run lint

# Format code
npm run format
```

## API Documentation

### Base URL

```
http://localhost:3001/api/v1
```

### Endpoints

#### Convert Currency

Converts an amount from one currency to another using current exchange rates.

- **URL**: `/convert`
- **Method**: `POST`
- **Content-Type**: `application/json`

**Request Body**:

```json
{
  "fromCurrency": "USD",
  "toCurrency": "EUR",
  "amount": 100
}
```

**Validation Rules**:
- `fromCurrency`: Required, string, exactly 3 characters, uppercase
- `toCurrency`: Required, string, exactly 3 characters, uppercase
- `amount`: Required, number, must be positive

**Success Response** (200 OK):

```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "fromCurrency": "USD",
    "toCurrency": "EUR",
    "amount": 100,
    "exchangeRate": 0.92,
    "convertedAmount": 92,
    "createdAt": "2024-05-08T10:30:00.000Z"
  }
}
```

**Error Responses**:

1. **Validation Error** (400 Bad Request):
```json
{
  "statusCode": 400,
  "message": [
    "fromCurrency must be exactly 3 characters",
    "amount must be a positive number"
  ],
  "error": "Bad Request"
}
```

2. **Exchange Rate Not Found** (404 Not Found):
```json
{
  "statusCode": 404,
  "message": "Exchange rate not found",
  "error": "Not Found"
}
```

3. **Internal Server Error** (500):
```json
{
  "statusCode": 500,
  "message": "Could not convert currency!",
  "error": "Internal Server Error"
}
```

### Example cURL Request

```bash
curl -X POST http://localhost:3001/api/v1/convert \
  -H "Content-Type: application/json" \
  -d '{
    "fromCurrency": "USD",
    "toCurrency": "EUR",
    "amount": 100
  }'
```

### Example with Different Currencies

```bash
# USD to GBP
curl -X POST http://localhost:3001/api/v1/convert \
  -H "Content-Type: application/json" \
  -d '{
    "fromCurrency": "USD",
    "toCurrency": "GBP",
    "amount": 250.50
  }'

# USD to JPY
curl -X POST http://localhost:3001/api/v1/convert \
  -H "Content-Type: application/json" \
  -d '{
    "fromCurrency": "USD",
    "toCurrency": "JPY",
    "amount": 1000
  }'
```

## Testing

The project includes comprehensive unit tests using Jest.

### Run All Tests

```bash
npm test
```

### Run Tests in Watch Mode

```bash
npm run test:watch
```

### Generate Test Coverage Report

```bash
npm run test:cov
```

Coverage report will be generated in the `coverage/` directory.

### Run Specific Test File

```bash
npm test -- conversion.service.spec.ts
```

### Test Coverage

The `ConversionService` has 10 unit tests covering:
- Exchange rate caching mechanism
- Currency conversion logic
- Database operations
- Error handling (NotFoundException, InternalServerErrorException)
- Input validation
- Correct calculation of converted amounts

## Project Structure

```
currency-conversion/
├── src/
│   ├── core/
│   │   ├── config/                    # Environment configuration
│   │   │   └── config.ts
│   │   └── database/
│   │       ├── typeOrm.config.ts      # TypeORM configuration
│   │       ├── database.module.ts     # Database module
│   │       ├── migrations/            # Database migrations
│   │       └── models/
│   │           └── conversion.model.ts # Conversion entity
│   ├── common/
│   │   ├── filters/                   # Exception filters
│   │   ├── interceptors/              # Response interceptors
│   │   └── http/
│   │       └── conversion.service.ts  # External API service
│   ├── modules/
│   │   └── conversion/
│   │       ├── conversion.controller.ts
│   │       ├── conversion.service.ts
│   │       ├── conversion.service.spec.ts # Unit tests
│   │       ├── conversion.module.ts
│   │       └── dto/
│   │           └── create-conversion.dto.ts
│   ├── app.module.ts                  # Root module
│   ├── app.controller.ts
│   ├── app.service.ts
│   └── main.ts                        # Application entry point
├── test/                              # E2E tests
├── .env                               # Environment variables
├── package.json
├── tsconfig.json
├── nest-cli.json
└── README.md
```

## Assumptions Made

### 1. Exchange Rate Source
- The application uses the PayFusion staging API as the external source for exchange rates
- The API endpoint returns an array of currency rates with `currency`, `sellValue`, and `buyValue` fields
- The `sellValue` is used for all conversion calculations
- The external API is assumed to be reliable and available

### 2. Caching Strategy
- Exchange rates are cached for **5 minutes (300 seconds)** to optimize performance
- This TTL balances between freshness of rates and reducing external API calls
- Cache invalidation is time-based only (no manual invalidation implemented)

### 3. Currency Codes
- All currency codes follow the **ISO 4217 standard** (3-letter codes)
- Currency codes are expected in **uppercase** (e.g., USD, EUR, GBP)
- Validation ensures exactly 3 characters

### 4. Conversion Logic
- Conversions are **unidirectional** (from base currency to target currency)
- The conversion formula: `convertedAmount = amount × exchangeRate`
- Only the `sellValue` from the external API is used (not `buyValue`)
- No commission or fees are applied to conversions

### 5. Data Persistence
- All conversion requests are **stored in the database** for historical tracking
- Each conversion gets a unique UUID
- Records include timestamps for audit purposes
- No deletion or update operations are provided (append-only log)

### 6. Input Validation
- Amount must be a **positive number** (greater than 0)
- Decimal amounts are supported
- Currency codes are required and validated
- Malformed requests return 400 Bad Request with detailed error messages

### 7. Error Handling
- If an exchange rate is not found for the target currency, a **404 Not Found** is returned
- Database errors or external API failures return **500 Internal Server Error**
- All errors follow consistent JSON response format

### 8. Database Schema
- Uses **PostgreSQL** as the primary database
- UUID is used as the primary key for better distribution and uniqueness
- Decimal type is used for amounts to avoid floating-point precision issues
- No soft deletes or archiving implemented

### 9. API Design
- RESTful design principles
- Versioned API (`/api/v1/`)
- JSON request/response format
- Consistent response structure with `data` wrapper

### 10. Environment & Deployment
- Application expects environment variables to be configured via `.env` file
- No default values for sensitive credentials (DB password, etc.)
- Application fails fast if required environment variables are missing
- Suitable for deployment to cloud platforms (Heroku, AWS, etc.)

### 11. Security Considerations
- No authentication/authorization implemented (assumed to be handled by API gateway or added later)
- CORS is enabled for all origins (should be restricted in production)
- Input sanitization through class-validator
- SQL injection protection through TypeORM parameterized queries

## License

This project is [MIT licensed](LICENSE).

## Support

For questions or issues, please contact the development team or open an issue in the repository.
