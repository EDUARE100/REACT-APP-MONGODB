import mongoose from "mongoose";

const postschema = new mongoose.Schema({
    //Usuario quién creó el post
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', 
        required: true
    },
    
    // Contenido de la publicación (texto)
    content: {
        type: String,
        required: true,
        maxlength: 500
    },
    
    // Contador simple de interacciones
    likes: {
        type: Number,
        default: 0
    },
    
    // Fecha de creación (para ordenar en el feed)
    fecha_creacion: {
        type: Date,
        default: Date.now
    }
});

const Post = mongoose.model('Post', postschema);
export default Post;