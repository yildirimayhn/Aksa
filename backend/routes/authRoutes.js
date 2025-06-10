const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const UserResetToken = require('../models/UserResetToken');

const crypto = require('crypto');
const {EncryptedOrDecryptedJSFormat} = require('../crypto/cryptoJs');
const {MailTransporter, MailOptions} = require('../utils/mailUtils');


const JWT_SECRET = process.env.JWT_SECRET; // Güvenli bir ortam değişkeni kullanın
const JWT_ANONMOUS_SECRET = 'anonymous-token-secret'; // Güvenli bir ortam değişkeni kullanın


// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Email ve şifre kontrolü
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Lütfen e-posta ve şifrenizi giriniz'
            });
        }

        // Kullanıcıyı bul
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Geçersiz e-posta veya şifre'
            });
        }

        // Şifre kontrolü
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Geçersiz e-posta veya şifre'
            });
        }

        if (!user.isActivated) {
           return res.json({
               success: false,
               message: 'Lütfen hesabınızı aktivasyon mailindeki link ile aktifleştirin.'
           });            
        }
        // Token oluştur
        const token = jwt.sign(
            { id: user._id },
            JWT_SECRET,
            { expiresIn: '1d' }
        );

        // Kullanıcı bilgilerini gönder
        const userResponse = { ...user.toObject() };
        delete userResponse.password;

        res.json({
            success: true,
            token,
            user: userResponse
        });
    } catch (error) {
        console.error('Login hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Giriş yapılırken bir hata oluştu'
        });
    }
});

// Mevcut kullanıcı bilgilerini getir
router.get('/me', async (req, res) => {
    try {
        let token;

        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Token bulunamadı'
            });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Kullanıcı bulunamadı'
            });
        }

        res.json({
            success: true,
            user
        });
    } catch (error) {
        console.error('Kullanıcı bilgileri getirme hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Kullanıcı bilgileri alınırken bir hata oluştu'
        });
    }
});

// anonim token oluştur
router.get('/anonymous-token', async(req, res) => {
    try {
        // Anonim token oluştur
        const token = jwt.sign(
            { role: 'anonymous' }, // Anonim kullanıcı rolü
            JWT_ANONMOUS_SECRET,
            { expiresIn: '1h' } // 1 saat geçerli
        );

        res.json({
            success: true,
            token
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Token oluşturulurken bir hata oluştu'
        });
    }
});

//#region forget password
router.post('/forget-password', async (req, res) => {
    const { email } = req.body;
    console.log('aut forget-password api çağrıldı ');
    console.log('body', email)
    try {
        const user = await User.findOne({ email });
        console.log('user ', user);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Girdiğiniz mail adresi hatalı lütfen tekrar deneyiniz!'
            });
        }

        const expireDate = new Date();
        expireDate.setHours(expireDate.getHours() + 1);
        console.log('expireDate ', expireDate);
        console.log('user id', user._id);
        
        //token şifrele
        const resetToken = EncryptedOrDecryptedJSFormat(user._id.toString(), true);
        console.log('Şifrelenen EncryptedOrDecryptedJSFormat resetToken:', resetToken);
        console.log('Link adresine verilen encodeURIComponent token :',encodeURIComponent(resetToken))
        const resetLink = `${process.env.LOCAL_WEB_ADDRESS}/reset-password/${encodeURIComponent(resetToken)}`;

        const userId = user._id;
        const existingUserToken = await UserResetToken.findOne({ userId: userId });
        const tokenModel = {userId: userId, resetToken: resetToken, expireDate: expireDate}; 
        
        if (existingUserToken) {       
            const updateUserResetToken = await UserResetToken.findByIdAndUpdate(
                existingUserToken._id,
                tokenModel,
                { new: true }
            );
            if (!updateUserResetToken) {
                return res.status(500).json({success:false, message: 'Kullanıcının token bilgisi güncellenmedi!'})
            }

        }else{

            const userResetToken = new UserResetToken(tokenModel);
             console.log('userResetToken model', userResetToken)

            await userResetToken.save();
            const userTokenResponse = { ...userResetToken.toObject() };
             console.log('userTokenResponse  save model', userTokenResponse)

            if (!userTokenResponse) {
              return  res.status(500).json({success: false, message : 'Kullanıcı için token oluşturulamadı!'})
            }
        }

        let transporter = nodemailer.createTransport(MailTransporter());
        
        let toMail = email;
        let subjectMessage = `Şifre Sıfırlama Maili`;
        let htmlBody = `
                Merhaba ${user.fullName},<br><br>
                Şifrenizi sıfırlamak için <a href="${resetLink}">buraya tıklayın</a>.<br>
                Eğer bu işlemi siz yapmadıysanız, lütfen bu maili dikkate almayınız.<br>
                <br>
                Teşekkürler.
            `;

        let mailOptions = MailOptions(toMail,subjectMessage, htmlBody);
        

        await transporter.sendMail(mailOptions);
        res.status(200).json({ success: true, message: 'Şifre sıfırlama mailiniz gönderilmiştir.' });
        
    } catch (error) {
        console.error('Mail gönderme hatası:', error);
        res.status(500).json({ success: false, message: 'Mail gönderilemedi', error: error.message });
    }
});

