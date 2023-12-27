import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import i18n from 'i18n';
import User from '../models/user.js';
import { sendEmail } from '../mailer.js';
import { HandledError } from '../errors/HandledError.js';

const jwtSecret = process.env.JWT_SECRET;
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

authCtrl.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      throw new HandledError('email_not_found', 'Email not found');
    }

    // Generar un token de restablecimiento de contraseña con expiración
    const resetToken = jwt.sign({ userId: user._id }, jwtSecret, { expiresIn: '1h' });

    // Envío del correo electrónico con el enlace de restablecimiento
    
    i18n.setLocale(user.lang);
    await sendEmail(
      user,
      i18n.__('passwordResetSubject'),
      i18n.__mf('passwordResetMessage', {
        baseUrl: process.env.BASE_URL,
        token: resetToken,
      }),
    );
    res.status(200).json({ message: 'Password reset email sent' });
  } catch (error) {
    next(error);
  }
};

authCtrl.resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { newPassword, confirmPassword } = req.body;

    // Decodificar el token para obtener el ID de usuario
    const decodedToken = jwt.verify(token, jwtSecret);
    const userId = decodedToken.userId;

    if (newPassword !== confirmPassword) {
      throw new HandledError('password_mismatch', 'Password mismatch');
    }

    // Actualizar la contraseña del usuario
    const hashedPassword = bcrypt.hashSync(newPassword, 10);
    await User.findByIdAndUpdate(userId, { password: hashedPassword });

    res.json({ success: true, message: 'Password reset successful' });
  } catch (error) {
    next(error);
  }
};

export default authCtrl;
