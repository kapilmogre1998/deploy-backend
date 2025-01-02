const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const formSchema = new Schema({
    folder: {
        type: Schema.Types.ObjectId,
        ref: 'Folder',
        required: true
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    formId: {
        type: String,
        required: true
    },
    formName: {
        type: String,
        required: true
    },
    elements: [{
        type: {
            type: String,
            required: true,
            enum: ['bubble-text', 'bubble-image', 'bubble-gif', 'user-input-text', 'user-input-number', 'user-input-email', 'user-input-phone', 'user-input-date', 'user-input-rating','user-input-button']
        },
        title: {
            type: String,
            required: true
        },
        value: {
            type: String
        }
    }]
})

module.exports = mongoose.model('form', formSchema);