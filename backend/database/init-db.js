const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

async function initializeDatabase() {
  let connection;

  try {
    // Créer une connexion sans spécifier de base de données
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD
    });

    console.log('Connexion à MySQL établie');

    // Créer la base de données si elle n'existe pas
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
    console.log(`Base de données ${process.env.DB_NAME} créée ou déjà existante`);

    // Utiliser la base de données
    await connection.query(`USE ${process.env.DB_NAME}`);

    // Lire le fichier de schéma
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Diviser le script en instructions individuelles
    const statements = schema.split(';').filter(statement => statement.trim());

    // Exécuter chaque instruction
    for (const statement of statements) {
      if (statement.trim()) {
        await connection.query(statement);
      }
    }

    console.log('Schéma de base de données initialisé avec succès');

  } catch (error) {
    console.error('Erreur lors de l\'initialisation de la base de données:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('Connexion à la base de données fermée');
    }
  }
}

// Exécuter l'initialisation
initializeDatabase()
  .then(() => {
    console.log('Initialisation de la base de données terminée');
    process.exit(0);
  })
  .catch(error => {
    console.error('Échec de l\'initialisation de la base de données:', error);
    process.exit(1);
  });