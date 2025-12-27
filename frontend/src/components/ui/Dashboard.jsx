import { useState, useEffect } from 'react';
import { Home, MessageSquare, User, Calendar, Trash2, Search, LogOut,Image as ImageIcon, ThumbsUp, MessageCircle } from 'lucide-react';
import ProfileScreen from './profile';
import NewPostForm from './createpost';
import UserPostsHistory from './historial';
import "../../styles/Dashboard.css"

const protocol = 'http:'; // http: o https:
const hostname = 'localhost'; // localhost, 192.168.x.x, o 172.20.x.x
const port = 3000; // El puerto de tu backend

const BASE_URL = `${protocol}//${hostname}:${port}`;

const user_img = "/user-icon-on-transparent-background-free.png";


//En muchas de las funciones que se realizaron necesitamos guardar el token en localstorage, osea guardar el token generado al incio de sesión localemente para no estar forzando al servidor a realizar demasiadas peticiones, simplemente el token guarda temporalmente las validaciones del usuario para mantener activa la sesión entre recargas de la página y para la autenticación de cada petición HTTP, ya que el servidor no mantiene el estado de sesión por si solo


function Dashboard({ user, onLogout, onUserUpdate}) {

    //Lista estática de constantes utilizada para renderizar la sección de tendencias(Solo visual)
  const trends = ['#AI', '#FrontendDev', '#NewMusic', '#TechNews', '#Gaming'];

 // Controla que sección se renderiza en el área principal sin necesidad de recargar la página, funciona mediante estados y valores posibles como feed, my_posts, profile, visit_profile
  const [currentsection, setcurrentsection] = useState('feed');
  // Arreglo especifico que almacena las publicaciones obtenidas del servidor, para que no desaparezcan cuando se recargue la página o se cambie de pestaña
  const [posts, setPosts] = useState([]);
 //Arreglo para almacenar el historial de publicaciones del usuario autenticado
  const [userPosts, setUserPosts] = useState([]);
  //Funcion que sirve como bandera para mostrar indicaciones de carga, mientras se realizan peticiones al backend
  const [isLoading, setIsLoading] = useState(true);

  //
  const [searchTerm, setSearchTerm] = useState('');
  // Arreglo que contiene la respuesta de la consulta a la base de datos mediante el username
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
 // Arreglo donde se almacenan un numero limitado de usuarios ajenos de manera aleatoria para su renderizado posteriormente
  const [suggestions, setSuggestions] = useState([]);
  //Almacena temporalmente el objeto de datos de un usuerio externo cuando se visita un perfil ajeno, permitiendo reutilizar la pantalla de perfil con información dinámica, osea que se puedan mostrar perfils de otros usuarios estando en sesión activa con un usuario
  const [visitingUser, setVisitingUser] = useState(null);
  

  const handleVisitProfile = async (userId) => {
    // Si soy yo mismo, vamos a mi perfil normal
    if (userId === user._id) {
        handleNavigation('profile');
        return;
    }

    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`${BASE_URL}/api/users/${userId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            const data = await response.json();
            setVisitingUser(data.user); // Guardamos los datos del otro usuario
            setcurrentsection('visit_profile'); // Cambiamos a una nueva sección
        }
    } catch (error) {
        console.error("Error cargando perfil:", error);
    }
};
//Función que se comunica con el API del backend para traer los resultados de los usuarios generados aleatoriamente para ser mostrados y renderizados en pantalla, guardamos temporalmente 
  const fetchSuggestions = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
          const response = await fetch(`${BASE_URL}/api/users/suggestions`, {
              headers: { 'Authorization': `Bearer ${token}` },
          });
          const data = await response.json();
          if (response.ok) {
              const usersWithStatus = data.users.map(u => ({...u, isFollowing: false}));
              setSuggestions(usersWithStatus);
          }
      } catch (err) {
          console.error("Error cargando sugerencias:", err);
      }
  };

//Funcion que nos permite seguir a un usuario, por medio del método POST enviamos una petición al servidor mediante la API, en este caso se neecesita autorización del token, como en cada petición hecha para mantener la integridad de la sesión activa.
  const handleFollowUser = async (targetUserId, isAlreadyFollowing) => {
      const token = localStorage.getItem('token');
    if (!token) return;

    // Ahora sí sabe qué valor tiene esta variable
    const endpoint = isAlreadyFollowing ? 'unfollow' : 'follow';

    try {
        const response = await fetch(`${BASE_URL}/api/users/${endpoint}/${targetUserId}`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            }
        });

        if (response.ok) {
            // Invertimos el estado (si era true ahora es false, y viceversa)
            const newStatus = !isAlreadyFollowing;

            // Actualizamos SUGERENCIAS
            setSuggestions(prev => prev.map(u => 
                u._id === targetUserId ? { ...u, isFollowing: newStatus } : u
            ));

            // Actualizamos RESULTADOS DE BÚSQUEDA
            setSearchResults(prev => prev.map(u => 
                u._id === targetUserId ? { ...u, isFollowing: newStatus } : u
            ));
            
            // Actualizamos TUS contadores personales
            const updatedUser = {
                ...user,
                contador: {
                    ...user.contador,
                    // Si newStatus es TRUE (empecé a seguir) -> Sumo 1
                    // Si newStatus es FALSE (dejé de seguir) -> Resto 1
                    siguiendo_count: (user.contador.siguiendo_count || 0) + (newStatus ? 1 : -1),
                },
            };
            onUserUpdate(updatedUser);
        }
      } catch (error) {
          console.error("Error al seguir:", error);
      }
  };

  //UseEffect es un hook con un arreglo de dependencias vacio, esto se refiere a gestionar el ciclo de vida del dashboard, Asegura las peticiones al servidor, permitiendo que las funciones se ejecuten una sola vez al momento en el que el componente se renderiza. Esto permite al usuario visualizar el contenido del feed y sugerencias de manera casi inmediata al iniciar sesión
  useEffect(() => { 
      fetchPosts(); 
      fetchSuggestions();
  }, []);


  const fetchPosts = async () => {
        const token = localStorage.getItem('token');
        if (!token) { setIsLoading(false); return; }

        try {
            const response = await fetch(`${BASE_URL}/api/posts`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            const data = await response.json();
            if (response.ok) setPosts(data.posts);
        } catch (err) {
            console.error("Error feed:", err);
        } finally {
            setIsLoading(false);
        }
    };

  const handleSearch = async (e) => {
        e.preventDefault();
        
        // Si el buscador está vacío, salimos del modo búsqueda y mostramos sugerencias
        if (!searchTerm.trim()) {
            setSearchResults([]);
            setIsSearching(false); // Aqui desactivamos el panel de busqueda, siempre y cuando este vacío el campo de buscar usuarios
            return;
        }

        setIsSearching(true); 

        try {
            
            const response = await fetch(`${BASE_URL}/api/users/suggestions?search=${searchTerm.trim()}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } // Agregamos el token por seguridad
            });
            
            if (!response.ok) throw new Error("Error en búsqueda");
            
            const data = await response.json();
            
            // Si la API devuelve los usuarios dentro de una propiedad 'users', úsala. 
            // Si devuelve el array directo, usa 'data'. 
            // Ajuste preventivo:
            const resultados = data.users || data; 
            
            setSearchResults(resultados);

        } catch (error) {
            console.error(error);
            setSearchResults([]);
        }
    };


    const handleNewPost = async (content) => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const response = await fetch(`${BASE_URL}/api/posts/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ content: content }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Error al publicar.");
            }
            
            // 1. Añadir el nuevo post al inicio del feed localmente
            setPosts(prevPosts => [data.post, ...prevPosts]);

            // 2. ACTUALIZAR EL CONTADOR EN EL PERFIL
            const updatedUser = {
                ...user,
                contador: {
                    ...user.contador,
                    post_count: (user.contador.post_count || 0) + 1,
                },
            };
            onUserUpdate(updatedUser); 
            
        } catch (error) {
            console.error("Error al crear post:", error);
            alert("Fallo al publicar: " + error.message);
        }
    };
    
    // Función para eliminar post (para el futuro botón de borrar)
    const handleDeletePost = async (postId) => {
        if (!window.confirm("¿Estás seguro de que quieres eliminar esta publicación?")) {
            return false; 
        }

        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const response = await fetch(`${BASE_URL}/api/posts/${postId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Error al eliminar.");
            }

            // 1. Eliminar el post del estado local
            setPosts(prevPosts => prevPosts.filter(post => post._id !== postId));

            // 2. ACTUALIZAR EL CONTADOR EN EL PERFIL
            const updatedUser = {
                ...user,
                contador: {
                    ...user.contador,
                    post_count: Math.max(0, (user.contador.post_count || 0) - 1),
                },
            };
            onUserUpdate(updatedUser); 

            return true;

        } catch (error) {
            console.error("Error al eliminar post:", error);
            alert("Fallo al eliminar: " + error.message);
            return false;
        }
    };

    const handleLikePost = async (postId) => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const response = await fetch(`${BASE_URL}/api/posts/like/${postId}`, {
                method: 'PUT', // Usamos PUT porque estamos actualizando
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                
                // Actualizamos el número de likes en la pantalla inmediatamente
                setPosts(prevPosts => prevPosts.map(post => 
                    post._id === postId ? { ...post, likes: data.post.likes } : post
                ));
            }
        } catch (error) {
            console.error("Error dando like:", error);
        }
    };

    const fetchUserPosts = async () => {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const response = await fetch(`${BASE_URL}/api/posts/me`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            const data = await response.json();

            if (!response.ok) throw new Error(data.message || "Fallo al cargar el historial.");

            setUserPosts(data.posts);
        } catch (err) {
            console.error("Error fetching user posts:", err);
        } finally {
            setIsLoading(false);
        }
    };

    // Manejador para cambiar de sección
    const handleNavigation = (section) => {
        setcurrentsection(section);
        if (section === 'my_posts') fetchUserPosts();
        if (section === 'feed' && posts.length === 0) fetchPosts();
    };

    // Si la sección actual es el perfil, renderizamos ProfileScreen
    if (currentsection === 'profile') {
        return (
            <ProfileScreen 
                user={user} 
                onBack={() => handleNavigation('feed')} 
                onUserUpdate={onUserUpdate} 
                isOwnProfile={true} // <--- Esto habilita el botón de editar
                onDeletePost={handleDeletePost}
            />
        );
    }

    // Aquí verificamos que sea la sección correcta Y que tengamos datos del usuario
    if (currentsection === 'visit_profile' && visitingUser) {
        return (
            <ProfileScreen 
                user={visitingUser} // <--- Pasamos el usuario que descargamos (no el tuyo)
                onBack={() => handleNavigation('feed')}
                onUserUpdate={() => {}} // Función vacía para evitar errores
                isOwnProfile={false} // <--- Esto oculta el botón de editar
            />
        );
    }

