import jwt from 'jsonwebtoken';

export const verificarToken = (req, res, next) => {
    // 1. Buscar el token en los headers (formato: "Bearer <token>")
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ status: false, message: "Acceso denegado. No hay token." });
    }

    try {
        // 2. Verificar si el token es válido usando nuestra clave secreta
        const verificado = jwt.verify(token, process.env.JWT_SECRET);
        
        // 3. Si es válido, guardamos los datos del usuario en la petición (req)
        req.usuario = verificado; 
        next(); // Le damos permiso para continuar a la ruta
    } catch (error) {
        return res.status(403).json({ status: false, message: "Token inválido o expirado." });
    }
};