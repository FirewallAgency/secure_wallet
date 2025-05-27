import React, { useState, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import axios from 'axios';

const Profile = () => {
  const { currentUser } = useContext(AuthContext);
  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/users/profile`, {
        name,
        email
      });
      
      setSuccess('Profil mis à jour avec succès');
      setLoading(false);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      setError(error.response?.data?.message || 'Erreur lors de la mise à jour du profil');
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (newPassword !== confirmPassword) {
      setError('Les nouveaux mots de passe ne correspondent pas');
      setLoading(false);
      return;
    }

    if (newPassword.length < 8) {
      setError('Le nouveau mot de passe doit contenir au moins 8 caractères');
      setLoading(false);
      return;
    }

    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/users/password`, {
        currentPassword,
        newPassword
      });
      
      setSuccess('Mot de passe mis à jour avec succès');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setLoading(false);
    } catch (error) {
      console.error('Erreur lors du changement de mot de passe:', error);
      setError(error.response?.data?.message || 'Erreur lors du changement de mot de passe');
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.')) {
      try {
        setLoading(true);
        await axios.delete(`${process.env.REACT_APP_API_URL}/users/account`);
        // Rediriger vers la page de connexion ou déconnecter l'utilisateur
        window.location.href = '/login';
      } catch (error) {
        console.error('Erreur lors de la suppression du compte:', error);
        setError(error.response?.data?.message || 'Erreur lors de la suppression du compte');
        setLoading(false);
      }
    }
  };

  return (
    <div>
      <h2>Mon Profil</h2>
      
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
        <div>
          <h3>Informations personnelles</h3>
          <form onSubmit={handleUpdateProfile}>
            <div className="form-group">
              <label htmlFor="name">Nom</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="form-control"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-control"
                required
              />
            </div>
            
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={loading}
            >
              {loading ? 'Mise à jour...' : 'Mettre à jour le profil'}
            </button>
          </form>
        </div>
        
        <div>
          <h3>Changer le mot de passe</h3>
          <form onSubmit={handleChangePassword}>
            <div className="form-group">
              <label htmlFor="currentPassword">Mot de passe actuel</label>
              <input
                type="password"
                id="currentPassword"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="form-control"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="newPassword">Nouveau mot de passe</label>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="form-control"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirmer le nouveau mot de passe</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="form-control"
                required 
              />
            </div>
            
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={loading}
            >
              {loading ? 'Mise à jour...' : 'Changer le mot de passe'}
            </button>
          </form>
        </div>
      </div>
      
      <div style={{ marginTop: '30px' }}>
        <h3>Supprimer mon compte</h3>
        <p>Attention : cette action est irréversible et supprimera toutes vos données.</p>
        <button 
          className="btn btn-danger"
          onClick={handleDeleteAccount}
          disabled={loading}
        >
          Supprimer mon compte
        </button>
      </div>
    </div>
  );
};

export default Profile;
