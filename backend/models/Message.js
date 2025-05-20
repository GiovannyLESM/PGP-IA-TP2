import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    contenido: {
      type: String,
      required: true,
    },
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    proyectoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
  },
  {
    timestamps: true, // añade createdAt automáticamente
  }
);

export const Message = mongoose.model('Message', messageSchema);
