import mongoose from 'mongoose';

const cardSchema = new mongoose.Schema(
  {
    titulo: {
      type: String,
      required: true,
      trim: true,
    },
    descripcion: {
      type: String,
      trim: true,
    },
    fechaInicio: Date,
    fechaFin: Date,
    listaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'List',
      required: true,
    },
    miembros: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    etiquetas: [
      {
        color: String,
        nombre: String,
      },
    ],
    checklist: [
      {
        nombre: String,
        completado: { type: Boolean, default: false },
      },
    ],
    adjuntos: [
      {
        nombre: String,
        url: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Card = mongoose.model('Card', cardSchema);
