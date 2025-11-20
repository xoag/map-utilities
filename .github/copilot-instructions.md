# Map App with React and Leaflet

This is a React application built with Vite that displays an interactive map using Leaflet. Users can add markers by clicking on the map and draw polygons using the drawing tools. All markers and polygons are saved locally in a SQLite database using sql.js.

## Features

- Interactive map with OpenStreetMap tiles
- Click on the map to add markers
- Draw polygons using the toolbar
- Local storage of markers and polygons in SQLite

## Getting Started

1. Install dependencies:
   ```
   npm install
   ```

2. Start the development server:
   ```
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:5173`

## Usage

- **Add Markers**: Click anywhere on the map to place a marker.
- **Draw Polygons**: Use the polygon drawing tool in the top-right corner of the map.

All changes are automatically saved to the local SQLite database.