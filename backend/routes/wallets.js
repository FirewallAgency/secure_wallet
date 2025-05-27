const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const db = require('../config/db');
const auth = require('../middleware/auth');

// Obtenir tous les portefeuilles de l'utilisateur
router.get('/', auth, async (req, res) => {
  try {
    const [wallets] = await db.query(
      'SELECT * FROM wallets WHERE user_id = ?',
      [req.user.userId]  
    );

    res.json(wallets);
  } catch (error) {
    console.error('Erreur lors de la récupération des portefeuilles:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Créer un nouveau portefeuille
router.post('/', [
  auth,
  body('name').notEmpty().withMessage('Le nom du portefeuille est requis')
], async (req, res) => {
  // Vérifier les erreurs de validation
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name } = req.body;

  try {
    const [result] = await db.query(
      'INSERT INTO wallets (user_id, name) VALUES (?, ?)',
      [req.user.userId, name]
    );

    res.status(201).json({
      id: result.insertId,
      user_id: req.user.userId,
      name,
      balance: 0,
      created_at: new Date()
    });
  } catch (error) {
    console.error('Erreur lors de la création du portefeuille:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Obtenir un portefeuille spécifique
router.get('/:id', auth, async (req, res) => {
  try {
    const [wallets] = await db.query(
      'SELECT * FROM wallets WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.userId]
    );

    if (wallets.length === 0) {
      return res.status(404).json({ message: 'Portefeuille non trouvé' });
    }

    res.json(wallets[0]);
  } catch (error) {
    console.error('Erreur lors de la récupération du portefeuille:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Mettre à jour un portefeuille
router.put('/:id', [
  auth,
  body('name').notEmpty().withMessage('Le nom du portefeuille est requis')
], async (req, res) => {
  // Vérifier les erreurs de validation
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name } = req.body;

  try {
    // Vérifier que le portefeuille appartient à l'utilisateur
    const [wallets] = await db.query(
      'SELECT * FROM wallets WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.userId]
    );

    if (wallets.length === 0) {
      return res.status(404).json({ message: 'Portefeuille non trouvé' });
    }

    // Mettre à jour le portefeuille
    await db.query(
      'UPDATE wallets SET name = ? WHERE id = ?',
      [name, req.params.id]
    );

    res.json({ message: 'Portefeuille mis à jour avec succès' });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du portefeuille:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Supprimer un portefeuille
router.delete('/:id', auth, async (req, res) => {
  try {
    // Vérifier que le portefeuille appartient à l'utilisateur
    const [wallets] = await db.query(
      'SELECT * FROM wallets WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.userId]
    );

    if (wallets.length === 0) {
      return res.status(404).json({ message: 'Portefeuille non trouvé' });
    }

    // Supprimer le portefeuille
    await db.query(
      'DELETE FROM wallets WHERE id = ?',
      [req.params.id]
    );

    res.json({ message: 'Portefeuille supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du portefeuille:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Créditer un portefeuille
router.post('/:id/credit', [
  auth,
  body('amount').isInt({ min: 1 }).withMessage('Le montant doit être un nombre entier supérieur à 0') // Modifié pour FCFA
], async (req, res) => {
  // Vérifier les erreurs de validation
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { amount } = req.body;
  const walletId = req.params.id;

  try {
    // Vérifier que le portefeuille appartient à l'utilisateur
    const [wallets] = await db.query(
      'SELECT * FROM wallets WHERE id = ? AND user_id = ?',
      [walletId, req.user.userId]
    );

    if (wallets.length === 0) {
      return res.status(404).json({ message: 'Portefeuille non trouvé' });
    }

    // Commencer une transaction SQL
    await db.query('START TRANSACTION');

    // Mettre à jour le solde du portefeuille
    await db.query(
      'UPDATE wallets SET balance = balance + ? WHERE id = ?',
      [amount, walletId]
    );

    // Créer un enregistrement de transaction (crédit)
    await db.query(
      'INSERT INTO transactions (to_wallet_id, amount, description) VALUES (?, ?, ?)',
      [walletId, amount, 'Crédit du portefeuille']
    );

    // Valider la transaction SQL
    await db.query('COMMIT');

    // Récupérer le portefeuille mis à jour
    const [updatedWallets] = await db.query(
      'SELECT * FROM wallets WHERE id = ?',
      [walletId]
    );

    res.json(updatedWallets[0]);
  } catch (error) {
    // Annuler la transaction SQL en cas d'erreur
    await db.query('ROLLBACK');
    console.error('Erreur lors du crédit du portefeuille:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;

