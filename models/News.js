const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        maxLength: 100
    },
    content: {
        type: String,
        required: true,
        maxLength: 1000
    },
    sourcePlatform: {
        type: String,
        required: true,
        enum: ['website', 'facebook', 'twitter', 'instagram', 'whatsapp', 'telegram', 'youtube', 'other']
    },
    sourceUrl: String,
    category: {
        type: String,
        required: true,
        enum: ['politics', 'technology', 'health', 'other']
    },
    imageUrl: String,
    cloudinaryId: String,
    assessment: {
        type: String,
        enum: ['likely-true', 'unsure', 'likely-false'],
        default: 'unsure'
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    views: {
        type: Number,
        default: 0
    },
    shares: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('News', newsSchema);
