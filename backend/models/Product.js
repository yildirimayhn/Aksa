const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Ürün adı zorunludur']
    },
    category: {
        type: String,
        required: [true, 'Kategori zorunludur'],
        enum: ['Endodonti', 'Restoratif', 'Protetik', 'Cerrahi', 'Ortodonti', 'Periodonti', 'Pedodonti', 'İmplant', 'Genel']
    },
    description: {
        type: String,
        required: [true, 'Açıklama zorunludur']
    },
    statusType: {
        type: String,
        required: [true, 'Durum zorunludur'],
        enum: ['true', 'false'],
        default: 'true'
    },
    price: {
        type: Number,
        required: [true, 'Fiyat zorunludur'],
        min: [0, 'Fiyat 0\'dan küçük olamaz']
    },
    stockQuantity: {
        type: Number,
        required: [true, 'Stok adedi zorunludur'],
        min: [0, 'Stok adedi 0\'dan küçük olamaz']
    },
    imageUrl: {
        type: String,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Product', productSchema);
