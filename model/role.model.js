import mongoose from 'mongoose';

const RoleSchema = mongoose.Schema({
  name: String,
  is_active: Boolean,
  permission: Array
});

export default mongoose.model('Role', RoleSchema);