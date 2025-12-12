import React, { useState } from 'react';
import { Image as ImageIcon } from 'lucide-react';

// Asume que user_img es una constante global o se pasa como prop
const DEFAULT_IMG = "/user-icon-on-transparent-background-free.png"; 

function NewPostForm({ user, onSubmitPost }) {
    const [content, setContent] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (content.trim()) {
            onSubmitPost(content);
            setContent(''); // Limpiar el input después de enviar
        }
    };

    return (
        <div className="new-post-section">
            <form onSubmit={handleSubmit} className="post-form">
                <div className="post-input-area">
                    <img 
                        src={user?.perfil?.foto_perfil || DEFAULT_IMG} 
                        alt="User Avatar" 
                        className="user-avatar-small" 
                    />
                    <textarea 
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="¿Qué estás pensando hoy?" 
                        className="post-input" 
                        rows="3"
                        required
                    />
                </div>
                <div className="post-actions">
                    <button type="button" className="btn-icon"><ImageIcon size={18} /></button>
                    <button type="submit" className="btn-primary" disabled={!content.trim()}>
                        Publicar
                    </button>
                </div>
            </form>
        </div>
    );
}

export default NewPostForm;