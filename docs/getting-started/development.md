# Development Setup

## Development Environment

### VS Code Extensions

Recommended extensions for development:

- **TypeScript**: Enhanced TypeScript support
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Tailwind CSS IntelliSense**: Tailwind CSS autocomplete
- **Auto Rename Tag**: Automatically rename paired HTML/JSX tags
- **Thunder Client** or **REST Client**: API testing

### Code Style

The project uses:
- **ESLint** for linting
- **Prettier** for formatting
- **TypeScript** for type checking

Run the following commands to ensure code quality:

```bash
# Frontend
npm run lint
npm run type-check

# Backend
cd backend
npm run lint
npm run type-check
npm run test
```

### Hot Reload

Both frontend and backend support hot reload during development:

- **Frontend**: Vite provides instant hot module replacement
- **Backend**: Uses `nodemon` for automatic restarts on file changes

### Debugging

#### Frontend Debugging
- Use browser developer tools
- React DevTools extension
- VS Code debugger with Chrome

#### Backend Debugging
- VS Code debugger configuration included
- Use `npm run dev:debug` for debug mode
- Console logging and breakpoints

### Testing

```bash
# Run frontend tests
npm run test

# Run backend tests
cd backend
npm run test

# Run tests with coverage
npm run test:coverage
```

## Development Workflow

1. Create a new branch for your feature
2. Make changes with proper commit messages
3. Run tests and linting
4. Submit pull request
5. Code review and merge

## Troubleshooting

### Common Issues

**Port already in use**
- Frontend (5173): Change port in `vite.config.ts`
- Backend (3000): Change port in `backend/src/config/env.ts`

**Database connection errors**
- Verify database is running
- Check credentials in `.env`
- Ensure database exists

**Module not found errors**
- Run `npm install` in both root and backend directories
- Clear node_modules and reinstall if needed
