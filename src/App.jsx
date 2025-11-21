import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import Login from './components/Login';
import Register from './components/Register';
import MapComponent from './components/MapComponent';
import Profile from './components/Profile';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/" element={token ? <Navigate to="/map" /> : <Login setToken={setToken} />} />
          <Route path="/register" element={<Register />} />
          <Route path="/map" element={token ? <MapComponent token={token} /> : <Navigate to="/" />} />
          <Route path="/profile" element={token ? <Profile /> : <Navigate to="/" />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