router.get('/check-reset-token', async (req, res) => {
    console.log('call check-reset-token api ');
    const { resetToken } = req.query;
    console.log('reset token : ', resetToken);
    try {
        const decryptedToken = EncryptedOrDecryptedJSFormat(resetToken, false);
        console.log('decryptedToken : ', decryptedToken);

        const tokenDoc = await UserResetToken.findOne({ decryptedToken });
        if (!tokenDoc) {
            return res.json({ success: false, message: 'Geçersiz bağlantı.' });
        }
        if (tokenDoc.expireDate < new Date()) {
            return res.json({ success: false, message: 'Bağlantının süresi dolmuş.' });
        }
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Sunucu hatası.' });
    }
});
router.post('/reset-password', async (req, res) => {
    const { resetToken, password } = req.body;
    try {
        const tokenDoc = await UserResetToken.findOne({ resetToken });
        if (!tokenDoc) {
            return res.status(400).json({ success: false, message: 'Geçersiz bağlantı.' });
        }
        if (tokenDoc.expireDate < new Date()) {
            return res.status(400).json({ success: false, message: 'Bağlantının süresi dolmuş.' });
        }
        const user = await User.findById(tokenDoc.userId);
        if (!user) {
            return res.status(400).json({ success: false, message: 'Kullanıcı bulunamadı.' });
        }
        // Şifreyi hashle
        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;
        await user.save();
        // Tokenı sil (tek kullanımlık)
        await UserResetToken.deleteOne({ _id: tokenDoc._id });
        res.json({ success: true, message: 'Şifreniz başarıyla güncellendi.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Sunucu hatası.' });
    }
});
//#endregion


router.post('/send-activation', async (req, res) => {
    const { email } = req.body;
    console.log('aut send-activation api çağrıldı ');
    console.log('body', email)
    try {
        const userModel = await User.findOne({ email });
        console.log('userModel ', userModel);
        if (!userModel) {
            return res.status(401).json({
                success: false,
                message: 'Girdiğiniz mail adresi hatalı lütfen tekrar deneyiniz!'
            });
        }

       //token şifrele
        const resetToken = EncryptedOrDecryptedJSFormat(userModel._id.toString(), true);
        console.log('Şifrelenen EncryptedOrDecryptedJSFormat resetToken:', resetToken);
        console.log('Link adresine verilen encodeURIComponent token :',encodeURIComponent(resetToken))
        const resetLink = `${process.env.LOCAL_WEB_ADDRESS}/user-activated/${encodeURIComponent(resetToken)}`;

        const tokenModel = userModel;
        tokenModel.activationToken = resetToken;
        tokenModel.isActivated = false;

        const updateUserToken = await UserResetToken.findByIdAndUpdate(
            userModel._id,
            tokenModel,
            { new: true }
        );
        if (!updateUserToken) {
            return res.status(500).json({success:false, message: 'Kullanıcının token bilgisi güncellenmedi!'})
        }
        let transporter = nodemailer.createTransport(MailTransporter());
        
        let toMail = email;
        let subjectMessage = `Aktivasyon maili`;
        let htmlBody = `
                    Merhaba ${userModel.fullName},<br><br>
                    Hesabınızı aktifleştirmek için <a href="${resetLink}">buraya tıklayın</a>.<br>
                    Eğer bu işlemi siz yapmadıysanız, lütfen bu maili dikkate almayınız.<br>
                    <br>
                    Teşekkürler.
            `;
        let mailOptions = MailOptions(toMail,subjectMessage, htmlBody);

        await transporter.sendMail(mailOptions);
        res.status(200).json({ success: true, message: 'Aktivasyon mailiniz gönderilmiştir.' });
        
    } catch (error) {
        console.error('Aktivasyon maili gönderme hatası:', error);
        res.status(500).json({ success: false, message: 'Aktivasyon maili gönderilemedi', error: error.message });
    }
});


router.get('/activate', async (req, res) => {
    const { activationToken } = req.query;
    try {
        const decryptedToken = EncryptedOrDecryptedJSFormat(activationToken, false);

        const user = await User.findOne({ activationToken: decryptedToken });
        if (!user) {
            return res.status(400).send('Geçersiz veya süresi dolmuş aktivasyon linki.');
        }
        user.isActivated = true;
        user.activationToken = null;
        await user.save();
        res.send('Hesabınız başarıyla aktifleştirildi.');
    } catch (error) {
        res.status(500).send('Aktivasyon sırasında bir hata oluştu.');
    }
});

module.exports = router;
