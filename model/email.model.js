import mongoose from 'mongoose';

const emailSchema = mongoose.Schema({
  name: { type: String, required: false },
  unique_identifier: { type: String, required: false },
  type: { type: String, required: true },
  subject: { type: String, required: true },
  content: { type: String, required: true },
  dynamic_fields: { type: String, required: false },
  is_fixed: { type: String, required: true },
  is_active: { type: Boolean, required: true },
  bcc: { type: String, required: false },
  id: { type: String },
  mailtags: { type: String, required: false },
});

export default mongoose.model('email_templates', emailSchema);
