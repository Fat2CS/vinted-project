const express = require("express");
const res = require("express/lib/response");
const router = express.Router();
const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});
// import des models

const User = require("../Models/User");
const Offer = require("../Models/Offers");

// console.log(User, "testtt");

const isAuthenticated = require("../middlewares/isAuthenticated");

// ma route publish

router.post("/vinted/offer/publish", isAuthenticated, async (req, res) => {
  console.log("sur ma route");
  // console.log(req.fields);
  try {
    // console.log(req.files);

    const newOffer = new Offer({
      product_name: req.fields.product_name,
      product_description: req.fields.product_description,
      product_price: req.fields.product_price,
      product_details: [
        { product_city: req.fields.product_city },
        { product_brand: req.fields.product_brand },
        { product_size: req.fields.product_size },
        { product_color: req.fields.product_color },
      ],

      owner: req.user,
    });
    // upload de l'image
    // console.log(req.files.picture);
    // const pictureToUpload = req.files.picture.path;
    const result = await cloudinary.uploader.upload(req.files.picture.path, {
      folder: "vinted/offers",
      public_id: `${req.fields.title} - ${newOffer._id}`,
    });

    // console.log(result);
    // return res.json(result);

    newOffer.picture = result;

    await newOffer.save();

    res.json(newOffer);
  } catch (error) {
    res.status(400).json(error.message);
    console.log(error);
  }
});

router.get("/vinted/offer", async (req, res) => {
  try {
    const filtersObject = {};

    //gestion du Title
    if (req.query.title) {
      filtersObject.product_name = new RegExp(req.query.title, "i");
    }

    if (req.query.priceMin) {
      filtersObject.product_price = { $gte: req.query.priceMin };
    }

    //si j'ai déjà une clé product_price dans mon objet objectFilters
    if (req.query.priceMax) {
      if (filtersObject.product_price) {
        filtersObject.product_price.$lte = req.query.priceMax;
      } else {
        filtersObject.product_price = {
          $lte: req.query.priceMax,
        };
      }
    }
    //gestion du tri avec l'objet sortObject
    const sortObject = {};
    if (req.query.sort === "price-desc") {
      sortObject.product_price = "desc";
    } else if (req.query.sort === "price-asc") {
      sortObject.product_price = "asc";
    }

    // console.log(filtersObject);

    //gestion de la pagination
    // On a par défaut 5 annonces par page
    //Si ma page est égale à 1 je devrais skip 0 annonces
    //Si ma page est égale à 2 je devrais skip 5 annonces
    //Si ma page est égale à 4 je devrais skip 15 annonces

    //(1-1) * 5 = skip 0 ==> PAGE 1
    //(2-1) * 5 = SKIP 5 ==> PAGE 2
    //(4-1) * 5 = SKIP 15 ==> PAGE 4
    // ==> (PAGE - 1) * LIMIT

    let limit = 3;
    if (req.query.limit) {
      limit = req.query.limit;
    }

    let page = 1;
    if (req.query.page) {
      page = req.query.page;
    }

    const offers = await Offer.find(filtersObject)
      .sort(sortObject)
      .skip((page - 1) * limit)
      .limit(limit)
      .select("product_name product_price");

    const count = await Offer.countDocuments(filtersObject);

    res.json({ count: count, offers: offers });
  } catch (error) {
    res.status(400).json(error.message);
  }
});

router.get("/offer/:id", async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id).populate({
      path: "owner",
      select: "account.username email -_id",
    });
    res.json(offer);
  } catch (error) {
    res.status(400).json(error.message);
  }
});

//export de ma route
module.exports = router;
