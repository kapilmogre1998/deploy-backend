const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const shareWorkspaceSchema = new Schema({
    ownerId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    ownerName: {
        type: String,
        required: true
    },
    accessSettings: [{
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        permission: {
            type: String,
            required: true,
            enum: ['view', 'edit']
        },
    }]
})

module.exports = mongoose.model('ShareWorkspace', shareWorkspaceSchema);