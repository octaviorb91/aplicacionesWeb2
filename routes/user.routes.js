import { Router } from "express";
import { readFile, writeFile } from 'fs/promises';


const router = Router();

//importar json
const fileProductos = await readFile('./data/productos.json', 'utf-8');
const fileUsuarios = await readFile('./data/usuarios.json', 'utf-8');
const fileVentas = await readFile('./data/ventas.json', 'utf-8');

const productos = JSON.parse(fileProductos);
const usuarios = JSON.parse(fileUsuarios);
const ventas = JSON.parse(fileVentas);

// Metodo Get

// Metodo Get para seleccionar todos los usuarios
/* router.get('/all', (req, res) => {
    res.status(200).json(usuarios);
});

// Metodo GET para seleccionar solo los nombres de todos los usuarios
router.get('/names', (req, res) => {
    try {
        const nombres = usuarios.map(u => u.nombre);
        res.status(200).json(nombres);
    } catch (err) {
        res.status(500).json({ message: 'Error al obtener los nombres' });
    }
});
 */

// Metodo Post



// Metodo post para buscar el usuario
router.post('/login', (req, res) => {
    const username = req.body.username
    const password = req.body.password

    const result = usuarios.find(e => e.username === username && e.password === password);

    if (result) {
        const data = {
            nombre: result.nombre,
            apellido: result.apellido,
            username: result.username,
            status: true
        }
        res.status(200).json(data);
    } else {
        res.status(404).json({ status:false });
    }
});

// Rutas para los productos y las ventas

// 1. Obtener todos los productos para la interfaz
router.get('/productos/all', (req, res) => {
    res.status(200).json(productos);
});

// 2. Registrar una nueva orden de compra
router.post('/ventas/comprar', async (req, res) => {
    const { username, productosCarrito, total, direccion } = req.body;

    if (!username || !productosCarrito || productosCarrito.length === 0) {
        return res.status(400).json({ message: "Datos de compra incompletos" });
    }

    try {
        // Buscamos el usuario para obtener su ID real
        const userFound = usuarios.find(u => u.username === username);
        const id_usuario = userFound ? userFound.id : 999; // ID por defecto si no se encuentra

        // Generamos un nuevo ID incremental para la venta
        const nuevoIdVenta = ventas.length > 0 ? ventas[ventas.length - 1].id + 1 : 5001;

        const nuevaOrden = {
            id: nuevoIdVenta,
            id_usuario: id_usuario,
            fecha: new Date().toISOString().split('T')[0], // Formato YYYY-MM-DD
            total: total,
            direccion: direccion || "Retiro por sucursal",
            productos: productosCarrito.map(p => ({
                id_producto: p.id,
                cantidad: p.cantidad
            })),
            pago_efectivo: true
        };

        // Guardamos en el array en memoria y persistimos en el archivo JSON
        ventas.push(nuevaOrden);
        await writeFile('./data/ventas.json', JSON.stringify(ventas, null, 2));

        res.status(201).json({ status: true, message: "Compra procesada con éxito", id_orden: nuevoIdVenta });
    } catch (error) {
        console.error("Error al procesar la compra:", error);
        res.status(500).json({ status: false, message: "Error interno del servidor al procesar la compra" });
    }
});
// Metodo Post para consultar el nombre de un usuario por id
/* router.post('/name/:id', (req, res) => {
    const { id } = req.params; // id enviado en los parámetros de la URL
    const user = usuarios.find(e => e.id === parseInt(id));

    if (user) {
        res.status(200).json({ nombre: user.nombre });
    } else {
        res.status(404).json({ message: 'Usuario no encontrado' });
    }
});

// Metodo Post para consultar la contraseña de un usuario por id
router.post('/pass/:id', (req, res) => {
    const { id } = req.params; // id enviado en los parámetros de la URL
    const user = usuarios.find(e => e.id === parseInt(id));

    if (user) {
        res.status(200).json({ password: user.password });
    } else {
        res.status(404).json({ message: 'Usuario no encontrado' });
    }
});

// Metodo Put

// Metodo put para actualizar la contraseña de un usuario por id
router.put('/pass/update/:id', async (req, res) => {
    const id = req.params.id;
    const new_pass = req.body.password;

    try{
        const index = usuarios.findIndex(e => e.id == id);
        if (index !== -1) {
            usuarios[index].password = new_pass;
            writeFile('./usuarios.json', JSON.stringify(usuarios, null, 2));
            res.status(200).json({ message: 'Contraseña actualizada correctamente' });
        } else {
            res.status(404).json({ message: 'Usuario no encontrado' });
            return;
        }
    }catch{
        res.status(500).json({ message: 'Error al actualizar la contraseña' });
    }
});

// Metodo Delete

router.delete('/delete/:id', (req, res) => {
        const id = req.params.id;
    try{
        const index = usuarios.findIndex(e => e.id == id);
        if (index !== -1) {
            usuarios.splice(index, 1);
            writeFile('./usuarios.json', JSON.stringify(usuarios, null, 2));
            res.status(200).json({ message: 'Usuario eliminado correctamente' });
        } else {
            res.status(404).json({ message: 'Usuario no encontrado' });
            return;
        }

    }catch{
        res.status(500).json({ message: 'Error al eliminar el usuario' });
    }
        
});
 */



export default router;