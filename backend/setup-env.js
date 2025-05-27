const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Fonction pour poser une question et obtenir une réponse
function question(query) {
  return new Promise(resolve => {
    rl.question(query, answer => {
      resolve(answer);
    });
  });
}

async function setupEnv() {
  console.log('Configuration du fichier .env pour Secure Wallet');
  console.log('==============================================');
  
  // Valeurs par défaut
  let port = '5000';
  let dbHost = 'localhost';
  let dbUser = 'secure_user';
  let dbPassword = '';
  let dbName = 'secure_wallet';
  let jwtSecret = crypto.randomBytes(32).toString('hex');
  let jwtExpiration = '1h';
  let rateLimitWindow = '15';
  let rateLimitMax = '100';
  
  // Demander les informations à l'utilisateur
  console.log('\nConfiguration du serveur:');
  port = await question(`Port du serveur (${port}): `) || port;
  
  console.log('\nConfiguration de la base de données:');
  dbHost = await question(`Hôte de la base de données (${dbHost}): `) || dbHost;
  dbUser = await question(`Utilisateur de la base de données (${dbUser}): `) || dbUser;
  dbPassword = await question('Mot de passe de la base de données: ') || dbPassword;
  dbName = await question(`Nom de la base de données (${dbName}): `) || dbName;
  
  console.log('\nConfiguration de sécurité:');
  jwtExpiration = await question(`Durée d'expiration du JWT (${jwtExpiration}): `) || jwtExpiration;
  rateLimitWindow = await question(`Fenêtre de limitation de débit en minutes (${rateLimitWindow}): `) || rateLimitWindow;
  rateLimitMax = await question(`Nombre maximum de requêtes par fenêtre (${rateLimitMax}): `) || rateLimitMax;
  
  // Créer le contenu du fichier .env
  const envContent = `PORT=${port}
DB_HOST=${dbHost}
DB_USER=${dbUser}
DB_PASSWORD=${dbPassword}
DB_NAME=${dbName}
JWT_SECRET=${jwtSecret}
JWT_EXPIRATION=${jwtExpiration}
RATE_LIMIT_WINDOW=${rateLimitWindow}
RATE_LIMIT_MAX=${rateLimitMax}
NODE_ENV=development
`;

  // Écrire le fichier .env
  const envPath = path.join(__dirname, '.env');
  fs.writeFileSync(envPath, envContent);
  
  console.log('\nFichier .env créé avec succès à:', envPath);
  console.log('\nVous pouvez maintenant initialiser la base de données avec:');
  console.log('node database/init-db.js');
  
  rl.close();
}

setupEnv().catch(error => {
  console.error('Erreur lors de la configuration:', error);
  rl.close();
});