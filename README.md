# 🧰 NestJS Backend Boilerplate

An opinionated and modular backend boilerplate built with **NestJS**, **TypeScript**, **Prisma**, and **Zod** — designed for scalable development with clear separation between HTTP, business logic, and persistence.

---

## 🚀 Features

* 🏗 **NestJS** – Structured and scalable Node.js framework with dependency injection
* 🔐 **TypeScript** – Strictly typed backend development
* 🎯 **Prisma ORM** – Type-safe database access with repository abstraction
* 🧩 **Repository Pattern** – Persistence isolated behind repository interfaces
* 📦 **Modular Architecture** – Self-contained feature modules with consistent structure
* 🛡 **Zod Validation** – Schema-first request validation with full type inference
* 📄 **Zod DTOs** – Same schemas used for validation, typing, and API documentation
* 🔗 **Response Serialization** – Zod-validated response DTOs prevent undeclared data from reaching clients
* 💫 **Centralized Responses** – Strict `{ body, message }` shape enforced across all endpoints
* 🚨 **Centralized Error Handling** – Global exception filter with consistent error responses
* 🔒 **JWT Authentication** – Global `JwtAuthGuard` with `@Public()` opt-out
* 🌍 **Environment Validation** – Environment variables validated at startup
* 📚 **OpenAPI Documentation** – Swagger documentation generated from the same Zod DTOs used for validation
* 🧪 **Unit Testing** – Fast service-level tests using repository interfaces and fakes
* 🔬 **E2E Testing** – Full application testing with Nest testing utilities and Supertest

---

## 📁 Folder Structure

Each feature follows the same modular structure:

```text
src/
├── common/
│   └── dto/
│       ├── pagination-query.dto.ts  # Reusable pagination DTO
│       └── id-param.dto.ts          # Reusable :id parameter DTO
├── modules/
│   ├── auth/
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── dto/
│   │   │   └── auth.dto.ts
│   │   ├── repositories/
│   │   │   └── auth.repository.ts
│   │   └── infrastructure/
│   │       └── prisma-auth.repository.ts
│   └── tasks/
│       ├── tasks.module.ts
│       ├── tasks.controller.ts
│       ├── tasks.service.ts
│       ├── dto/
│       │   └── tasks.dto.ts
│       ├── repositories/
│       │   └── tasks.repository.ts
│       └── infrastructure/
│           └── prisma-tasks.repository.ts
├── app.module.ts
└── ...
```

### Feature Module Pattern

Every feature module follows the same five-piece structure:

```text
src/modules/<feature>/

├── <feature>.module.ts
├── <feature>.controller.ts          # Thin: HTTP in, DTO out, calls service
├── <feature>.service.ts             # Orchestration; never imports Prisma
├── dto/
│   └── <feature>.dto.ts             # createZodDto(schema) per input/output shape
├── repositories/
│   └── <feature>.repository.ts      # Abstract class — the persistence port
└── infrastructure/
    └── prisma-<feature>.repository.ts
                                      # Adapter — the only Prisma import in the module
```

---

## 🛠 Tech Stack

| Tech              | Description                                            |
| ----------------- | ------------------------------------------------------ |
| NestJS            | Structured Node.js framework with dependency injection |
| TypeScript        | Strictly typed application development                 |
| Prisma            | ORM and type-safe database access                      |
| Zod               | Schema validation and type inference                   |
| `nestjs-zod`      | Zod DTOs, validation pipe, and response serialization  |
| `@nestjs/swagger` | OpenAPI/Swagger API documentation                      |
| JWT               | Authentication and authorization                       |
| Supertest         | HTTP testing for E2E tests                             |

---

## 📦 Installation

```bash
# Install dependencies
npm install
```

---

## ⚙️ Setup

### 1. Environment Variables

Create a `.env` file based on `.env.example`:

```env
DATABASE_URL="mysql://user:password@localhost:3306/your_db"
JWT_SECRET="your_jwt_secret_here"
```

Environment variables are validated when the application starts. Invalid or missing required variables cause the application to fail immediately rather than running with an invalid configuration.

### 2. Prisma Setup

Generate the Prisma client:

```bash
npx prisma generate
```

Run database migrations:

```bash
npx prisma migrate dev
```

---

## 🧩 Dependency Rule

The dependency boundary is deliberately enforced at **persistence**.

Services never import Prisma or `PrismaService`. Instead, they depend on a repository interface represented by an abstract class. Only the repository implementation inside `infrastructure/` imports `PrismaService`.

```text
Controller
    │
    ▼
 Service
    │
    ▼
Repository interface
    ▲
    │
Prisma repository
    │
    ▼
Database
```

The repository is registered with its implementation inside the feature module:

```ts
providers: [
  FeatureService,
  {
    provide: FeatureRepository,
    useClass: PrismaFeatureRepository,
  },
]
```

This is intentionally **not** full Clean Architecture. There are no separate Input/Output Ports, Interactors for every use case, or strict separation between domain entities and persistence models.

The abstraction exists specifically where it provides practical value: isolating persistence so services can be unit-tested without a database and the underlying persistence implementation can be replaced when necessary.

---

## ➕ Adding a New Feature Module

