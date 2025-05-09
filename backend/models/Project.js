import mongoose from 'mongoose';

const proyectoSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true,
      trim: true,
    },
    descripcion: {
      type: String,
      trim: true,
    },
    fecha_creacion: {
      type: Date,
      default: Date.now,
    },
    creador: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    miembros: [
      {
        usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        rol: {
          type: String,
          enum: ['propietario', 'colaborador', 'lector'],
          default: 'colaborador',
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Project = mongoose.model('Project', proyectoSchema);
