import express from 'express';
import sqlite3 from 'sqlite3';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cors from 'cors';

const app = express();
const PORT = 3001;
const SECRET_KEY = 'your_secret_key'; // Change this in production

app.use(cors());
app.use(express.json());

// Initialize database
const db = new sqlite3.Database('./database.db');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password_hash TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS polygons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    coords TEXT,
    label TEXT,
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`);

  // Add label column if not exists
  db.run(`ALTER TABLE polygons ADD COLUMN label TEXT DEFAULT ''`, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.log('Error adding label column:', err);
    }
  });

  db.run(`CREATE TABLE IF NOT EXISTS markers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    lat REAL,
    lng REAL,
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`);
});

// Middleware to verify JWT
function authenticateToken(req, res, next) {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access denied' });

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
}

// Register
app.post('/register', async (req, res) => {
  const { username, password, confirmPassword } = req.body;
  if (password !== confirmPassword) {
    return res.status(400).json({ error: 'Passwords do not match' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  db.run('INSERT INTO users (username, password_hash) VALUES (?, ?)', [username, hashedPassword], function(err) {
    if (err) {
      return res.status(400).json({ error: 'Username already exists' });
    }
    res.json({ message: 'User registered successfully' });
  });
});

// Login
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
    if (err || !user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY);
    res.json({ token });
  });
});

// Get polygons
app.get('/polygons', authenticateToken, (req, res) => {
  db.all('SELECT coords, label FROM polygons WHERE user_id = ?', [req.user.id], (err, rows) => {
    if (err) {
      console.log('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    const polygons = rows.map(row => ({ coords: JSON.parse(row.coords), label: row.label || '' }));
    res.json(polygons);
  });
});

// Save polygons
app.post('/polygons', authenticateToken, (req, res) => {
  const { polygons } = req.body;
  db.run('DELETE FROM polygons WHERE user_id = ?', [req.user.id], (err) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    const stmt = db.prepare('INSERT INTO polygons (user_id, coords, label) VALUES (?, ?, ?)');
    polygons.forEach(poly => {
      stmt.run(req.user.id, JSON.stringify(poly.coords), poly.label || '');
    });
    stmt.finalize();
    res.json({ message: 'Polygons saved' });
  });
});

// Get markers
app.get('/markers', authenticateToken, (req, res) => {
  db.all('SELECT lat, lng FROM markers WHERE user_id = ?', [req.user.id], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(rows);
  });
});

// Save markers
app.post('/markers', authenticateToken, (req, res) => {
  const { markers } = req.body;
  db.run('DELETE FROM markers WHERE user_id = ?', [req.user.id], (err) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    const stmt = db.prepare('INSERT INTO markers (user_id, lat, lng) VALUES (?, ?, ?)');
    markers.forEach(marker => {
      stmt.run(req.user.id, marker.lat, marker.lng);
    });
    stmt.finalize();
    res.json({ message: 'Markers saved' });
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});