import express from "express";
import dotenv from "dotenv";
import userRoutes from "./routes/user.routes.js";

dotenv.config();

const app = express();
app.use(express.json()); // habilitar JSON en body

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`);
});

// Levantar el front
app.use(express.static('./public'));

// Rutas de endPoints
app.use("/users", userRoutes);


