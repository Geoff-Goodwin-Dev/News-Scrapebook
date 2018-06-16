const mongoose = require("mongoose");
const Schema = mongoose.Schema;

//Schema constructor
const ArticleSchema = new Schema({
  headline: {
    type: String,
    required: true,
    unique: true
  },
  summary: {
    type: String,
    required: true
  },
  URL: {
    type: String,
    required: true
  },
  author: {
    type: String,
    required: true
  },
  updated: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  note: {
    type: Schema.Types.ObjectId,
    ref: "Note"
  }
});

const Article = mongoose.model("Article", ArticleSchema);

module.exports = Article;