const mongoose = require('mongoose');

const LibrarySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    contact: {
        type: String,
        required: true
    },
    owner:{
        type:String,
        required:true
    },
    inventory: [{
        bookid: {
            type: mongoose.Schema.Types.ObjectId, // Use ObjectId to reference books
            required: true
        },
        title: {
            type: String,
            required: true
        },
        available: {
            type: Boolean,
            required: true,
            default: true
        },
        borrower: {
            name: {
                type: String,
                default: null
            },
            price: {
                type: Number,
                default: null
            }
        }
    }]
});

const Library = mongoose.model("Library", LibrarySchema);
module.exports = Library;

