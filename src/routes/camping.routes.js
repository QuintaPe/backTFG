const express = require("express");
const router = express.Router();

const campingCtrl = require("../controllers/camping.controller");
const campingLodgingCtrl = require("../controllers/campingLodging.controller");
const bookingCtrl = require("../controllers/booking.controller");

const { 
    validateCampingLodgings,
    validateAvailableLodgings,
    validateCreateBooking,
    validateCampingBookings, 
} = require("../validators/camping");


router.get("/", campingCtrl.getCampings); 
router.post("/", campingCtrl.createCamping);
router.put("/:id", campingCtrl.createCamping);
router.get("/:id", campingCtrl.getCamping);
router.get("/:id/full", campingCtrl.getFullCamping);
router.delete("/:id", campingCtrl.deleteCamping);

router.get("/:id/lodgings", validateCampingLodgings, campingLodgingCtrl.getCampingLodgings);
router.get("/:id/lodgings/availables", validateAvailableLodgings, campingLodgingCtrl.getAvailableLodgings);

router.post("/:id/bookings", validateCreateBooking, bookingCtrl.createBooking);
router.get("/:id/bookings", validateCampingBookings, bookingCtrl.getCampingBookings);
router.delete("/:id/bookings/:booking", bookingCtrl.deleteCampingBooking);

module.exports = router;
