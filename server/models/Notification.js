import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  userId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  type:    { type: String, default: 'reminder' }, // reminder, success, warning, missed
  date:    { type: String, default: '' },
  read:    { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model('Notification', notificationSchema);
