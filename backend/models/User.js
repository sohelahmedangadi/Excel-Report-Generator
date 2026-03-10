const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true, minlength: 2, maxlength: 120 },
  email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  plan:     { type: String, enum: ['free','pro','guest'], default: 'free' },
}, { timestamps: true });

// Never return password
userSchema.methods.toSafeObject = function () {
  const { _id, name, email, plan, createdAt, updatedAt } = this;
  return { id: _id.toString(), name, email, plan, created_at: createdAt, updated_at: updatedAt };
};

module.exports = mongoose.model('User', userSchema);
