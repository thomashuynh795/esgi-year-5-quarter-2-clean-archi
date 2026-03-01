# ADR 001: Hexagonal Architecture

## Context
The project requires a Parking Reservation System with a clear separation of concerns, testability, and maintainability. The core logic involves reservations, rules (5 days max, etc.), and user management.

## Decision
We will use **Hexagonal Architecture** (Ports and Adapters) for this application.

## Structure
- **Domain**: Contains the core business logic and entities. Pure TypeScript, no framework dependencies.
- **Application**: Contains the use cases (what the system does). Orchestrates domain objects.
- **Infrastructure**: Contains the implementation of interfaces (adapters). This includes:
    - **Persistence**: Prisma implementation of repositories.
    - **Web**: NestJS Controllers exposing the API.

## Consequences
- **Pros**:
    - Decoupled business logic from framework/database.
    - Easier to test domain logic in isolation.
    - Adapters can be swapped (e.g., QR code check-in became a button click without changing domain logic).
- **Cons**:
    - More boilerplate (interfaces, DTOs, mappers) than a traditional MVC 3-layer architecture.
