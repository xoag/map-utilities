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

function MapEvents({ onMapClick }) {
  useMapEvents({
    click: onMapClick,
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
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isMarkerMode, setIsMarkerMode] = useState(false);

  useEffect(() => {
    if (token) {
      fetch('http://localhost:3001/markers', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => {
          if (!res.ok) throw new Error('Failed to fetch markers');
          return res.json();
        })
        .then(setMarkers)
        .catch(() => setMarkers([]));

      fetch('http://localhost:3001/polygons', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => {
          if (!res.ok) throw new Error('Failed to fetch polygons');
          return res.json();
        })
        .then(setPolygons)
        .catch(() => setPolygons([]));
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
    if (isMarkerMode) {
      const { lat, lng } = e.latlng;
      const newMarkers = [...markers, { lat, lng }];
      saveMarkers(newMarkers);
    }
  };

  const handleCreated = (e) => {
    const { layerType, layer } = e;
    if (layerType === 'polygon') {
      const coords = layer.getLatLngs()[0].map(latlng => [latlng.lat, latlng.lng]);
      const newPolygons = [...polygons, { coords, label: '' }];
      savePolygons(newPolygons);
    }
  };

  function getCenter(coords) {
    const lats = coords.map(c => c[0]);
    const lngs = coords.map(c => c[1]);
    const lat = lats.reduce((a, b) => a + b) / lats.length;
    const lng = lngs.reduce((a, b) => a + b) / lngs.length;
    return [lat, lng];
  }

  const calculateArea = (coords) => {
    try {
      // Simple approximation using planar geometry (not geodesic)
      if (coords.length < 3) return '0 m²';
      let area = 0;
      for (let i = 0; i < coords.length; i++) {
        const j = (i + 1) % coords.length;
        area += coords[i][1] * coords[j][0];
        area -= coords[j][1] * coords[i][0];
      }
      area = Math.abs(area) / 2;
      // Approximate meters squared (rough, not accurate for large areas)
      const meters = area * 111319.5 * 111319.5 * Math.cos((coords[0][0] * Math.PI) / 180);
      if (meters < 1000000) {
        return meters.toFixed(0) + ' m²';
      } else {
        return (meters / 1000000).toFixed(2) + ' km²';
      }
    } catch (error) {
      console.error('Error calculating area:', error);
      return 'Error';
    }
  };

  const handleSearchInput = async (query) => {
    setSearchQuery(query);
    if (query.trim().length > 2) {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`);
        const data = await res.json();
        setSuggestions(data);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Search error:', error);
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (suggestions.length > 0) {
      handleSelectSuggestion(suggestions[0]);
    }
  };

  const saveLabel = (index) => {
    const newPolygons = [...polygons];
    newPolygons[index].label = editingLabel.label;
    savePolygons(newPolygons);
    setEditingLabel({ index: -1, label: '' });
  };

  const handleLabelChange = (index, label) => {
    setEditingLabel({ index, label });
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
      `}} />
      <div style={{
        position: 'absolute',
        top: '10px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000,
        background: 'white',
        padding: '10px',
        borderRadius: '5px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        display: 'flex',
        flexDirection: 'column',
        gap: '5px',
        minWidth: '250px',
      }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '5px', position: 'relative' }}>
          <input
            type="text"
            placeholder="Search places..."
            value={searchQuery}
            onChange={(e) => handleSearchInput(e.target.value)}
            style={{
              padding: '8px',
              border: '1px solid #ddd',
              borderRadius: '3px',
              width: '200px',
            }}
          />
          <button
            type="submit"
            style={{
              padding: '8px 12px',
              background: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '3px',
              cursor: 'pointer',
            }}
          >
            Search
          </button>
          {showSuggestions && suggestions.length > 0 && (
            <ul style={{
              position: 'absolute',
              top: '100%',
              left: '0',
              right: '0',
              background: 'white',
              border: '1px solid #ddd',
              borderRadius: '3px',
              listStyle: 'none',
              margin: '0',
              padding: '0',
              maxHeight: '200px',
              overflowY: 'auto',
              zIndex: 1001,
            }}>
              {suggestions.map((suggestion, index) => (
                <li
                  key={index}
                  onClick={() => handleSelectSuggestion(suggestion)}
                  style={{
                    padding: '8px',
                    cursor: 'pointer',
                    borderBottom: index < suggestions.length - 1 ? '1px solid #eee' : 'none',
                  }}
                  onMouseOver={(e) => e.target.style.background = '#f8f9fa'}
                  onMouseOut={(e) => e.target.style.background = 'white'}
                >
                  {suggestion.display_name}
                </li>
              ))}
            </ul>
          )}
        </form>
      </div>
      <div style={{
        position: 'absolute',
        top: '140px',
        left: '10px',
        zIndex: 1000,
        background: 'white',
        padding: '5px',
        borderRadius: '5px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      }}>
        <button
          onClick={() => setIsMarkerMode(!isMarkerMode)}
          style={{
            padding: '8px 12px',
            background: isMarkerMode ? '#dc3545' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '3px',
            cursor: 'pointer',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
          }}
        >
          📍 {isMarkerMode ? 'Disable Marker Mode' : 'Enable Marker Mode'}
        </button>
      </div>
      <button
        onClick={() => {
          window.location.href = '/profile';
        }}
        style={{
          position: 'absolute',
          bottom: '10px',
          left: '120px',
          zIndex: 1000,
          padding: '12px 20px',
          background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
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
          e.target.style.background = 'linear-gradient(135deg, #218838 0%, #17a2b8 100%)';
          e.target.style.transform = 'translateY(-2px)';
          e.target.style.boxShadow = '0 6px 20px rgba(0,0,0,0.3)';
        }}
        onMouseOut={(e) => {
          e.target.style.background = 'linear-gradient(135deg, #28a745 0%, #20c997 100%)';
          e.target.style.transform = 'translateY(0)';
          e.target.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
        }}
      >
        Profile
      </button>
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
      <MapContainer center={[51.505, -0.09]} zoom={13} style={{ height: '100vh', width: '100%' }}>
        <SetInitialView />
        <MapEvents onMapClick={handleMapClick} />
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
                  <strong>Polygon {index + 1}</strong><br />
                  Area: {calculateArea(poly.coords)}<br />
                  <input
                    type="text"
                    placeholder="Label"
                    value={editingLabel.index === index ? editingLabel.label : poly.label}
                    onChange={(e) => handleLabelChange(index, e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => e.stopPropagation()}
                  />
                  <button onClick={(e) => { e.stopPropagation(); saveLabel(index); }}>Save Label</button>
                  <br />
                  <button onClick={(e) => { e.stopPropagation(); const newPolygons = polygons.filter((_, i) => i !== index); savePolygons(newPolygons); }}>Delete Polygon</button>
                </div>
              </Popup>
            </Polygon>
            {poly.label && (
              <Marker
                position={getCenter(poly.coords)}
                icon={L.divIcon({ html: `<div style="display: inline-block; background: rgba(65,105,225,0.4); border: 1px solid #ccc; border-radius: 4px; color: red; font-weight: bold; font-size: 14px; padding: 1px 2px; white-space: nowrap; pointer-events: none;">${poly.label}</div>` })}
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