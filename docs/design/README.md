# TFMshop Design System

## 🎨 Brand Identity

**TFMshop** - *Shop, Smile, Save More*

A modern e-commerce platform that combines the familiar patterns of Amazon with a fresh, sustainable approach to online shopping. Our design emphasizes trust, efficiency, and delight in the shopping experience.

## 🌈 Color Palette

### Primary Colors

```css
:root {
  /* Primary Brand Colors */
  --tfm-primary: #000f0a;        /* Deep Forest Green */
  --tfm-secondary: #001f14;      /* Darker Forest Green */
  --tfm-accent: #ff9500;         /* Vibrant Orange */
  --tfm-teal: #20B2AA;          /* Light Sea Green */
  
  /* Neutral Colors */
  --tfm-white: #ffffff;
  --tfm-gray-50: #f9fafb;
  --tfm-gray-100: #f3f4f6;
  --tfm-gray-200: #e5e7eb;
  --tfm-gray-300: #d1d5db;
  --tfm-gray-400: #9ca3af;
  --tfm-gray-500: #6b7280;
  --tfm-gray-600: #4b5563;
  --tfm-gray-700: #374151;
  --tfm-gray-800: #1f2937;
  --tfm-gray-900: #111827;
  
  /* Semantic Colors */
  --tfm-success: #10b981;
  --tfm-warning: #f59e0b;
  --tfm-error: #ef4444;
  --tfm-info: #3b82f6;
}
```

### Color Usage Guidelines

#### Primary Actions
- **Buttons**: `--tfm-primary` with `--tfm-secondary` on hover
- **Links**: `--tfm-primary` with underline on hover
- **Call-to-Actions**: `--tfm-accent` for high-priority actions

#### Text Colors
```css
.text-primary { color: var(--tfm-gray-900); }
.text-secondary { color: var(--tfm-gray-600); }
.text-muted { color: var(--tfm-gray-500); }
.text-brand { color: var(--tfm-primary); }
```

#### Background Colors
```css
.bg-primary { background-color: var(--tfm-primary); }
.bg-secondary { background-color: var(--tfm-gray-50); }
.bg-accent { background-color: var(--tfm-accent); }
.bg-surface { background-color: var(--tfm-white); }
```

### Accessibility Compliance

All color combinations meet WCAG 2.1 AA standards:
- Text on white: minimum 4.5:1 contrast ratio
- Text on colored backgrounds: minimum 4.5:1 contrast ratio
- Interactive elements: minimum 3:1 contrast ratio

## 📝 Typography

### Font Family
```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
```

### Type Scale

```css
/* Headings */
.text-4xl { font-size: 2.25rem; line-height: 2.5rem; }    /* 36px */
.text-3xl { font-size: 1.875rem; line-height: 2.25rem; }  /* 30px */
.text-2xl { font-size: 1.5rem; line-height: 2rem; }       /* 24px */
.text-xl { font-size: 1.25rem; line-height: 1.75rem; }    /* 20px */
.text-lg { font-size: 1.125rem; line-height: 1.75rem; }   /* 18px */

/* Body Text */
.text-base { font-size: 1rem; line-height: 1.5rem; }      /* 16px */
.text-sm { font-size: 0.875rem; line-height: 1.25rem; }   /* 14px */
.text-xs { font-size: 0.75rem; line-height: 1rem; }       /* 12px */

/* Display */
.text-5xl { font-size: 3rem; line-height: 1; }            /* 48px */
.text-6xl { font-size: 3.75rem; line-height: 1; }         /* 60px */
```

### Font Weights
```css
.font-light { font-weight: 300; }
.font-normal { font-weight: 400; }
.font-medium { font-weight: 500; }
.font-semibold { font-weight: 600; }
.font-bold { font-weight: 700; }
```

### Typography Usage

#### Page Titles
```css
.page-title {
  font-size: 1.875rem;
  font-weight: 600;
  line-height: 2.25rem;
  color: var(--tfm-gray-900);
  margin-bottom: 1rem;
}
```

#### Section Headers
```css
.section-header {
  font-size: 1.25rem;
  font-weight: 600;
  line-height: 1.75rem;
  color: var(--tfm-gray-800);
  margin-bottom: 0.75rem;
}
```

#### Body Text
```css
.body-text {
  font-size: 1rem;
  font-weight: 400;
  line-height: 1.5rem;
  color: var(--tfm-gray-700);
}
```

