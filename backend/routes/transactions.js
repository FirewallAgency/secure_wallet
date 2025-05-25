const express = require('express');
const router = express.Router();
const { body, param, validationResult } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const TransactionService = require('../services/TransactionService');

// Utilisation de middleware d'authentification
router.get('/transactions', authenticateToken, async (req, res) => {
  try {
    // Utilisation de paramètres préparés
    const transactions = await TransactionService.getUserTransactions(req.user.id);
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Validation des entrées et vérification du solde
router.post('/transfer', 
  authenticateToken,
  [
    body('amount').isFloat({ min: 0.01 }).withMessage('Montant invalide'),
    body('toAccount').isString().trim().isLength({ min: 5 }).withMessage('Compte destinataire invalide')
  ], 
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { amount, toAccount } = req.body;
      const result = await TransactionService.transferFunds(req.user.id, toAccount, amount);
      res.json(result);
    } catch (error) {
      if (error.message === 'INSUFFICIENT_FUNDS') {
        return res.status(400).json({ error: 'Solde insuffisant' });
      }
      res.status(500).json({ error: 'Erreur lors du transfert' });
    }
  }
);

module.exports = router;