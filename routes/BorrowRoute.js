const express = require('express');
const authmiddlewares = require('../middlewares/authmiddlewares');
const { borrowBookFromLibrary, returnBorrowedBook } = require('../controller/BorrowController');
const router=express.Router();

router.post('/api/borrow',authmiddlewares,borrowBookFromLibrary);
router.put('/api/return/:id',authmiddlewares,returnBorrowedBook);

module.exports=router;