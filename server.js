const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const exphbs = require("express-handlebars");

// Scraping tools
const request = require("request");
const cheerio = require("cheerio");

// Require all models
const db = require("./models");

const PORT = process.env.PORT || 3000;

// Initialize Express
const app = express();
// Middleware
app.use(bodyParser.urlencoded({ extended: true }));

// app.use(express.static("public"));
// Connect to the Mongo DB
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";
mongoose.Promise = Promise;

mongoose.connect(MONGODB_URI);

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

app.get('/', (req, res) => {
  res.render("index");
});

app.get('/scrape', (req, res) => {
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
app.get("/articles", (req, res) => {
  db.Article.find({})
    .then((dbArticle) => {
      res.json(dbArticle);
    })
    .catch((err) => {
      res.json(err);
    });
});

// Route for grabbing a specific Article by id
app.get("/articles/:id", (req, res) => {
  db.Article.findOne({ _id: req.params.id })
    .populate("note")
    .then((dbArticle) => {
      res.json(dbArticle);
    })
    .catch((err) => {
      res.json(err);
    });
});

// // Route for saving/updating an Article's associated Note
// app.post("/articles/:id", function(req, res) {
//   // Create a new note and pass the req.body to the entry
//   db.Note.create(req.body)
//     .then(function(dbNote) {
//       // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
//       // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
//       // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
//       return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
//     })
//     .then(function(dbArticle) {
//       // If we were able to successfully update an Article, send it back to the client
//       res.json(dbArticle);
//     })
//     .catch(function(err) {
//       // If an error occurred, send it to the client
//       res.json(err);
//     });
// });

// Starts the server
app.listen(PORT, function() {
  console.log(`App running on: 
  http://localhost:${PORT}
  http://localhost:${PORT}/scrape
  http://localhost:${PORT}/articles`);
});
