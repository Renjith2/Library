const express = require('express');
const authmiddlewares = require('../middlewares/authmiddlewares');
const { LibraryAdd, LibraryDelete, LibraryUpdate, LibraryGet, getLibraryDetailsById } = require('../controller/LibraryController');
const router = express.Router();

router.post('/',authmiddlewares,LibraryAdd);
router.delete('/:id',authmiddlewares,LibraryDelete);
router.put('/:id',authmiddlewares,LibraryUpdate);
router.get('/',authmiddlewares,LibraryGet);
router.get('/:id',authmiddlewares,getLibraryDetailsById);

module.exports=router;