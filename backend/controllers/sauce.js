const sauce = require('../models/sauce');

exports.createThing = (req, res, next) => {
  const thing = new Thing({
    name: req.body.name,
    manufacturer: req.body.manufacturer,
    description: req.body.description,
    imageUrl: req.body.imageUrl,
    mainPepperIngredient: req.body.mainPepperIngredient,
    heat: req.body.heat
  });
  thing.save().then(
    () => {
      res.status(201).json({
        message: 'Post saved successfully!'
      });
    }
  ).catch(
    (error) => {
      res.status(400).json({
        error: error
      });
    }
  );
};