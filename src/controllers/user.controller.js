const User = require("../models/user");
const bcrypt = require("bcrypt");

const userCtrl = {};

userCtrl.getUsers = async (req, res, next) => {
  const users = await User.find();
  res.json(users);
};

userCtrl.createUser = async (req, res, next) => {
  req.body.username = req.body.username.toLowerCase();
  await User.findOne({ username: req.body.username }).then((err, user) => {
    if (err) {
      return res.json({
        type: false,
        data: `Error: $(err)`,
      });
    } else if (user) {
      return res.json({
        type: false,
        data: "El usuario ya existe.",
      });
    } else {
      var newUser = new User({
        username: req.body.username,
        password: bcrypt.hashSync(req.body.password, 10),
        rol: req.body.rol,
        email: req.body.email,
        name: req.body.name,
        lastName: req.body.lastName,
        birthDate: new Date(req.body.birthDate),
        phone: req.body.phone,
      });

      newUser.save();

      return res.json({
        type: true,
        data: "Nuevo usuario creado",
      });
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
  res.json({ status: "User Updated" });
};

userCtrl.deleteUser = async (req, res, next) => {
  await User.findByIdAndRemove(req.params.id);
  res.json({ status: "User Deleted" });
};

module.exports = userCtrl;
