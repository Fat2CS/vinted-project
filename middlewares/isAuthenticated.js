const User = require("../Models/User");

const isAuthenticated = async (req, res, next) => {
  console.log(req.headers.authorization);
  // console.log("Middleware isAuthenticated");

  const checkUser = await User.findOne({
    token: req.headers.authorization.replace("Bearer ", ""),
  });
  console.log(checkUser);

  if (checkUser) {
    //Si le token est valide, j'appelle next pour sortir de mon middleware isAuthenticated
    //J'en profite également pour
    req.user = checkUser;
    next();
  } else {
    //Unautorized
    res.json("Unauthorized");
  }
};

module.exports = isAuthenticated;
