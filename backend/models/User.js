// models/User.js
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true,
      trim: true,
    },
    correo: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    avatar: {
      type: String, // URL o base64
    },
    proyectos: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Proyecto',
      },
    ],
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

export const User = mongoose.model('User', userSchema);
