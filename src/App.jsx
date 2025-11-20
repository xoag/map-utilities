import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon, FeatureGroup, useMapEvents } from 'react-leaflet';
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

function MapEvents() {
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

function App() {
  const [markers, setMarkers] = useState([]);
  const [polygons, setPolygons] = useState([]);
  const [center, setCenter] = useState([51.505, -0.09]);
  const [zoom, setZoom] = useState(13);

  useEffect(() => {
    const savedMarkers = localStorage.getItem('markers');
    if (savedMarkers) setMarkers(JSON.parse(savedMarkers));
    const savedPolygons = localStorage.getItem('polygons');
    if (savedPolygons) setPolygons(JSON.parse(savedPolygons));
    const savedCenter = localStorage.getItem('center');
    if (savedCenter) setCenter(JSON.parse(savedCenter));
    const savedZoom = localStorage.getItem('zoom');
    if (savedZoom) setZoom(parseInt(savedZoom));
  }, []);

  const handleMapClick = (e) => {
    const { lat, lng } = e.latlng;
    setMarkers(prev => {
      const newMarkers = [...prev, { lat, lng }];
      localStorage.setItem('markers', JSON.stringify(newMarkers));
      return newMarkers;
    });
  };

  const handleCreated = (e) => {
    const { layerType, layer } = e;
    if (layerType === 'polygon') {
      const coords = layer.getLatLngs()[0].map(latlng => [latlng.lat, latlng.lng]);
      setPolygons(prev => {
        const newPolygons = [...prev, coords];
        localStorage.setItem('polygons', JSON.stringify(newPolygons));
        return newPolygons;
      });
    }
  };

  return (
    <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%' }} onClick={handleMapClick}>
      <MapEvents />
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {markers.map((marker, index) => (
        <Marker key={index} position={[marker.lat, marker.lng]}>
          <Popup>Marker {index + 1}</Popup>
        </Marker>
      ))}
      {polygons.map((poly, index) => (
        <Polygon key={index} positions={poly} />
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

export default App;
