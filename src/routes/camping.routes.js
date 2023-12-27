import express from 'express';
import campingCtrl from '../controllers/camping.controller.js';
import campingRelationCtrl from '../controllers/campingRelation.controller.js';
import campingLodgingCtrl from '../controllers/campingLodging.controller.js';
import bookingCtrl from '../controllers/booking.controller.js';
import { authMiddleware } from '../middlewares/middlewares.js';

import { 
  validateCampingLodgings,
  validateAvailableLodgings,
  validateCreateBooking,
  validateCampingBookings, 
} from "../validators/camping.js";

export const campingRouter = express.Router();
campingRouter.get("/availables", campingCtrl.getAvailableCampings);
campingRouter.get("/favorites", authMiddleware, campingCtrl.getFavoriteCampings);

campingRouter.get("/:id", campingCtrl.getCamping);
campingRouter.get("/:id/lodgings", validateCampingLodgings, campingLodgingCtrl.getCampingLodgings);
campingRouter.get("/:id/lodgings/availables", validateAvailableLodgings, campingLodgingCtrl.getAvailableLodgings);
campingRouter.get("/:id/reviews", campingRelationCtrl.getCampingReviews);

campingRouter.use(authMiddleware);

campingRouter.get("/", campingCtrl.getOwnCampings);
campingRouter.post("/", campingCtrl.createCamping);
campingRouter.put("/:id", campingCtrl.createCamping);
campingRouter.delete("/:id", campingCtrl.deleteCamping);
campingRouter.get("/:id/full", campingCtrl.getFullCamping);

campingRouter.post("/:id/relation", campingRelationCtrl.create);

campingRouter.post("/:id/bookings", validateCreateBooking, bookingCtrl.createBooking);
campingRouter.get("/:id/bookings", validateCampingBookings, bookingCtrl.getCampingBookings);
campingRouter.delete("/:id/bookings/:booking", bookingCtrl.deleteCampingBooking);
campingRouter.put("/:id/bookings/:booking/status/:status", bookingCtrl.changeBookingStatus);

