const fs = require('fs');
const https = require('https');
const path = require('path');

const avatarUrls = [
    'https://raw.githubusercontent.com/Ashwinvalento/cartoon-avatar/master/lib/images/male/45.png',
    'https://raw.githubusercontent.com/Ashwinvalento/cartoon-avatar/master/lib/images/female/45.png',
    'https://raw.githubusercontent.com/Ashwinvalento/cartoon-avatar/master/lib/images/male/85.png',
    'https://raw.githubusercontent.com/Ashwinvalento/cartoon-avatar/master/lib/images/female/85.png',
    'https://raw.githubusercontent.com/Ashwinvalento/cartoon-avatar/master/lib/images/male/15.png',
    'https://raw.githubusercontent.com/Ashwinvalento/cartoon-avatar/master/lib/images/female/15.png'
];

const downloadAvatar = (url, index) => {
    return new Promise((resolve, reject) => {
        const fileName = `avatar${index + 1}.jpg`;
        const filePath = path.join(__dirname, '..', 'uploads', 'avatars', fileName);
        
        https.get(url, (response) => {
            if (response.statusCode !== 200) {
                reject(new Error(`Failed to download ${url}`));
                return;
            }

            const fileStream = fs.createWriteStream(filePath);
            response.pipe(fileStream);

            fileStream.on('finish', () => {
                fileStream.close();
                console.log(`Downloaded ${fileName}`);
                resolve();
            });
        }).on('error', (err) => {
            reject(err);
        });
    });
};

async function downloadAllAvatars() {
    try {
        await Promise.all(avatarUrls.map((url, index) => downloadAvatar(url, index)));
        console.log('All avatars downloaded successfully');
    } catch (error) {
        console.error('Error downloading avatars:', error);
    }
}

downloadAllAvatars();
