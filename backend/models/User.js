/**
 * models/User.js
 * Mongoose schema for system users (students + admins)
 */

const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    // Full name of the student or admin
    name: {
      type:     String,
      required: [true, 'Name is required'],
      trim:     true,
      minlength: [2, 'Name must be at least 2 characters']
    },

    // Algonquin student email
    email: {
      type:     String,
      required: [true, 'Email is required'],
      unique:   true,
      lowercase: true,
      trim:     true,
      match:    [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
    },

    // Hashed password (never stored plain text)
    password: {
      type:      String,
      required:  [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters']
    },

    // Role determines access level
    role: {
      type:    String,
      enum:    ['student', 'admin'],
      default: 'student'
    },

    // Student ID number (optional, for reference)
    studentId: {
      type:  String,
      trim:  true
    }
  },
  {
    // Automatically adds createdAt + updatedAt
    timestamps: true
  }
);

// ── Pre-save Hook: Hash password before storing ───────────────────────────────
userSchema.pre('save', async function (next) {
  // Only hash if password was modified (avoids re-hashing on profile updates)
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// ── Instance Method: Compare plain password against stored hash ───────────────
userSchema.methods.comparePassword = async function (plainPassword) {
  return bcrypt.compare(plainPassword, this.password);
};

// ── Instance Method: Return safe user object (no password) ───────────────────
userSchema.methods.toSafeObject = function () {
  const { _id, name, email, role, studentId, createdAt } = this;
  return { _id, name, email, role, studentId, createdAt };
};

module.exports = mongoose.model('User', userSchema);
