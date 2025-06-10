const mongoose = require('mongoose');
const {categoryTypeEnum} = require('../emuns/enums')

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Lütfen kategori adını giriniz']
    },
    categoryTypeId: {
        type: Number,
        enum: [categoryTypeEnum],
        required: [true, 'Lütfen kategori türünü seçiniz']
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Category', categorySchema);
