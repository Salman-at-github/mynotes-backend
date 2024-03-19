//APIs FOR THE SERVER

const express = require('express');
const router = express.Router();
const Notes = require('../models/Notes');
const decodeUser = require('../middleware/decodeUser');

const { body } = require('express-validator');
const { getNotes, addNote, updateNote, deleteNote, searchNotes } = require('../controllers/notesController');

//fetch Notes

router.get('/get', decodeUser, getNotes);

//Add a new note 
router.post('/add', decodeUser, [body('title', "Enter a title").isLength(),
body('description', "Enter a valid name (min 3 chars)").isLength({ min: 2 })], addNote );

// update note
router.put('/update/:id', decodeUser, updateNote)

//delete note
router.delete('/delete/:id', decodeUser, deleteNote);

router.get('/search', decodeUser, searchNotes)
  
module.exports = router;
