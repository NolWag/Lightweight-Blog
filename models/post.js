var mongoose = require('mongoose');

var postSchema = mongoose.Schema({
  title: String,
  author: String,
  body: String,
  date: { type: Date, default: Date.now },
});

var Post = mongoose.model('Post', postSchema);

module.exports = Post;
