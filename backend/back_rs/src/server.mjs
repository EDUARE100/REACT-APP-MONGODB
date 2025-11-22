// Necesitamos el framework de express.js para hacer de las conexione en node.js más fácil. Necesitamos la libreria de mongoose que es la libreria de mongodb para organizar todos los datos en mongodb es como un creador del esqueleto de cada coleccion lo que deberia tener para js. bcrypt para encriptar las contraseñas . Cors como paquete de seguridad y permisos, soluciona el problema de bloque de puertos locales y añade acceso a los puertos que se le indique para mantener el front y el backend en una misma sintonia

// .MJS Module JavaScript

//Estoy usando la extensión moderna de JavaScript osea mjs, enves de la CommonJS que necesitabas explicitamente usar los modulos COMMON usando require y module:export para import y exportar mientras que mjs hace de esa sintaxis más sencilla y se puede usar directamente import y export de las funciones o de diferentes archivos
import User from "./models/users.model.mjs"
// Importamos las librerias, esto será nuestra conexión osea NUESTRA API    
import "dotenv/config" //Cargará la variable del url que contiene mi contraseña, y no será público en github, ya que en el .gitignore lo pusimos para que no fuese visible, para evitar robo de base de datos por medio de credenciales
import express from 'express' //Herramienta (framework) para crear el servidor y manejar las peticiones web
import mongoose from 'mongoose' // Para creacion de esquemas de la BD como una sql y validacion de los datos
import cors from 'cors' // Funciona como pase de permiso entre mi app react y el servidor en node.js para que los puertos locales se permitan
import bcrypt from 'bcrypt' //Funciona para encriptar las contraseñas ingresadas poniendoles una tipo clave
import neo4j, { auth } from 'neo4j-driver'

//Necesitamos installar dotenv para cargar varaibles desde un entorno .env para mantener ocultas las contraseñas importantes por ejemplo la contraseña de la base de datos en la nube de mongo Atlas.

const app = express() // Creacion de la aplicacion de servidor, app es la variable del servidor
const port = 8080 // Variable port que tendrá el servidor Node.js, creamos este puerto mas que nada porque no peude coexistir el mismo puerto para el frontend que es el 5173 en mi caso
const Mongodb_url = process.env.MongoDB_url // Aqui es donde dotenv funciona ya que evitamos poner en el backend directamente el url de la base de datos en la nube usando un entorno "secreto" y lo ocultamos de github o de cualquier plataforma a la que se suba

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

app.use(cors()) // app.use() = use le indica que use un middleware que es un punto de control para que revise todas las peticiones antes de que lleguen a las rutas de register o login, usamos cors para que no haya problemas entre los puertos , osea para permitir el "paso" entre las rutas
app.use(express.json()) // Es un traductor para que cuando en react se inserten los datos este middleware transforme esos datos a formato json para que la lectura en mongodb sea correcta ya que mongo usa documentos json. De un formato json lo traduce a un objeto de Javascript luego adjudicandoselo a req.body que es creado por la insercion de datos username, email y password

mongoose.connect(Mongodb_url) // Conexion hacia MongoDB, toma la url que escondimos como paremtro y se conecta
.then(() => {console.log("Conexion exitosa")}) //Validadciones si la conexion fue exitosa
.catch((err) => {console.error("Conexion fallida: ",err.message)}) //Validacion si la conexion fue fallida e imprimimos el error

//Implementaciones desde la propia documentación de Express

//Necesitamos usar .get para confirmar que realmente el servidor se inició, .get es para OBTENER datos acerca de la direccion que se le pasó, sería como un pull de datos
// req = request, forma de petición de express, mantiene toda la información sobre la petición que llega del cliente
// res = response, forma de respuesta de express, envia toda la información sobre la respueesta de la petición del cliente al cliente devuelta
app.get('/', (req,res) => {
    res.send('Hola mundo')
})

//Endpoint para agregar a un usuario. Temporalmente aqui en la conexion para probarlo con Postman

// Le mandamos una direccion virtual que el servidor express ahora escucha para que React o Postman lo llamen por ese nombre, ya que se enviarán esos datos a esa dirección . Post es basicamente la función para inserción de datos
// async, funcion que permite realizar otras tareas mientras se ejecutan antes otras, con esto me refiero a que no es sincrona osea que esta funcion no depende del terminar de un proceso para empezar otro se ocupa la variable await para crear intervalos de tiempo especificos de ejecución

//Esta parte del codigo sería un INSERT CRUD.
app.post('/api/register', async(req,res) =>{
    const session = driver.session()
    try {
        // Pasamos variables que se mostraran en el registro en react
        const {username,email,password, fecha_nacimiento, nombre_completo} = req.body //req.body es creado despues que los datos hayan sido creados y traducidos por express.json()
        //Validacion de emails
        const emailExistente = await User.findOne({ email: email });
        if (emailExistente) {
            return res.status(400).json({ message: "El correo ya está registrado" });
        }
        const usernameExistente = await User.findOne({ username: username });
        if (usernameExistente) {
            return res.status(400).json({ message: "El nombre de usuario ya existe" });
        }
        

    } catch (error) {
        
    }
})







app.listen(port, () => {
    console.log(`Servidor corriendo en https://localhost:${port}`)
})











