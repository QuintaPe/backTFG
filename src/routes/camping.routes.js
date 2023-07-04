const express = require("express");
const routerGuest = express.Router();
const router = express.Router();

const campingCtrl = require("../controllers/camping.controller");
const campingRelationCtrl = require("../controllers/campingRelation.controller");
const campingLodgingCtrl = require("../controllers/campingLodging.controller");
const bookingCtrl = require("../controllers/booking.controller");

const { 
    validateCampingLodgings,
    validateAvailableLodgings,
    validateCreateBooking,
    validateCampingBookings, 
} = require("../validators/camping");

routerGuest.get("/availables", campingCtrl.getAvailableCampings);
routerGuest.get("/:id", campingCtrl.getCamping);
routerGuest.get("/:id/lodgings", validateCampingLodgings, campingLodgingCtrl.getCampingLodgings);
routerGuest.get("/:id/lodgings/availables", validateAvailableLodgings, campingLodgingCtrl.getAvailableLodgings);

// Relation
router.get("/favorites", campingCtrl.getFavoriteCampings);
router.post("/:id/relation", campingRelationCtrl.create);

router.get("/", campingCtrl.getOwnCampings);
router.get("/:id/full", campingCtrl.getFullCamping);
router.post("/", campingCtrl.createCamping);
router.put("/:id", campingCtrl.createCamping);
router.delete("/:id", campingCtrl.deleteCamping);

router.post("/:id/bookings", validateCreateBooking, bookingCtrl.createBooking);
router.get("/:id/bookings", validateCampingBookings, bookingCtrl.getCampingBookings);
router.delete("/:id/bookings/:booking", bookingCtrl.deleteCampingBooking);

module.exports = {
    login: router,
    guest: routerGuest,
};
