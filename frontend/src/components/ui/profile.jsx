// src/components/ui/ProfileScreen.jsx
import {useState} from 'react';
import { ArrowLeft, MapPin, Mail, Phone, Calendar, User, Zap, Edit, Save, Loader } from 'lucide-react';
import '../../styles/Profile.css'; // Usamos el mismo CSS para consistencia

const protocol = window.location.protocol;
const hostname = window.location.hostname;
const port = 3000;

const base_url = `${protocol}//${hostname}:${port}`;
const API_URL = base_url + '/api/users/profile';
const img = "/user-icon-on-transparent-background-free.png"

const LISTA_INTERESES = [
    "Tecnología", "Programación", "Cine", "Música", "Viajes", 
    "Fotografía", "Diseño", "Videojuegos", "Deportes", "Cocina",
    "Literatura", "Ciencia", "Arte", "Negocios", "Moda", 
    "Animales", "Política", "Historia", "Anime", "Fitness"
];


function ProfileScreen({ user, onBack, onUserUpdate, isOwnProfile}) {
    if (!user) {
        return <div className="profile-container"><p>Error: Usuario no cargado.</p></div>;
    }

    const { username, email, perfil, contador, intereses } = user;
    const ubicacion = perfil?.ubicacion;

    const formattedDate = perfil?.fecha_nacimiento 
        ? perfil.fecha_nacimiento.split('T')[0] 
        : '';

    // ESTADO 1: Datos del Formulario
    const [formData, setFormData] = useState({
        biografia: perfil?.biografia || '',
        fecha_nacimiento: formattedDate, 
        telefono: perfil?.telefono || '',
        genero: perfil?.genero || '',
        // Convertir array de intereses a un string separado por comas para editar
        intereses: intereses?.join(', ') || '', 
        ubicacion_ciudad: ubicacion?.ciudad || '',
        ubicacion_municipio: ubicacion?.municipio || '',
        ubicacion_pais: ubicacion?.pais || '',
    });
    
    // ESTADO 2: Modos de la pantalla
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState(null);

    // Manejador genérico para todos los inputs
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    // FUNCIÓN PRINCIPAL DE GUARDADO
    const handleSave = async () => {
        setIsSaving(true);
        setError(null);

        const token = localStorage.getItem('token');

        if (!token) {
        // Manejo de error si no hay token (aunque no debería pasar si el usuario está logueado)
        setError("Error de sesión: No se encontró el token de acceso.");
        setIsSaving(false);
        return; 
    }
        
        // 1. Preparar los datos para enviarlos al backend
        const profileUpdate = {
        perfil: {
            biografia: formData.biografia,
            fecha_nacimiento: formData.fecha_nacimiento, 
            telefono: formData.telefono,
            genero: formData.genero, 

            ubicacion: { 
                ciudad: formData.ubicacion_ciudad,
                pais: formData.ubicacion_pais,
                municipio: formData.ubicacion_municipio,
            },
        },
        intereses: formData.intereses.split(',').map(item => item.trim()).filter(item => item !== '') 
    };
        
        let updatedUser = null;

        try {
            // Realizamos la petición PUT (o PATCH)
            const response = await fetch(API_URL, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(profileUpdate),
            });

            const responseData = await response.json(); 

            if (!response.ok) {
                // Si el servidor devuelve un error (400, 401, 500)
                throw new Error(responseData.message || 'Error desconocido al guardar.');
            }

            updatedUser = responseData.user; // Asignamos el objeto de usuario a la variable superior
            
            
        } catch (err) {
            console.error("Error al guardar el perfil:", err);
            setError(err.message);
            setIsEditing(true); // Opcional: Mantener en modo edición para corregir
            return; // Salir de la función si hubo error
        } finally {
            setIsSaving(false);
        }

        if (updatedUser && onUserUpdate) { 
            onUserUpdate(updatedUser); 
        }

        setIsEditing(false); // Salir del modo edición
    };

    const getProfileImageUrl = () => {
        const foto = perfil?.foto_perfil;
        
        if (!foto) {
            return img; // Usa la imagen por defecto
        }
        
        // Si el valor no empieza con una barra, la añadimos (asumiendo que está en /public)
        if (!foto.startsWith('/')) {
            return `/${foto}`; 
        }
        
        // Si ya es una URL absoluta o ya tiene barra, la usamos tal cual
        return foto; 
    };
    
    const profileImageSrc = getProfileImageUrl();
    
    
    const fechaNacimientoDisplay = perfil?.fecha_nacimiento 
        ? (() => {
            const [year, month, day] = perfil.fecha_nacimiento.split('T')[0].split('-');
            const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 
                          'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
            return `${parseInt(day)} de ${months[parseInt(month) - 1]} de ${year}`;
          })()
        : 'Desconocida';


    const handleInterestToggle = (interes) => {
    // 1. Convertir la cadena de intereses actual (formData.intereses) a un array de strings
    const currentInterestsArray = formData.intereses
        .split(',')
        .map(item => item.trim())
        .filter(item => item !== '');

    const interesIndex = currentInterestsArray.indexOf(interes);

    let updatedInterestsArray;

    if (interesIndex === -1) {
        // Si el interés NO está en la lista, lo añadimos
        updatedInterestsArray = [...currentInterestsArray, interes];
    } else {
        // Si el interés SÍ está en la lista, lo eliminamos
        updatedInterestsArray = currentInterestsArray.filter((_, index) => index !== interesIndex);
    }
    
    // 2. Convertir el array de vuelta a una cadena separada por comas para guardar en formData
    const updatedInterestsString = updatedInterestsArray.join(', ');

    // 3. Actualizar el estado formData
    setFormData(prevData => ({
        ...prevData,
        intereses: updatedInterestsString
    }));
};

