# Installation Guide

## Prerequisites

Before setting up TMF Shop, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **PostgreSQL** or **MySQL**
- **Git**

## Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd tmfshop
   ```

2. **Install dependencies**
   ```bash
   # Install frontend dependencies
   npm install
   
   # Install backend dependencies
   cd backend
   npm install
   cd ..
   ```

3. **Set up environment variables**
   ```bash
   # Copy example environment files
   cp backend/.env.example backend/.env
   ```

4. **Configure database**
   - Create a new database for the project
   - Update database credentials in `backend/.env`

5. **Run database migrations**
   ```bash
   cd backend
   npm run migration:run
   cd ..
   ```

6. **Start the development servers**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev
   
   # Terminal 2 - Frontend
   npm run dev
   ```

## Next Steps

- [Development Setup](./development.md)
- [Environment Configuration](./environment.md)
- [Database Setup](../database/setup.md)
