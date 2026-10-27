# DumpTrade ♻️

**Give what you don't need. Take what you do.**

DumpTrade is a community-driven waste management and material reuse platform that connects households, workshops, businesses, and industries with people who can reuse, repurpose, or responsibly collect unwanted materials.

Instead of sending reusable materials to dumpsites or burning them, DumpTrade encourages a circular economy where waste becomes a resource. The platform also aims to support waste collectors by making their environmental contributions more visible and verifiable.


## 🌍 The Problem

Reusable materials are often discarded because people lack a convenient way to connect with individuals and businesses that need them. This contributes to unnecessary waste, environmental pollution, and the loss of valuable resources.

DumpTrade aims to bridge this gap by providing a platform where people can list unwanted materials, discover available resources, and connect with others who can give those materials a second life.

## 🎯 Project Objectives

- Promote the reuse and recycling of unwanted materials.
- Connect households, workshops, and industries with potential material recipients.
- Reduce unnecessary waste and encourage responsible disposal.
- Make material discovery and collection more accessible.
- Support the development of a community-driven circular economy.
- Build toward transparent, verifiable environmental impact tracking.

## 🛠️ Technology Stack

| Component                             | Technology                      |
| ------------------------------------- | ------------------------------- |
| Backend language                      | Go                              |
| HTTP framework                        | Gin                             |
| Frontend                              | HTML5, CSS3, Vanilla JavaScript |
| Database                              | PostgreSQL                      |
| PostgreSQL driver and connection pool | pgx/v5                          |
| Authentication                        | JWT-based authentication        |
| Password hashing                      | bcrypt                          |
| Database migrations                   | SQL                             |
| API communication                     | HTTP and JSON                   |
| Version control                       | Git                             |

The frontend uses vanilla HTML, CSS, and JavaScript without requiring a frontend build framework. The Go backend exposes HTTP endpoints that the frontend can consume.

PostgreSQL provides persistent storage, while `pgx` manages database connections.

## 🏗️ Architecture

DumpTrade separates the frontend, backend, and database responsibilities.

```text
                 ┌─────────────────────────┐
                 │      Web Browser        │
                 │                         │
                 │ HTML, CSS, JavaScript   │
                 └────────────┬────────────┘
                              │
                         HTTP / JSON
                              │
                 ┌────────────▼────────────┐
                 │       Go Backend       │
                 │                         │
                 │     Gin HTTP Router     │
                 │                         │
                 │  Authentication         │
                 │  Listing Handlers       │
                 │  Middleware             │
                 └────────────┬────────────┘
                              │
                         pgx / pgxpool
                              │
                 ┌────────────▼────────────┐
                 │      PostgreSQL         │
                 │                         │
                 │ Users                   │
                 │ Listings                │
                 │ Claims                  │
                 └─────────────────────────┘
```

## 📁 Project Structure

The repository is organized into a frontend and a Go backend.

```text
dumptrade/
├── backend/
│   ├── db/
│   │   ├── db.go
│   │   ├── db_test.go
│   │   ├── db_integration_test.go
│   │   └── migrations/
│   │       ├── 0001_init.up.sql
│   │       └── 0001_init.down.sql
│   │
│   ├── handlers/
│   │   ├── auth.go
│   │   ├── auth_test.go
│   │   ├── listings.go
│   │   ├── listings_test.go
│   │   ├── postgres_listing_store.go
│   │   ├── postgres_user_store.go
│   │   └── postgres_store_integration_test.go
│   │
│   ├── middleware/
│   │   ├── auth.go
│   │   ├── cors.go
│   │   └── middleware_test.go
│   │
│   ├── models/
│   │   ├── models.go
│   │   └── models_test.go
│   │
│   ├── main.go
│   ├── go.mod
│   └── go.sum
│
├── frontend/
│   ├── index.html
│   ├── browse.html
│   ├── post.html
│   ├── listing.html
│   ├── login.html
│   ├── register.html
│   ├── css/
│   ├── js/
│   └── assets/
│
├── .gitignore
├── LICENSE.md
├── Project.Rmd
└── README.md
```


### Backend packages

#### `main.go`

The application's entry point.

It is responsible for:

