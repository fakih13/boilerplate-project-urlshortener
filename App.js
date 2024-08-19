require("dotenv").config();
const mongoose = require("mongoose");

if (!process.env.MONGO_URI) {
  throw new Error("MONGO_URI is not defined in the environment variables");
}

mongoose.connect(process.env.MONGO_URI);

const urlSchema = new mongoose.Schema({
  original_url: String,
  short_url: Number,
});

const urlModel = mongoose.model("Url", urlSchema);

const createShortUrl = async (url) => {
  //console.log(`url find ${url}`);
  const data = await urlModel.findOne({ original_url: url });
  if (!data) {
    //console.log("nous y est");
    const lastUrl = await urlModel.findOne().sort("-short_url").exec();
    let shortUrl = lastUrl ? lastUrl.short_url + 1 : 1;
    //const shortURLCreation = new Url({ original_url: url });
    const shortURLCreation = new urlModel({
      original_url: url,
      short_url: shortUrl,
    });
    try {
      const savedUrl = await shortURLCreation.save();
      //console.log(savedUrl);
      return savedUrl;
    } catch (err) {
      //console.log(err);
    }
  } else {
    //console.log(`url déjà existante n\ ${data}`);
    return data;
  }

  /* await Url.find().distinct("original:url").exec(); */
};

exports.createShortUrl = createShortUrl;