return (
        <div className="social-dashboard-container">
            {/* --- SIDEBAR IZQUIERDA --- */}
            <aside className="sidebar-left">
                <div className="sidebar-header">
                    <img src={user?.perfil?.foto_perfil || user_img} alt="User Avatar" className="user-avatar-large" onClick={() => handleNavigation('profile')} />
                </div>
                <nav className="sidebar-nav">
                    <a href="#" className={`nav-item ${currentsection === 'feed' ? 'active' : ''}`} onClick={() => handleNavigation('feed')}>
                        <Home size={24} /> <span>Inicio</span>
                    </a>
                    
                    <a href="#" className={`nav-item ${currentsection === 'my_posts' ? 'active' : ''}`} onClick={() => handleNavigation('my_posts')}>
                        <MessageSquare size={24} /> <span>Mis Posts</span>
                    </a>
                    
                    <a href="#" className={`nav-item ${currentsection === 'profile' ? 'active' : ''}`} onClick={() => handleNavigation('profile')}>
                        <User size={24} /> <span>Mi Perfil</span>
                    </a>

                    <a href="#" className="nav-item" onClick={onLogout}>
                        <LogOut size={24} /> <span>Cerrar Sesión</span>
                    </a>
                </nav>
            </aside>
            
            <main className="main-content">
                {currentsection === 'feed' && (
                    <>
                        <NewPostForm user={user} onSubmitPost={handleNewPost} />
                        <div className="posts-feed">
                            {posts.length > 0 ? posts.map(post => (
                                <PostItem key={post._id} post={post} currentUser={user} onDelete={handleDeletePost} onLike={handleLikePost}/>
                            )) : <p>No hay publicaciones globales.</p>}
                        </div>
                    </>
                )}

                {currentsection === 'my_posts' && (
                    <div className="my-posts-view">
                        <h2 style={{color:'white', marginBottom:'20px'}}>Mis Publicaciones</h2>
                        <UserPostsHistory 
                            posts={userPosts}
                            isLoading={isLoading}
                            user={user}
                            onDeletePost={handleDeletePost} 
                        />
                    </div>
                )}
            </main>
            <aside className="sidebar-right">
                <form className="search-bar" onSubmit={handleSearch}>
                    <Search size={18} className="search-icon" />
                    <input 
                        type="text" 
                        placeholder="Buscar usuarios..." 
                        className="search-input" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </form>

                <div className="suggestions-section">
                    <h3>
                        {isSearching 
                            ? 'Resultados de búsqueda' 
                            : 'Sugerencias para ti'}
                    </h3>
                    
                    {isSearching && searchResults.length > 0 && (
                        searchResults.map(result => (
                            <div key={result._id} className="suggestion-card">
                                <div className="suggestion-info-clickable">
                                    <img 
                                        src={result.perfil?.foto_perfil || user_img} 
                                        alt="Avatar" 
                                        className="suggestion-avatar" 
                                    />
                                    <div className="suggestion-texts">
                                        <span className="suggestion-name">
                                            {result.perfil?.nombre_completo || result.username}
                                        </span>
                                        <span className="suggestion-handle">
                                            @{result.username}
                                        </span>
                                    </div>
                                </div>
                                <button className="btn-follow" onClick={() => handleVisitProfile(result._id)}>Ver</button>
                            </div>
                        ))
                    )}

                    {!isSearching && suggestions.length > 0 && (
                        suggestions.map(sugUser => (
                            <div key={sugUser._id} className="suggestion-card">
                                <div className="suggestion-info-clickable" onClick={() => handleVisitProfile(sugUser._id)}>
                                    <img 
                                        src={sugUser.perfil?.foto_perfil || user_img} 
                                        alt="Avatar" 
                                        className="suggestion-avatar" 
                                    />
                                    <div className="suggestion-texts">
                                        <span className="suggestion-name">
                                            {sugUser.perfil?.nombre_completo || sugUser.username}
                                        </span>
                                        <span className="suggestion-handle">
                                            @{sugUser.username}
                                        </span>
                                    </div>
                                </div>

                                <button 
                                    className="btn-follow"
                                    onClick={() => handleFollowUser(sugUser._id, sugUser.isFollowing)}
                                >
                                    {sugUser.isFollowing ? 'Siguiendo' : 'Seguir'}
                                </button>
                            </div>
                        ))
                    )}

                    {!isSearching && suggestions.length === 0 && (
                        <p style={{color: '#888', fontSize: '0.9rem', padding: '0 15px'}}>No hay sugerencias.</p>
                    )}
                    
                    {isSearching && searchResults.length === 0 && (
                         <p style={{color: '#888', fontSize: '0.9rem', padding: '0 15px'}}>No se encontraron usuarios.</p>
                    )}
                </div>

                <div className="trends-section">
                    <h3>Tendencias</h3>
                    {trends.map((trend, index) => (
                        <a key={index} href="#" className="trend-item">{trend}</a>
                    ))}
                </div>
            </aside>
        </div>
    );
}

