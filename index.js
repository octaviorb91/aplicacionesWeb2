import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import userRoutes from "./routes/user.routes.js";
import { connectDB, Producto } from "./models/db.js"; // Importamos la base de datos y el modelo Producto

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();

// Iniciamos la conexión a MongoDB
connectDB();

// Mantenemos el límite de 10mb para que puedan subir las fotos de perfil en Base64
app.use(express.json({ limit: '10mb' })); 
app.use(express.urlencoded({ limit: '10mb', extended: true }));

const port = process.env.PORT || 5000;

// Servimos el frontend
app.use(express.static(path.join(__dirname, 'public')));

// Enlazamos las rutas de usuarios
app.use("/users", userRoutes);

// Endpoint: Catálogo desde MONGODB
app.get('/api/productos', async (req, res) => {
  try {
    const categoriaFiltro = req.query.categoria;
    let query = {}; // Objeto de búsqueda para MongoDB
    
    // Si envían una categoría por URL, la agregamos al filtro de Mongo
    if (categoriaFiltro) {
      query.categoria = categoriaFiltro;
    }

    // Buscamos directamente en la colección de Mongo usando Mongoose
    const productos = await Producto.find(query);
    res.json(productos);
  } catch (error) {
    console.error("Error al consultar el catálogo en MongoDB:", error);
    res.status(500).json({ error: 'Error interno de la base de datos' });
  }
});

app.listen(port, () => {
  console.log("===========================================================");
  console.log(`SERVIDOR CORRIENDO EN EL PUERTO: ${port}`);
  console.log(`Accede a la tienda en: http://localhost:${port}`);
  console.log("===========================================================");
});


