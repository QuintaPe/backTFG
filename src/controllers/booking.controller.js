const Booking = require('path/to/booking.model');
const bookingController = {};

bookingController.createBooking = async (req, res) => {
  try {
    const booking = new Booking(req.body);
    await booking.save();
    res.status(201).json({ message: 'Booking created successfully', booking });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

bookingController.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().populate('campingId', 'name').populate('userId', 'username');
    res.status(200).json({ bookings });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

bookingController.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('campingId', 'name').populate('userId', 'username');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    res.status(200).json({ booking });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

bookingController.updateBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    res.status(200).json({ message: 'Booking updated successfully', booking });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

bookingController.deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    res.status(200).json({ message: 'Booking deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = bookingController;