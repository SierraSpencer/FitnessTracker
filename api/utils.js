function requireUser(req, res, next) {
  if (!req.user) {
    next({
      error: "AuthorizationHeaderError",
      name: "AuthorizationHeaderError",
      message: "You must be logged in to perform this action",
    });
  }

  next();
}

module.exports = {
  requireUser,
};