const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const jwtSecret = process.env.JWT_SECRET || 'PalabraSecreta';
const User = require('../models/user');
const HandledError = require('../errors/HandledError');

const authCtrl = {};

authCtrl.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !bcrypt.compareSync(password, user.password)) {
      throw new HandledError('invalid_email', 'Invalid email or password');
    }

    res.json({
      user,
      token: jwt.sign({ user }, jwtSecret, { expiresIn: '24h' }),
    });
  } catch (error) {
    next(error);
  }
};

authCtrl.signup = async (req, res, next) => {
  delete req.body._id;
  try {
    if (req.body.password !== req.body.confirmPassword) {
      throw new HandledError('password_mismatch', 'Password mismatch');
    }
    const newUser = new User({
      ...req.body,
      password: bcrypt.hashSync(req.body.password, 10),
    });
    const user = await newUser.save();
    res.status(201).json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

module.exports = authCtrl;
