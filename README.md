# batch-take-profit

This project is bootstrapped by [aurelia/new](https://github.com/aurelia/new).

## Start dev web server

    npm start

## Build the app in production mode

    npm run build


## Unit Tests

    npm run test

Run unit tests in watch mode.

    npm run test:watch

## App data flow

In this **Aurelia** application, data flows through a structured pipeline involving **Views**, **ViewModels**, **Stores**, and **Services**.

### 1. Views (`.html`)

* **Role:** The presentation layer of the application.
* **Interaction:** Views are paired with ViewModels and bind to their public properties and methods using Aurelia’s binding system.
* **Responsibility:**

  * Handle display logic only.
  * Apply formatting (e.g., currency, dates, numbers) to data provided by the ViewModel.

### 2. ViewModels (`.ts`)

* **Role:** UI controllers that connect Views to application logic.
* **Interaction:** ViewModels are paired one-to-one with Views and are responsible for orchestrating UI behavior.
* **Responsibility:**

  * Inject Stores as needed.
  * Delegate data retrieval, transformation, and business logic to Stores.
  * Expose observable properties for the View to bind to.
  * Handle user interaction and lifecycle events (`binding`, `attached`, etc.).

### 3. Stores (Independent State & Logic Managers)

* **Role:** Centralized modules that manage state, business logic, and coordination of data.
* **Interaction:** Injected into ViewModels (or other Stores if needed).
* **Responsibility:**

  * Act as the middle layer between ViewModels and Services.
  * Call Services to fetch raw data.
  * Apply business rules and transformations.
  * Cache and manage shared application state.

### 4. Services (Data Access Layer)

* **Role:** Interface with external resources like APIs, databases, or smart contracts.
* **Interaction:** Injected into Stores.
* **Responsibility:**

  * Make HTTP requests or contract calls.
  * Return raw, unformatted data.
  * Remain stateless and reusable.

---

### Summary of Flow

```
[ View ] → binds to → [ ViewModel ] → uses → [ Store ] → calls → [ Service ]
```

This separation supports:

* **Reusability** of Stores across different ViewModels
* **Testability** by isolating logic in Stores and Services
* **Clean UI logic** by keeping ViewModels slim and focused
