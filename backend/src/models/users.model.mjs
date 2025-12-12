// Definiremos un modelo osea un esquema para nuestra coleccion de users en nuestra DB, osea mantendremos variables y sus tipo de datos ya establecidas para mantener el orden de entrada de datos
import mongoose from "mongoose";
import { Schema } from "mongoose";

//Diseño del esquema para mantener la integridad de los datos

const userSchema = new Schema({

    //Asignamos los tipos de datos y y las especificaciones de cada uno de ellos
    username: {
        type: String, //Asignamos el tipo de dato
        required: [true, "El nombre de usuario es obligatorio"], //required para que el campo sea obligatorio
        unique: true, //Necesitamos que no se repitan nombres de usuario, para seguridad de la BD y del usuario
        trim: true, //Quitamos espacios en blanco al inicio y al final, para mantener el puro string de caracteres
        lowercase: true, //Hacmos que aunque la entrada sea en mayusculas se reciba internamente en minusculas
    },

    email:{
        type: String,
        required: [true, "El correo electrónico es obligatorio"],
        unique: true,
        trim: true,
        lowercase: true,
    },

    email_verificado:{
        type: Boolean,
        default: false, //Hacemos que sea por default falso para evitar implantación de identidad mediante email o spam mediante creacion de multicuentas. No puedes entrar o ingresar hasta que verifiques tu email
    },

    password_hash:{
        type: String,
        required: [true, "La contraseña es obligatoria"],
    },

    estado:{
        type: String,
        enum: ["activo","suspendido","eliminado"],
        default: "activo",
    },

    perfil:{
        nombre_completo: {type: String, default:''},
        biografia: {type:String, default:'', maxLength: 200},
        fecha_nacimiento: {type: Date, required: [true,'Fecha de nacimiento obligatoria']},
        telefono: { 
            type: String, 
            trim: true, 
            default: '' // Empieza vacío. El usuario lo llenará al "Editar Perfil"
        },
        foto_perfil: {type: String, default:''},
        foto_portada: {type: String, default:''},
        ubicacion: {
            pais: {type:String, default:''},
            ciudad: {type:String, default:''},
            municipio: {type:String, default:''}
        },
        genero: {type: String, default:''},

    },

    intereses: [String], //Array de strings

    contador: {
        post_count: {type: Number, default: 0},
        seguidores_count: { type: Number, default: 0 },
        siguiendo_count: { type: Number, default: 0 }, 
    },
},
    {
        //Campos de registro de Fecha de creacion y fecha de actualizacion por la funcion timestamps
        timestamps: {createdAt: 'fecha_creacion', updatedAt: 'fecha_actualizacion'},
        toJSON: {virtuals: true},
        toObject: {virtuals: true}
    },
)
//Funcion para incorporarlo en la base de datos sin que aparezca como campo, se calcula al momento y te retorna el objeto gracias a la funcion toJSON: {virtuals:true} pero como tal no está en el esquema de la BD como campo estricto
//Campo Calculado de edad
userSchema.virtual('edad').get(function(){
    if (!this.perfil || !this.perfil.fecha_nacimiento) {
        return null; 
    }
    const hoy = new Date() // Declaramos una variable con la fecha actual
    const nacimiento = this.perfil.fecha_nacimiento //Una variable con la fecha de dato insertado, extraido con la funcion this
    if (isNaN(nacimiento.getTime())) return null;
    let edad = hoy.getFullYear() - nacimiento.getFullYear() //variable let ya que es susceptible a cambiar su valor, en donde resta el año actual menos el año de nacimiento, sacando el año de nacimiento
    const mes = hoy.getMonth() - nacimiento.getMonth()
    // La condición consta de si el mes de nacimiento es menor que 0 entonces le restamos 1 a la edad. Ejemplo, si se cumple en el mes de diciembre mes 12 pero estamos en el mes de nomviembre 11, el mes seria 11-12 lo que daría -1, osea aun faltaría un mes para que cumpla años por lo tanto se le resta un año, O si estamos en el mismo mes del cumpleaños pero hay dias de diferencia por eso el getDate de hoy y nacimiento osea que si el dia de hoy es menor que el dia del nacimiento se le resta un año tambien porque no ha llegado a su cumple aun
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
        edad -- 
    }
    return edad
})

/**
 Creacion de __V: 0 (Version Key). Es un control de recurrencia generado por moongose para mantener en concordancia los datos

 osea si el mismo usuario está cambiando datos en dos partes distintas(dos dispotivos diferentes por ejemplo) al mismo tiempo, esta clave se encarga de mantener la seguridad de los datos, si uno hace cambios, el otro tendrá que refrescar las personas. 

 */



const User = mongoose.model('User',userSchema, 'Users')

export default User