# TFMshop - Modern E-commerce Platform

A comprehensive e-commerce platform built with Next.js 14, featuring Amazon-inspired UX with custom TFMshop branding.

## 🚀 Current Status - PRODUCTION READY

**✅ Successfully Completed:**
- Next.js 14 project setup with TypeScript
- Comprehensive database schema with Drizzle ORM
- Modern Header and Footer components with TFM Navy theme
- Product Card component with ratings and Prime badges
- Homepage with hero section and featured products
- 28+ fully functional e-commerce pages
- Complete testing infrastructure (Jest + Playwright + MSW)
- Docker containerization and CI/CD pipeline
- Performance optimizations and production build
- Tailwind CSS configuration with TFMshop theme
- Development server running at http://localhost:3001

**🎉 Production Features:**
- Complete e-commerce platform with all major pages
- Performance monitoring and health checks
- Automated deployment scripts
- Comprehensive testing suite
- Production-ready Docker configurations

## �️ Quick Start

### Core E-commerce Functionality
- **Responsive Design**: Mobile-first approach with 1440px max-width container
- **Product Catalog**: Dynamic product grid with detailed product cards
- **Search & Navigation**: Prominent search bar with category filtering
- **User Account System**: Login/logout, account management, and order tracking
- **Shopping Cart**: Interactive cart with item count and management
- **Rating System**: 5-star rating display with review counts

### Design Highlights
- **Custom Branding**: Unique TFMshop logo with curved smile design
- **Modern Layout**: Familiar UX patterns with custom TFM Navy styling
- **TFM Navy Theme**: Custom color scheme using `#06303E` for header and navigation
- **Soft Shadows**: Subtle card shadows and hover effects
- **Typography**: Optimized font sizes (14px-16px body, 18px-22px headings)

## 🛠 Tech Stack

- **Frontend**: Next.js 14 + React 18 + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **Icons**: Lucide React
- **Testing**: Jest + Playwright + MSW
- **Deployment**: Docker + CI/CD
- **Code Quality**: ESLint + Prettier + TypeScript strict mode

## 📦 Installation

```bash
# Clone the repository
git clone <repository-url>
cd tfmshop

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🎨 Design System

### Colors
- **Primary**: `#000f0a` (Dark Green)
- **Secondary**: `#001f14` (Darker Green)
- **Accent**: `#ff9500` (Orange)
- **Teal**: `#20B2AA` (Logo accent)
- **Navy**: `#06303E` (Header/Navigation)
- **Navy Light**: `#0a4a5c` (Hover states)
- **Navy Dark**: `#042530` (Active states)
- **Gray Scale**: Various shades for text and backgrounds

### Typography
- **Body Text**: 14px-16px
- **Headings**: 18px-22px
- **Small Text**: 11px-12px
- **Font Family**: Inter, system-ui, sans-serif

### Layout
- **Max Width**: 1440px (Amazon standard)
- **Responsive Breakpoints**: Mobile-first approach
- **Grid System**: CSS Grid and Flexbox
- **Spacing**: 8px base unit system

## 🏗 Project Structure

```
src/
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── Header.tsx          # Main navigation header
│   ├── CategoryNav.tsx     # Category navigation bar
│   ├── ProductCard.tsx     # Individual product card
│   ├── ProductGrid.tsx     # Product listing grid
│   ├── Footer.tsx          # Site footer
│   └── TFMshopLogo.tsx    # Custom logo component
├── hooks/
│   └── use-toast.ts        # Toast notification hook
├── lib/
│   └── utils.ts            # Utility functions
├── App.tsx                 # Main application component
├── main.tsx               # Application entry point
└── index.css              # Global styles and Tailwind imports
```

## 🎯 Key Components

### Header Component
- Logo with custom SVG design
- Search functionality with category dropdown
- User account dropdown menu
- Shopping cart with item counter
- Location selector
- Language/currency options

### Product Grid
- Responsive grid layout (1-5 columns based on screen size)
- Product cards with images, ratings, and pricing
- Hover effects and smooth transitions
- "Add to Cart" functionality
- Badge system for featured products

### Navigation

- Horizontal category navigation
- Mobile-responsive menu
- Smooth hover transitions

## 🔧 Configuration

### Tailwind CSS
Custom configuration with:
- Extended color palette
- Custom spacing system
- Animation utilities
- Component variants

### TypeScript
Strict mode enabled with:
- Path mapping for clean imports
- Type safety throughout
- ESLint integration

## 📱 Responsive Design

- **Mobile**: Single column layout, collapsible navigation
- **Tablet**: 2-3 column product grid, condensed header
- **Desktop**: Full 5-column grid, complete navigation
- **Large Desktop**: Max 1440px width, centered layout

## 🎨 Brand Guidelines

### Logo Usage
- Primary logo includes curved smile element
- Teal "Tfm" with gray "shop" text
- Optional tagline: "Shop, Smile, Save More"
- Minimum size: 120px width for readability

### Color Applications
- Primary actions: Dark green (`#000f0a`)
- Hover states: Lighter green (`#001f14`)
- Accent elements: Orange (`#ff9500`)
- Success states: Green variants
- Error states: Red variants

## 🚀 Deployment

The project is optimized for deployment on:
- Vercel (recommended for Next.js)
- Netlify
- AWS Amplify
- Any static hosting service

Build command: `npm run build`
Output directory: `dist`

## 📚 Documentation

For detailed documentation, see the `docs/` folder:
- [Project Tracking](docs/PROJECT_TRACKING.md) - Development progress and milestones
- [Module Documentation](docs/MODULE_DOCUMENTATION.md) - System architecture and components
- [API Documentation](docs/api/) - Backend API specifications
- [Component Guide](docs/components/) - Frontend component documentation
- [Design System](docs/design/) - UI/UX guidelines and assets

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Design inspiration from Amazon.com
- UI components from shadcn/ui
- Icons from Lucide React
- Images from Pexels

---

**TFMshop** - Where shopping meets savings! 🛒✨
