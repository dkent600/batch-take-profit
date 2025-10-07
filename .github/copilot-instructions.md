# Copilot Instructions - Batch Take Profit

## Project Overview
Cryptocurrency portfolio management app built with Aurelia 2 + TypeScript + Vite, integrating with multiple exchange APIs (Kraken, MEXC) for automated take-profit order execution.

## Architecture & Key Patterns

### Service Layer & Dependency Injection
- All services use DI tokens created with `DI.createInterface<T>('ServiceName')`
- Services are registered as singletons in `main.ts` using `Registration.singleton(Token, Implementation)`
- Constructor injection follows pattern: `@inject(ServiceToken)` with interface references only
- Example pattern:
```typescript
export const MyServiceToken = DI.createInterface<IMyService>('IMyService');

@inject(MyServiceToken)
export class MyComponent {
  constructor(private readonly myService: IMyService) {}
}
```

### Store Pattern for State Management
- Stores manage domain-specific state (AssetsStore, OrdersStore, CoinsStore)
- Components inject stores via DI tokens, never directly instantiate
- Stores coordinate with services for data operations and API calls
- Request queue service handles API rate limiting automatically

### Fluent UI Integration
- Uses `@fluentui/web-components@2.6.1` with custom FluentUIAdapter in `src/stores/fluent-ui-adapter.ts`
- Two-way binding configured via FluentUIAdapter for seamless form interactions
- Custom FluentUIAdapter replaces aurelia-fast-adapter for better Fluent UI support
- Custom dialog renderer `FluentDialogRenderer` for consistent UI
- Components use `<fluent-*>` tags with native Fluent theming (no custom CSS overrides)
- Reference implementation available in `fluent-test` sibling project for isolated testing

### Shadow DOM and Styling Constraints
- **Critical**: Fluent UI web components use Shadow DOM which creates absolute style isolation
- **Never suggest TailwindCSS classes for internal styling of Fluent UI components** - they cannot penetrate Shadow DOM boundaries
- **Never suggest regular CSS properties** (padding, margin, etc.) for styling Fluent UI component internals
- **Only CSS custom properties** can cross Shadow DOM boundaries, and only those explicitly exposed by the component
- Valid customization approach: `<fluent-button style="--design-unit: 2px;">` (uses exposed CSS custom property)
- Invalid approaches: `<fluent-button class="tw-px-4">` or `<fluent-button style="padding: 8px;">`
- When unsure if a CSS custom property is exposed, explicitly state uncertainty rather than guess

### Component Architecture
- Bindable properties with explicit TypeScript types using `@bindable`
- File structure: `component-name.ts`, `component-name.html`, `component-name.css`
- Register components in `main.ts` as part of Aurelia registration

## Development Workflow

### Build & Development
- Dev server: `npm run dev` (Vite on port 5173)
- Build: `npm run build` (TypeScript check + Vite build)
- Test: `npm test` (Vitest with jsdom environment)
- Lint: `npm run lint` (ESLint + Stylelint)

### Testing Setup
- Test setup in `test/setup.ts` bootstraps Aurelia environment
- Uses `@aurelia/testing` with fixture management
- Tests automatically clean up fixtures in `afterEach`

### Exchange API Integration
- Services call backend APIs via `butterfly-services` at configured `serviceUrl`
- Exchange-specific patterns: Kraken uses USD quotes, MEXC uses USDT
- All external requests go through `RequestQueueService` for rate limiting
- Error handling preserves backend error messages when available

## Project-Specific Conventions

### File Organization
- Services in `src/services/` with interfaces in `interfaces.ts`
- Stores in `src/stores/` with shared interfaces and FluentUIAdapter
- Components in `src/components/ui/` with subfolder per component
- Pages in `src/pages/` (app-level routing components)

### Exchange Asset Handling
- Assets have `exchange` property determining API endpoints and quote currencies
- Amount fields automatically convert to numbers: `asset.amount = +asset.amount || 0`
- Price formatting depends on exchange (USD vs USDT precision)

### Styling & UI
- TailwindCSS integration with `tw-` prefix for utility classes
- TailwindCSS 3.x stable version (not 4.x beta which has broken prefix support)
- All TailwindCSS utilities must use `tw-` prefix: `tw-flex`, `tw-p-4`, `tw-text-sm`, etc.
- Fluent UI theming through design system provider
- CSS modules pattern with component-scoped stylesheets
- **Respect Shadow DOM boundaries**: TailwindCSS works for layout containers, CSS custom properties for Fluent UI internals

### Configuration
- Environment-specific config in `config.json` and `config.local.json`
- EnvService handles config loading and environment detection
- Service URLs and API endpoints configured per environment

When working with this codebase, prioritize understanding the service layer DI patterns and Fluent UI integration over generic Aurelia patterns. The exchange-specific business logic in stores and services is critical for maintaining API compatibility.

**Remember**: Shadow DOM creates absolute style boundaries. Respect these boundaries by only suggesting appropriate customization methods for each component type.