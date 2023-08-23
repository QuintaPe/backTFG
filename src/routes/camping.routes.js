const express = require("express");
const router = express.Router();

const campingCtrl = require("../controllers/camping.controller");
const campingRelationCtrl = require("../controllers/campingRelation.controller");
const campingLodgingCtrl = require("../controllers/campingLodging.controller");
const bookingCtrl = require("../controllers/booking.controller");
const { authMiddleware } = require("../utils/middlewares");

const { 
    validateCampingLodgings,
    validateAvailableLodgings,
    validateCreateBooking,
    validateCampingBookings, 
} = require("../validators/camping");

router.get("/availables", campingCtrl.getAvailableCampings);
router.get("/favorites", authMiddleware, campingCtrl.getFavoriteCampings);

router.get("/:id", campingCtrl.getCamping);
router.get("/:id/lodgings", validateCampingLodgings, campingLodgingCtrl.getCampingLodgings);
router.get("/:id/lodgings/availables", validateAvailableLodgings, campingLodgingCtrl.getAvailableLodgings);
router.get("/:id/reviews", campingRelationCtrl.getCampingReviews);

router.use(authMiddleware);

router.get("/", campingCtrl.getOwnCampings);
router.post("/", campingCtrl.createCamping);
router.put("/:id", campingCtrl.createCamping);
router.delete("/:id", campingCtrl.deleteCamping);
router.get("/:id/full", campingCtrl.getFullCamping);

router.post("/:id/relation", campingRelationCtrl.create);

router.post("/:id/bookings", validateCreateBooking, bookingCtrl.createBooking);
router.get("/:id/bookings", validateCampingBookings, bookingCtrl.getCampingBookings);
router.delete("/:id/bookings/:booking", bookingCtrl.deleteCampingBooking);
router.put("/:id/bookings/:booking/status/:status", bookingCtrl.changeBookingStatus);

module.exports = router;
