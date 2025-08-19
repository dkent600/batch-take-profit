# Phase 3, Step 1: Tailwind/DaisyUI Usage Audit

## 📊 Complete Inventory of Current Usage

### 🎯 **DaisyUI Components Found** (18 instances)

#### **Tables** (5 instances)
- `daisy-table daisy-table-zebra daisy-table-auto` in:
  - `orders-display.html` (line 8, 58)
  - `exchange-component.html` (line 5)

#### **Modals** (1 instance)
- `daisy-modal` in `order-confirmation-modal.html` (line 2)
- `daisy-modal-box` in `order-confirmation-modal.html` (line 6)

#### **Buttons** (2 instances)
- `daisy-btn daisy-btn-error daisy-btn-lg` in `order-confirmation-modal.html` (line 96)
- `daisy-btn daisy-btn-outline daisy-btn-lg` in `order-confirmation-modal.html` (line 103)

#### **Form Elements** (2 instances)
- `daisy-input daisy-input-lg daisy-input-bordered` in `order-confirmation-modal.html` (line 76)
- `daisy-select daisy-select-xs` in `exchange-component.html` (line 31)

#### **Alerts** (4 instances)
- `daisy-alert daisy-alert-error` in `order-confirmation-modal.html` (line 16)
- `daisy-alert daisy-alert-info` in `order-confirmation-modal.html` (lines 22, 26)
- `daisy-alert daisy-alert-warning` in `order-confirmation-modal.html` (lines 64, 88)

#### **Badges** (1 instance)
- `daisy-badge` with conditional classes in `order-confirmation-modal.html` (line 39)

#### **Collapse/Accordion** (3 instances)
- `daisy-collapse daisy-collapse-arrow` in `orders-display.html` (line 52)
- `daisy-collapse-title` in `orders-display.html` (line 54)
- `daisy-collapse-content` in `orders-display.html` (line 57)

#### **Links** (1 instance)
- `daisy-link daisy-link-primary` in multiple files

---

### 🎨 **Tailwind Utility Classes Found** (44 instances)

#### **Layout & Flexbox** (12 instances)
- `flex flex-col items-center` in `exchange-component.html` (lines 2, 87)
- `flex flex-row gap-4` in `exchange-component.html` (lines 88, 97, 110)
- `flex gap-4 justify-end` in `order-confirmation-modal.html` (line 94)
- `grid grid-cols-2 gap-4` in `order-confirmation-modal.html` (line 33)
- `justify-center` in multiple locations
- `items-center` in multiple locations

#### **Spacing** (15 instances)
- `p-6`, `px-8 py-6`, `px-2`, `py-2`, `py-4` across multiple files
- `m-*`, `mt-*`, `mb-*`, `mx-auto` spacing utilities
- `gap-2`, `gap-4` for flex/grid gaps
- `space-y-2`, `space-y-4`, `space-y-6` for vertical spacing

#### **Typography** (20 instances)
- `text-2xl font-bold text-center` (headers)
- `text-sm`, `text-lg` (size variants)
- `font-semibold`, `font-mono`, `font-bold` (weight variants)
- `text-left` (alignment)
- `text-primary`, `text-error`, `text-accent` (color variants)
- `text-center` (alignment)

#### **Sizing** (8 instances)
- `w-fit`, `w-full`, `w-24` (width utilities)
- `max-w-2xl`, `max-w-fit` (max-width utilities)
- `min-h-*` (minimum height)

#### **Colors & Backgrounds** (6 instances)
- `bg-base-100`, `bg-base-200` (DaisyUI semantic colors)
- `bg-neutral` (background colors)
- `text-gray-500` (text colors)

#### **Effects & Transitions** (3 instances)
- `shadow-2xl`, `shadow-md`, `shadow-inner` (shadows)
- `rounded-2xl`, `rounded-lg`, `rounded` (border radius)
- `hover:scale-105 transition-transform` (hover effects)

---

### 📁 **Files Requiring Conversion** (Priority Order)

#### **🔴 HIGH Priority** (Core UI Components)
1. **`order-confirmation-modal.html`** - Most complex component
   - Modal dialog → `<fast-dialog>`
   - Buttons → `<fast-button>`
   - Input field → `<fast-text-field>`
   - Alerts → Custom FAST-styled alert components
   - Complex layout with grid and flexbox

2. **`exchange-component.html`** - Main interface
   - Select dropdown → `<fast-select>`
   - Layout utilities → Custom FAST utilities
   - Links → Custom FAST-styled links

#### **🟡 MEDIUM Priority** (Data Display)
3. **`orders-display.html`** - Data tables
   - Tables → Custom FAST-styled tables or `<fast-data-grid>`
   - Collapse/accordion → Custom FAST accordion
   - Typography utilities

#### **🟢 LOW Priority** (Simple Components)
4. **`asset-list.html`** - Simple container (minimal changes)
5. **`app.html`** - Root template (no changes needed)

---

### 🎯 **Conversion Strategy by Component Type**

#### **DaisyUI → FAST Component Mapping**
```typescript
// Modal Components
'daisy-modal' → '<fast-dialog modal>'
'daisy-modal-box' → Custom styled div with FAST tokens

// Buttons
'daisy-btn daisy-btn-error' → '<fast-button appearance="accent" class="error-style">'
'daisy-btn daisy-btn-outline' → '<fast-button appearance="outline">'

// Form Elements
'daisy-input' → '<fast-text-field>'
'daisy-select' → '<fast-select>'

// Alerts
'daisy-alert-*' → Custom alert components using FAST design tokens

// Tables
'daisy-table' → Custom table with FAST styling or '<fast-data-grid>'

// Badges
'daisy-badge' → Custom badge component with FAST tokens

// Collapse
'daisy-collapse' → Custom accordion using FAST patterns
```

#### **Tailwind → FAST Utility Mapping**
```css
/* Layout */
'flex flex-col items-center' → 'custom-flex custom-flex-col custom-items-center'
'grid grid-cols-2 gap-4' → 'custom-grid custom-grid-cols-2 custom-gap-md'

/* Spacing */
'p-6' → 'custom-p-lg'
'px-8 py-6' → 'custom-px-xl custom-py-lg'
'gap-4' → 'custom-gap-md'
'space-y-6' → 'custom-space-y-lg'

/* Typography */
'text-2xl font-bold' → 'custom-text-2xl custom-font-bold'
'text-center' → 'custom-text-center'

/* Colors */
'text-primary' → 'custom-text-primary'
'bg-base-100' → 'custom-bg-surface'
```

---

### 📈 **Conversion Metrics**
- **Total Files to Convert:** 4 HTML files
- **DaisyUI Components:** 18 instances (9 unique component types)
- **Tailwind Utilities:** 44 instances (6 categories)
- **Estimated Conversion Time:** 
  - High Priority: 4-6 hours
  - Medium Priority: 2-3 hours  
  - Low Priority: 1 hour
  - **Total: 7-10 hours**

---

### ✅ **Next Steps for Phase 3, Step 2**
1. Start with `order-confirmation-modal.html` (most complex)
2. Create FAST component equivalents for missing components (alerts, tables)
3. Convert utility classes to custom FAST utilities
4. Test each component as it's converted
5. Move to `exchange-component.html`
6. Complete remaining files

**🎯 Ready to proceed to Step 2: Component Conversion**
