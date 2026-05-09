# Batch Take-Profit Frontend

A sophisticated cryptocurrency portfolio management application built with Aurelia framework. This is the frontend component of the **Butterfly App** ecosystem, designed to execute scaled take-profit sales across multiple cryptocurrency exchanges.

## Project Overview

This application integrates with the **butterfly-services** backend API to provide a user-friendly interface for:
- Managing cryptocurrency assets across multiple exchanges (Kraken, MEXC)
- Executing batch take-profit orders with percentage-based or fixed-amount strategies
- Real-time price monitoring and balance tracking
- Order history and status management

## Technical Stack

- **Framework**: Aurelia with TypeScript
- **Styling**: TailwindCSS + FluentUi Web Components components
- **Build Tool**: Vite
- **Testing**: Vitest
- **HTTP Client**: Axios with request queue service

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Running butterfly-services backend (see backend repository)

### Development Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment**:
   Create `config.local.json` based on `config.json` with your backend URL:
   ```json
   {
     "apiBaseUrl": "http://localhost:3000"
   }
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```
   Application will be available at `http://localhost:5173`

### Build Commands

- **Development**: `npm run dev` - Start Vite dev server with hot reload
- **Production Build**: `npm run build` - TypeScript check + Vite build
- **Testing**: `npm test` - Run Vitest unit tests
- **Watch Tests**: `npm run test:watch` - Run tests in watch mode
- **Linting**: `npm run lint` - ESLint + Stylelint checks

## Architecture & Integration

### Backend Integration
This frontend application communicates with the **butterfly-services** REST API to:
- Authenticate with cryptocurrency exchanges
- Fetch real-time asset balances and prices  
- Execute market and limit orders
- Retrieve order history and status

### Key Features
- **Batch Operations**: Execute multiple take-profit orders simultaneously
- **Flexible Strategies**: Support for percentage-based or fixed-amount sales
- **Real-time Updates**: Live price feeds and balance synchronization
- **Order Management**: Full order lifecycle tracking with retry logic
- **Exchange Support**: Currently supports Kraken and MEXC exchanges

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

## Configuration

### Environment Files
- `config.json` - Default configuration
- `config.local.json` - Local overrides (not tracked in git)

### Required Configuration
```json
{
  "apiBaseUrl": "http://localhost:3000",
  "enableRequestLogging": false,
  "retryAttempts": 3,
  "retryDelayMs": 1000
}
```

## Troubleshooting

### Common Issues

#### Development Server Issues
- **Port 5173 in use**: Change port in `vite.config.ts`
- **Hot reload not working**: Clear browser cache and restart dev server
- **TypeScript errors**: Run `npx tsc --noEmit` to check for type issues

#### API Connection Issues
- Verify `config.local.json` has correct backend URL
- Check that butterfly-services is running and accessible
- Review browser console for detailed error messages

### Performance Optimization
See `.vscode/vscode-performance-tips.md` for VS Code optimization settings and debugging tips.

### PowerShell Commands
See `.vscode/powershell-commands.md` for development workflow commands and utilities.

## Project Structure

```
src/
├── pages/           # Aurelia pages and components
│   ├── app/         # Main application shell
│   └── asset-list/  # Trading interface components
├── services/        # Data access and business logic
│   ├── exchange-apis/    # Backend API integration
│   └── request-queue-service.ts  # Request serialization
└── stores/          # State management
    ├── asset-store.ts    # Asset and balance state
    └── orders-store.ts   # Order tracking state
```

## Contributing

1. Follow the established architecture patterns (View/ViewModel/Store/Service)
2. Add unit tests for new components and services
3. Update documentation for significant changes

## Related Projects

- **butterfly-services**: Backend REST API for exchange integration
- Part of the **Butterfly App** cryptocurrency trading ecosystem
