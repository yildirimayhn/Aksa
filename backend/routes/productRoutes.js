const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Product = require('../models/Product');
const { authenticateToken } = require('../middleware/authMiddleware');
const { protect, authorize, protectAnonymous } = require('../middleware/auth');

// Multer yapılandırması
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = 'uploads/products';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: function (req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
            return cb(new Error('Sadece resim dosyaları yüklenebilir!'));
        }
        cb(null, true);
    }
});

// Tüm ürünleri getir 
router.get('/productList', async (req, res) => {
    try {
        console.log('GET /api/products endpoint çağrıldı');
        const products = await Product.find();
        res.json({ 
            success: true, 
            products 
        });
    } catch (error) {
        console.error('Ürünleri çekerken hata:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Tüm ürünleri getir - Sadece admin
router.get('/', protect, async (req, res) => {
    try {
        console.log('GET /api/products endpoint çağrıldı');
        const products = await Product.find();
        res.json({ 
            success: true, 
            products 
        });
    } catch (error) {
        console.error('Ürünleri çekerken hata:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Tek ürün getir
router.get('/:id', protect, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Ürün bulunamadı' });
        }
        res.json({ success: true, product });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Yeni ürün ekle
router.post('/', protect, authorize('admin'), upload.single('image'), async (req, res) => {
    try {
        const { name, category, description, price, stockQuantity } = req.body;
        const product = new Product({
            name,
            category,
            description,
            price: parseFloat(price),
            stockQuantity: parseInt(stockQuantity),
            imageUrl: req.file ? '/uploads/products/' + req.file.filename : null
        });

        await product.save();
        res.status(201).json({ success: true, product });
    } catch (error) {
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }
        res.status(400).json({ success: false, message: error.message });
    }
});

// Ürün güncelle
router.put('/:id', protect, authorize('admin'), upload.single('image'), async (req, res) => {
    try {
        console.log('PUT request received for product:', req.params.id);
        console.log('Request body:', req.body);
        console.log('Authenticated user:', req.user);

        const { name, category, description, price, stockQuantity } = req.body;
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ success: false, message: 'Ürün bulunamadı' });
        }

        product.name = name;
        product.category = category;
        product.description = description;
        product.price = parseFloat(price);
        product.stockQuantity = parseInt(stockQuantity);
        
        const imageUrl = req.file && product.imageUrl? product.imageUrl : null;
        if (req.file) {
            product.imageUrl = '/uploads/products/' + req.file.filename;
        }

        // Eski resimleri silme işlemini yanıt gönderilmeden önce yapın
        if (imageUrl && typeof imageUrl === 'string') {
            const oldImagePath = path.join(__dirname, '..', imageUrl);
            if (fs.existsSync(oldImagePath)) {
                fs.unlinkSync(oldImagePath);
            }
        }
           
        await product.save();
        res.json({ success: true, product });
    } catch (error) {
        console.error('Error updating product:', error);
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }
        res.status(400).json({ success: false, message: error.message });
    }
});

// Ürün sil
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        
        if (!product) {
            return res.status(404).json({ success: false, message: 'Ürün bulunamadı' });
        }

        // Ürün resmini sil
        if (product.imageUrl) {
            const imagePath = path.join(__dirname, '..', product.imageUrl);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        await product.remove();
        res.json({ success: true, message: 'Ürün başarıyla silindi' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;