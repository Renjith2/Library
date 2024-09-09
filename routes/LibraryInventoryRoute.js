const express = require('express');
const authmiddlewares = require('../middlewares/authmiddlewares');
const { addBookToLibraryInventory, getLibraryInventory, deleteBookFromLibraryInventory } = require('../controller/LibraryInventory');
const router=express.Router();



router.post('/api/libraries/:id/inventory',authmiddlewares, addBookToLibraryInventory);
router.get('/api/libraries/:id/inventory',authmiddlewares, getLibraryInventory);
router.delete('/api/libraries/:libraryId/inventory/:bookId',authmiddlewares, deleteBookFromLibraryInventory);

module.exports = router;