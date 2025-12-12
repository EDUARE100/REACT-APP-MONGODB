import express from 'express';
import Post from "../models/post.model.mjs"; 
import User from "../models/users.model.mjs"; 

//Reutilización del middleware creado en users.routes
import { authMiddleware } from './user.routes.mjs'; 

const router = express.Router();

router.post('/create', authMiddleware, async (req, res) => {
    const { content } = req.body;

    if (!content || content.trim() === '') {
        return res.status(400).json({ message: "El contenido de la publicación no puede estar vacío." });
    }

    try {
        // 1. Creamos la nueva publicación
        const newPost = new Post({
            userId: req.userId, 
            content: content
        });
        
        // 2. Guardamos en BD
        await newPost.save();

        // 🔥 3. PASO CLAVE: Rellenamos los datos del usuario INMEDIATAMENTE
        // Esto busca el nombre y la foto usando el userId que acabamos de guardar
        await newPost.populate('userId', 'username perfil.foto_perfil');

        // 4. Actualizamos el contador de posts del usuario
        const user = await User.findById(req.userId);
        if (user) {
            user.contador.post_count += 1;
            await user.save();
        }

        // 5. Enviamos el post YA CON LOS DATOS DE USUARIO al frontend
        res.status(201).json({ 
            status: 'ok', 
            message: 'Publicación creada con éxito', 
            post: newPost // Ahora 'post' lleva dentro el objeto de usuario, no solo el ID
        });

    } catch (error) {
        console.error("Error al crear post y actualizar contador:", error);
        res.status(500).json({ status: 'error', message: 'Error interno del servidor.' });
    }
});


//Eliminacion del post, decrementamos el contador
router.delete('/:postId', authMiddleware, async (req, res) => {
    const { postId } = req.params;

    try {
        const postToDelete = await Post.findById(postId);

        if (!postToDelete) {
            return res.status(404).json({ message: "Publicación no encontrada." });
        }

        // 🚨 VERIFICACIÓN DE PROPIEDAD: Solo el dueño puede borrar
        if (postToDelete.userId.toString() !== req.userId) {
            return res.status(403).json({ message: "No tienes permiso para borrar esta publicación." });
        }

        await Post.deleteOne({ _id: postId });

        // 4. ACTUALIZAR EL CONTADOR DE POSTS DEL USUARIO (Decremento)
        const user = await User.findById(req.userId);
        if (user && user.contador.post_count > 0) {
            user.contador.post_count -= 1;
            await user.save();
        }

        res.status(200).json({ 
            status: 'ok', 
            message: 'Publicación eliminada con éxito',
            postId: postId // Devolvemos el ID para que el frontend lo elimine de la lista
        });

    } catch (error) {
        console.error("Error al eliminar post y actualizar contador:", error);
        res.status(500).json({ status: 'error', message: 'Error interno del servidor.' });
    }
});


//Obtención de los Posts realizados del usuario actual
router.get('/me', authMiddleware, async (req, res) => {
    try {
        const posts = await Post.find({ userId: req.userId })
                                .sort({ fecha_creacion: -1 });

        res.status(200).json({ 
            status: 'ok', 
            posts: posts 
        });

    } catch (error) {
        console.error("Error al obtener posts:", error);
        res.status(500).json({ status: 'error', message: 'Error interno del servidor.' });
    }
});

router.get('/', authMiddleware, async (req, res) => {
    try {
        const posts = await Post.find()
            .sort({ fecha_creacion: -1 })
            .populate('userId', 'username perfil.foto_perfil')
            .limit(50);

        res.status(200).json({ 
            status: 'ok', 
            posts: posts 
        });

    } catch (error) {
        console.error("Error al obtener el feed:", error);
        res.status(500).json({ status: 'error', message: 'Error interno del servidor.' });
    }
});

router.put('/like/:postId', authMiddleware, async (req, res) => {
    try {
        const { postId } = req.params;
        

        const postActualizado = await Post.findByIdAndUpdate(
            postId,
            { $inc: { likes: 1 } }, 
            { new: true } 
        );

        if (!postActualizado) {
            return res.status(404).json({ message: "Post no encontrado" });
        }

        res.status(200).json({ status: 'ok', post: postActualizado });
    } catch (error) {
        console.error("Error al dar like:", error);
        res.status(500).json({ message: "Error del servidor" });
    }
});


export default router;