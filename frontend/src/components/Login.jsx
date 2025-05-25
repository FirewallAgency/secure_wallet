import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError('Échec de connexion - vérifiez vos identifiants');
      console.error('Login error:', err.message);
    }
  };

  return (
    <form onSubmit={handleLogin} className="auth-form">
      {error && <div className="error-message">{error}</div>}
      <input 
        type="email" 
        value={email} 
        onChange={(e) => setEmail(e.target.value)} 
        required
        aria-label="Email address"
      />
      <input 
        type="password" 
        value={password} 
        onChange={(e) => setPassword(e.target.value)} 
        required
        aria-label="Password"
      />
      <button type="submit">Se connecter</button>
    </form>
  );
}