require("dotenv").config();
const dns = require("dns");
const bodyParser = require("body-parser");
const express = require("express");
const cors = require("cors");
const { hostname } = require("os");
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(
  bodyParser.urlencoded({
    // to support URL-encoded bodies
    extended: true,
  })
);

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// POST /api/shorturl
const createShortUrl = require("./App.js").createShortUrl;
app.post("/api/shorturl", function (req, res) {
  try {
    const url = req.body.url;
    console.log(`voici l'url utliser ${url}`);
    const newPattern =
      /(https?:\/\/(.+?\.)?[a-zA-Z]{2,}(\/[A-Za-z0-9\-\._~:\/\?#\[\]@!$&'\(\)\*\+,;\=]*)?)/g;
    const test = url.match(newPattern);

    const errorMessage = "Invalid URL";
    if (!test) {
      console.error(`catch : ${errorMessage}`);
      res.json({ error: errorMessage });
      return;
    } else {
      const urlHostName = new URL(url);
      const hostName = urlHostName.hostname;
      console.log(hostName);
      dns.lookup(hostName, async function (error, address, family) {
        if (error) {
          console.error(error);
          return res.json({ error: errorMessage });
        }

        console.log("address: %j family: IPv%s", address, family);

        const { short_url, original_url } = await createShortUrl(url);
        res.json({
          original_url: original_url,
          short_url: short_url,
          hostName: hostName,
        });
      });
    }
  } catch (error) {
    console.error(`catch : ${error}`);
    res.json({ error: error });
  }
});

// GET /api/shorturl
const getUrl = require("./App.js").getUrl;
app.get("/api/shorturl/:short_url", async function (req, res) {
  const shortUrl = Number(req.params.short_url);

  const { original_url } = await getUrl(shortUrl);
  const { error } = await getUrl(shortUrl);
  if (!shortUrl) {
    res.json({ error: "invalid short_url" });
    return;
  }
  if (error) {
    res.json({ error: error });
  } else {
    res.redirect(original_url);
  }
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
