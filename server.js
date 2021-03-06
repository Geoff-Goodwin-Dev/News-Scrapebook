const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const exphbs = require("express-handlebars");

// Scraping tools
const request = require("request");
const cheerio = require("cheerio");

// Require all models
const db = require("./models");

// Sets server port
const PORT = process.env.PORT || 3000;

// Initialize Express
const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// Connect to the Mongo DB
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI);

//Handlebars setup
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// ROUTES
app.get('/', (req, res) => {
  res.render('index');
});

app.get('/saved', (req, res) => {
  res.render('saved');
});

app.get('/api/scrape', (req, res) => {
  request('https://gizmodo.com/c/space', (error, response, body) => {
    if (error) throw error;
    else {
      console.log('statusCode:', response && response.statusCode);
      const $ = cheerio.load(body);
      // GET route for scraping the gizmodo website
      $("article").each(function(i, element) {
        let result = {};
        result.headline = $(".headline", this)
          .children("a")
          .text();
        result.summary = $(".entry-summary", this)
          .children("p")
          .text();
        result.URL = $(".headline", this)
          .children("a")
          .attr("href");
        result.author = $(".author", this)
          .children("a")
          .text();
        result.updated = $("time", this)
          .attr("datetime");
        result.image = $("picture", this)
          .children("source")
          .data("srcset");
        db.Article.create((result), (dbArticle) => {
          console.log(dbArticle);
        });
      });
    }
    res.send("Scrape Complete");
  });
});

// Route for getting all Articles from the db
app.get("/api/articles", (req, res) => {
  db.Article.find({saved: false})
    .then((dbArticle) => {
      res.json(dbArticle);
    })
    .catch((err) => {
      res.json(err);
    });
});

// Route for getting all Articles from the db
app.get("/api/savedArticles", (req, res) => {
  db.Article.find({saved: true})
    .then((dbArticle) => {
      res.json(dbArticle);
    })
    .catch((err) => {
      res.json(err);
    });
});

app.get("/api/articleNotes/:id", (req, res) => {
  db.Article.findOne({ _id: req.params.id })
    .populate("note")
    .then((dbArticle) => {
      res.json(dbArticle);
    })
    .catch((err) => {
      res.json(err);
    });
});

app.put("/api/saveArticle/:id", (req, res) => {
  db.Article.findByIdAndUpdate(
    req.params.id,
    { $set: { saved: true }},
    { new: true },
    (err, data) => {
      if (err) return res.status(500).send(err);
      return res.send(data);
    }
  )
});

app.put("/api/removeArticle/:id", (req, res) => {
  db.Article.findByIdAndUpdate(
    req.params.id,
    { $set: { saved: false }},
    { new: true },
    (err, data) => {
      if (err) return res.status(500).send(err);
      return res.send(data);
    }
  )
});

// Route for saving/updating an Article's associated Note
app.post("/api/addNote/:id", function(req, res) {
  console.log(req.body);
  db.Note.create(req.body)
    .then(function(dbNote) {
      return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
    })
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

// Starts the server
app.listen(PORT, function() {
  console.log(`App running on: 
  http://localhost:${PORT}`);
});
