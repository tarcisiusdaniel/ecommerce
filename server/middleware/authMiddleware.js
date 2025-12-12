import jwt from "jsonwebtoken";

export function authMiddleware(req, res, next) {
  const token = req.cookies ? req.cookies.jwtAssignmentToken : null;
  console.log(token);

  if (!token) {
    req.loggedIn = false;
    req.loginMsg = "Login token does not exist";
    req.user = null;
    return next();
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    req.loggedIn = true;
  } catch {
    req.loggedIn = false;
    req.loginMsg = "Login token invalid";
    req.user = null;
    console.log(req.loginMsg);
  }

  console.log("here");
  return next();
}
