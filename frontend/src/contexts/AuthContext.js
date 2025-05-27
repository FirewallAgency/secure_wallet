import React, { createContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Déclarer fetchUserData avec useCallback avant de l'utiliser dans useEffect
  const fetchUserData = useCallback(async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/users/profile`);
      setCurrentUser(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Erreur lors de la récupération des données utilisateur:', error);
      logout();
      setLoading(false);
    }
  }, []);  // Ajouter logout aux dépendances après sa déclaration

  useEffect(() => {
    // Vérifier si l'utilisateur est déjà connecté
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUserData();
    } else {
      setLoading(false);
    }
  }, [fetchUserData]);  // Maintenant fetchUserData est défini avant d'être utilisé ici

  const login = async (email, password) => {
    try {
      setError(null);
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/auth/login`, {
        email,
        password
      });
      
      const { token, user } = response.data;
      
      // Stocker le token dans le localStorage
      localStorage.setItem('token', token);
      
      // Configurer axios pour inclure le token dans les en-têtes
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setCurrentUser(user);
      return true;
    } catch (error) {
      console.error('Erreur de connexion:', error);
      setError(error.response?.data?.message || 'Erreur de connexion');
      return false;
    }
  };

  const register = async (username, email, password) => {
    try {
      setError(null);
      await axios.post(`${process.env.REACT_APP_API_URL}/auth/register`, {
        username,
        email,
        password
      });
      
      return true; 
    } catch (error) { 
      console.error('Erreur d\'inscription:', error);
      
      // Récupérer le message d'erreur spécifique du serveur
      if (error.response && error.response.data) {
        // Si le serveur renvoie un tableau d'erreurs (comme avec express-validator)
        if (Array.isArray(error.response.data.errors)) {
          const errorMessages = error.response.data.errors.map(err => err.msg).join(', ');
          setError(errorMessages);
        } 
        // Si le serveur renvoie un message d'erreur simple
        else if (error.response.data.message) {
          setError(error.response.data.message);
        } 
        // Fallback pour tout autre format d'erreur
        else {
          setError('Erreur d\'inscription: Veuillez vérifier vos informations');
        }
      } else {
        // Erreur réseau ou autre erreur non liée à la réponse du serveur
        setError('Erreur de connexion au serveur. Veuillez réessayer plus tard.');
      }
      
      return false;
    }
  };

  const logout = () => {
    // Supprimer le token du localStorage
    localStorage.removeItem('token');
    
    // Supprimer le token des en-têtes axios
    delete axios.defaults.headers.common['Authorization'];
    
    // Réinitialiser l'état de l'utilisateur
    setCurrentUser(null);
  };

  // Mettre à jour la dépendance de fetchUserData pour inclure logout
  useEffect(() => {
    // Cette fonction vide est nécessaire pour éviter une erreur de dépendance circulaire
    // entre fetchUserData et logout
  }, [fetchUserData]);

  const value = {
    currentUser,
    loading,
    error,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};