return (
        <div className="profile-container">
            
            <button onClick={isEditing ? () => setIsEditing(false) : onBack} className="btn-back-profile">
                <ArrowLeft size={20} /> {isEditing ? 'Cancelar Edición' : 'Volver al Inicio'}
            </button>

            <div className="profile-card">
                <div className="profile-header-background">
                    {/* Aquí iría una imagen de banner si la tuvieras */}
                </div>
                
                <div className="profile-content">
                    
                    {/* Botón de Editar/Guardar */}
                    <div className="profile-actions-top">
                        {isEditing ? (
                            <button 
                                onClick={handleSave} 
                                className="btn-save-profile" 
                                disabled={isSaving}
                            >
                                {isSaving ? <Loader size={20} className="spinner" /> : <Save size={20} />} 
                                {isSaving ? ' Guardando...' : ' Guardar Cambios'}
                            </button>
                        ) : (
                            isOwnProfile && (
                            <button onClick={() => setIsEditing(true)} className="btn-edit-profile">
                                <Edit size={20} /> Editar Perfil
                            </button>
                            )
                        )}
                    </div>
                    
                    {/* Avatar */}
                    <img 
                        src={profileImageSrc} 
                        alt="Foto de Perfil" 
                        className="profile-avatar-large" 
                    />

                    <h2 className="profile-username">@{username}</h2>
                    
                    
                     <p className="profile-name">{perfil?.nombre_completo}</p>

                    
                    {/* Biografía */}
                    {isEditing ? (
                        <textarea
                            name="biografia"
                            value={formData.biografia}
                            onChange={handleChange}
                            className="profile-input profile-bio-input"
                            placeholder="Escribe tu biografía..."
                            rows="3"
                        ></textarea>
                    ) : (
                        <p className="profile-bio">{perfil?.biografia || 'Agrega tu descripción.'}</p>
                    )}
                    
                    {error && <p className="error-message">Error: {error}</p>}

                    <div className="profile-stats">
                        <span className="stat-item"><strong>{contador?.siguiendo_count || 0}</strong> Siguiendo</span>
                        <span className="stat-item"><strong>{contador?.seguidores_count || 0}</strong> Seguidores</span>
                        <span className="stat-item"><strong>{contador?.post_count || 0}</strong> Publicaciones</span>
                    </div>

                    <div className="details-tab-content">

                            {/* Detalles y Contacto (Editables) */}
                            <div className="profile-details-grid">
                                <h3>Detalles y Contacto</h3>
                                
                                <div className="detail-item"><Mail size={16} /> Correo: <span>{email}</span></div>
                                {/* Teléfono */}
                                <div className="detail-item">
                                    <Phone size={16} /> Teléfono: 
                                    {isEditing ? (
                                        <input type="tel" name="telefono" value={formData.telefono} onChange={handleChange} className="profile-input" placeholder="Ej: +52 55..." />
                                    ) : (
                                        <span>{perfil?.telefono || 'N/A'}</span>
                                    )}
                                </div>

                                {/* Fecha de Nacimiento */}
                                <div className="detail-item">
                                    <Calendar size={16} /> Nació: 
                                    {isEditing ? (
                                        <input type="date" name="fecha_nacimiento" value={formData.fecha_nacimiento} onChange={handleChange} className="profile-input" />
                                    ) : (
                                        <span>{fechaNacimientoDisplay}</span>
                                    )}
                                </div>
                                
                                {/* Género */}
                                <div className="detail-item">
                                    <User size={16} /> Género: 
                                    {isEditing ? (
                                        <select name="genero" value={formData.genero} onChange={handleChange} className="profile-input">
                                            <option value="">Seleccionar</option>
                                            <option value="Masculino">Masculino</option>
                                            <option value="Femenino">Femenino</option>
                                            <option value="Otro">Otro</option>
                                        </select>
                                    ) : (
                                        <span>{perfil?.genero || 'N/A'}</span>
                                    )}
                                </div>

                                {/* Ciudad */}
                                <div className="detail-item">
                                    <MapPin size={16} /> Ciudad: 
                                    {isEditing ? (
                                        <input type="text" name="ubicacion_ciudad" value={formData.ubicacion_ciudad} onChange={handleChange} className="profile-input" placeholder="Ciudad" />
                                    ) : (
                                        <span>{perfil?.ubicacion?.ciudad || 'N/A'}</span> 
                                    )}
                                </div>

                                {/* Municipio */}
                                <div className="detail-item">
                                    <MapPin size={16} /> Municipio: 
                                    {isEditing ? (
                                        <input type="text" name="ubicacion_municipio" value={formData.ubicacion_municipio} onChange={handleChange} className="profile-input" placeholder="Municipio" />
                                    ) : (
                                        <span>{perfil?.ubicacion?.municipio || 'N/A'}</span> 
                                    )}
                                </div>

                                {/* País */}
                                <div className="detail-item">
                                    <MapPin size={16} /> País: 
                                    {isEditing ? (
                                        <input type="text" name="ubicacion_pais" value={formData.ubicacion_pais} onChange={handleChange} className="profile-input" placeholder="País" />
                                    ) : (
                                        <span>{perfil?.ubicacion?.pais || 'N/A'}</span> 
                                    )}
                                </div>
                            </div>

                             <div className="profile-interests">
                                <h3><Zap size={18}/> Intereses</h3>
                                {isEditing ? (
                                    // ✅ NUEVA INTERFAZ DE SELECCIÓN DE INTERESES
                                    <div className="interest-selection-grid">
                                        {LISTA_INTERESES.map((interes) => {
                                            // Verificamos si el interés actual está en formData
                                            const isSelected = formData.intereses
                                                .split(',')
                                                .map(item => item.trim())
                                                .includes(interes);

                                            return (
                                                <button
                                                    key={interes}
                                                    type="button"
                                                    onClick={() => handleInterestToggle(interes)}
                                                    className={`interest-select-btn ${isSelected ? 'selected' : ''}`}
                                                >
                                                    {interes}
                                                </button>
                                            );
                                        })}
                                    </div>

                                ) : (
                                    // Vista de solo lectura (sin cambios aquí)
                                    <div className="interest-tags">
                                        {intereses?.length > 0 ? (
                                            intereses.map((interes, index) => (
                                                <span key={index} className="interest-tag">{interes}</span>
                                            ))
                                        ) : (
                                            <span>No tiene intereses registrados.</span>
                                        )}
                                    </div>
                                )}
                                
                                
                            </div>
                        </div>
                </div>
            </div>
        </div>
    );
}

export default ProfileScreen;
