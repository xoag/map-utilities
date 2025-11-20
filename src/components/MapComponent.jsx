import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon, FeatureGroup, useMapEvents, useMap } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.css';
import L from 'leaflet';

// Fix default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function MapEvents({ onMarkersChange, onPolygonsChange }) {
  useMapEvents({
    move: (e) => {
      const center = e.target.getCenter();
      localStorage.setItem('center', JSON.stringify([center.lat, center.lng]));
    },
    zoom: (e) => {
      const zoom = e.target.getZoom();
      localStorage.setItem('zoom', zoom.toString());
    },
  });
  return null;
}

function SetInitialView() {
  const map = useMap();
  useEffect(() => {
    const savedCenter = localStorage.getItem('center');
    const savedZoom = localStorage.getItem('zoom');
    if (savedCenter && savedZoom) {
      map.setView(JSON.parse(savedCenter), parseInt(savedZoom));
    }
  }, [map]);
  return null;
}

function MapComponent({ token }) {
  const [markers, setMarkers] = useState([]);
  const [polygons, setPolygons] = useState([]);

  useEffect(() => {
    if (token) {
      fetch('http://localhost:3001/markers', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => res.json())
        .then(setMarkers);

      fetch('http://localhost:3001/polygons', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => res.json())
        .then(setPolygons);
    }
  }, [token]);

  const saveMarkers = (newMarkers) => {
    setMarkers(newMarkers);
    fetch('http://localhost:3001/markers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ markers: newMarkers }),
    });
  };

  const savePolygons = (newPolygons) => {
    setPolygons(newPolygons);
    fetch('http://localhost:3001/polygons', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ polygons: newPolygons }),
    });
  };

  const handleMapClick = (e) => {
    const { lat, lng } = e.latlng;
    const newMarkers = [...markers, { lat, lng }];
    saveMarkers(newMarkers);
  };

  const handleCreated = (e) => {
    const { layerType, layer } = e;
    if (layerType === 'polygon') {
      const coords = layer.getLatLngs()[0].map(latlng => [latlng.lat, latlng.lng]);
      const newPolygons = [...polygons, coords];
      savePolygons(newPolygons);
    }
  };

  return (
    <MapContainer center={[51.505, -0.09]} zoom={13} style={{ height: '100vh', width: '100%' }} onClick={handleMapClick}>
      <SetInitialView />
      <MapEvents />
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {markers.map((marker, index) => (
        <Marker key={index} position={[marker.lat, marker.lng]}>
          <Popup>
            Marker {index + 1}
            <br />
            <button onClick={() => {
              const newMarkers = markers.filter((_, i) => i !== index);
              saveMarkers(newMarkers);
            }}>Delete Marker</button>
          </Popup>
        </Marker>
      ))}
      {polygons.map((poly, index) => (
        <Polygon key={index} positions={poly}>
          <Popup>
            <button onClick={() => {
              const newPolygons = polygons.filter((_, i) => i !== index);
              savePolygons(newPolygons);
            }}>Delete Polygon</button>
          </Popup>
        </Polygon>
      ))}
      <FeatureGroup>
        <EditControl
          position="topright"
          onCreated={handleCreated}
          draw={{
            rectangle: false,
            circle: false,
            circlemarker: false,
            marker: false,
            polygon: true,
            polyline: false,
          }}
        />
      </FeatureGroup>
    </MapContainer>
  );
}

export default MapComponent;