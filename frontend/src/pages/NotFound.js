import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '80vh', 
      textAlign: 'center' 
    }}>
      <h1>404</h1>
      <h2>Page non trouvée</h2>
      <p>La page que vous recherchez n'existe pas ou a été déplacée.</p>
      <Link to="/" style={{ 
        marginTop: '20px', 
        padding: '10px 20px', 
        backgroundColor: '#007bff', 
        color: 'white', 
        textDecoration: 'none', 
        borderRadius: '5px' 
      }}>
        Retour à l'accueil
      </Link>
    </div>
  );
};

export default NotFound;