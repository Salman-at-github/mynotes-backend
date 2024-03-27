const Notes = require("../models/Notes");
const { structurePaginator } = require("../utils/structurePaginator");
const { sendErrorResponse } = require("../utils/helpers");

const getNotes = async (req, res) => {
    try {
      const { page = 1, limit = 8 } = req.query;
      const parsedPage = parseInt(page);
      const parsedLimit = parseInt(limit);
  
      // Fetch all posts count
      const totalNotesCount = await Notes.countDocuments({user: req.user.id});
  
      // Paginate and fetch posts
      const notes = await Notes.find({user: req.user.id})
        .sort({ date: -1 })
        .skip((parsedPage - 1) * parsedLimit)
        .limit(parsedLimit);
  
      // Use the paginator utility to structure the paginated results
      const paginatedResults = structurePaginator(parsedPage, parsedLimit, notes, totalNotesCount);
  
  
      // Respond with the paginated posts
      res.json(paginatedResults);
    } catch (error) {
      return sendErrorResponse(res, 500, error.message)
    }
  };
const addNote = async (req, res) => {
  try {
      const { title, description, tag } = req.body;
      
      const newNote = new Notes({
          title, description, tag, user: req.user.id //user ID decoded from jwt using mwr
      });
      const savedNote = await newNote.save();
      res.status(201).json(savedNote)
  } catch (error) {
    return sendErrorResponse(res, 500, error.message)
  }
}

const updateNote = async (req, res) => {
  try {
      const { title, description, tag } = req.body;

      // create an update note obj
      const updatedNote = {};
      if (title) (updatedNote.title = title);
      if (description) (updatedNote.description = description);
      if (tag) (updatedNote.tag = tag);

      // find the old note to be updated (/:id fetched here)
      let oldNote = await Notes.findById(req.params.id);
      if (!oldNote) {
          return sendErrorResponse(res, 404, "Old not not found. Can't update")
      };
      if (oldNote.user.toString() !== req.user.id) {//if notes's user's id != id in api/update
        return sendErrorResponse(res, 401, "You can't update this note. You are not authorized")
      };
      oldNote = await Notes.findByIdAndUpdate(req.params.id, { $set: updatedNote }, { new: true }); //The $set operator is used to update the value of a field in a MongoDB document. It takes an object as its value, with each key-value pair representing a field and its new value.
      res.status(200).json(oldNote)
  } catch (error) {
    return sendErrorResponse(res, 500, error.message)

  };
}

const deleteNote =  async (req, res) => {
  try {
      // find the old note to be deleted (/:id fetched here)
      let oldNote = await Notes.findById(req.params.id);
      if (!oldNote) {
          return sendErrorResponse(res, 404, "Old not not found. Can't Delete")
      };

      // check if user is the owner of the note or not and then delete
      if (oldNote.user.toString() !== req.user.id) {
        return sendErrorResponse(res, 401, "You can't delete this note. You are not authorized")
      };
      await Notes.findByIdAndDelete(req.params.id);
      res.status(200).json({ "Success": "Note deleted successfully bruhhh" })
  } catch (error) {
    return sendErrorResponse(res, 500, error.message)
  };
}

const searchNotes = async (req, res) => {
  try {
    const { q = '', fields = [], fromDate, toDate, page = 1, limit = 10 } = req.query;
    const user = req.user.id; // Access user ID from middleware

    let searchQuery = {user: user};
    if (q) {
      // Full-text search using $text operator
      searchQuery.$text = { $search: q };
    }


    searchQuery.user = user; // Filter notes for the current user

    const totalResults = await Notes.countDocuments(searchQuery);
    const skip = (page - 1) * limit; // Calculate skip for pagination

    const notes = await Notes.find(searchQuery, { score: { $meta: "textScore" } }) // Include score for sorting
      .sort({ score: { $meta: "textScore" } }) // Sort by relevance (higher score first)
      .skip(skip)
      .limit(limit);

    res.json({ notes, totalResults }); // Include total results for pagination display
  } catch (error) {
    return sendErrorResponse(res, 500, error.message)
  }
};


  module.exports = {getNotes, addNote, updateNote, deleteNote, searchNotes};