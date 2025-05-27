import React, { useContext } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

// Sous-pages du tableau de bord
import Wallets from './dashboard/Wallets';
import Transactions from './dashboard/Transactions';
import Profile from './dashboard/Profile';

const Dashboard = () => {
  const { currentUser, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div>
      <nav style={{ 
        backgroundColor: '#333', 
        color: 'white', 
        padding: '10px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h2 style={{ margin: 0 }}>Secure Wallet</h2>
        </div>
        <div style={{ display: 'flex', gap: '20px' }}>
          <Link to="/dashboard" style={{ color: 'white', textDecoration: 'none' }}>Accueil</Link>
          <Link to="/dashboard/wallets" style={{ color: 'white', textDecoration: 'none' }}>Portefeuilles</Link>
          <Link to="/dashboard/transactions" style={{ color: 'white', textDecoration: 'none' }}>Transactions</Link>
          <Link to="/dashboard/profile" style={{ color: 'white', textDecoration: 'none' }}>Profil</Link>
          <button 
            onClick={handleLogout} 
            style={{ 
              background: 'none', 
              border: 'none', 
              color: 'white', 
              cursor: 'pointer' 
            }}
          >
            Déconnexion
          </button>
        </div>
      </nav>

      <div className="container" style={{ padding: '20px' }}>
        <Routes>
          <Route path="/" element={<div>Bienvenue, {currentUser?.name} !</div>} />
          <Route path="/wallets" element={<Wallets />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </div>
    </div>
  );
};

export default Dashboard;