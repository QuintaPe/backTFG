const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const jwtSecret = process.env.JWT_SECRET || "PalabraSecreta";
const User = require("../models/user");

const loginCtrl = {};

loginCtrl.login = async (req, res) => {
  await User.findOne({ username: req.body.username.toLowerCase() }).then(
    (user, err) => {
      if (err) {
        return res.json({
          type: false,
          message: `Error: $(err)`,
        });
      } else if (
        !user ||
        !bcrypt.compareSync(req.body.password, user.password)
      ) {
        res.json({
          type: false,
          data: "Nombre de usuario o contraseña incorrecta.",
        });
      } else {
        console.log(!bcrypt.compareSync(req.body.password, user.password));
        var token = jwt.sign({ userId: user._id }, jwtSecret, {
          expiresIn: "24h",
        });
        res.json({
          type: true,
          data: user,
          token,
        });
      }
    }
  );
};
module.exports = loginCtrl;
