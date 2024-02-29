const express = require('express');
const mongoose = require('mongoose')
const mongodbErrorHandler = require('mongoose-mongodb-errors');

const app = express();

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

app.use((req, res) => {
   res.json({ message: 'Your request was successful!' });
});

module.exports = app;