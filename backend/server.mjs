// Necesitamos el framework de express.js para hacer de las conexione en node.js más fácil. Necesitamos la libreria de mongoose que es la libreria de mongodb para organizar todos los datos en mongodb es como un creador del esqueleto de cada coleccion lo que deberia tener para js. bcrypt para encriptar las contraseñas . Cors como paquete de seguridad y permisos, soluciona el problema de bloque de puertos locales y añade acceso a los puertos que se le indique para mantener el front y el backend en una misma sintonia

// .MJS Module JavaScript

//Estoy usando la extensión moderna de JavaScript osea mjs, enves de la CommonJS que necesitabas explicitamente usar los modulos COMMON usando require y module:export para import y exportar mientras que mjs hace de esa sintaxis más sencilla y se puede usar directamente import y export de las funciones o de diferentes archivos
import User from "./src/models/users.model.mjs"
// Importamos las librerias, esto será nuestra conexión osea NUESTRA API    
import "dotenv/config" //Cargará la variable del url que contiene mi contraseña, y no será público en github, ya que en el .gitignore lo pusimos para que no fuese visible, para evitar robo de base de datos por medio de credenciales
import express from 'express' //Herramienta (framework) para crear el servidor y manejar las peticiones web
import mongoose from 'mongoose' // Para creacion de esquemas de la BD como una sql y validacion de los datos
import cors from 'cors' // Funciona como pase de permiso entre mi app react y el servidor en node.js para que los puertos locales se permitan
import bcrypt from 'bcrypt' //Funciona para encriptar las contraseñas ingresadas poniendoles una tipo clave
import neo4j from 'neo4j-driver'
import jwt from 'jsonwebtoken'

//Necesitamos instalar dotenv para cargar varaibles desde un entorno .env para mantener ocultas las contraseñas importantes por ejemplo la contraseña de la base de datos en la nube de mongo Atlas.

