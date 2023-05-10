const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const jwtSecret = process.env.JWT_SECRET || "PalabraSecreta";
const User = require("../models/user");

const authCtrl = {};

authCtrl.login = async (req, res) => {
  const { email, password } = req.body;
  await User.findOne({ email }).then((user, err) => {
    if (err) {
        res.status(500).json({
        success: false,
        message: `Error: $(err)`,
      });
    } else if (!user || !bcrypt.compareSync(password, user.password)) {
      res.status(401).json({
        success: false,
        message: "Nombre de usuario o contraseña incorrecta.",
      });
    } else {
      res.json({
        success: true,
        user,
        token: jwt.sign({ user }, jwtSecret, { expiresIn: "24h" }),
      });
    }
  });
};

authCtrl.signup = async (req, res, next) => {
  delete req.body._id;
  
  const newUser = new User({ ...req.body, password: bcrypt.hashSync(req.body.password, 10)});
  newUser.save()
    .then(user => res.status(201).json({ success: true, user }))
    .catch(err => next(err));
};

module.exports = authCtrl;
