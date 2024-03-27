//APIs FOR THE SERVER

const express = require('express');
const router = express.Router();
const decodeUser = require('../middleware/decodeUser');

const { getNotes, addNote, updateNote, deleteNote, searchNotes } = require('../controllers/notesController');
const { validateNote, handleValidationErrors } = require('../middleware/validation');

//fetch Notes

router.get('/get', decodeUser, getNotes);

//Add a new note 
router.post('/add', decodeUser, validateNote, handleValidationErrors, addNote );

// update note
router.put('/update/:id', decodeUser, validateNote, handleValidationErrors, updateNote)

//delete note
router.delete('/delete/:id', decodeUser, deleteNote);

router.get('/search', decodeUser, searchNotes)
  
module.exports = router;