Copy the structure of an existing feature such as `src/modules/tasks/`:

```text
src/modules/<feature>/

<feature>.module.ts
<feature>.controller.ts
<feature>.service.ts

dto/
└── <feature>.dto.ts

repositories/
└── <feature>.repository.ts

infrastructure/
└── prisma-<feature>.repository.ts
```

Then:

1. Define the Zod schemas and DTOs.
2. Create the repository abstraction.
3. Implement the repository using Prisma.
4. Inject the repository into the service.
5. Register the repository implementation in the module's `providers`.
6. Add the Prisma model.
7. Register the module in `app.module.ts`.

All routes are protected by the global `JwtAuthGuard` by default. Use `@Public()` when an endpoint should bypass authentication, as demonstrated by the login route in `auth.controller.ts`.

---

## 🛡 Request Validation

All `@Body()`, `@Query()`, and `@Param()` inputs should use Zod DTOs created with `createZodDto(schema)` rather than bare primitive types.

The global `ZodValidationPipe` validates DTOs before the controller executes.

Two reusable DTOs are already provided:

* `common/dto/pagination-query.dto.ts` — `page` and `limit` for list endpoints
* `common/dto/id-param.dto.ts` — a single `:id` route parameter

Example:

```ts
export class LoginRequestDto extends createZodDto(loginRequestSchema) {}
```

---

## 🔗 Response Serialization

Response shapes are validated as well as requests.

Add `@ZodSerializerDto(SomeResponseDto)` to a handler to define exactly what can be returned to the client:

```ts
@ZodSerializerDto(UserResponseDto)
@Get()
getUser() {
  return this.usersService.getUser();
}
```

The global `ZodSerializerInterceptor` strips properties that are not defined by the response schema.

This means the response DTO is an actual runtime boundary rather than documentation only.

---

## 🔗 Response Shape

Every API response — successful or failed — follows the same contract:

```json
{
  "body": {},
  "message": "Human-readable summary"
}
```

For an error:

```json
{
  "body": null,
  "message": "Invalid credentials"
}
```

HTTP status information is represented exclusively through the HTTP status code and is not duplicated inside the JSON response.

Successful responses are handled by `ResponseInterceptor`, which can use an optional `@ResponseMessage("...")` decorator defined on the handler.

All failures are handled by `AllExceptionsFilter`, including:

* `HttpException`
* Zod validation failures
* Prisma constraint violations
* Unexpected application errors

Common Prisma errors are mapped consistently:

| Prisma Error | HTTP Status       |
| ------------ | ----------------- |
| `P2002`      | `409 Conflict`    |
| `P2025`      | `404 Not Found`   |
| `P2003`      | `400 Bad Request` |

Both the interceptor and exception filter use the same `WrappedResponse<T>` type, preventing success and error response formats from drifting apart.

---

## 🔐 Authentication

Authentication is protected globally through `JwtAuthGuard`.

Routes are therefore protected by default:

```ts
@Get()
getTasks() {
  // Protected automatically
}
```

Public routes explicitly opt out:

```ts
@Public()
@Post("login")
login() {
  // Public endpoint
}
```

This makes authentication the default rather than something that must be remembered individually for every protected route.

---

## 📚 API Documentation

Swagger UI is available at:

```text
/docs
```

It is disabled outside the development environment.

OpenAPI documentation is generated from the same Zod DTOs used for request validation, avoiding separate validation and documentation definitions.

---

## 🧪 Testing

### Unit Tests

Unit tests are placed next to the code in `*.spec.ts` files.

Services are constructed directly with fake repository implementations:

```text
Service
   │
   ▼
Repository interface
   │
   ▼
Fake repository
```

No NestJS DI container or database is required.

This keeps unit tests fast and allows service behaviour to be tested independently of persistence.

### E2E Tests

E2E tests are located under `test/*.e2e-spec.ts`.

They boot the real `AppModule` using `@nestjs/testing` and make HTTP requests with Supertest.

E2E tests require a real, migrated database because `PrismaService` connects during module initialization.

Run the tests with:

```bash
npm run test       # Unit tests

npm run test:e2e   # E2E tests — requires a real migrated database
```

---

## 🏗 Architecture Guidance

* Keep controllers thin — handle HTTP concerns, DTOs, and service calls
* Keep business orchestration inside services
* Never import Prisma or `PrismaService` inside services
* Keep Prisma access inside repository implementations
* Keep repository abstractions inside `repositories/`
* Keep Prisma repository implementations inside `infrastructure/`
* Use Zod DTOs for all request inputs
* Use response DTOs to explicitly define the data exposed to clients
* Protect routes by default with `JwtAuthGuard`
* Use `@Public()` only for endpoints that intentionally bypass authentication
* Avoid unnecessary Clean Architecture ceremony when the abstraction does not provide practical value

---

## 🚫 Deliberately Not Included

Docker and CI configuration are intentionally excluded.

They should be added at the project level when there is an actual deployment target rather than introducing deployment assumptions into the boilerplate.

---

## ✍️ Author

**Maduranga Jayasena** – [GitHub](https://github.com/MadurangaDev)

---

## 🧪 License

This project is licensed under the [MIT License](LICENSE).

---

## 🤝 Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.
