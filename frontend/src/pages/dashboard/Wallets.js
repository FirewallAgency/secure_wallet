import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { formatCurrency } from '../../utils/formatCurrency'; 

const Wallets = () => { 
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newWalletName, setNewWalletName] = useState('');
  
  // États pour le crédit de portefeuille
  const [selectedWalletId, setSelectedWalletId] = useState('');  
  const [creditAmount, setCreditAmount] = useState('');
  const [showCreditForm, setShowCreditForm] = useState(false);

  useEffect(() => {
    fetchWallets();
  }, []);

  const fetchWallets = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/wallets`);
      setWallets(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Erreur lors de la récupération des portefeuilles:', error);
      setError('Impossible de charger les portefeuilles');
      setLoading(false);
    }
  };

  const handleCreateWallet = async (e) => {
    e.preventDefault();
    if (!newWalletName.trim()) return;

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/wallets`, {
        name: newWalletName
      });
      setWallets([...wallets, response.data]);
      setNewWalletName('');
    } catch (error) {
      console.error('Erreur lors de la création du portefeuille:', error);
      setError('Impossible de créer le portefeuille');
    }
  };

  const handleCreditWallet = async (e) => {
    e.preventDefault();
    if (!selectedWalletId || !creditAmount || parseFloat(creditAmount) <= 0) {
      setError('Veuillez sélectionner un portefeuille et entrer un montant valide');
      return;
    }

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/wallets/${selectedWalletId}/credit`, 
        { amount: parseFloat(creditAmount) }
      );
      
      // Mettre à jour la liste des portefeuilles avec le nouveau solde
      setWallets(wallets.map(wallet => 
        wallet.id === response.data.id ? response.data : wallet
      ));
      
      // Réinitialiser le formulaire
      setSelectedWalletId('');
      setCreditAmount('');
      setShowCreditForm(false);
      setError('');
    } catch (error) {
      console.error('Erreur lors du crédit du portefeuille:', error);
      setError(error.response?.data?.message || 'Erreur lors du crédit du portefeuille');
    }
  };

  if (loading) return <div>Chargement des portefeuilles...</div>;

  return (
    <div>
      <h2>Mes Portefeuilles</h2>
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      <div style={{ marginBottom: '20px' }}>
        <form onSubmit={handleCreateWallet} style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            value={newWalletName}
            onChange={(e) => setNewWalletName(e.target.value)}
            placeholder="Nom du portefeuille"
            style={{ padding: '8px', flex: 1 }}
          />
          <button type="submit" className="btn btn-primary">Créer</button>
        </form>
      </div>
      
      <button 
        onClick={() => setShowCreditForm(!showCreditForm)} 
        className="btn btn-success"
        style={{ marginBottom: '20px' }}
      >
        {showCreditForm ? 'Annuler' : 'Créditer un portefeuille'}
      </button>
      
      {showCreditForm && (
        <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '5px' }}>
          <h3>Créditer un portefeuille</h3>
          <form onSubmit={handleCreditWallet}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div className="form-group">
                <label htmlFor="walletSelect">Portefeuille</label>
                <select
                  id="walletSelect"
                  value={selectedWalletId}
                  onChange={(e) => setSelectedWalletId(e.target.value)}
                  className="form-control"
                  required
                >
                  <option value="">Sélectionner un portefeuille</option>
                  {wallets.map(wallet => (
                    <option key={wallet.id} value={wallet.id}>
                      {wallet.name} ({formatCurrency(wallet.balance)})
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="creditAmount">Montant (FCFA)</label>
                <input
                  type="number"
                  id="creditAmount"
                  value={creditAmount}
                  onChange={(e) => setCreditAmount(e.target.value)}
                  min="1" // Modifié pour n'accepter que des montants entiers
                  step="1" // Modifié pour n'accepter que des montants entiers
                  className="form-control"
                  required
                />
              </div>
            </div>
            
            <button type="submit" className="btn btn-success" style={{ marginTop: '15px' }}>
              Créditer
            </button>
          </form>
        </div>
      )}
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {wallets.length > 0 ? (
          wallets.map(wallet => (
            <div key={wallet.id} style={{ 
              border: '1px solid #ddd', 
              borderRadius: '5px', 
              padding: '15px',
              backgroundColor: '#f9f9f9'
            }}>
              <h3>{wallet.name}</h3>
              <p style={{ 
                fontSize: '24px', 
                fontWeight: 'bold', 
                margin: '15px 0',
                color: wallet.balance > 0 ? 'green' : 'inherit'
              }}>
                {formatCurrency(wallet.balance)}
              </p>
              <p>Créé le {new Date(wallet.created_at).toLocaleDateString()}</p>
            </div>
          ))
        ) : (
          <p>Vous n'avez pas encore de portefeuille. Créez-en un pour commencer.</p>
        )}
      </div>
    </div>
  );
};

export default Wallets;



