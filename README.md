# 🛒 Prexiopá - Smart Price Comparison Platform

> **Version:** 1.0.0 MVP  
> **Status:** In Development (97% Complete)  
> **Last Updated:** December 7, 2025

**Prexiopá** is a smart price comparison platform for Panama that helps users find the best deals across multiple stores, track prices over time, and save money on everyday purchases.

---

## 🎯 Project Overview

### What is Prexiopá?

A web application that allows users to:
- 🔍 **Compare prices** across different stores in real-time
- 📊 **Track price history** and identify trends
- ⭐ **Save favorites** and create personalized shopping lists
- 🔔 **Set price alerts** to get notified when prices drop
- 📱 **Scan barcodes** to quickly find products
- 🤝 **Contribute data** to help build a comprehensive price database

### Key Features

- **Smart Search** with filters, autocomplete, and barcode scanning
- **Price Comparison** across multiple stores
- **Price History Charts** to track trends
- **Shopping Lists** with session tracking
- **Price Alerts** with customizable thresholds
- **Dark Mode** with persistent theme preference
- **User Contributions** to enrich product data
- **Admin Dashboard** for moderation
- **Mobile-First Design** with responsive UI

---

## 📊 Current Status

### Completed (97%)

✅ **Sprint 1** - Security & Critical UX (100%)
- Protected routes with authentication
- Dark mode toggle
- Toast notifications

✅ **Sprint 2** - Mobile UX & Authentication (100%)
- Mobile offcanvas menu
- User contributions system
- Email/password authentication

✅ **Sprint 3** - Admin Moderation (60%)
- User roles & permissions system ✅
- Admin dashboard for contributions ✅
- Approval/rejection logic ✅
- Reputation system (pending)
- Incomplete products view (pending)

### In Progress

🔵 **Sprint 3** - Finishing moderation features  
🟡 **Sprint 4** - Testing & Quality  
🟢 **Sprint 5** - Performance Optimization  
🔴 **Sprint 6** - Production Deploy

---

## 🏗️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast builds
- **Styled Components** for styling
- **Zustand** for state management
- **React Router** for navigation
- **Recharts** for data visualization
- **React Toastify** for notifications

### Backend
- **Supabase** (PostgreSQL + Auth + Storage)
- **Row Level Security** (RLS) for data protection
- **Real-time subscriptions** (planned)

### Tools & Services
- **ESLint** for code quality
- **TypeScript** for type safety
- **Barcode Scanner** (via camera)
- **Google OAuth** for authentication

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Supabase account

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/prexiopa.git
cd prexiopa

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your Supabase credentials

# Run development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Environment Variables

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

---

## 📚 Documentation

### For Developers

- **[Setup Guide](docs/development/SETUP.md)** - Development environment setup
- **[Architecture](docs/development/ARCHITECTURE.md)** - System architecture overview
- **[Database Schema](docs/development/DATABASE.md)** - Database structure and migrations
- **[API Reference](docs/development/API.md)** - Service layer documentation
- **[Contributing Guide](docs/development/CONTRIBUTING.md)** - How to contribute

### For Project Management

- **[Roadmap](CLAUDE.md)** - Complete development plan and sprints
- **[Sprint Progress](docs/project/PROGRESS.md)** - Current sprint status
- **[Features](docs/project/FEATURES.md)** - Completed and planned features

### Setup Guides

- **[Google OAuth Setup](docs/setup/GOOGLE_OAUTH_SETUP.md)** - Configure Google authentication
- **[OAuth Quick Fix](docs/setup/OAUTH_QUICK_FIX.md)** - Troubleshooting OAuth issues

### Legacy Documentation

- **[Old App Models](docs/legacy/OLD_APP_DATABASE_MODELS.md)** - ThriftyTracker migration reference
- **[Phase 5 Enhancements](docs/legacy/PHASE_5_ENHANCEMENTS.md)** - Schema improvements plan

---

## 🗂️ Project Structure

```
prexiopa/
├── src/
│   ├── components/         # React components
│   │   ├── admin/         # Admin dashboard components
│   │   ├── auth/          # Authentication components
│   │   ├── common/        # Shared components
│   │   ├── contributions/ # User contributions
│   │   └── ...
│   ├── pages/             # Page components
│   ├── services/          # API services
│   ├── store/             # Zustand state stores
│   ├── hooks/             # Custom React hooks
│   ├── types/             # TypeScript types
│   ├── styles/            # Global styles
│   └── routes/            # Route configuration
├── supabase/
│   └── migrations/        # Database migrations
├── docs/                  # Documentation
│   ├── development/       # Developer docs
│   ├── project/          # Project management
│   ├── setup/            # Setup guides
│   └── legacy/           # Legacy docs
├── public/               # Static assets
└── scripts/              # Utility scripts
```

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](docs/development/CONTRIBUTING.md) for details.

### Quick Contribution Steps

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License.

---

## 👥 Team

- **Renan Diaz Reyes** - Lead Developer

---

## 🔗 Links

- **Live Demo:** [Coming soon]
- **Documentation:** [docs/](docs/)
- **Roadmap:** [CLAUDE.md](CLAUDE.md)

---

## 📧 Contact

For questions or support, please open an issue on GitHub.

---

**Made with ❤️ in Panama**