#### Product Prices
```css
.price-current {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--tfm-gray-900);
}

.price-original {
  font-size: 0.875rem;
  font-weight: 400;
  color: var(--tfm-gray-500);
  text-decoration: line-through;
}
```

## 📐 Spacing System

Based on an 8px grid system for consistent spacing throughout the application.

```css
/* Spacing Scale */
.space-1 { margin: 0.25rem; }    /* 4px */
.space-2 { margin: 0.5rem; }     /* 8px */
.space-3 { margin: 0.75rem; }    /* 12px */
.space-4 { margin: 1rem; }       /* 16px */
.space-5 { margin: 1.25rem; }    /* 20px */
.space-6 { margin: 1.5rem; }     /* 24px */
.space-8 { margin: 2rem; }       /* 32px */
.space-10 { margin: 2.5rem; }    /* 40px */
.space-12 { margin: 3rem; }      /* 48px */
.space-16 { margin: 4rem; }      /* 64px */
```

### Component Spacing Guidelines

#### Cards
- Padding: `1.5rem` (24px)
- Gap between cards: `1rem` (16px)

#### Buttons
- Padding: `0.5rem 1rem` (8px 16px) for default
- Padding: `0.375rem 0.75rem` (6px 12px) for small
- Padding: `0.75rem 1.5rem` (12px 24px) for large

#### Form Elements
- Margin bottom: `1rem` (16px)
- Label spacing: `0.5rem` (8px)

## 🎯 Logo & Branding

### TFMshop Logo

The TFMshop logo consists of:
1. **"Tfm"** in teal (`#20B2AA`)
2. **"shop"** in gray (`#6b7280`)
3. **Curved smile element** underneath

#### Logo Specifications
```css
.logo {
  font-family: 'Inter', sans-serif;
  font-weight: 700;
  font-size: 1.5rem;
  line-height: 1;
}

.logo-tfm {
  color: var(--tfm-teal);
}

.logo-shop {
  color: var(--tfm-gray-500);
}

.logo-smile {
  stroke: var(--tfm-teal);
  stroke-width: 2;
  fill: none;
}
```

#### Logo Sizes
- **Large**: 48px height (desktop header)
- **Medium**: 32px height (mobile header)
- **Small**: 24px height (footer, favicon)
- **Minimum**: 120px width for readability

#### Logo Usage
```jsx
// Primary logo
<div className="flex items-center space-x-1">
  <span className="text-tfm-teal font-bold text-xl">Tfm</span>
  <span className="text-gray-500 font-bold text-xl">shop</span>
  <svg className="w-6 h-3" viewBox="0 0 24 12">
    <path d="M2 8 Q12 2 22 8" stroke="currentColor" fill="none" strokeWidth="2"/>
  </svg>
</div>
```

### Tagline
**"Shop, Smile, Save More"**
- Font: Inter Regular
- Size: 0.875rem (14px)
- Color: `--tfm-gray-600`
- Usage: Below logo in headers and marketing materials

## 📱 Responsive Design

### Breakpoints
```css
/* Mobile First Approach */
/* sm: 640px and up */
@media (min-width: 640px) { ... }

/* md: 768px and up */
@media (min-width: 768px) { ... }

/* lg: 1024px and up */
@media (min-width: 1024px) { ... }

/* xl: 1280px and up */
@media (min-width: 1280px) { ... }

/* 2xl: 1536px and up */
@media (min-width: 1536px) { ... }
```

### Container Widths
```css
.container {
  width: 100%;
  max-width: 1440px;  /* Amazon standard */
  margin: 0 auto;
  padding: 0 1rem;
}

@media (min-width: 640px) {
  .container { padding: 0 1.5rem; }
}

@media (min-width: 1024px) {
  .container { padding: 0 2rem; }
}
```

### Grid System
```css
/* Product Grid Responsive */
.product-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: 1fr;
}

@media (min-width: 640px) {
  .product-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (min-width: 768px) {
  .product-grid { grid-template-columns: repeat(3, 1fr); }
}

@media (min-width: 1024px) {
  .product-grid { grid-template-columns: repeat(4, 1fr); }
}

@media (min-width: 1280px) {
  .product-grid { grid-template-columns: repeat(5, 1fr); }
}
```

## 🎨 Components

### Buttons

#### Primary Button
```css
.btn-primary {
  background-color: var(--tfm-primary);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 500;
  transition: all 0.2s ease-in-out;
}

.btn-primary:hover {
  background-color: var(--tfm-secondary);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 15, 10, 0.15);
}
```

