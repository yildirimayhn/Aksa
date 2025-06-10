const mongoose = require('mongoose');

const aboutSchema = new mongoose.Schema({
    aboutText: {
        type: String,
        required: [true, 'Lütfen hakkımızda kısmını giriniz']
    },
    visionText: {
        type: String,
        required: [true, 'Lütfen vizyon kısmını giriniz']
    },
    missionText: {
        type: String,
        required: [true, 'Lütfen misyon kısmını giriniz']
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('About', aboutSchema);