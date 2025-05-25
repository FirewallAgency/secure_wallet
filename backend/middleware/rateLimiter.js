const { RateLimiterMemory } = require('rate-limiter-flexible');

const limiter = new RateLimiterMemory({
  points: 10, // Nombre de requêtes
  duration: 1, // Par seconde
});

const rateLimiterMiddleware = (req, res, next) => {
  limiter.consume(req.ip)
    .then(() => {
      next();
    })
    .catch(() => {
      res.status(429).json({ error: 'Trop de requêtes, veuillez réessayer plus tard' });
    });
};

module.exports = { limiter: rateLimiterMiddleware };