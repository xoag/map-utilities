import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch('http://localhost:3001/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, confirmPassword }),
    });
    const data = await res.json();
    if (res.ok) {
      setMessage(data.message);
      setTimeout(() => navigate('/'), 2000);
    } else {
      setError(data.error);
    }
  };

  const styles = {
    container: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: 'Arial, sans-serif',
    },
    card: {
      background: 'white',
      padding: '40px',
      borderRadius: '10px',
      boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
      width: '100%',
      maxWidth: '400px',
      textAlign: 'center',
    },
    title: {
      marginBottom: '30px',
      color: '#333',
      fontSize: '28px',
      fontWeight: 'bold',
    },
    input: {
      width: '100%',
      padding: '15px',
      margin: '10px 0',
      border: '1px solid #ddd',
      borderRadius: '5px',
      fontSize: '16px',
      boxSizing: 'border-box',
    },
    button: {
      width: '100%',
      padding: '15px',
      background: '#667eea',
      color: 'white',
      border: 'none',
      borderRadius: '5px',
      fontSize: '16px',
      cursor: 'pointer',
      marginTop: '20px',
      transition: 'background 0.3s',
    },
    buttonHover: {
      background: '#5a6fd8',
    },
    error: {
      color: 'red',
      marginTop: '10px',
    },
    message: {
      color: 'green',
      marginTop: '10px',
    },
    link: {
      color: '#667eea',
      textDecoration: 'none',
      marginTop: '20px',
      display: 'inline-block',
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Create Account</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={styles.input}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={styles.input}
          />
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            style={styles.input}
          />
          <button
            type="submit"
            style={styles.button}
            onMouseOver={(e) => (e.target.style.background = styles.buttonHover.background)}
            onMouseOut={(e) => (e.target.style.background = styles.button.background)}
          >
            Sign Up
          </button>
        </form>
        {error && <p style={styles.error}>{error}</p>}
        {message && <p style={styles.message}>{message}</p>}
        <a href="/" style={styles.link}>Already have an account? Sign In</a>
      </div>
    </div>
  );
}

export default Register;