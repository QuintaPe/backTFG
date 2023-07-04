const CampingRelation = require('../models/campingRelation');
const campingRelationController = {};

// Get all campings
campingRelationController.create = async (req, res, next) => {
  const camping = req.params.id;
  const user = req.user._id;
  const { favorite=false, rating=null } = req.body;

  const response = await CampingRelation.search(null, { camping, user });
  let relation = response.total ? response.items[0] : new CampingRelation();
  if (!response.total) {
    relation.camping = camping;
    relation.user = user;
  } 
  relation.favorite = favorite;
  relation.rating = rating;

  if (!relation.favorite && !relation.false) {
    relation.delete();
  } else {
    relation.save();
  }
  
  res.json(relation);
};


module.exports = campingRelationController;
