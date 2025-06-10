const Event = require('../models/Event');
const Payment = require('../models/Payment'); // Üstte import edilmeli
const { notifyUser } = require('../utils/notify');

exports.joinEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Etkinlik bulunamadı' });

    const userId = req.body.userId;
    if (event.participants.includes(userId))
      return res.status(400).json({ error: 'Zaten katıldınız.' });
    if (event.participants.length >= event.quota)
      return res.status(400).json({ error: 'Kontenjan dolu.' });

    // Ödeme kontrolü
    const payment = await Payment.findOne({ userId, eventId: event._id, paid: true });
    if (!payment) {
      return res.status(400).json({ error: 'Lütfen ödemenizi yapınız.' });
    }
    if (event.participants.length >= event.quota) {
        // Yedek listeye ekle
        if (!event.waitingList.includes(userId)) {
          event.waitingList.push(userId);
          await event.save();
          await notifyUser(userId, 'Etkinlik dolu, yedek listeye eklendiniz.');
          return res.status(200).json({ message: 'Etkinlik dolu, yedek listeye eklendiniz.' });
        } else {
          return res.status(400).json({ error: 'Zaten yedek listedesiniz.' });
        }
      }
    
    event.participants.push(userId);
    await event.save();
    await notifyUser(userId, 'Tebrikler, etkinliğe katıldınız.');  
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.cancelParticipation = async (req, res) => {
  const { id } = req.params; // event id
  const { userId } = req.body;
  const event = await Event.findById(id);
  if (!event) return res.status(404).json({ error: 'Etkinlik bulunamadı' });

  // Son iptal tarihi kontrolü
  if (event.cancelDeadline && new Date() > event.cancelDeadline) {
    return res.status(400).json({ error: 'İptal için son tarih geçti.' });
  }

  // Katılımcıdan çıkar
  event.participants = event.participants.filter(u => u.toString() !== userId);
  
  // Yedek listedeki ilk kişiyi katılımcı yap
  if (event.waitingList.length > 0) {
    const nextUserId = event.waitingList.shift();
    event.participants.push(nextUserId);
    // Burada SMS veya e-posta ile bildirim gönderebilirsin
    // notifyUser(nextUserId, 'Yedekten etkinliğe katıldınız!');
    // ...
    // Yedek listedeki ilk kişiyi katılımcı yap
    if (event.waitingList.length > 0) {
      const nextUserId = event.waitingList.shift();
      event.participants.push(nextUserId);
      await notifyUser(nextUserId, 'Tebrikler! Yedekten etkinliğe katıldınız.');
    }
  }
await event.save();
await notifyUser(userId, 'Etkinlikten çıkarıldınız.');  
  res.json({ success: true });
};

exports.getAllEvents = async (req, res) => {
    try {
      const { category } = req.query;
      let query = {};
      if (category && category !== 'Tümü') {
        query.category = category;
      }
      const events = await Event.find(query).populate('category').populate('participants').populate('waitingList');
      res.json(events);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

exports.createEvent = async (req, res) => {
  try {
    const event = new Event(req.body);
    await event.save();
    res.status(201).json(event);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('category').populate('participants').populate('waitingList');
    if (!event) return res.status(404).json({ error: 'Etkinlik bulunamadı' });
    res.json(event);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
