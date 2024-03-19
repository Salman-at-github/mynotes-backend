const mongoose = require('mongoose');
const {Schema} = mongoose;

const NotesSchema = new Schema({
    
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    title:{
        type: String,
        required: true
    },
    description:{
        type: String,
        required: true
    },
    tag:{
        type: String,
    },
    date:{
        type: Date,
        default: Date.now
    }
},
{
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

NotesSchema.index({ title: 'text', description: 'text', tag: 'text' }, { weights: { title: 2, description: 1, tag: 0.5 } });
 // Full-text search index
module.exports = mongoose.model('notes', NotesSchema);

