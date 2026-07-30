const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, required: true }, // e.g., Cardiovascular, Respiratory
  overview: { type: String, required: true },
  symptoms: [{ type: String }],
  causes: [{ type: String }],
  riskFactors: [{ type: String }],
  prevention: [{ type: String }],
  whenToSeeDoctor: { type: String },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isPublished: { type: Boolean, default: false }
}, { timestamps: true });

const Article = mongoose.model('Article', articleSchema);
module.exports = Article;
