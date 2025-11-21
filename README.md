# Map Utilities 🗺️

An interactive web mapping application built with React, Node.js, and Leaflet. Users can create markers, draw polygons, search places, and manage their data with a complete authentication system.

## ✨ Features

- **🔐 Authentication**: User registration and login with JWT tokens
- **🗺️ Interactive Maps**: OpenStreetMap-based maps with Leaflet
- **📍 Smart Markers**: Add markers with clustering for better performance
- **📐 Polygons**: Draw areas with automatic area calculation
- **🔍 Search**: Place search with autocomplete using Nominatim API
- **🏷️ Labels**: Custom labels for polygons
- **🌓 Themes**: Dark/light mode toggle with persistence
- **📱 Responsive**: Works on desktop and mobile devices
- **🐳 Docker**: Complete containerization setup
- **🔄 CI/CD**: Automated testing with GitHub Actions

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Docker (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/xoag/map-utilities.git
   cd map-utilities
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the backend server**
   ```bash
   npm run server
   ```

4. **In another terminal, start the frontend**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   - Frontend: http://localhost:5173
   - Backend: http://localhost:3001

### With Docker

```bash
docker build -t map-app .
docker run -p 3001:3001 map-app
```

## 🛠️ Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build
- `npm run server` - Start backend only

### Project Structure

```
src/
├── components/          # React components
│   ├── Login.jsx       # Login form
│   ├── Register.jsx    # Registration form
│   ├── MapComponent.jsx # Main map component
│   └── Profile.jsx     # Profile management
├── contexts/           # React contexts
│   └── ThemeContext.jsx # Theme management
├── App.jsx            # Root component
├── main.jsx           # Entry point
└── index.css          # Global styles

server.js              # Backend server
Dockerfile             # Docker configuration
eslint.config.js       # ESLint configuration
```

## 🔧 CI/CD

This project uses GitHub Actions for automated CI/CD:

### Workflows

- **CI**: Runs on push/PR, tests build on Node.js 18 and 20
- **Linting**: Code quality checks with ESLint
- **Docker Build**: Validates container builds

### CI Status
[![CI](https://github.com/xoag/map-utilities/actions/workflows/ci.yml/badge.svg)](https://github.com/xoag/map-utilities/actions/workflows/ci.yml)

## 📦 Technologies

### Frontend
- **React 19** - UI framework
- **Vite** - Build tool and dev server
- **React Router** - Navigation
- **Leaflet** - Interactive maps
- **React Leaflet** - React-Leaflet integration
- **React Leaflet MarkerCluster** - Marker clustering

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **SQLite** - Database
- **JWT** - Authentication
- **bcrypt** - Password hashing

### DevOps
- **Docker** - Containerization
- **ESLint** - Code linting
- **GitHub Actions** - CI/CD

## 🎯 Usage

1. **Register**: Create a new account
2. **Login**: Sign in with your credentials
3. **Enable Marker Mode**: Click the button to add markers by clicking the map
4. **Draw Polygons**: Use the polygon tool in the top-left
5. **Search Places**: Use the search bar to find locations
6. **Toggle Theme**: Switch between light and dark modes
7. **Manage Profile**: Update password in profile section

## 🤝 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 Roadmap

- [ ] Automated tests with Jest and React Testing Library
- [ ] Export/import GeoJSON data
- [ ] Offline mode with service workers
- [ ] REST API documentation
- [ ] Automatic deployment to Vercel/Railway
- [ ] GPS location button
- [ ] Undo/redo functionality

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [OpenStreetMap](https://www.openstreetmap.org/) for map data
- [Leaflet](https://leafletjs.com/) for the mapping library
- [React](https://reactjs.com/) for the UI framework

---

Made with ❤️ and lots of ☕
