import mongoose from 'mongoose';

const SettingSchema = mongoose.Schema({
  sender_name: { type: String, required: false },
  sender_mail_address: { type: String, required: false },
  smtp_server: { type: String, required: false },
  smtp_port: { type: String, required: false },
  smtp_user: { type: String, required: false },
  smtp_type: { type: String, required: false },
  updated_by: { type: String },
  is_remember_session_to_configure: { type: String, required: false },
  is_user_password_to_configure: { type: String, required: false },
  password_expire_unit: { type: String, required: false },
  password_expire_value: { type: String, required: false },
  password_link_expire_unit: { type: String, required: false },
  password_link_expire_value: { type: String, required: false },
  session_expire_unit: { type: String, required: false },
  session_expire_value: { type: String, required: false },
  logo: { type: String, required: false },
  background: { type: String, required: false },
  id: { type: String },
});

export default mongoose.model('Setting', SettingSchema);
