const sauce = require('../models/sauce');
const Sauce = require('../models/sauce');
const fs = require('fs');

/**
 * 
 * @param {*} createSauce - allows user to create a sauce while requiring essential data 
 */
exports.createSauce = (req, res, next) => {
  req.body.sauce = JSON.parse(req.body.sauce);
  try {
    validateUser(req.auth.userId, req.body.sauce.userId);
  } catch (error) {
    return res.status(400).json({ error: 'Failed to create sauce' });
  }
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

/**
 * 
 * @param {*} allSauces - returns a database of all available sauces
 */
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

/**
 * 
 * @param {*} oneSauce - returns a single sauce based on it's id
 */
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

/**
 * 
 * @param {*} modifySauce - allows only the original creator to modify a posted sauce both with and without an image
 */
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
        validateUser(req.auth.userId, req.body.sauce.userId);
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
          userId: req.body.userId,
          name: req.body.name,
          manufacturer: req.body.manufacturer,
          description: req.body.description,
          mainPepper: req.body.mainPepper,
          imageUrl: existingSauce.imageUrl,
          heat: req.body.heat,
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

/**
 * 
 * @param {*} deleteSauce - ensures only the sauce creator can delete the sauce
 */
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

/**
 * 
 * @param {*} like - records and limits users like/dislike choices
 */
exports.like = (req, res, next) => {
  const sauceId = req.params.id;
  const userId = req.body.userId;
  const likeValue = req.body.like;

  Sauce.findOne({ _id: sauceId })
    .then(sauce => {
      if (!sauce) {
        return res.status(404).json({ error: 'Sauce not found' });
      }

      if (likeValue !== 1 && likeValue !== -1 && likeValue !== 0) {
        return res.status(400).json({ error: 'Invalid like value' });
      }

      if (sauce.usersLiked.includes(userId)) {
        sauce.likes--;
        sauce.usersLiked = sauce.usersLiked.filter(id => id !== userId);
      } else if (sauce.usersDisliked.includes(userId)) {
        sauce.dislikes--;
        sauce.usersDisliked = sauce.usersDisliked.filter(id => id !== userId);
      }

      if (likeValue === 1) {
        sauce.likes++;
        sauce.usersLiked.push(userId);
      } else if (likeValue === -1) {
        sauce.dislikes++;
        sauce.usersDisliked.push(userId);
      }

      return sauce.save();
    })
    .then(() => {
      res.status(200).json({ message: 'Sauce liked/disliked successfully' });
    })
    .catch(error => {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    });
};



function validateUser(authUserId, sauceUserId) {
  if (authUserId !== sauceUserId) {
    throw new Error();
  }
}

