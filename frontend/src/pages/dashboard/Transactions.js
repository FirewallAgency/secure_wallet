import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { formatCurrency } from '../../utils/formatCurrency'; 

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // État pour le formulaire de nouvelle transaction
  const [fromWalletId, setFromWalletId] = useState('');
  const [toWalletId, setToWalletId] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  
  // État pour le transfert à un autre utilisateur 
  const [showUserTransfer, setShowUserTransfer] = useState(false); 
  const [recipientEmail, setRecipientEmail] = useState('');

  useEffect(() => {
    fetchTransactions();
    fetchWallets();
  }, []);

  const fetchTransactions = async () => {
    try {
      console.log(`Fetching transactions from: ${process.env.REACT_APP_API_URL}/transactions`);
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/transactions`);
      setTransactions(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des transactions:', error);
      setError('Impossible de charger les transactions');
    } finally {
      setLoading(false);
    }
  };

  const fetchWallets = async () => {
    try {
      console.log(`Fetching wallets from: ${process.env.REACT_APP_API_URL}/wallets`);
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/wallets`);
      setWallets(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des portefeuilles:', error);
    }
  };

  const handleCreateTransaction = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    if (!fromWalletId || (!toWalletId && !showUserTransfer) || (!recipientEmail && showUserTransfer) || !amount) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }
    
    if (!showUserTransfer && fromWalletId === toWalletId) { 
      setError('Les portefeuilles source et destination doivent être différents'); 
      return;
    }
    
    try {
      let response;
       
      if (showUserTransfer) {
        // Transfert à un autre utilisateur 
        response = await axios.post(`${process.env.REACT_APP_API_URL}/transactions/transfer-to-user`, {
          from_wallet_id: fromWalletId,
          recipient_email: recipientEmail,
          amount: parseInt(amount), // Utilisez parseInt au lieu de parseFloat pour FCFA
          description
        });
      } else {
        // Transfert entre ses propres portefeuilles
        response = await axios.post(`${process.env.REACT_APP_API_URL}/transactions`, {
          from_wallet_id: fromWalletId,
          to_wallet_id: toWalletId,
          amount: parseInt(amount), // Utilisez parseInt au lieu de parseFloat pour FCFA
          description
        });
      }
      
      setTransactions([response.data, ...transactions]);
      setSuccess(showUserTransfer 
        ? `Transfert de ${formatCurrency(parseFloat(amount))} à ${recipientEmail} effectué avec succès` 
        : 'Transaction effectuée avec succès');
      
      // Réinitialiser le formulaire
      setFromWalletId('');
      setToWalletId('');
      setRecipientEmail('');
      setAmount('');
      setDescription('');
      
      // Mettre à jour les portefeuilles pour refléter les nouveaux soldes
      fetchWallets();
    } catch (error) {
      console.error('Erreur lors de la création de la transaction:', error);
      setError(error.response?.data?.message || 'Impossible de créer la transaction');
    }
  };

  if (loading) return <div>Chargement des transactions...</div>;

  return (
    <div>
      <h2>Mes Transactions</h2>
      
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      
      <div style={{ marginBottom: '30px', border: '1px solid #ddd', padding: '20px', borderRadius: '5px' }}>
        <h3>Nouvelle Transaction</h3>
        
        <div style={{ marginBottom: '15px' }}>
          <button 
            onClick={() => setShowUserTransfer(false)} 
            className={`btn ${!showUserTransfer ? 'btn-primary' : 'btn-outline-primary'}`}
            style={{ marginRight: '10px' }}
          >
            Entre mes portefeuilles
          </button>
          <button 
            onClick={() => setShowUserTransfer(true)} 
            className={`btn ${showUserTransfer ? 'btn-primary' : 'btn-outline-primary'}`}
          >
            Vers un autre utilisateur
          </button>
        </div>
        
        <form onSubmit={handleCreateTransaction}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div className="form-group">
              <label htmlFor="fromWallet">De</label>
              <select
                id="fromWallet"
                value={fromWalletId}
                onChange={(e) => setFromWalletId(e.target.value)}
                className="form-control"
                required
              >
                <option value="">Sélectionner un portefeuille</option>
                {wallets.map(wallet => (
                  <option key={wallet.id} value={wallet.id}>
                    {wallet.name} ({wallet.balance} FCFA)
                  </option>
                ))}
              </select>
            </div>
            
            {!showUserTransfer && (
              <div className="form-group">
                <label htmlFor="toWallet">Vers</label>
                <select
                  id="toWallet"
                  value={toWalletId}
                  onChange={(e) => setToWalletId(e.target.value)}
                  className="form-control"
                  required
                >
                  <option value="">Sélectionner un portefeuille</option>
                  {wallets.map(wallet => (
                    <option key={wallet.id} value={wallet.id}>
                      {wallet.name} ({wallet.balance} FCFA)
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            {showUserTransfer && (
              <div className="form-group">
                <label htmlFor="recipientEmail">Email du destinataire</label>
                <input
                  type="email"
                  id="recipientEmail"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  className="form-control"
                  required
                />
              </div>
            )}
            
            <div className="form-group">
              <label htmlFor="amount">Montant (FCFA)</label>
              <input
                type="number"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="1" // Modifié pour n'accepter que des montants entiers
                step="1" // Modifié pour n'accepter que des montants entiers
                className="form-control"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="description">Description (optionnel)</label>
              <input
                type="text"
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="form-control"
              />
            </div>
          </div>
          
          <button type="submit" className="btn btn-primary" style={{ marginTop: '15px' }}>
            Effectuer la transaction
          </button>
        </form>
      </div>
      
      <h3>Historique des transactions</h3>
      
      {transactions.length === 0 ? (
        <p>Aucune transaction à afficher.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f2f2f2' }}>
                <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Date</th>
                <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>De</th>
                <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Vers</th>
                <th style={{ padding: '10px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>Montant</th>
                <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Description</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(transaction => (
                <tr key={transaction.id} style={{ borderBottom: '1px solid #ddd' }}>
                  <td style={{ padding: '10px' }}>{new Date(transaction.created_at).toLocaleString()}</td>
                  <td style={{ padding: '10px' }}>{transaction.from_wallet_name}</td>
                  <td style={{ padding: '10px' }}>{transaction.to_wallet_name}</td>
                  <td style={{ padding: '10px', textAlign: 'right' }}>{formatCurrency(transaction.amount)}</td>
                  <td style={{ padding: '10px' }}>{transaction.description || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Transactions;







