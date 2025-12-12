import { useState, useEffect } from 'react';
import { Trash2, ThumbsUp, MessageCircle } from 'lucide-react';
import '../../styles/Historial.css';

const protocol = window.location.protocol; 
const hostname = window.location.hostname; // localhost, 192.168.x.x, o 172.20.x.x
const port = 3000;

const BASE_URL = `${protocol}//${hostname}:${port}`;
const user_img = "/user-icon-on-transparent-background-free.png"; 


const PostItem = ({ post, currentUser, onDelete }) => (
    <div className="post-item-card">
        <div className="post-header">
            <img 
                src={currentUser.perfil.foto_perfil || user_img} 
                alt="Avatar" 
                className="user-avatar-small" 
            />
            <div className="post-info">
                <strong>@{currentUser.username}</strong>
                <span className="post-time">{new Date(post.fecha_creacion).toLocaleString()}</span>
            </div>
            
            {/* Botón de Borrar (solo se muestra si es el dueño) */}
            <button className="btn-icon btn-delete" onClick={() => onDelete(post._id)}>
                <Trash2 size={18} />
            </button>
        </div>
        
        <p className="post-content-text">{post.content}</p>

        <div className="post-footer">
            <button className="btn-interaction"><ThumbsUp size={16} /> {post.likes}</button>
            <button className="btn-interaction"><MessageCircle size={16} /> Comentarios</button>
        </div>
    </div>
);


function UserPostsHistory({ user, onDeletePost }) {
    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Función para cargar los posts del usuario al montar el componente
    useEffect(() => {
        const fetchUserPosts = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setIsLoading(false);
                return;
            }

            try {
                const response = await fetch(`${BASE_URL}/api/posts/me`, {
                    headers: { 'Authorization': `Bearer ${token}` },
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || "Error al cargar las publicaciones.");
                }

                setPosts(data.posts);
            } catch (err) {
                console.error("Error fetching user posts:", err);
                setError("Fallo al cargar las publicaciones: " + err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserPosts();
    }, [user._id]); // Se vuelve a cargar si cambia el ID del usuario
    
    // Función para eliminar localmente, llama a la lógica de eliminación del padre
    const handleLocalDelete = async (postId) => {
       
        const fueBorrado = await onDeletePost(postId); 
        
        if (fueBorrado) {
            setPosts(prevPosts => prevPosts.filter(post => post._id !== postId));
        }
    }


    if (isLoading) return <div className="loading-message">Cargando publicaciones...</div>;
    if (error) return <div className="error-message">{error}</div>;

    if (posts.length === 0) {
        return <p className="no-posts-message">Aún no tienes publicaciones.</p>;
    }

    return (
        <div className="posts-history-container">
            {posts.map(post => (
                <PostItem 
                    key={post._id} 
                    post={post} 
                    currentUser={user}
                    onDelete={handleLocalDelete}
                />
            ))}
        </div>
    );
}

export default UserPostsHistory;