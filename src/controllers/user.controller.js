const Unauthorized = require('../errors/Unauthorized');
const User = require('../models/user');
const userCtrl = {};

userCtrl.getUsers = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      throw new Unauthorized();
    }
    const { page, size, search, filters, sort } = req.query.opts;
    const users = await User.search(null, filters, size, page, sort);
    res.json(users);
  } catch (err) {
    next(err);
  }
};

userCtrl.getUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    res.json(user);
  } catch (err) {
    next(err);
  }
};

userCtrl.editUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    await User.findByIdAndUpdate(id, { $set: req.body }, { new: true });
    res.json({ status: 'User Updated', user: req.body });
  } catch (err) {
    next(err);
  }
};

userCtrl.deleteUser = async (req, res, next) => {
  try {
    await User.findByIdAndRemove(req.params.id);
    res.json({ status: 'User Deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = userCtrl;
