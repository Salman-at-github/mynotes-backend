//APIs FOR THE SERVER

const express = require('express');
const router = express.Router();
const Notes = require('../models/Notes');
const decodeUser = require('../middleware/decodeUser');

const { body } = require('express-validator');
const { getNotes, addNote, updateNote, deleteNote } = require('../controllers/notesController');

// ROUTE1 Fetch all notes using get api/notes/fetchallnotes. Login required

router.get('/fetchallnotes', decodeUser, async (req, res) => {
    try {
        const notes = await Notes.find({ user: req.user.id }); //find note by user from fecthUser
        res.status(200).json(notes)
    } catch (error) {
        console.error(error.message);
    }
});

//Add a new note 
router.post('/addnote', decodeUser, [body('title', "Enter a title").isLength(),
body('description', "Enter a valid name (min 3 chars)").isLength({ min: 2 })], addNote );

// update note
router.put('/updatenote/:id', decodeUser, updateNote)

//delete note
router.delete('/deletenote/:id', decodeUser, deleteNote);

router.get('/get', decodeUser, getNotes);
  
  
module.exports = router;
