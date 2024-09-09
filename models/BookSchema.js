// models/Book.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bookSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    publishedDate: {
        type: String,
        required: true,
    },
    author: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
    libraryID: { type: mongoose.Schema.Types.ObjectId, ref: 'Library' },
    libraryName: { 
        type: String
    },
    borrower: { type: String },
   
});

const Book = mongoose.model('Book', bookSchema);

module.exports = Book;