- Loading environment variables.
- Connecting to PostgreSQL.
- Running database migrations.
- Seeding sample data.
- Initializing user and listing stores.
- Registering authentication and listing handlers.
- Configuring Gin and CORS middleware.
- Serving frontend files.
- Starting the HTTP server.

#### `db/`

Manages PostgreSQL connectivity and database initialization.

The current implementation includes:

- Environment variable loading from `.env` files.
- PostgreSQL connection pooling using `pgxpool`.
- Database connectivity checks.
- Creation of the required database schema.
- Sample data seeding.
- Database shutdown.
- Database unit and integration tests.

#### `handlers/`

Contains the HTTP handlers and PostgreSQL-backed storage implementations.

Current components include:

- `auth.go` — authentication handlers.
- `listings.go` — material listing handlers.
- `postgres_user_store.go` — PostgreSQL-backed user storage.
- `postgres_listing_store.go` — PostgreSQL-backed listing storage.

#### `middleware/`

Contains HTTP middleware used by the application.

- `auth.go` — protects routes that require authentication.
- `cors.go` — configures Cross-Origin Resource Sharing.

#### `models/`

Contains the application's data models and their associated tests.

#### `db/migrations/`

Contains SQL migration files for database schema changes.

- `0001_init.up.sql` — applies the initial migration.
- `0001_init.down.sql` — reverses the initial migration.

## ✨ Implemented Backend Functionality

The following API routes are registered in the current Go application's `main.go`.

| Method | Endpoint                    | Authentication | Purpose                     |
| ------ | --------------------------- | -------------- | --------------------------- |
| GET    | `/api/health`               | No             | Check API availability      |
| POST   | `/api/register`             | No             | Register a user             |
| POST   | `/api/login`                | No             | Authenticate a user         |
| GET    | `/api/listings`             | No             | Retrieve material listings  |
| GET    | `/api/listings/:id`         | No             | Retrieve a listing by ID    |
| POST   | `/api/listings`             | Required       | Create a listing            |
| POST   | `/api/listings/:id/claim`   | Required       | Claim a listing             |
| POST   | `/api/listings/:id/collect` | Required       | Mark a listing as collected |

**Note:** Authentication requirements above reflect the route configuration. Request fields, response formats, validation rules, and detailed behavior are defined by the handler implementations.

## 🗄️ Database Design

DumpTrade currently uses PostgreSQL to store user accounts, material listings, and claims.

### Users

Stores information about registered users.

The current schema includes:

- User ID.
- Name.
- Email address.
- Password hash.
- Account type.
- Location.
- Creation timestamp.

Account types currently include:

- `individual`
- `organization`

Passwords are stored as hashes rather than plaintext in the database.

### Listings

Stores materials that users make available to others.

The current schema includes:

- Listing ID.
- User ID of the person who created the listing.
- Title.
- Category.
- Description.
- Photo URL.
- Quantity label and numeric quantity.
- Condition.
- Location.
- Listing status.
- Creation timestamp.

Supported material categories include furniture, electronic waste, textiles, construction materials, organic materials, plastics, industrial materials, and other items.

Listing statuses include:

- `available`
- `claimed`
- `collected`

### Claims

Records claims made against material listings.

The current schema includes:

- Claim ID.
- Listing ID.
- Claimant's user ID.
- Claim timestamp.
- Collection timestamp.

Foreign-key constraints link claims to listings and users.

### Database indexes

The migration creates indexes for commonly queried listing and claim fields, including:

- Listing status.
- Listing category.
- Listing location.
- Claim listing ID.

These indexes help support listing discovery and claim-related queries.

## 🚀 Getting Started

### Prerequisites

Before running DumpTrade, make sure you have:

- Go installed.
- PostgreSQL database access.
- Git installed.
- A browser for accessing the frontend.

The Go version and required dependencies are defined in `backend/go.mod` and `backend/go.sum`.

