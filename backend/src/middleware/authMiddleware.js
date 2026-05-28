import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        data: null,
        message: 'Authorization token is required',
        token: null,
      });
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.user_id);

    if (!user) {
      return res.status(401).json({
        success: false,
        data: null,
        message: 'User no longer exists',
        token: null,
      });
    }

    req.user = user;

    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);

    return res.status(401).json({
      success: false,
      data: null,
      message: 'Invalid or expired token',
      token: null,
    });
  }
};