#### Secondary Button
```css
.btn-secondary {
  background-color: transparent;
  color: var(--tfm-primary);
  border: 1px solid var(--tfm-gray-300);
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 500;
  transition: all 0.2s ease-in-out;
}

.btn-secondary:hover {
  background-color: var(--tfm-gray-50);
  border-color: var(--tfm-primary);
}
```

### Cards

#### Product Card
```css
.product-card {
  background-color: white;
  border-radius: 0.5rem;
  padding: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease-in-out;
}

.product-card:hover {
  box-shadow: 0 4px 25px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}
```

#### Feature Card
```css
.feature-card {
  background-color: white;
  border: 1px solid var(--tfm-gray-200);
  border-radius: 0.75rem;
  padding: 2rem;
  text-align: center;
}
```

### Forms

#### Input Fields
```css
.form-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid var(--tfm-gray-300);
  border-radius: 0.375rem;
  font-size: 1rem;
  transition: border-color 0.2s ease-in-out;
}

.form-input:focus {
  outline: none;
  border-color: var(--tfm-primary);
  box-shadow: 0 0 0 3px rgba(0, 15, 10, 0.1);
}

.form-input.error {
  border-color: var(--tfm-error);
}
```

#### Labels
```css
.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--tfm-gray-700);
}
```

## 🌊 Animations

### Transitions
```css
/* Standard transitions */
.transition-standard {
  transition: all 0.2s ease-in-out;
}

.transition-slow {
  transition: all 0.3s ease-in-out;
}

.transition-fast {
  transition: all 0.1s ease-in-out;
}
```

### Hover Effects
```css
.hover-lift {
  transition: transform 0.2s ease-in-out;
}

.hover-lift:hover {
  transform: translateY(-2px);
}

.hover-shadow {
  transition: box-shadow 0.2s ease-in-out;
}

.hover-shadow:hover {
  box-shadow: 0 4px 25px rgba(0, 0, 0, 0.15);
}
```

### Loading Animations
```css
@keyframes spin {
  to { transform: rotate(360deg); }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
```

## 🎯 Iconography

### Icon System
Using **Lucide React** for consistent, lightweight icons.

#### Icon Sizes
```css
.icon-xs { width: 0.75rem; height: 0.75rem; }  /* 12px */
.icon-sm { width: 1rem; height: 1rem; }        /* 16px */
.icon-md { width: 1.25rem; height: 1.25rem; }  /* 20px */
.icon-lg { width: 1.5rem; height: 1.5rem; }    /* 24px */
.icon-xl { width: 2rem; height: 2rem; }        /* 32px */
```

#### Common Icons
- **Shopping**: ShoppingCart, ShoppingBag, Package
- **User**: User, UserPlus, Heart, Star
- **Navigation**: ChevronDown, ChevronRight, Menu, X
- **Actions**: Plus, Minus, Edit, Trash2, Eye
- **Status**: CheckCircle, AlertCircle, XCircle, Info

## 📐 Layout Patterns

### Page Layout
```jsx
<div className="min-h-screen bg-gray-50">
  <Header />
  <main className="container mx-auto px-4 py-8">
    {/* Page content */}
  </main>
  <Footer />
</div>
```

### Content Sections
```jsx
<section className="py-12">
  <div className="container mx-auto px-4">
    <h2 className="text-2xl font-semibold mb-8 text-center">
      Section Title
    </h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Section content */}
    </div>
  </div>
</section>
```

## ♿ Accessibility

### Focus States
```css
.focus-ring {
  outline: 2px solid transparent;
  outline-offset: 2px;
}

.focus-ring:focus {
  outline: 2px solid var(--tfm-primary);
  outline-offset: 2px;
}
```

### Screen Reader Support
```jsx
// Hidden text for screen readers
<span className="sr-only">Screen reader only text</span>

// ARIA labels
<button aria-label="Add to cart">
  <ShoppingCart aria-hidden="true" />
</button>
```

### Color Contrast
All text and interactive elements meet WCAG 2.1 AA standards:
- Normal text: 4.5:1 contrast ratio
- Large text: 3:1 contrast ratio
- Interactive elements: 3:1 contrast ratio

---

**Design System Version**: 1.0.0  
**Last Updated**: July 30, 2025  
**Maintained by**: TFMshop Design Team
