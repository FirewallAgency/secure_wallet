const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  // Récupérer le token du header Authorization
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Accès non autorisé. Token manquant.' });
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    // Vérifier le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Ajouter les informations de l'utilisateur à l'objet request
    req.user = decoded;
    
    next();
  } catch (error) {
    console.error('Erreur d\'authentification:', error);
    res.status(401).json({ message: 'Token invalide ou expiré' });
  }
};