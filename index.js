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

/* const pattern =
  /(https:\/\/www\.|http:\/\/www\.|https:\/\/|http:\/\/)?[a-zA-Z]{2,}(\.[a-zA-Z]{2,})(\.[a-zA-Z]{2,})?\/[a-zA-Z0-9]{2,}|((https:\/\/www\.|http:\/\/www\.|https:\/\/|http:\/\/)?[a-zA-Z]{2,}(\.[a-zA-Z]{2,})(\.[a-zA-Z]{2,})?)|(https:\/\/www\.|http:\/\/www\.|https:\/\/|http:\/\/)?[a-zA-Z0-9]{2,}\.[a-zA-Z0-9]{2,}\.[a-zA-Z0-9]{2,}(\.[a-zA-Z0-9]{2,})?/g; */
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

        // vérifier si il y a un élément déjà existants pour l'url
        // engregistrer l'url en bdd et récupérer l'id pour le short_url
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
    /* res.json({ error: "invalid url" });
    return; */
  }
});

// GET /api/shorturl

app.get("/api/shorturl/:short_url", function (req, res) {
  const url = Number(req.params.short_url);

  if (!url) {
    res.json({ error: "invalid short_url" });
    return;
  }
  res.json({ query_url: url });
  // récupérer l'url avec le short_url
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
