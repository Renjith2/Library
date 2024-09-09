// routes/books.js

const express = require('express');
const router = express.Router();
const { addBook, getAllBooks, updateBookById, deleteBookById, getBookDetailsById } = require('../controller/BookController');
const multer = require('multer'); // For handling file uploads
const authmiddlewares = require('../middlewares/authmiddlewares');



const upload = multer({ storage: multer.memoryStorage() }); // Using memory storage for uploads


router.post('/', authmiddlewares, upload.single('image'), addBook);
router.get('/',authmiddlewares,getAllBooks)
router.get('/:id',authmiddlewares,getBookDetailsById)
router.put('/:id', authmiddlewares, upload.single('image'), updateBookById);
router.delete('/:id', authmiddlewares, deleteBookById);
module.exports = router;
