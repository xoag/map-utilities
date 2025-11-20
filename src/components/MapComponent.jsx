import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon, FeatureGroup, useMapEvents, useMap } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.css';
import L, { DivIcon } from 'leaflet';

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
  const [editingLabel, setEditingLabel] = useState({ index: -1, label: '' });

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
      const newPolygons = [...polygons, { coords, label: '' }];
      savePolygons(newPolygons);
    }
  };

  const getCenter = (coords) => {
    const lats = coords.map(c => c[0]);
    const lngs = coords.map(c => c[1]);
    const lat = lats.reduce((a, b) => a + b) / lats.length;
    const lng = lngs.reduce((a, b) => a + b) / lngs.length;
    return [lat, lng];
  };

  const handleLabelChange = (index, label) => {
    setEditingLabel({ index, label });
  };

  const saveLabel = (index) => {
    const newPolygons = [...polygons];
    newPolygons[index].label = editingLabel.label;
    savePolygons(newPolygons);
    setEditingLabel({ index: -1, label: '' });
  };

  return (
    <div style={{ position: 'relative' }}>
      <style dangerouslySetInnerHTML={{__html: `
        .leaflet-draw-edit-edit, .leaflet-draw-edit-remove { display: none !important; }
        .leaflet-draw-draw-polygon {
          border-radius: 5px !important;
          box-shadow: 0 4px 15px rgba(0,0,0,0.2) !important;
          transition: all 0.3s ease !important;
        }
        .leaflet-draw-draw-polygon:hover {
          transform: translateY(-2px) !important;
          box-shadow: 0 6px 20px rgba(0,0,0,0.3) !important;
        }
        .polygon-label {
          background: none;
          border: none;
          color: black;
          font-weight: bold;
          font-size: 14px;
          text-align: center;
          pointer-events: none;
        }
      `}} />
      <button
        onClick={() => {
          localStorage.removeItem('token');
          window.location.href = '/';
        }}
        style={{
          position: 'absolute',
          bottom: '10px',
          left: '10px',
          zIndex: 1000,
          padding: '12px 20px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          fontSize: '14px',
          fontWeight: 'bold',
          cursor: 'pointer',
          boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
          transition: 'all 0.3s ease',
        }}
        onMouseOver={(e) => {
          e.target.style.background = 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)';
          e.target.style.transform = 'translateY(-2px)';
          e.target.style.boxShadow = '0 6px 20px rgba(0,0,0,0.3)';
        }}
        onMouseOut={(e) => {
          e.target.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
          e.target.style.transform = 'translateY(0)';
          e.target.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
        }}
      >
        Logout
      </button>
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
          <div key={index}>
            <Polygon positions={poly.coords}>
              <Popup>
                <div>
                  <input
                    type="text"
                    placeholder="Label"
                    value={editingLabel.index === index ? editingLabel.label : poly.label}
                    onChange={(e) => handleLabelChange(index, e.target.value)}
                  />
                  <button onClick={() => saveLabel(index)}>Save Label</button>
                  <br />
                  <button onClick={() => {
                    const newPolygons = polygons.filter((_, i) => i !== index);
                    savePolygons(newPolygons);
                  }}>Delete Polygon</button>
                </div>
              </Popup>
            </Polygon>
            {poly.label && (
              <Marker
                position={getCenter(poly.coords)}
                icon={new DivIcon({ html: poly.label, className: 'polygon-label' })}
              />
            )}
          </div>
        ))}
        <FeatureGroup>
          <EditControl
            position="topleft"
            onCreated={handleCreated}
            draw={{
              rectangle: false,
              circle: false,
              circlemarker: false,
              marker: false,
              polygon: true,
              polyline: false,
            }}
            edit={false}
            delete={false}
          />
        </FeatureGroup>
      </MapContainer>
    </div>
  );
}

export default MapComponent;