# Vantage Impact Backend

A production-ready Node.js + Express + MongoDB backend for a Golf Charity Subscription Platform.

## Architecture

**Strict MVC Pattern:**

- **Routes**: URL mapping + middleware + controller delegation
- **Controllers**: Request handling + service orchestration
- **Services**: Business logic + database interaction
- **Models**: Mongoose schemas with validation
- **Middleware**: Cross-cutting concerns
- **Utils**: Pure functions for common operations

## Installation

```bash
npm install
```

## Environment Setup

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Key variables:

- `MONGO_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT signing
- `STRIPE_SECRET_KEY`: Stripe API key
- `SMTP_*`: Email configuration
- `CLIENT_URL`: Frontend URL for redirects

## Running the Server

**Development:**

```bash
npm run dev
```

**Production:**

```bash
npm start
```

## Admin Bootstrap

To promote an existing user to admin:

```bash
npm run make-admin -- admin@example.com
```

To create a brand new admin user:

```bash
npm run make-admin -- admin@example.com "Admin User" "securepass123"
```

This updates the user's `role` to `admin`, which is what the frontend admin login checks for.

## API Endpoints

### Authentication (`/api/auth`)

- `POST /register` - Register new user
- `POST /login` - Login user
- `GET /me` - Get current user profile

### Users (`/api/users`)

- `GET /` - Get user profile
- `PUT /` - Update user profile

### Scores (`/api/scores`)

- `GET /` - Get user's last 5 scores
- `POST /` - Add a new score
- `PUT /` - Replace all scores

### Subscriptions (`/api/subscriptions`)

- `POST /checkout` - Create Stripe checkout session
- `POST /webhook` - Handle Stripe webhooks
- `GET /` - Get user's active subscription
- `PUT /charity` - Update charity selection
- `DELETE /` - Cancel subscription

### Draws (`/api/draws`)

- `GET /history` - Get published draws (paginated)
- `GET /draft` - Get current draft draw (admin only)
- `POST /:id/simulate` - Simulate draw results (admin only)
- `POST /:id/publish` - Publish draw and create winners (admin only)

### Charities (`/api/charities`)

- `GET /` - List charities (filterable, searchable)
- `GET /:id` - Get charity details
- `POST /` - Create charity (admin only)
- `PUT /:id` - Update charity (admin only)
- `DELETE /:id` - Delete charity (soft delete, admin only)

### Winners (`/api/winners`)

- `GET /` - Get user's wins and winnings
- `POST /:winnerId/proof` - Upload proof of golf score

### Admin (`/api/admin`)

- `GET /stats` - Platform statistics
- `GET /users` - List all users (searchable, paginated)
- `PUT /users/:id` - Update user role/status
- `GET /winners` - List all winners (filterable)
- `PUT /winners/:winnerId/verify` - Approve/reject/pay winners

## Data Models

### User

- name, email, password (hashed), role (user/admin)
- charityId, charityPercent (10-50%)
- isActive, timestamps

### Score

- userId, value (1-45 Stableford), date
- Indexed by { userId, date }

### Subscription

- userId, plan (catalyst/architect/foundational)
- billing (monthly/yearly), status
- charityId, charityPercent
- Stripe integration fields

### Draw

- month (YYYY-MM), numbers (5 unique)
- logic (random/algorithmic), totalPool
- pools { fiveMatch, fourMatch, threeMatch }
- status (draft/simulated/published)

### DrawEntry

- drawId, userId, scores, matchCount, tier
- Unique on { drawId, userId }

### Charity

- name, category, description, impact
- raised, imageUrl, events, featured
- isActive (soft delete)

### Winner

- drawId, userId, tier, prizeAmount
- proofUrl, paymentStatus, paidAt
- adminNotes

## Prize Pool Distribution

- **5-Match**: 40% of pool (rolls over if no winner)
- **4-Match**: 35% of pool
- **3-Match**: 25% of pool

## Key Features

✅ **JWT Authentication** - Secure token-based auth  
✅ **Role-Based Access Control** - Admin vs user roles  
✅ **Stripe Integration** - Subscription + webhook handling  
✅ **Email Notifications** - Welcome, draw results, winners, payments  
✅ **Input Validation** - Express-validator on all endpoints  
✅ **Rate Limiting** - 100 req per 15 min  
✅ **Security** - Helmet, CORS, password hashing  
✅ **Draw Engine** - Random + algorithmic draw logic  
✅ **Error Handling** - Centralized error middleware

## Testing with cURL

### Register User

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securepass123"
  }'
```

### Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "securepass123"
  }'
```

### Get Profile (requires token from login)

```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Add Golf Score

```bash
curl -X POST http://localhost:5000/api/scores \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "value": 38,
    "date": "2026-03-18T00:00:00Z"
  }'
```

## Deployment

1. Set production environment variables
2. Ensure MongoDB is accessible
3. Configure Stripe webhook endpoint in Stripe dashboard
4. Use process manager (PM2) for production:
   ```bash
   pm2 start server.js --name vantage-backend
   ```

## License

ISC