const app = express() // Creacion de la aplicacion de servidor, app es la variable del servidor
const port = 3000 // Variable port que tendrá el servidor Node.js, creamos este puerto mas que nada porque no peude coexistir el mismo puerto para el frontend que es el 5173 en mi caso
app.use(cors({
    origin: [
        'http://localhost:5173', 
        'http://192.168.100.63:5173', // Tu celular accediendo al frontend
        'http://192.168.100.63:3000'  // Peticiones directas
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true 
}));

app.use(express.json()); // app.use() = use le indica que use un middleware que es un punto de control para que revise todas las peticiones antes de que lleguen a las rutas de register o login, usamos cors para que no haya problemas entre los puertos , osea para permitir el "paso" entre las rutas
app.use((req, res, next) => {
    console.log(`📡 Petición recibida: ${req.method} ${req.url} desde ${req.ip}`);
    next();
});
// Es un traductor para que cuando en react se inserten los datos este middleware transforme esos datos a formato json para que la lectura en mongodb sea correcta ya que mongo usa documentos json. De un formato json lo traduce a un objeto de Javascript luego adjudicandoselo a req.body que es creado por la insercion de datos username, email y password
const Mongodb_url = process.env.MongoDB_url // Aqui es donde dotenv funciona ya que evitamos poner en el backend directamente el url de la base de datos en la nube usando un entorno "secreto" y lo ocultamos de github o de cualquier plataforma a la que se suba

const JWT_SECRET = process.env.JWT_SECRET || "secreto"

//EndPoints en pocas palabras son las RUTAS DE LA API

const Neo4j_url= process.env.Neo4j_url
const Neo4j_user = process.env.Neo4j_user
const Neo4j_password = process.env.Neo4j_password

// Middlewares: software que actua como puentes entre diferentes aplicaciones o componentes. El cerebro de la API


let driver //Declaramos como let puesto que esta variable cambiará constatemente
try {
    driver = neo4j.driver(Neo4j_url, neo4j.auth.basic(Neo4j_user,Neo4j_password))
    await driver.verifyConnectivity()
    console.log("Conexion a la BD en Neo4j (Aura) exitosa")
} catch (error) {
    console.error("Error al conectarse a la BD en Neo4j",error.message)
    process.exit(1) //Cerramos la conexion
}



mongoose.connect(Mongodb_url) // Conexion hacia MongoDB, toma la url que escondimos como paremtro y se conecta
.then(() => {console.log("Conexion exitosa")}) //Validadciones si la conexion fue exitosa
.catch((err) => {console.error("Conexion fallida: ",err.message)}) //Validacion si la conexion fue fallida e imprimimos el error

//Implementaciones desde la propia documentación de Express

//Necesitamos usar .get para confirmar que realmente el servidor se inició, .get es para OBTENER datos acerca de la direccion que se le pasó, sería como un pull de datos
// req = request, forma de petición de express, mantiene toda la información sobre la petición que llega del cliente
// res = response, forma de respuesta de express, envia toda la información sobre la respueesta de la petición del cliente al cliente devuelta
app.get('/', (req,res) => {
    res.send('Hola mundo. Nubish Funcionando')
})

//Endpoint para agregar a un usuario. Temporalmente aqui en la conexion para probarlo con Postman

// Le mandamos una direccion virtual que el servidor express ahora escucha para que React o Postman lo llamen por ese nombre, ya que se enviarán esos datos a esa dirección . Post es basicamente la función para inserción de datos
// async, funcion que permite realizar otras tareas mientras se ejecutan antes otras, con esto me refiero a que no es sincrona osea que esta funcion no depende del terminar de un proceso para empezar otro se ocupa la variable await para crear intervalos de tiempo especificos de ejecución

//Esta parte del codigo sería un INSERT CRUD.
app.post('/api/auth/register', async(req, res) => {
    const session = driver.session()
    try {
        console.log("Intento de registro:", req.body.email);

        const { nombre,username, email, password, fecha_nacimiento } = req.body; 

        // 1. Validar si ya existe en Mongo
        const emailExistente = await User.findOne({ email: email });
        if (emailExistente) {
            return res.status(400).json({ status: 'error', message: "El correo ya está registrado" });
        }
        
        if (!username) {
            return res.status(400).json({ status: 'error', message: "El nombre de usuario es obligatorio" });
        }
        
        // 3. Encriptar Pass
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 4. Guardar en Mongo
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
        console.log("Usuario guardado en Mongo");

        // 5. Guardar en Neo4j
        await session.run(
            'CREATE (u:Usuario {username: $username, email: $email, nombre: $nombre}) RETURN u',
            { username: username, email: email, nombre: nombre }
        )
        console.log("Nodo creado en Neo4j");

        res.json({ status: 'ok', message: "Usuario registrado exitosamente" });

    } catch (error) {
        console.error("Error en el registro:", error);
        res.status(500).json({ status: 'error', message: error.message || "Error interno del servidor" });
    } finally {
        await session.close();
    }
})

// --- LOGIN ---
app.post('/api/auth/login', async (req, res) => {
    try {
        console.log("Intento de login:", req.body.email);
        const { email, password } = req.body;

        // 1. Buscar usuario
        const user = await User.findOne({ email: email });
        if (!user) {
            return res.status(404).json({ status: 'error', message: "Usuario no encontrado" });
        }

        // 2. Comparar contraseñas
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        
        if (!isPasswordValid) {
            return res.status(401).json({ status: 'error', message: "Contraseña incorrecta" });
        }

        // 3. Generar Token
        const token = jwt.sign(
            { id: user._id, username: user.username, email: user.email },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        // 4. Responder con éxito
        res.json({
            status: 'ok',
            message: "Login exitoso",
            user: {
                username: user.username,
                nombre: user.perfil.nombre_completo,
                email: user.email,
                foto: user.perfil.foto_perfil
            },
            token: token
        });

    } catch (error) {
        console.error("Error en login:", error);
        res.status(500).json({ status: 'error', message: "Error interno" });
    }
});

app.delete('/api/test/reset-db', async (req, res) => {
    const session = driver.session();
    try {
        console.log("Iniciando purga de base de datos...");

        // 1. Borrar todo en MongoDB
        // deleteMany({}) sin filtros borra todos los documentos de la colección
        await User.deleteMany({});
        console.log("MongoDB: Todos los usuarios eliminados.");

        // 2. Borrar todo en Neo4j
        // MATCH (n) selecciona todos los nodos
        // DETACH borra las relaciones primero (necesario para borrar nodos)
        // DELETE n borra los nodos
        await session.run('MATCH (n) DETACH DELETE n');
        console.log("Neo4j: Todos los nodos y relaciones eliminados.");

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

app.listen(port, '0.0.0.0',() => {
    console.log(`Servidor corriendo en http://localhost:${port}`)
})











