import { CURRENCY } from '../constants/currency';

/**
 * Formate un montant dans la devise de l'application
 * @param {number} amount - Le montant à formater
 * @param {boolean} includeSymbol - Inclure le symbole de la devise (par défaut: true)
 * @returns {string} Le montant formaté
 */
export const formatCurrency = (amount, includeSymbol = true) => {
  // Formater le nombre avec séparateur de milliers
  const formattedAmount = new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: CURRENCY.decimalPlaces,
    maximumFractionDigits: CURRENCY.decimalPlaces,
  }).format(amount);
  
  // Ajouter le symbole de la devise si demandé
  return includeSymbol ? `${formattedAmount} ${CURRENCY.symbol}` : formattedAmount; 
};
