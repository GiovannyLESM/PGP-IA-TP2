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
    posicion: {
      type: Number,
      default: 0,
    },
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
    completada: {
      type: Boolean,
      default: false,
    }
  },
  {
    timestamps: true,
  }
);

export const Card = mongoose.model('Card', cardSchema);
