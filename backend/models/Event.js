const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },  
  date: { type: Date, required: true },
  startTime:{type:Date, required: true},
  endTime:{type:Date, required: true},
  duration:{type:Number, required: true},
  distance:{type:String, required: true},
  location: { type: String, required: true },
  guide: { type: String, required: true },
  quota: { type: Number, required: true }, // toplam kontenjan
  price: { type: Number, required: true },
  eventNumber: { type: Number},
  description: String,
  summary: String,
  program: String,
  includedInTheFee: String,
  image: String,
  imageUrls: [{ type: String, default: null}],
  stops: [String], // duraklar
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isDeleted: { type: Boolean, default: false }, // EKLENDİ
  cancelDeadline: { type: Date }, // Katılım iptali için son tarih
  waitingList: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now }
});

EventSchema.virtual('remainder').get(function () {
  return this.quota - (this.participants ? this.participants.length : 0);
});

EventSchema.set('toJSON', { virtuals: true });
EventSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Event', EventSchema);