# Data Grid Custom Element

## Usage

The `data-grid` custom element is a wrapper around `fluent-data-grid` that provides consistent styling and behavior.

### Basic Usage

```html
<data-grid>
  <fluent-data-grid-row type="header">
    <fluent-data-grid-cell cell-type="columnheader" grid-column="1">Name</fluent-data-grid-cell>
    <fluent-data-grid-cell cell-type="columnheader" grid-column="2">Value</fluent-data-grid-cell>
  </fluent-data-grid-row>
  
  <fluent-data-grid-row repeat.for="item of myData">
    <fluent-data-grid-cell grid-column="1">${item.name}</fluent-data-grid-cell>
    <fluent-data-grid-cell grid-column="2">${item.value}</fluent-data-grid-cell>
  </fluent-data-grid-row>
</data-grid>
```

### Properties

- `rows-data`: Array of data objects to display
- `class`: Additional CSS classes to apply
- `style`: Inline styles to apply

### Features

- Consistent Fluent UI styling
- Mineral theme integration
- Responsive design
- Content projection for custom headers and rows
- Error state styling for form controls
