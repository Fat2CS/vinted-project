const express = require("express");
const uid2 = require("uid2");
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const router = express.Router();

// modèle requis
const User = require("../Models/User");

router.post("/vinted/user/signup", async (req, res) => {
  try {
    const password = req.fields.password;

    //On vérifier qu'on envoie bien un username
    if (req.fields.username === undefined) {
      res.status(400).json({ message: "Missing parameter" });
    } else {
      const inexistma = await User.findOne({ email: req.fields.email });

      if (inexistma !== null) {
        res.json({ message: "this email already has an acount!" });
      } else {
        console.log(req.fields);
      }

      // Etape 1 hasher le mot de passe
      const salt = uid2(16);
      const hash = SHA256(password + salt).toString(encBase64);
      const token = uid2(16);

      // Etape 2: creer le nouvel utilisateur
      const newUser = new User({
        email: req.fields.email,
        account: {
          username: req.fields.username,
        },
        newsletter: req.fields.newsletter,
        token: token,
        hash: hash,
        salt: salt,
      });
      //Etape 3 : sauvegarder le nouvel utilisateur dans la bdd
      await newUser.save();
      res.json({
        _id: newUser._id,
        email: newUser.email,
        token: newUser.token,
        account: newUser.account,
      });
    }
  } catch (error) {
    res.status(400).json(error.message);
  }
});

router.post("/vinted/user/login", async (req, res) => {
  try {
    const userToCheck = await User.findOne({ email: req.fields.email });
    if (userToCheck === null) {
      res.status(401).json({ message: "Unauthorized ! 1" });
    } else {
      const newHash = SHA256(req.fields.password + userToCheck.salt).toString(
        encBase64
      );

      console.log("newHash==>", newHash);
      console.log("hashToCheck", userToCheck.hash);
      if (userToCheck.hash === newHash) {
        res.json({
          _id: userToCheck._id,
          token: userToCheck.token,
          account: userToCheck.account,
        });
      } else {
        res.status(401).json({ message: "Unauthorized ! 2" });
      }
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
