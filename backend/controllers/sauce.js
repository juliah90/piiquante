const sauce = require('../models/sauce');
const Sauce = require('../models/sauce');
const fs = require('fs');

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.createSauce = (req, res, next) => {
  req.body.sauce = JSON.parse(req.body.sauce);
  const url = req.protocol + '://' + req.get('host');
  const sauce = new Sauce({
    userId: req.body.sauce.userId,
    name: req.body.sauce.name,
    manufacturer: req.body.sauce.manufacturer,
    description: req.body.sauce.description,
    mainPepper: req.body.sauce.mainPepper,
    imageUrl: url + '/images/' + req.file.filename,
    heat: req.body.sauce.heat,
    likes: 0,
    dislikes: 0,
    usersLiked: [],
    usersDisliked: []
  });
  sauce.save().then(
    () => {
      res.status(201).json({
        message: 'Sauce saved successfully!'
      });
    }
  ).catch(
    (error) => {
      console.log(error);
      res.status(400).json({
        error: 'Failed to add sauce'
      });
    }
  );
};
exports.getAllSauces = (req, res, next) => {
  Sauce.find().then(
    (sauces) => {
      res.status(200).json(sauces);
    }
  ).catch(
    (error) => {
      res.status(400).json({
        error: 'Failed to get all sauces'
      });
    }
  );
};
exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({
    _id: req.params.id
  }).then(
    (sauce) => {
      res.status(200).json(sauce);
    }
  ).catch(
    (error) => {
      res.status(404).json({
        error: 'Failed to get sauce'
      });
    }
  );
};
exports.modifySauce = (req, res, next) => {
  Sauce.findById(req.params.id)
    .then(existingSauce => {
      if (!existingSauce) {
        return res.status(404).json({ error: 'Sauce not found' });
      }
      const { likes, dislikes, usersLiked, usersDisliked } = existingSauce;
      let updatedSauce
      if (req.file) {
        const url = req.protocol + '://' + req.get('host');
        req.body.sauce = JSON.parse(req.body.sauce);
        updatedSauce = {
          _id: req.params.id,
          userId: req.body.sauce.userId,
          name: req.body.sauce.name,
          manufacturer: req.body.sauce.manufacturer,
          description: req.body.sauce.description,
          mainPepper: req.body.sauce.mainPepper,
          imageUrl: url + '/images/' + req.file.filename,
          heat: req.body.sauce.heat,
          likes: likes,
          dislikes: dislikes,
          usersLiked: usersLiked,
          usersDisliked: usersDisliked
        };
      } else {
        updatedSauce = {
          _id: req.params.id,
          userId: req.body.sauce.userId,
          name: req.body.sauce.name,
          manufacturer: req.body.sauce.manufacturer,
          description: req.body.sauce.description,
          mainPepper: req.body.sauce.mainPepper,
          imageUrl: existingSauce.imageUrl,
          heat: req.body.sauce.heat,
          likes: likes,
          dislikes: dislikes,
          usersLiked: usersLiked,
          usersDisliked: usersDisliked
        };
      }
      return Sauce.updateOne({ _id: req.params.id }, updatedSauce);
    })
    .then(() => {
      res.status(201).json({ message: 'Sauce updated successfully!' });
    })
    .catch(error => {
      res.status(400).json({ error: 'Failed to update sauce' });
    });
};

exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id }).then(
    (sauce) => {
      const filename = sauce.imageUrl.split('/images/')[1];
      fs.unlink('images/' + filename, () => {
        Sauce.deleteOne({ _id: req.params.id }).then(
          () => {
            res.status(200).json({
              message: 'Deleted!'
            });
          }
        ).catch(
          (error) => {
            res.status(400).json({
              error: error
            });
          }
        );
      });
    }
  );
};

exports.like = async (req, res, next) => {
  try {
      const sauceId = req.params.id;
      const userId = req.user.id;

      const sauce = await Sauce.findById(sauceId);
      if (!sauce) {
          return res.status(404).json({ error: 'Sauce not found' });
      }

      if (sauce.usersLiked.includes(userId) || sauce.usersDisliked.includes(userId)) {
          return res.status(400).json({ error: 'You have already liked/disliked this sauce' });
      }

      if (req.body.like === 1) {
          sauce.likes++;
          sauce.usersLiked.push(userId);
      } else if (req.body.like === -1) {
          sauce.dislikes++;
          sauce.usersDisliked.push(userId);
      } else if (req.body.like !== 0) {
          return res.status(400).json({ error: 'Invalid like value' });
      }

      await sauce.save();

      res.status(200).json({ message: 'Sauce liked/disliked successfully' });
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
  }
};
