import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="container">
      <h1>Bienvenue sur Secure Wallet</h1>
      <p>Une application sécurisée pour gérer vos portefeuilles et transactions</p>
      <div>
        <Link to="/login">
          <button className="btn btn-primary">Se connecter</button>
        </Link>
        <Link to="/register">
          <button className="btn btn-primary" style={{ marginLeft: '10px' }}>S'inscrire</button>
        </Link>
      </div>
    </div>
  );
};

export default Home;