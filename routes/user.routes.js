import { Router } from "express";
import { readFile, writeFile } from 'fs/promises';


const router = Router();

//importar json
const fileProductos = await readFile('./productos.json', 'utf-8');
const fileUsuarios = await readFile('./usuarios.json', 'utf-8');
const fileVentas = await readFile('./ventas.json', 'utf-8');

const productos = JSON.parse(fileProductos);
const usuarios = JSON.parse(fileUsuarios);
const ventas = JSON.parse(fileVentas);

// Metodo Get

// Metodo Get para seleccionar todos los usuarios
router.get('/all', (req, res) => {
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


// Metodo Post

// Metodo Post para consultar el nombre de un usuario por id
router.post('/name/:id', (req, res) => {
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
        res.status(200).json({ contraseña: user.contraseña });
    } else {
        res.status(404).json({ message: 'Usuario no encontrado' });
    }
});

// Metodo Put

router.put('/pass/update/:id', async (req, res) => {
    const id = req.params.id;
    const new_pass = req.body.contraseña;

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




export default router;