const express = require('express');
const cors = require('cors');
const app = express();

// Configuration CORS
app.use(cors());

// Middleware pour parser le JSON
app.use(express.json());

// Importer les routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users'); 
const walletRoutes = require('./routes/wallets');
const transactionRoutes = require('./routes/transactions');

// Utiliser les routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/wallets', walletRoutes);
app.use('/api/transactions', transactionRoutes);

// Ajoutez un log pour déboguer les routes
app.use((req, res, next) => {
  console.log(`Route demandée: ${req.method} ${req.url}`);
  next();
});

// Route de base pour vérifier que l'API fonctionne
app.get('/', (req, res) => {
  res.json({ message: 'Bienvenue sur l\'API Secure Wallet' });
});

// Gestion des erreurs 404
app.use((req, res, next) => {
  console.log(`Route non trouvée: ${req.method} ${req.url}`);
  res.status(404).json({ message: 'Route non trouvée' });
});

// Gestion des erreurs globales
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Erreur serveur',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Une erreur est survenue'
  });
});

// Définir le port
const PORT = process.env.PORT || 5000;

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`Serveur en cours d'exécution sur le port ${PORT}`);
});

module.exports = app;
