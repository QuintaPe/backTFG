const Booking = require('../models/booking');
const CampingRelation = require('../models/campingRelation');
const campingRelationController = {};

// Get all campings
campingRelationController.create = async (req, res, next) => {
  const camping = req.params.id;
  const user = req.user._id;
  const { favorite, review } = req.body;

  const response = await CampingRelation.search(null, { camping, user });
  let relation = response.total ? response.items[0] : new CampingRelation();

  if (!response.total) {
    relation.camping = camping;
    relation.user = user;
  } 

  if (favorite || favorite === false) {
    relation.favorite = favorite;
  }

  const today = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7); 
  const bookingsFilter = {
    user, 
    exitDate: {
      $gte: sevenDaysAgo,
      $lte: today,
    }
  }
  console.log(bookingsFilter);
  const bookings = await Booking.search(['id'], bookingsFilter, 1);
  if (review && bookings.total) {
    relation.review = review;
  }

  if (!relation.favorite && !relation.review) {
    relation.delete();
  } else {
    relation.save();
  }
  
  res.json(relation);
};

campingRelationController.getCampingReviews = async (req, res, next) => {
  const camping = req.params.id;
  const { page, size } = req.query?.opts || {};

  const filters = { camping };
  const relations = await CampingRelation.search(['user', 'camping', 'review'], filters, size, page, '', 'user');
  res.status(200).json(relations);
}


module.exports = campingRelationController;
