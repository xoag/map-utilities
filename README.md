# Map App with React and Leaflet

This is a React application built with Vite that displays an interactive map using Leaflet. Users can add markers by clicking on the map and draw polygons using the drawing tools. All markers and polygons are saved on the server per user.

## Features

- User registration and login
- Interactive map with OpenStreetMap tiles
- Click on the map to add markers
- Draw polygons using the toolbar
- Server-side storage of markers and polygons per user
- Delete markers and polygons

## Getting Started

1. Install dependencies:
   ```
   npm install
   ```

2. Start the backend server:
   ```
   npm run server
   ```

3. In another terminal, start the frontend:
   ```
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

## Usage

- **Register**: Create a new account with username and password.
- **Login**: Log in with your credentials.
- **Add Markers**: Click anywhere on the map to place a marker.
- **Draw Polygons**: Use the polygon drawing tool in the top-right corner of the map.
- **Delete**: Click on markers or polygons to open popup and delete.

All data is stored on the server and persists across sessions.
