// src/routes/user.routes.mjs

import express from 'express';
import 'dotenv/config'; // Necesario para acceder a JWT_SECRET
import jwt from 'jsonwebtoken';
import User from "../models/users.model.mjs"; // Modelo de Mongoose, se inteactua con el modelo directamente no con la propia base de datos en crudo o raw, para seguir el esquema que se creó

//Todas las funciones que usemos con User. serán funciones implicitas del propio moongose, con sintaxis un poco diferentes de las de MongoDB

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "secreto_default"; 


// MIDDLEWARE DE AUTENTICACIÓN (Verifica el token JWT)
// Actualizaces mediante token, se refiere a que mientras el token que se generó tras el login exitoso siga activo las peticiones que se hagan ya sea creación de algo o actualización de algo se harán de manera y segura y protegida mediante el token. 
export const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    //Validación para comprobar si hay un token existente o no expirado en la sesión activa
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: "Acceso denegado. No hay token." });
    }

    const token = authHeader.split(' ')[1];

    try {
        // Verifica el token usando la clave secreta
        const decoded = jwt.verify(token, JWT_SECRET);
        // Adjuntamos el ID del usuario decodificado a la petición para que la ruta lo use
        req.userId = decoded.id; 
        next();
    } catch (err) {
        return res.status(401).json({ message: "Token inválido o expirado." });
    }
};


/**
 PUT /profile
 Actualiza la información del perfil del usuario autenticado.
 Requiere el token JWT en el header 'Authorization'.
 Ruta final: /api/users/profile
 */
router.put('/profile', authMiddleware, async (req, res) => {
    // req.userId fue adjuntado por authMiddleware
    const userId = req.userId;
    const updateData = req.body; 

    try {
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }

        
        if (updateData.perfil) {
            

            //Definimos una variable temporal que almacena datos del perfil de usuario
            let newPerfilData = { 
                ...user.perfil.toObject(), 
                ...updateData.perfil 
            };

                if (updateData.perfil.ubicacion) {
                // Sobreescribimos la ubicación en la variable temporal fusionándola
                newPerfilData.ubicacion = {
                // Usamos los datos de ubicación existentes como base
                ...user.perfil.ubicacion.toObject(), 
                // Fusionamos con los nuevos datos recibidos (ciudad, pais, municipio)
                ...updateData.perfil.ubicacion 
                };
                }
                            
                 // Asignamos el objeto perfil completamente fusionado de vuelta al usuario
                user.perfil = newPerfilData;
                }


        if (updateData.intereses !== undefined) {
            user.intereses = updateData.intereses; 
        }
        
        // Guardar los cambios en MongoDB
        await user.save(); 

        // Clonamos el objeto y eliminamos el hash de la contraseña antes de responder
        const userObject = user.toObject();
        delete userObject.password_hash; 

        // Devolvemos la estructura de datos que espera el frontend (ProfileScreen.jsx)
        res.json({
            status: 'ok',
            message: 'Perfil actualizado con éxito',
            user: {
                username: userObject.username,
                email: userObject.email,
                perfil: userObject.perfil,
                contador: userObject.contador,
                rol: userObject.rol,
                intereses: userObject.intereses
            }
        });

    } catch (error) {
        console.error("Error al actualizar perfil:", error);
        res.status(500).json({ status: 'error', message: error.message || 'Error interno del servidor al actualizar.' });
    }
});


router.get('/suggestions', authMiddleware, async (req, res) => {
    try {
        const { search } = req.query; // Leemos el parámetro ?search=...

        let matchStage = { _id: { $ne: req.userId } }; // Base: excluirme a mí mismo

        // Si hay término de búsqueda, agregamos filtro por nombre o username
        if (search) {
            matchStage.username = { $regex: search, $options: 'i' };
        }

        const pipeline = [
            { $match: matchStage },
            // Solo hacemos $sample (aleatorio) si NO estamos buscando
            // Si buscamos, queremos ver resultados precisos, no aleatorios
            ...(search ? [] : [{ $sample: { size: 5 } }]),  //Limitamos el numero de usuarios a mostrar a 5, si se quiere modificar nada mas se cambia el size
            { $limit: 10 },
            { $project: { 
                username: 1, 
                'perfil.nombre_completo': 1, 
                'perfil.foto_perfil': 1 
            }}
        ];

        const suggestions = await User.aggregate(pipeline);

        res.status(200).json({ status: 'ok', users: suggestions });
    } catch (error) {
        console.error("Error obteniendo sugerencias:", error);
        res.status(500).json({ message: "Error del servidor" });
    }
});

// Seguir a un usuario
router.post('/follow/:id', authMiddleware, async (req, res) => {
    const targetUserId = req.params.id;
    const currentUserId = req.userId;

    if (targetUserId === currentUserId) {
        return res.status(400).json({ message: "No puedes seguirte a ti mismo." });
    }

    try {
        // Verificamos en la BD que el usuario exista usando la funcion de 
        const targetUser = await User.findById(targetUserId);
        if (!targetUser) return res.status(404).json({ message: "Usuario no encontrado." });

        // Incrementamos el contador de numero de seguidores de acuerdo a la funcion findbyId, que vendria a ser findOne({_id: userId})
        await User.findByIdAndUpdate(targetUserId, { 
            $inc: { 'contador.seguidores_count': 1 } 
        });

        // Incrementamos los siguiendo del usuario actual
        await User.findByIdAndUpdate(currentUserId, { 
            $inc: { 'contador.siguiendo_count': 1 } 
        });

        res.status(200).json({ status: 'ok', message: `Ahora sigues a ${targetUser.username}` });

    } catch (error) {
        console.error("Error al seguir usuario:", error);
        res.status(500).json({ message: "Error del servidor" });
    }
});

router.post('/unfollow/:id', authMiddleware, async (req, res) => {
    const targetUserId = req.params.id;
    const currentUserId = req.userId;

    try {
        //Restamos al contador de seguidores buscando el id a dejar de seguir
        await User.findByIdAndUpdate(targetUserId, { 
            $inc: { 'contador.seguidores_count': -1 } 
        });

        //Restamos el numero de seguidos del usuario actual
        await User.findByIdAndUpdate(currentUserId, { 
            $inc: { 'contador.siguiendo_count': -1 } 
        });

        res.status(200).json({ status: 'ok', message: "Dejaste de seguir al usuario." });
    } catch (error) {
        console.error("Error al dejar de seguir:", error);
        res.status(500).json({ message: "Error del servidor" });
    }
});

//Funcion para visitar el perfil de otro usuario, busca en la base de datos por ID que viene en la URL de req.params.id, el signo menos le indica a moongose que extraiga todo excepto el campo que no se quiera extraer en este caso la contraseña
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password_hash');
        
        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        res.status(200).json({ status: 'ok', user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error del servidor" });
    }
});

export default router;