const express = require("express");
const router = express.Router();

const campingCtrl = require("../controllers/camping.controller");
const campingLodgingCtrl = require("../controllers/campingLodging.controller");
const bookingCtrl = require("../controllers/booking.controller");

const { validateAvailableLodging } = require("../validators/camping");


router.get("/", campingCtrl.getCampings); 
router.post("/", campingCtrl.createCamping);
router.put("/:id", campingCtrl.createCamping);
router.get("/:id", campingCtrl.getCamping);
router.get("/:id/full", campingCtrl.getFullCamping);
router.delete("/:id", campingCtrl.deleteCamping);

router.get("/:id/lodgings", campingLodgingCtrl.getCampingLodgings);
router.get("/:id/lodgings/availables", validateAvailableLodging, campingLodgingCtrl.getAvailableLodgings);

router.post("/:id/bookings", bookingCtrl.createBooking);
router.get("/:id/bookings", bookingCtrl.getCampingBookings);

module.exports = router;
