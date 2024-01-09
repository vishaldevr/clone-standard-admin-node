
import jwt from 'jsonwebtoken';

const isLoggedIn = async (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Unauthenticated, please login again',
    });
  }

  try {
    // eslint-disable-next-line no-undef
    const userDetails = jwt.verify(token, process.env.SECRET_KEY);
    req.user = userDetails;
    req.userId = userDetails.id;
    next();
  } catch (error) {
    // If token verification fails
    return res.status(401).json({
      success: false,
      message: 'Invalid token, please login again',
    });
  }
};

export default isLoggedIn;