import express from 'express';
import User from "../models/users.model.mjs"; // Asegúrate que esta ruta sea correcta
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import neo4j from 'neo4j-driver';
import 'dotenv/config'; 


const router = express.Router(); 


const JWT_SECRET = process.env.JWT_SECRET || "secreto_default";
const Neo4j_url = process.env.Neo4j_url;
const Neo4j_user = process.env.Neo4j_user;
const Neo4j_password = process.env.Neo4j_password;

let driver;
try {
    driver = neo4j.driver(Neo4j_url, neo4j.auth.basic(Neo4j_user, Neo4j_password));
    driver.verifyConnectivity(); // Solo para lanzar un error si falla
} catch (error) {
    console.error("Error al conectarse a Neo4j en auth.routes:", error.message);
    // No cerramos el proceso aquí, solo reportamos el error
}

//Implementaciones desde la propia documentación de Express

//Necesitamos usar .get para confirmar que realmente el servidor se inició, .get es para OBTENER datos acerca de la direccion que se le pasó, sería como un pull de datos
// req = request, forma de petición de express, mantiene toda la información sobre la petición que llega del cliente
// res = response, forma de respuesta de express, envia toda la información sobre la respueesta de la petición del cliente al cliente devuelta

//Endpoint para agregar a un usuario. Temporalmente aqui en la conexion para probarlo con Postman

// Le mandamos una direccion virtual que el servidor express ahora escucha para que React o Postman lo llamen por ese nombre, ya que se enviarán esos datos a esa dirección . Post es basicamente la función para inserción de datos
// async, funcion que permite realizar otras tareas mientras se ejecutan antes otras, con esto me refiero a que no es sincrona osea que esta funcion no depende del terminar de un proceso para empezar otro se ocupa la variable await para crear intervalos de tiempo especificos de ejecución

//Esta parte del codigo sería un INSERT CRUD.

// POST /register (Ruta final será /api/auth/register)
router.post('/register', async (req, res) => {
    const session = driver.session();
    try {
        const { nombre, username, email, password, fecha_nacimiento } = req.body; 

        // Validamos si el email ya existe en la BD
        const emailExistente = await User.findOne({ email: email });
        if (emailExistente) {
            return res.status(400).json({ status: 'error', message: "El correo ya está registrado" });
        }
        // Validamos si se ingresó un username
        if (!username) {
            return res.status(400).json({ status: 'error', message: "El nombre de usuario es obligatorio" });
        }
        
        // 2. Encriptar Pass
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 3. Guardar en Mongo
        const newUser = new User({
            username: username,
            email: email,
            password_hash: hashedPassword, 
            perfil: {
                nombre_completo: nombre, 
                fecha_nacimiento: fecha_nacimiento ? new Date(fecha_nacimiento) : new Date(), 
            },
            estado: "activo"
        });

        await newUser.save();
        console.log("Usuario guardado en Mongo:", username);

        // Una vez se cree en MongoDB, se guarda o crea el nodo en Neo4j
        await session.run(
            'CREATE (u:Usuario {username: $username, email: $email, nombre: $nombre}) RETURN u',
            { username: username, email: email, nombre: nombre }
        );
        console.log("Nodo creado en Neo4j:", username);

        res.json({ status: 'ok', message: "Usuario registrado exitosamente" });

    } catch (error) {
        console.error("Error en el registro:", error);
        res.status(500).json({ status: 'error', message: error.message || "Error interno del servidor" });
    } finally {
        await session.close();
    }
});

// POST /login (Ruta final será /api/auth/login)
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        //Validaciones LOGIN
        // Buscamos el usuario, si no se encuentra, mandará mensaje de error no permitiendo el acceso
        const user = await User.findOne({ email: email });
        if (!user) {
            return res.status(404).json({ status: 'error', message: "Usuario no encontrado" });
        }

        // Comparación de contraseñas
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        
        if (!isPasswordValid) {
            return res.status(401).json({ status: 'error', message: "Contraseña incorrecta" });
        }

        // Generación de token que luego será guardado en localstorage para evitar constantes peticiones manteniendo seguridad
        const token = jwt.sign(
            { id: user._id, username: user.username, email: user.email },
            JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        // Devolvemos todos los datos de perfil para que el frontend los use
        res.json({
            status: 'ok',
            message: "Login exitoso",
            user: {
                username: user.username,
                email: user.email,
                perfil: user.perfil,
                contador: user.contador,
                rol: user.rol,
                intereses: user.intereses
            },
            token: token
        });

    } catch (error) {
        console.error("Error en login:", error);
        res.status(500).json({ status: 'error', message: "Error interno" });
    }
});

//Funcion de eliminacion 
router.delete('/test/reset-db', async (req, res) => {
    const session = driver.session();
    try {
        await User.deleteMany({});
        await session.run('MATCH (n) DETACH DELETE n');
        
        res.json({ 
            status: 'ok', 
            message: "Bases de datos limpiadas correctamente. Puedes registrarte de nuevo." 
        });

    } catch (error) {
        console.error("Error limpiando BD:", error);
        res.status(500).json({ error: error.message });
    } finally {
        await session.close();
    }
});

export default router;