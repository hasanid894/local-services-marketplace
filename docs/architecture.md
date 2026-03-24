# System Architecture – Local Services Marketplace

## 1. Introduction

This system is a Local Services Marketplace implemented using a **layered architecture** that enforces separation of concerns, modularity, and scalability.

The current implementation uses **file-based persistence (CSV)** while being explicitly designed for **future database integration**. This ensures that the system can evolve without modifying its business logic.

---

## 2. High-Level Architecture

The system is structured into the following layers:

Client (Frontend)

  ↓

Routes

  ↓
    
Middleware

  ↓

Controllers

  ↓

Services (Business Logic)

  ↓
    
Repository (Abstraction Layer)

  ↓
    
FileRepository (Current Implementation)

  ↓
    
CSV Storage


---

## 3. Request Processing Pipeline

Every HTTP request follows a defined execution flow:

1. Client sends an HTTP request
2. Request is handled by **Routes**
3. Middleware executes (authentication, validation, error handling)
4. Controller processes the request
5. Controller delegates logic to Service layer
6. Service interacts with Repository
7. Repository accesses data (CSV files)
8. Response is returned to the client

This pipeline ensures:
- Structured request handling
- Security enforcement
- Separation of concerns

---

## 4. Layer Responsibilities

### 4.1 Routes Layer

- Defines API endpoints
- Maps HTTP methods to controllers
- Example:
  - `authRoutes.js`
  - `userRoutes.js`
  - `serviceRoutes.js`

Routes act as the **entry point** of the backend.

---

### 4.2 Middleware Layer

Middleware handles **cross-cutting concerns**:

- Authentication (`authMiddleware.js`)
- Error handling (`errorHandler.js`)

Middleware executes **before controllers**, ensuring requests are valid and secure.

---

### 4.3 Controllers

- Handle incoming requests and outgoing responses
- Do not contain business logic
- Call service layer methods

---

### 4.4 Services (Business Logic Layer)

- Contain all business rules and logic
- Coordinate operations between controllers and repositories
- Independent of storage implementation

Examples:
- `UserService`
- `BookingService`
- `ReviewService`
- `ServiceService`
- `AuthService`

---

### 4.5 Repository Layer

The system applies the **Repository Pattern**.

#### Interface: `IRepository`

Defines the contract:

- `getAll()`
- `getById(id)`
- `add(entity)`
- `update(id, data)`
- `delete(id)`
- `save()`

#### Implementation: `FileRepository`

- Handles data persistence using CSV files
- Implements all methods from `IRepository`

---

## 5. Current Implementation (Phase 1)

- Data is stored in CSV files
- Managed exclusively through `FileRepository`
- No direct file access from services or controllers

This ensures:
- Simplicity
- Maintainability
- Clear separation of concerns

---

## 6. Planned Database Integration (Phase 2)

The system is explicitly designed for seamless database integration.

### Future Architecture:


Service Layer
↓
IRepository (Interface)
↓
DatabaseRepository (Future Implementation)
↓
Database (SQL)


### Transition Strategy:

- Implement `DatabaseRepository` following `IRepository`
- Replace `FileRepository` with `DatabaseRepository`
- No changes required in:
  - Services
  - Controllers
  - Routes
  - Middleware

This demonstrates strong adherence to **Dependency Inversion Principle (DIP)**.

---

## 7. Design Principles Applied

### 7.1 Separation of Concerns
Each layer has a distinct responsibility.

### 7.2 Dependency Inversion Principle
Services depend on abstractions (`IRepository`), not concrete implementations.

### 7.3 Open/Closed Principle
The system can be extended (database integration) without modifying existing code.

### 7.4 Single Responsibility Principle
Each module handles a single responsibility.

---

## 8. Security Considerations

- Authentication handled via middleware (`authMiddleware.js`)
- Passwords should be stored using hashing (e.g., bcrypt)
- Input validation occurs before reaching business logic
- Error handling is centralized via middleware

---

## 9. Data Flow Example

### User Creation Flow

1. Client sends request
2. Route matches endpoint
3. Middleware validates request
4. Controller receives request
5. Controller calls `UserService`
6. Service validates and processes data
7. Service calls `IRepository.add()`
8. `FileRepository` writes to CSV
9. Response is returned

---

## 10. Extensibility and Maintainability

This architecture allows:

- Easy replacement of persistence layer
- Independent module development
- Scalability to larger systems
- Minimal impact when introducing new features

---

## 11. Conclusion

The system is designed as a **database-ready, layered architecture**.

While currently implemented using file-based storage, the use of abstraction (`IRepository`) ensures that:

- The system can transition to a database with minimal effort
- Business logic remains unchanged
- The architecture remains clean and maintainable

