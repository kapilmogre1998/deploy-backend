const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const folderSchema = new Schema({
    folders: [{
        folderName: {
            type: String,
            required: true,
            unique: true
        },
        forms: [{
            formName: {
                type: String,
                required: true,
                unique: true
            },
            owner: {
                type: Schema.Types.ObjectId,
                ref: 'User'
            },
            createdAt: {
                type: Date,
                default: Date.now
            }
        }]
    }],
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createAt: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model("Folder", folderSchema);