A hosted PostgreSQL service such as Neon can be used instead of installing PostgreSQL locally.

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd dumptrade
```

Replace `<your-repository-url>` with your actual repository URL.

### 2. Configure environment variables

The backend reads configuration from environment variables and can load them from `.env` files.

Create a `.env` file in the repository root or in the backend directory.

Example:

```env
DATABASE_URL=your_postgresql_connection_string
PORT=8080
JWT_SECRET=replace_with_a_long_random_secret
```

Replace the example values with your actual configuration.

**Important:**

- Use the connection string provided by your PostgreSQL provider.
- Never commit `.env` files containing credentials.
- The default JWT secret in the current development code should be replaced with a secure secret before deployment.
- The backend's `LoadEnv` function checks `.env` and `../.env` relative to the application's working directory. Run commands from the backend directory when using the configuration above.

### 3. Install Go dependencies

Navigate to the backend directory:

```bash
cd backend
```

Download the project's dependencies:

```bash
go mod download
```

### 4. Start the backend

Run:

```bash
go run .
```

During startup, the application attempts to:

1. Load its environment configuration.
2. Establish a PostgreSQL connection.
3. Apply the database schema.
4. Seed initial sample data if the listings table is empty.
5. Initialize the HTTP handlers and middleware.
6. Start the Gin server.

By default, the application listens on port `8080`, unless another port is configured through `PORT`.

Open the application at:

```text
http://localhost:8080
```

The backend serves the frontend from `../frontend` when that directory exists relative to the backend's working directory.

### 5. Verify the API

With the backend running, open the health endpoint:

```text
http://localhost:8080/api/health
```

A successful response should resemble:

```json
{
  "status": "ok",
  "service": "dumptrade-api"
}
```

You can also test it from the terminal:

```bash
curl http://localhost:8080/api/health
```

### 6. Run the tests

From the backend directory:

```bash
go test ./...
```

To see detailed test output:

```bash
go test -v ./...
```

Some integration tests may require a configured PostgreSQL database.

## 🔐 Authentication and Security

The backend provides registration and login handlers and protects listing creation, claiming, and collection routes using authentication middleware.

The current implementation includes:

- JWT-based authentication.
- Password hashing with bcrypt.
- Protected API routes.
- CORS middleware.
- PostgreSQL connection management.

The following practices should be followed as development continues:

- Keep secrets outside the source code.
- Use a strong, unpredictable JWT secret.
- Validate incoming request data.
- Use parameterized SQL queries.
- Avoid returning passwords, password hashes, or other sensitive data in API responses.
- Configure CORS appropriately for the intended deployment.
- Use HTTPS in production.
- Review token expiration and authentication behavior before deployment.

## 🧪 Development and Testing

DumpTrade is developed incrementally, with tests covering important backend components.

When introducing new functionality:

1. Implement the required models or data structures.
2. Add or update database migrations where necessary.
3. Implement the relevant storage operations.
4. Add HTTP handlers.
5. Register the routes in `main.go`.
6. Apply appropriate authentication middleware.
7. Add unit and integration tests.
8. Connect the frontend to the new endpoints.
9. Test the complete workflow.

Run the test suite before committing changes:

```bash
go test ./...
```

## 🗺️ Roadmap

The following items represent potential development goals, not a claim that all functionality is already implemented.

- [x] Establish the Go backend using Gin.
- [x] Connect the backend to PostgreSQL using `pgx`.
- [x] Add initial database schema and sample data initialization.
- [x] Register authentication and listing API routes.
- [x] Add authentication middleware for protected listing operations.
- [ ] Verify frontend integration with the Go API.
- [ ] Improve authentication configuration and production security.
- [ ] Expand listing search and filtering.
- [ ] Improve listing image handling.
- [ ] Expand claim and collection workflows.
- [ ] Add user profile management.
- [ ] Introduce waste collector profiles and contribution tracking.
- [ ] Develop community cleanup activities.
- [ ] Add environmental impact reporting.
- [ ] Expand automated testing and deployment.

## 🤝 Contributing

Contributions, ideas, and feedback are welcome.

To contribute:

1. Fork the repository or create a development branch.
2. Make focused changes.
3. Follow the existing Go package structure.
4. Add tests for new functionality.
5. Run `go test ./...`.
6. Verify frontend and backend integration.
7. Submit your changes for review.

Keep database credentials and other secrets out of version control.

## 🌱 Our Mission

DumpTrade is built around a simple idea:

**One person's waste can become another person's resource.**

By connecting communities and encouraging responsible material reuse, DumpTrade aims to reduce unnecessary waste, promote sustainable practices, and help make environmental contributions more visible.

## 📄 License

See [LICENSE.md](LICENSE.md) for the project's licensing terms.



