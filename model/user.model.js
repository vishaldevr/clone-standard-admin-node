import mongoose from 'mongoose';

import crypto from 'crypto';
const userSchema = mongoose.Schema({
  name: { type: String },
  first_name: { type: String },
  last_name: { type: String },
  email: { type: String },
  is_active: { type: Boolean, default: 0 },
  password: { type: String },
  phone_no: { type: String },
  mobile_no: { type: String },
  avatar: { type: String },
  note: { type: String },
  reset_password_token: { type: String },
  account_activated_token: { type: String },
  forgotPasswordToken: { type: String },
  forgotPasswordExpiry: { type: Date },
  roles:{type:Array}
});

userSchema.methods = {
  generatePasswordResetToken: async function () {
    const resetToken = crypto.randomBytes(20).toString('hex');
    this.forgotPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    this.forgotPasswordExpiry = Date.now() + 3600000;
    console.log(resetToken);
    await this.save();
    return resetToken;
  },
};

export default mongoose.model('Users', userSchema);
