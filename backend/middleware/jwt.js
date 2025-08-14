import jwt from "jsonwebtoken";
import createError from "../utils/createError.js";

export const verifyToken = (req, res, next) => {
  const token = req.cookies.accessToken;
  
  if (!token) {
    return next(createError(401, "არ ხართ ავტორიზებული!"));
  }

  jwt.verify(token, process.env.JWT_KEY, (err, payload) => {
// <<<<<<< HEAD
//     console.log("JWT payload:", payload);
// =======
// >>>>>>> temp-save
    if (err) return next(createError(403, "თქვენი ტოკენი არ არის ვალიდური!"));
    
    // დავრწმუნდეთ რომ isAdmin ველი მოდის JWT-დან
    req.user = {
      id: payload.id,
      isAdmin: payload.isAdmin || false // დავრწმუნდეთ რომ isAdmin არსებობს
    };
    
    next();
  });
};
