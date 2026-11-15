require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
app.use(express.json({ limit: '5mb' }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/slots', require('./middleware/auth'), require('./routes/slots'));
app.use('/api/places', require('./middleware/auth'), require('./routes/places'));
app.use((err, req, res, next) => res.status(400).json({ error: err.message }));

const PORT = process.env.PORT || 3000;
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/campus-connect')
  .then(() => app.listen(PORT, () => console.log(`http://localhost:${PORT}`)));
