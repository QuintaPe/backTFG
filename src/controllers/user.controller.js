const User = require("../models/user");
const bcrypt = require("bcrypt");
const handleValidationError = require('../errors/handleValidationError')

const userCtrl = {};

userCtrl.getUsers = async (req, res, next) => {
  const users = await User.find();
  res.json(users);
};

userCtrl.createUser = async (req, res, next) => {
  const { _id, ...user } = req.body;
  const newUser = new User({ ...user, password: bcrypt.hashSync(user.password, 10)});

  newUser.save()
    .then(user => res.status(201).json({ success: true, user }))
    .catch(err => {
      if (err.name === 'ValidationError') {
        return handleValidationError(err, req, res, next);
      }
    });
};

userCtrl.getUser = async (req, res, next) => {
  const { id } = req.params;
  const user = await User.findById(id);
  res.json(user);
};

userCtrl.editUser = async (req, res, next) => {
  const { id } = req.params;
  await User.findByIdAndUpdate(id, { $set: req.body }, { new: true });
  res.json({ status: "User Updated", user: req.body });
};

userCtrl.deleteUser = async (req, res, next) => {
  await User.findByIdAndRemove(req.params.id);
  res.json({ status: "User Deleted" });
};

module.exports = userCtrl;
