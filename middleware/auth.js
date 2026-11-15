const User = require('../models/User');
module.exports = async (req, res, next) => {
  const user = req.get('x-token') && await User.findOne({ token: req.get('x-token') });
  if (!user) return res.status(401).json({ error: 'Please log in' });
  req.user = user;
  next();
};
