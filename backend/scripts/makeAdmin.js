const mongoose = require('mongoose');
const User = require('../models/User');

const connectDB = require('../config/db');

const makeAdmin = async () => {
    try {
        // MongoDB'ye bağlan
        await connectDB();

        // Kullanıcıyı bul ve güncelle
        const user = await User.findOneAndUpdate(
            { email: 'fesih2012@gmail.com' },
            { role: 'admin' },
            { new: true }
        );

        if (user) {
            console.log('Kullanıcı admin olarak güncellendi:', user);
        } else {
            console.log('Kullanıcı bulunamadı');
        }

        // Bağlantıyı kapat
        await mongoose.connection.close();
        
        console.log('İşlem tamamlandı');
        process.exit(0);
    } catch (error) {
        console.error('Hata:', error);
        process.exit(1);
    }
};

makeAdmin();
