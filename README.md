# Timeoff Tracker React

A modern React application for tracking time off, built with TypeScript and Vite.

## 🚀 Quick Start

### Development

```bash
# Install dependencies
yarn install

# Start development server
yarn dev

# Open http://localhost:5173 in your browser
```

### Building for Production

```bash
# Build the app
yarn build

# Preview the production build
yarn preview
```

## 📦 Deployment to GitHub Pages

This app is configured to deploy to GitHub Pages automatically.

### Prerequisites

1. Make sure your repository is pushed to GitHub
2. Enable GitHub Pages in your repository settings:
   - Go to Settings → Pages
   - Select "Deploy from a branch"
   - Choose "gh-pages" branch
   - Select "/ (root)" folder

### Deploy Commands

```bash
# Deploy to GitHub Pages (builds and deploys)
yarn deploy

# Or use the deployment script
./deploy.sh
```

### Manual Deployment Steps

1. **Build the project:**
   ```bash
   yarn build
   ```

2. **Deploy to GitHub Pages:**
   ```bash
   yarn deploy
   ```

3. **Your app will be available at:**
   ```
   https://xavier.github.io/TimeoffTracker-react
   ```

## 🛠️ Available Scripts

- `yarn dev` - Start development server
- `yarn build` - Build for production
- `yarn preview` - Preview production build
- `yarn lint` - Run ESLint
- `yarn deploy` - Deploy to GitHub Pages

## 📁 Project Structure

```
src/
├── App.tsx          # Main app component
├── App.css          # App styles
├── main.tsx         # Entry point
└── index.css        # Global styles
```

## 🔧 Configuration

- **Vite** for fast development and building
- **TypeScript** for type safety
- **ESLint** for code quality
- **GitHub Pages** for deployment

## 📝 Notes

- The app is configured with the base path `/TimeoffTracker-react/` for GitHub Pages
- Make sure to update the `homepage` field in `package.json` if you change the repository name
- The `gh-pages` package handles the deployment to the `gh-pages` branch automatically
