const express = require('express');
const mongoose = require('mongoose');
const mongodbErrorHandler = require('mongoose-mongodb-errors');
const path = require('path');

const app = express();

const userRoutes = require('./routes/user');
const sauceRoutes = require('./routes/sauce');

app.use(express.json());

mongoose.connect(`mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}/?retryWrites=true&w=majority`)
   .then(() => {
      console.log('Successfully connected to mongodb Atlas');
      mongoose.plugin(mongodbErrorHandler);
   })
   .catch((error) => {
      console.log('Unable to connect to Mongodb Atlas');
      console.error(error);
   })

app.use((req, res, next) => {
   res.setHeader('Access-Control-Allow-Origin', '*');
   res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
   res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
   next();
});

app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/api/auth', userRoutes);
app.use('/api/sauces', sauceRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
   console.error(err.stack);
   res.status(500).json({ error: 'Internal Server Error' });
});


module.exports = app;