import mongoose from 'mongoose';

const LogSchema = mongoose.Schema({
  event_type: { type: String },
  request_url: { type: String },
  user_id: { type: mongoose.Schema.Types.ObjectId, refs: 'Users' },
  ip_address: { type: String },
  response_data: { type: String },
  code: { type: String },
  method: { type: String },
  created_at: {
    type: Date,
    default: new Date(),
  },
});

const LogModel = mongoose.model('Logs',LogSchema);
export default LogModel;