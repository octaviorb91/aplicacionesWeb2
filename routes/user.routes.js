import { Router } from "express";
import { writeFile } from 'fs/promises';
import path from "path";
import { fileURLToPath } from "url";
import fs from 'fs';
import bcrypt from 'bcrypt'; // Importamos bcrypt
import { Usuario, Producto, Venta } from '../models/db.js';

const router = Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dirImages = path.join(__dirname, '../public/images');
if (!fs.existsSync(dirImages)) {
    fs.mkdirSync(dirImages, { recursive: true });
}

const guardarFotoBase64 = async (base64String, username) => {
    try {
        const matches = base64String.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        if (!matches || matches.length !== 3) return null;
        const mimeType = matches[1]; 
        const base64Data = matches[2]; 
        const buffer = Buffer.from(base64Data, 'base64'); 
        let extension = 'jpg';
        if (mimeType.includes('png')) extension = 'png';
        if (mimeType.includes('webp')) extension = 'webp';
        if (mimeType.includes('gif')) extension = 'gif';
        const fileName = `${username}.${extension}`;
        const pathDestino = path.join(dirImages, fileName);
        await writeFile(pathDestino, buffer);
        return `/images/${fileName}`;
    } catch (error) {
        console.error("Error al procesar la imagen:", error);
        return null;
    }
};

// MÉTODOS GET
router.get('/all', async (req, res) => {
    try {
        const usuarios = await Usuario.find();
        res.status(200).json(usuarios);
    } catch (error) {
        res.status(500).json({ status: false, message: "Error interno." });
    }
});

router.get('/names', async (req, res) => {
    try {
        const usuarios = await Usuario.find({}, 'nombre');
        const nombres = usuarios.map(u => u.nombre);
        res.status(200).json(nombres);
    } catch (err) {
        res.status(500).json({ message: 'Error al obtener los nombres' });
    }
});

// MÉTODOS POST (Registro y Login con Bcrypt)
router.post('/register', async (req, res) => {
    try {
        const { nombre, apellido, email, password, username, photoBase64 } = req.body;

        if (!nombre || !email || !password) {
            return res.status(400).json({ status: false, message: "Faltan datos." });
        }

        const existeEmail = await Usuario.findOne({ email: new RegExp(`^${email}$`, 'i') });
        if (existeEmail) return res.status(400).json({ status: false, message: "El correo ya existe." });

        // Encriptamos la contraseña
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const ultimoUser = await Usuario.findOne().sort({ id: -1 });
        const nuevoId = ultimoUser && ultimoUser.id ? ultimoUser.id + 1 : 1;

        let photoUrlFinal = photoBase64 ? await guardarFotoBase64(photoBase64, username) : 
            `https://ui-avatars.com/api/?name=${encodeURIComponent(nombre)}+${encodeURIComponent(apellido || '')}&background=28a745&color=fff`;

        const nuevoUsuario = new Usuario({
            id: nuevoId,
            nombre,
            apellido: apellido || "",
            email,
            password: hashedPassword, // Guardamos el hash
            username: username || `${nombre.toLowerCase()}.${(apellido || '').toLowerCase()}`,
            photoUrl: photoUrlFinal
        });

        await nuevoUsuario.save();
        res.status(201).json({ status: true, message: "Usuario creado", usuario: nuevoUsuario });
    } catch (error) {
        res.status(500).json({ status: false, message: "Error al crear cuenta." });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await Usuario.findOne({ username: username });

        // Comparamos el password ingresado con el hash almacenado
        if (user && await bcrypt.compare(password, user.password)) {
            res.status(200).json({
                id: user.id,
                nombre: user.nombre,
                apellido: user.apellido,
                username: user.username,
                email: user.email,
                photoUrl: user.photoUrl,
                status: true
            });
        } else {
            res.status(404).json({ status: false, message: "Datos incorrectos." });
        }
    } catch (error) {
        res.status(500).json({ status: false, message: "Error en login." });
    }
});

// Metodos post/put/delete

router.post('/name/:id', async (req, res) => {
    try {
        const user = await Usuario.findOne({ id: parseInt(req.params.id) });
        res.status(user ? 200 : 404).json(user ? { nombre: user.nombre } : { message: 'No encontrado' });
    } catch (e) { res.status(500).json({ message: 'Error' }); }
});

router.post('/pass/:id', async (req, res) => {
    try {
        const user = await Usuario.findOne({ id: parseInt(req.params.id) });
        res.status(user ? 200 : 404).json(user ? { password: user.password } : { message: 'No encontrado' });
    } catch (e) { res.status(500).json({ message: 'Error' }); }
});

router.put('/pass/update/:id', async (req, res) => {
    try {
        const new_pass = await bcrypt.hash(req.body.password, 10);
        const updated = await Usuario.findOneAndUpdate({ id: parseInt(req.params.id) }, { password: new_pass });
        res.status(updated ? 200 : 404).json({ message: updated ? 'Actualizado' : 'No encontrado' });
    } catch (e) { res.status(500).json({ message: 'Error' }); }
});

router.delete('/delete/:id', async (req, res) => {
    try {
        const result = await Usuario.findOneAndDelete({ id: parseInt(req.params.id) });
        res.status(result ? 200 : 404).json({ message: result ? 'Eliminado' : 'No encontrado' });
    } catch (e) { res.status(500).json({ message: 'Error' }); }
});

router.get('/productos/all', async (req, res) => {
    try {
        const productos = await Producto.find();
        res.status(200).json(productos);
    } catch (e) { res.status(500).json({ message: "Error" }); }
});

router.post('/ventas/comprar', async (req, res) => {
    try {
        const { username, productosCarrito, total, direccion } = req.body;
        const userFound = await Usuario.findOne({ username });
        const ultimaVenta = await Venta.findOne().sort({ id: -1 });
        const nuevoIdVenta = ultimaVenta && ultimaVenta.id ? ultimaVenta.id + 1 : 5001;

        const nuevaOrden = new Venta({
            id: nuevoIdVenta,
            id_usuario: userFound ? userFound.id : 999,
            fecha: new Date().toISOString().split('T')[0],
            total: total,
            direccion: direccion,
            productos: productosCarrito.map(p => ({ id_producto: p.id, cantidad: p.cantidad })),
            pago_efectivo: true
        });
        await nuevaOrden.save();
        res.status(201).json({ status: true, id_orden: nuevoIdVenta });
    } catch (e) { res.status(500).json({ status: false }); }
});

export default router;