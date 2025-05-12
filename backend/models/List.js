import mongoose from 'mongoose';

const listSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true,
      trim: true,
    },
    posicion: {
      type: Number,
      default: 0, // permite reordenar si se desea más adelante
    },
    proyectoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const List = mongoose.model('List', listSchema);
