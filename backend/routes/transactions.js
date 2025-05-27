const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const db = require('../config/db');
const auth = require('../middleware/auth');

// Obtenir toutes les transactions de l'utilisateur
router.get('/', auth, async (req, res) => {
  try {
    const [transactions] = await db.query(`
      SELECT t.*, 
             fw.name as from_wallet_name, 
             tw.name as to_wallet_name 
      FROM transactions t
      LEFT JOIN wallets fw ON t.from_wallet_id = fw.id
      LEFT JOIN wallets tw ON t.to_wallet_id = tw.id
      WHERE fw.user_id = ? OR tw.user_id = ?
      ORDER BY t.created_at DESC
    `, [req.user.userId, req.user.userId]);

    res.json(transactions);
  } catch (error) {
    console.error('Erreur lors de la récupération des transactions:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Créer une nouvelle transaction
router.post('/', [
  auth,
  body('from_wallet_id').isInt().withMessage('ID du portefeuille source invalide'),
  body('to_wallet_id').isInt().withMessage('ID du portefeuille destination invalide'),
  body('amount').isInt({ min: 1 }).withMessage('Le montant doit être un nombre entier supérieur à 0'), // Modifié pour FCFA
  body('description').optional().trim().escape()
], async (req, res) => {
  // Vérifier les erreurs de validation
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { from_wallet_id, to_wallet_id, amount, description } = req.body;

  // Vérifier que les portefeuilles existent et que le portefeuille source appartient à l'utilisateur
  try {
    const [fromWallets] = await db.query(
      'SELECT * FROM wallets WHERE id = ? AND user_id = ?',
      [from_wallet_id, req.user.userId]
    );

    if (fromWallets.length === 0) {
      return res.status(404).json({ message: 'Portefeuille source non trouvé ou non autorisé' });
    }

    const fromWallet = fromWallets[0];

    // Vérifier que le portefeuille source a suffisamment de fonds
    if (fromWallet.balance < amount) {
      return res.status(400).json({ message: 'Solde insuffisant' });
    }

    // Vérifier que le portefeuille destination existe
    const [toWallets] = await db.query(
      'SELECT * FROM wallets WHERE id = ?',
      [to_wallet_id]
    );

    if (toWallets.length === 0) {
      return res.status(404).json({ message: 'Portefeuille destination non trouvé' });
    }

    // Commencer une transaction SQL
    await db.query('START TRANSACTION');

    // Créer la transaction
    const [result] = await db.query(
      'INSERT INTO transactions (from_wallet_id, to_wallet_id, amount, description) VALUES (?, ?, ?, ?)',
      [from_wallet_id, to_wallet_id, amount, description || null]
    );

    // Mettre à jour les soldes des portefeuilles
    await db.query(
      'UPDATE wallets SET balance = balance - ? WHERE id = ?',
      [amount, from_wallet_id]
    );

    await db.query(
      'UPDATE wallets SET balance = balance + ? WHERE id = ?',
      [amount, to_wallet_id]
    );

    // Valider la transaction SQL
    await db.query('COMMIT');

    res.status(201).json({
      id: result.insertId,
      from_wallet_id,
      to_wallet_id,
      amount,
      description,
      created_at: new Date()
    });
  } catch (error) {
    // Annuler la transaction SQL en cas d'erreur
    await db.query('ROLLBACK');
    console.error('Erreur lors de la création de la transaction:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Obtenir une transaction spécifique
router.get('/:id', auth, async (req, res) => {
  try {
    const [transactions] = await db.query(`
      SELECT t.*, 
             fw.name as from_wallet_name, 
             tw.name as to_wallet_name 
      FROM transactions t
      LEFT JOIN wallets fw ON t.from_wallet_id = fw.id
      LEFT JOIN wallets tw ON t.to_wallet_id = tw.id
      WHERE t.id = ? AND (fw.user_id = ? OR tw.user_id = ?)
    `, [req.params.id, req.user.userId, req.user.userId]);

    if (transactions.length === 0) {
      return res.status(404).json({ message: 'Transaction non trouvée' });
    }

    res.json(transactions[0]);
  } catch (error) {
    console.error('Erreur lors de la récupération de la transaction:', error);
    res.status(500).json({ message: 'Erreur serveur' }); 
  }
});

// Transférer de l'argent à un autre utilisateur (par email)
router.post('/transfer-to-user', [
  auth,
  body('from_wallet_id').isInt().withMessage('ID du portefeuille source invalide'),
  body('recipient_email').isEmail().withMessage('Email du destinataire invalide'),
  body('amount').isInt({ min: 1 }).withMessage('Le montant doit être un nombre entier supérieur à 0'), 
  body('description').optional().trim().escape()
], async (req, res) => {
  console.log('Requête de transfert reçue:', req.body);
  
  // Vérifier les erreurs de validation
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Erreurs de validation:', errors.array());
    return res.status(400).json({ errors: errors.array() });
  }

  const { from_wallet_id, recipient_email, amount, description } = req.body;

  try {
    // Vérifier que le portefeuille source appartient à l'utilisateur
    const [fromWallets] = await db.query(
      'SELECT * FROM wallets WHERE id = ? AND user_id = ?',
      [from_wallet_id, req.user.userId]
    );

    if (fromWallets.length === 0) {
      return res.status(404).json({ message: 'Portefeuille source non trouvé ou non autorisé' });
    }

    const fromWallet = fromWallets[0];

    // Vérifier que le portefeuille source a suffisamment de fonds
    if (fromWallet.balance < amount) {
      return res.status(400).json({ message: 'Solde insuffisant' });
    }

    // Trouver l'utilisateur destinataire par email
    const [recipients] = await db.query(
      'SELECT id FROM users WHERE email = ?',
      [recipient_email]
    );

    if (recipients.length === 0) {
      return res.status(404).json({ message: 'Utilisateur destinataire non trouvé' });
    }

    const recipientId = recipients[0].id;

    // Vérifier que l'utilisateur ne transfère pas à lui-même
    if (recipientId === req.user.userId) {
      return res.status(400).json({ message: 'Vous ne pouvez pas transférer à vous-même' });
    }

    // Trouver le portefeuille principal du destinataire (ou le premier disponible)
    const [recipientWallets] = await db.query(
      'SELECT id FROM wallets WHERE user_id = ? ORDER BY id ASC LIMIT 1',
      [recipientId]
    );

    if (recipientWallets.length === 0) {
      return res.status(404).json({ message: 'Le destinataire n\'a pas de portefeuille' });
    }

    const to_wallet_id = recipientWallets[0].id;

    // Commencer une transaction SQL
    await db.query('START TRANSACTION');

    // Créer la transaction
    const [result] = await db.query(
      'INSERT INTO transactions (from_wallet_id, to_wallet_id, amount, description) VALUES (?, ?, ?, ?)',
      [from_wallet_id, to_wallet_id, amount, description || 'Transfert à ' + recipient_email]
    );

    // Mettre à jour les soldes des portefeuilles
    await db.query(
      'UPDATE wallets SET balance = balance - ? WHERE id = ?',
      [amount, from_wallet_id]
    );

    await db.query(
      'UPDATE wallets SET balance = balance + ? WHERE id = ?',
      [amount, to_wallet_id]
    );

    // Valider la transaction SQL
    await db.query('COMMIT');

    res.status(201).json({
      id: result.insertId,
      from_wallet_id,
      to_wallet_id,
      amount,
      description: description || 'Transfert à ' + recipient_email,
      created_at: new Date()
    });
  } catch (error) {
    // Annuler la transaction SQL en cas d'erreur
    await db.query('ROLLBACK');
    console.error('Erreur lors du transfert:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;


