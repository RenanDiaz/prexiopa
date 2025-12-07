# 🛠️ Development Setup Guide

This guide will help you set up your local development environment for Prexiopá.

---

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18.x or higher ([Download](https://nodejs.org/))
- **npm** 9.x or higher (comes with Node.js)
- **Git** ([Download](https://git-scm.com/))
- A code editor (we recommend [VS Code](https://code.visualstudio.com/))

---

## Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/prexiopa.git
cd prexiopa
```

---

## Step 2: Install Dependencies

```bash
npm install
```

This will install all required dependencies including:
- React 18
- TypeScript
- Vite
- Styled Components
- Zustand
- And more...

---

## Step 3: Environment Variables

### Create .env file

```bash
cp .env.example .env
```

### Configure Supabase

You'll need to create a Supabase project and get your credentials:

1. Go to [Supabase](https://supabase.com)
2. Create a new project
3. Go to **Settings > API**
4. Copy the following values to your `.env` file:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

---

## Step 4: Database Setup

### Run Migrations

All database migrations are located in `supabase/migrations/`.

**IMPORTANT:** Do NOT use the Supabase CLI. Execute migrations manually:

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of each migration file (in order)
4. Paste and execute in the SQL Editor

### Migration Order

Execute migrations in this order:

1. `20250129_create_contributions_system.sql`
2. `20250129_create_user_roles_system.sql`
3. `20250130_apply_contributions_to_products.sql`

---

## Step 5: Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

---

## Step 6: Verify Setup

### Check that everything works:

1. **Homepage loads** - You should see the Prexiopá homepage
2. **Search works** - Try searching for products
3. **Auth works** - Try logging in with Google OAuth (requires setup)
4. **No console errors** - Check browser console for errors

---

## Development Workflow

### Running the Dev Server

```bash
npm run dev
```

### Type Checking

```bash
npm run type-check
```

### Linting

```bash
npm run lint
npm run lint:fix  # Auto-fix issues
```

### Building

```bash
npm run build
```

### Preview Build

```bash
npm run preview
```

---

## Recommended VS Code Extensions

- **ES7+ React/Redux/React-Native snippets**
- **Prettier - Code formatter**
- **ESLint**
- **Styled Components**
- **GitLens**

### VS Code Settings

Create `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true
}
```

---

## Troubleshooting

### Port 5173 is already in use

```bash
# Kill the process using port 5173
lsof -ti:5173 | xargs kill -9

# Or use a different port
npm run dev -- --port 3000
```

### Module not found errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Supabase connection errors

- Verify your `.env` file has correct credentials
- Check that your Supabase project is active
- Ensure RLS policies are configured correctly

---

## Next Steps

- Read [ARCHITECTURE.md](ARCHITECTURE.md) to understand the codebase structure
- Check [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines
- Review [DATABASE.md](DATABASE.md) for database schema details

---

**Need help?** Open an issue on GitHub or contact the team.
