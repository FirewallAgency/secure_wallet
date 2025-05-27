const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const db = require('../config/db');
const auth = require('../middleware/auth');

// Obtenir le profil de l'utilisateur connecté
router.get('/profile', auth, async (req, res) => {
  try {
    const [users] = await db.query(
      'SELECT id, username, email, created_at FROM users WHERE id = ?',
      [req.user.userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    res.json(users[0]);
  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Mettre à jour le profil de l'utilisateur
router.put('/profile', [
  auth,
  body('username').optional().notEmpty().withMessage('Le nom d\'utilisateur ne peut pas être vide'),
  body('email').optional().isEmail().withMessage('Email invalide'),
  body('password').optional().isLength({ min: 8 }).withMessage('Le mot de passe doit contenir au moins 8 caractères')
], async (req, res) => {
  // Vérifier les erreurs de validation
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, email, password } = req.body;
  const updates = {};
  const values = [];

  // Construire la requête de mise à jour dynamiquement
  if (username) {
    updates.username = 'username = ?';
    values.push(username);
  }
  
  if (email) {
    updates.email = 'email = ?';
    values.push(email);
  }
  
  if (password) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    updates.password = 'password = ?';
    values.push(hashedPassword);
  }

  // Si aucune mise à jour n'est demandée
  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ message: 'Aucune donnée à mettre à jour' });
  }

  // Ajouter l'ID de l'utilisateur à la fin des valeurs
  values.push(req.user.userId);

  try {
    // Exécuter la mise à jour
    const updateQuery = `UPDATE users SET ${Object.values(updates).join(', ')} WHERE id = ?`;
    await db.query(updateQuery, values);

    res.json({ message: 'Profil mis à jour avec succès' });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du profil:', error);
    res.status(500).json({ message: 'Erreur serveur' }); 
  }
});

// Changer le mot de passe de l'utilisateur
router.put('/password', [
  auth,
  body('currentPassword').notEmpty().withMessage('Le mot de passe actuel est requis'),
  body('newPassword').isLength({ min: 8 }).withMessage('Le nouveau mot de passe doit contenir au moins 8 caractères')
], async (req, res) => {
  // Vérifier les erreurs de validation
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { currentPassword, newPassword } = req.body;

  try {
    // Récupérer l'utilisateur actuel
    const [users] = await db.query(
      'SELECT * FROM users WHERE id = ?',
      [req.user.userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    const user = users[0];

    // Vérifier le mot de passe actuel
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Mot de passe actuel incorrect' });
    }

    // Hacher le nouveau mot de passe
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Mettre à jour le mot de passe
    await db.query(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, req.user.userId]
    );

    res.json({ message: 'Mot de passe mis à jour avec succès' });
  } catch (error) {
    console.error('Erreur lors du changement de mot de passe:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Supprimer le compte utilisateur
router.delete('/account', auth, async (req, res) => {
  try {
    // Récupérer l'ID de l'utilisateur à partir du token
    const userId = req.user.userId;
    
    // Commencer une transaction pour assurer l'intégrité des données
    await db.query('START TRANSACTION');
    
    // Supprimer d'abord les transactions liées à l'utilisateur
    await db.query(
      'DELETE FROM transactions WHERE wallet_id IN (SELECT id FROM wallets WHERE user_id = ?)',
      [userId]
    );
    
    // Supprimer les portefeuilles de l'utilisateur
    await db.query(
      'DELETE FROM wallets WHERE user_id = ?',
      [userId]
    );
    
    // Supprimer l'utilisateur
    await db.query(
      'DELETE FROM users WHERE id = ?',
      [userId]
    );
    
    // Valider la transaction
    await db.query('COMMIT');
    
    res.json({ message: 'Compte supprimé avec succès' });
  } catch (error) {
    // En cas d'erreur, annuler la transaction
    await db.query('ROLLBACK');
    console.error('Erreur lors de la suppression du compte:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la suppression du compte' });
  }
});

module.exports = router;
