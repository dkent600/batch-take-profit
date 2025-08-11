# GitHub Copilot Instructions Example for Aurelia Projects

This is a `copilot-instructions.md` file optimized for Aurelia 2.0 development with GitHub Copilot.

# GitHub Copilot Instructions

## Project Overview

This is an Aurelia 2.x TypeScript application.

## Architecture

We use Aurelia's dependency injection (DI) system from `@aurelia/kernel` with hierarchical containers.

Components follow MVVM pattern with clear separation between view models and templates.

Resources (viewmodels, custom elements, attributes, value converters) are registered in Main `Aurelia.register`.


## Coding Standards

### TypeScript
We use strict TypeScript with explicit types - avoid `any` type.

Prefer interfaces over type aliases for object shapes.

Use union types and generic constraints appropriately.

Handle undefined and null explicitly with strict null checks.

### Aurelia Conventions
Custom elements use kebab-case naming: `<user-profile>` maps to `UserProfileCustomElement`.

Classes use PascalCase: `UserService`, `MyCustomElement`.

Bindable properties should have explicit TypeScript types.

### Component Lifecycle
Implement proper cleanup in `detaching` and `unbinding` lifecycle hooks.

Use lifecycle hooks in order: creating → created → binding → bound → attaching → attached.

Always handle errors in lifecycle methods appropriately.

### Dependency Injection
Class constructor injection (DI) must always refer to interfaces, not class types, for the purpose of mocking.

Injection uses the `@inject()` decorator to specify injected "tokens", as created by `DI.createInterface` as:

  ```typescript
  export const [interfaceName]Token = DI.createInterface<[interfaceName]>('[interfaceName]');
  ```

The `@inject` decorator must reference the tokens in the same order as corresponding Typescript interfaces are referenced in the constructor.  The tokens must be registered in Main like:

```typescript
Registration.singleton([interfaceName]Token, [implementingClassName])
```

Services resolve through `container.get()` or constructor injection.

Tests will create mocks of the interfaces also by using `container.get()`.

## Development Workflow

### Building
Always run `npm run build` after making changes to packages before running tests.

Use `npm run rebuild` for clean builds when encountering issues.

Build is required for both package changes and test file modifications.

### Testing
Tests are located in `__tests__` directory.

Use `@aurelia/testing` package for component testing.

Follow AAA pattern: Arrange, Act, Assert.

Run specific tests with `npm run dev -- -t "pattern"` for faster feedback.

### Code Quality
Run `npm run lint` before committing changes.

Prefer positive if statements over negative conditions.

Prefer single final method returns to early returns.

Always use curly braces for control structures.

Prefer const over let, never use var.

Prefer double quotes on strings.

## Framework-Specific Patterns

### Custom Elements
```typescript
@customElement({
  name: 'user-profile',
  template: '<div>Template content</div>'
})
export class UserProfile {
  @bindable public user?: User;
  
  public binding(): void {
    // Setup logic
  }
  
  public unbinding(): void {
    // Cleanup logic
  }
}
```

### Value Converters
```typescript
@valueConverter('formatDate')
export class DateFormatValueConverter {
  public toView(value: Date, format?: string): string {
    // Conversion logic
  }
}
```

## Logging

Use Aurelia's logger system (ILogger) instead of console.

Refer to router package for logging implementation patterns.

## Error Handling

Never expose or log secrets and keys.

Handle binding and lifecycle errors gracefully.

Provide meaningful error messages for development debugging.

## Testing Patterns

Avoid loops in unit tests - write explicit test cases.

Use methods from `@aurelia/testing` package for assertions.

Test both happy path and error scenarios.

Create proper test setups and teardowns for component tests.

## Key Features of This Configuration

### 1. **Repository-Wide Context**
This file provides broad guidance that applies to all developers working with GitHub Copilot in the repository.

### 2. **Short, Self-Contained Instructions**
Each instruction is a simple statement that can be applied broadly across different coding scenarios.

### 3. **Framework-Specific Patterns**
Includes concrete examples of Aurelia patterns that Copilot can reference when generating code.

Generate Aurelia custom elements with proper lifecycle hooks and TypeScript types.

Use kebab-case for element names and PascalCase for classes.

Always include proper cleanup in unbinding lifecycle hook.

## Team Collaboration

Keep this file under version control and treat it as a living document.

Update instructions as team coding practices evolve.

All team members benefit from consistent Copilot behavior through shared instructions.

Reference this file during code reviews to ensure Copilot suggestions align with project standards.