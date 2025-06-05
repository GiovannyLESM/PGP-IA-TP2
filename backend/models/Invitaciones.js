import mongoose from 'mongoose';

const invitacionSchema = new mongoose.Schema({
  proyecto: { 
    type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true 
},
  usuarioInvitado: {
    type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true 
},
  usuarioInvitador: { 
    type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true 
},
  estado: { 
    type: String, enum: ['pendiente', 'aceptada', 'rechazada'], default: 'pendiente' 
},
  fechaCreacion: { 
    type: Date, default: Date.now 
},
});

export const Invitacion = mongoose.model('Invitacion', invitacionSchema);