const PostItem = ({ post, currentUser, onDelete, onLike }) => {
    const autor = post.userId || {};
    const fotoAutor = autor.perfil?.foto_perfil || user_img;
    const nombreAutor = autor.username || "Usuario Desconocido";

    const soyElDueño = (autor._id === currentUser._id) || (autor === currentUser._id);

    return (
        <div className="post-item-card fade-in">
            <div className="post-header">
                <div className="post-user-info">
                    <img 
                        src={fotoAutor} 
                        alt="Avatar" 
                        className="user-avatar-medium" 
                    />
                    <div className="user-details">
                        <span className="username">@{nombreAutor}</span>
                        <span className="post-date">
                            <Calendar size={12} style={{marginRight: '4px'}}/>
                            {new Date(post.fecha_creacion).toLocaleDateString()} · {new Date(post.fecha_creacion).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                    </div>
                </div>
                
                {soyElDueño && (
                    <button 
                        className="btn-icon-action btn-delete" 
                        onClick={() => onDelete(post._id)}
                        title="Eliminar publicación"
                    >
                        <Trash2 size={18} />
                    </button>
                )}
            </div>
            
            <div className="post-body">
                <p className="post-content-text">{post.content}</p>
            </div>

            <div className="post-divider"></div>

            <div className="post-footer">
                <button className="btn-interaction like-btn" onClick={() => onLike(post._id)}>
                    <ThumbsUp size={18} /> 
                    <span>{post.likes || 0} Me gusta</span>
                </button >
                <button className="btn-interaction comment-btn">
                    <MessageCircle size={18} /> 
                    <span>Comentar</span>
                </button>
            </div>
        </div>
    );
};

export default Dashboard;