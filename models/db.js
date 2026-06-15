import mongoose from 'mongoose';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Si Mongo no responde, falla rápido y no cuelga el navegador.
mongoose.set('bufferCommands', false);

// Conexión a MongoDB
export const connectDB = async () => {
    try {
        const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/emporio_maravillas';
        // Configuramos un tiempo máximo de espera de 3 segundos
        await mongoose.connect(uri, { serverSelectionTimeoutMS: 3000 });
        console.log('🟢 Conectado exitosamente a la base de datos MongoDB');
    } catch (error) {
        console.error('No se pudo conectar a MongoDB. El servidor local de Mongo no está respondiendo.');
    }
};

// Definición de Esquemas (Schemas)

// Esquema para Usuarios
const usuarioSchema = new mongoose.Schema({
    id: { type: Number },
    nombre: { type: String, required: true },
    apellido: String,
    email: { type: String, required: true },
    password: { type: String, required: true },
    username: { type: String, required: true },
    photoUrl: String
});
export const Usuario = mongoose.model('Usuario', usuarioSchema);

// Esquema para Productos
const productoSchema = new mongoose.Schema({
    id: Number,
    nombre: String,
    desc: String,
    precio: Number,
    imagen: String,
    categoria: String
});
export const Producto = mongoose.model('Producto', productoSchema);

// Esquema para Ventas
const ventaSchema = new mongoose.Schema({
    id: { type: Number },
    id_usuario: Number,
    fecha: String,
    total: Number,
    direccion: String,
    productos: Array,
    pago_efectivo: Boolean
});
export const Venta = mongoose.model('Venta', ventaSchema);
