const Sauce = require('../models/sauce');

exports.createThing = (req, res, next) => {
  const sauce = new Sauce({
    name: req.body.name,
    manufacturer: req.body.manufacturer,
    description: req.body.description,
    imageUrl: req.body.imageUrl,
    mainPepperIngredient: req.body.mainPepperIngredient,
    heat: req.body.heat
  });
  sauce.save().then(
    () => {
      res.status(201).json({
        message: 'Sauce saved successfully!'
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