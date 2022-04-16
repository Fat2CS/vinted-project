require("dotenv").config();

const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const uid2 = require("uid2");

const express = require("express");
const cors = require("cors");
app.use(cors());
const formidableMiddleware = require("express-formidable");
const mongoose = require("mongoose");
const app = express();
app.use(formidableMiddleware());

mongoose.connect(process.env.MONGODB_URI);

// import des models

// const User = require("./Models/User");
// app.use(User);

// import route  export

const offerPublish = require("./routes/publish");
// attention au moment de spliter bien changer le chemin
const count = require("./routes/publish");
app.use(count);
app.use(offerPublish);

const signup = require("./routes/signup");
app.use(signup);

const cloudinary = require("cloudinary").v2;

// Données à remplacer avec vos credentials :
cloudinary.config({
  cloud_name: "dwr7fdqsa",
  api_key: "766154879848168",
  api_secret: "VwWZf9-NFCCVxPcCFstscIDvry4",
});

app.listen(process.env.PORT, () => {
  console.log("Server has started ! 🚀");
});
