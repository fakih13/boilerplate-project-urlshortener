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
  const data = await urlModel.findOne({ original_url: url });
  if (!data) {
    const lastUrl = await urlModel.findOne().sort("-short_url").exec();
    let shortUrl = lastUrl ? lastUrl.short_url + 1 : 1;
    const shortURLCreation = new urlModel({
      original_url: url,
      short_url: shortUrl,
    });
    try {
      const savedUrl = await shortURLCreation.save();
      return savedUrl;
    } catch (err) {
      console.log(err);
    }
  } else {
    return data;
  }
};

const getUrl = async (shortUrl) => {
  const data = await urlModel.findOne({ short_url: shortUrl });
  if (!data) {
    const error = { error: "No short URL found for the given input" };
    return error;
  }
  return data;
};

exports.createShortUrl = createShortUrl;
exports.getUrl = getUrl;
