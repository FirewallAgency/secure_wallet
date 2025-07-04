const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

// Créer un pool de connexions
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Tester la connexion
pool.getConnection()
  .then(connection => {
    console.log('Connexion à la base de données établie avec succès');
    connection.release();
  })
  .catch(err => {
    console.error('Erreur de connexion à la base de données:', err);
  });

module.exports = pool;