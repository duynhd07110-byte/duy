// server.js - JSON Server for Render deployment (persistent storage)
// Run with: node server.js
const path = require('path');
const fs = require('fs');
const jsonServer = require('json-server');

// Render persistent disk mount path (set this in Render: /var/data)
const DATA_DIR = process.env.DATA_DIR || '/var/data';
const DB_FILE = process.env.DB_FILE || path.join(DATA_DIR, 'db.json');

// Ensure data dir exists
fs.mkdirSync(DATA_DIR, { recursive: true });

// If DB_FILE doesn't exist (first deploy), seed it from the repo's db.json
const seedPath = path.join(__dirname, 'db.json');
if (!fs.existsSync(DB_FILE)) {
  if (fs.existsSync(seedPath)) {
    fs.copyFileSync(seedPath, DB_FILE);
    console.log(`Seeded database: ${seedPath} -> ${DB_FILE}`);
  } else {
    // Create an empty DB if no seed available
    fs.writeFileSync(DB_FILE, JSON.stringify({ tours: [], promotions: [], leaders: [], users: [], bookings: [], comments: [] }, null, 2));
    console.log(`Created empty database at ${DB_FILE}`);
  }
}

const server = jsonServer.create();
const router = jsonServer.router(DB_FILE);
const middlewares = jsonServer.defaults({
  static: path.join(__dirname, 'public'),
});

// Basic CORS for Expo/Web
server.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

server.use(middlewares);
server.use(jsonServer.bodyParser);

// Health check
server.get('/healthz', (req, res) => {
  res.json({ ok: true, dbFile: DB_FILE });
});

// Use router (REST endpoints)
server.use(router);

const PORT = process.env.PORT || 3001;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`JSON Server is running on port ${PORT}`);
  console.log(`Using DB file: ${DB_FILE}`);
});
