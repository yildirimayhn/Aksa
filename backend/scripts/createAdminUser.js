import User from '../models/User';
import bcrypt from 'bcrypt';

async function createAdminUser() {
  const existingAdmin = await User.findOne({ username: 'fhant' });
  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('1452', 10);
    const adminUser = new User({
      username: 'fhant',
      password: hashedPassword,
      email: 'fhant@hantsoft.com',
      role: 'admin'
    });

    await adminUser.save();
    console.log('Admin kullanıcısı oluşturuldu!');
  } else {
    console.log('Admin kullanıcısı zaten mevcut.');
  }
}

createAdminUser();