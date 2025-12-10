import random
from faker import Faker
from pymongo import MongoClient
from neo4j import GraphDatabase
import bcrypt
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv() #Como puse mis contraseñas en un .env en el mismo nivel que este .py tengo que cargarlas con la libreria dotenv que permite la importación de claves resguardadas de manera segura

Mongo_uri = os.getenv("Mongo_uri")
Neo4j_uri = os.getenv("Neo4j_uri")
Neo4j_user = os.getenv("Neo4j_user")
Neo4j_password = os.getenv("Neo4j_password")

Lista_intereses = [
    "Tecnología", "Programación", "Cine", "Música", "Viajes", 
    "Fotografía", "Diseño", "Videojuegos", "Deportes", "Cocina",
    "Literatura", "Ciencia", "Arte", "Negocios", "Moda", 
    "Animales", "Política", "Historia", "Anime", "Fitness"
]



# Configuración del generador
N_usuarios = 500
Prob_follow = 0.05 # 5% de probabilidad de que un usuario siga a otro (para no saturar)


fake = Faker('es_MX') # Datos en español de México

# 1. Conexiones
try:
    Client = MongoClient(Mongo_uri)
    #De esta manera de sintaxis es la misma manera que mandarlo como si fuera get_database() y get_collection(), solo es de manera simplificada. Solo sería conveniente usar esas notaciones para obtener algo más avanzado como definir opciones de lectura o escritura especificas y no las predeterminadas del cliente
    Database = Client["RedSocial"] # 
    Collection = Database["Users"] # 
    
    neo4j_driver = GraphDatabase.driver(Neo4j_uri, auth=(Neo4j_user, Neo4j_password))
    print("Conexión a Bases de Datos exitosa")
except Exception as e:
    print(f"Error de conexión: {e}")
    exit()

def seed_database():

    # Lineas comentadas, descomentar si se quiere borrar la base de datos al principio de generar nuevos usuarios y conexiones
    # users_collection.delete_many({})
    # with neo4j_driver.session() as session:
    # session.run("MATCH (n) DETACH DELETE n")
    
    # Generamos Usuarios
    print(f"Generando {N_usuarios} usuarios falsos...")
    
    # Optimizacion: Generamos el hash UNA vez y lo usamos para todos
    # (Para no tardar mucho encriptando 500 veces). La clave será 123456 para todos los usuarios
    password_hash = bcrypt.hashpw("123456".encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    usuarios_mongo = []
    usuarios_neo4j = []
    usernames_list = [] # Lista auxiliar para crear relaciones después

    for _ in range(N_usuarios):
        sexo = random.choice(['M', 'F'])
        nombre = fake.first_name_male() if sexo == 'M' else fake.first_name_female()
        apellido = f"{fake.last_name()} {fake.last_name()}"
        nombre_completo = f"{nombre} {apellido}"
        
        base_username = fake.user_name()
        username = f"{base_username}{random.randint(10, 999)}"
        
        palabra = fake.word()
        email = f"{palabra}{random.randint(1000,99999)}@gmail.com"
        
        mis_intereses = random.sample(Lista_intereses, k=random.randint(1, 5))
        
        fakenum = fake.numerify('##########')
        telefono = f"+52 {fakenum}"
        
        # Estructura para MongoDB (idéntica a tu Modelo)
        user_mongo = {
            "username": username,
            "email": email,
            "password_hash": password_hash,
            "email_verificado": True,
            "rol": "usuario",
            "estado": "activo",
            "perfil": {
                "nombre_completo": nombre_completo,
                "biografia": fake.text(max_nb_chars=100),
                "fecha_nacimiento": datetime.combine(fake.date_of_birth(minimum_age=18, maximum_age=60), datetime.min.time()),
                "telefono": telefono,
                "foto_perfil": "default_profile.png",
                "ubicacion": {
                    "pais": "México",
                    "estado": fake.state(),
                    "ciudad": fake.city()
                },
                "genero": "Masculino" if sexo == 'M' else "Femenino"
            },
            "intereses": mis_intereses,
            "contador": {
                "post_count": 0,
                "seguidores_count": 0,
                "siguiendo_count": 0
            },
            "fecha_nacimiento": datetime.now(),
            "fecha_actualizacion": datetime.now(),
            "__v": 0
        }
        
        usuarios_mongo.append(user_mongo)
        # Estructura para Neo4j (Solo datos clave)
        usuarios_neo4j.append({"username": username, "email": email, "nombre": nombre})
        usernames_list.append(username)

    # Insertar en MongoDB (Batch)
    if usuarios_mongo:
        Collection.insert_many(usuarios_mongo)
        print("MongoDB: Usuarios insertados.")

    # Insertar en Neo4j (Batch con UNWIND es mucho más rápido)
    with neo4j_driver.session() as session:
        session.run("""
            UNWIND $users AS user
            CREATE (u:Usuario {username: user.username, email: user.email, nombre: user.nombre})
        """, users=usuarios_neo4j)
        print("Neo4j: Nodos creados.")

    # Generación de relaciones aleatorias
    print("Creando conexiones aleatorias (Follows)...")
    
    
    
    relaciones = []
    
    # Diccionario para contar cuántos seguidores/siguiendo tiene cada uno y actualizar Mongo
    mongo_updates = { u: {'seguidores': 0, 'siguiendo': 0} for u in usernames_list }

    for usuario_origen in usernames_list:
        # Decidimos aleatoriamente a cuántos va a seguir este usuario
        # Ejemplo: Sigue a entre 0 y 400 personas

        '''
            Para calcular la cantidad máxima de relaciones entre todos los nodos se tendría que ocupar la fórmula n * n - 1,
            se multiplicarían la cantidad de personas por la cantidad de cada persona - 1 persona, descontando propiamente al nodo propio
            ya que no es posible o realista seguirse a uno mismo desde su propia cuenta.        
            
        '''
        
        cantidad_a_seguir = random.randint(0, 350)
        
        # Elegimos personas al azar de la lista (excluyéndose a sí mismo)
        posibles_destinos = [u for u in usernames_list if u != usuario_origen]
        a_quienes_sigue = random.sample(posibles_destinos, k=min(cantidad_a_seguir, len(posibles_destinos)))
        
        for usuario_destino in a_quienes_sigue:
            # Preparamos dato para Neo4j
            relaciones.append({"from": usuario_origen, "to": usuario_destino})
            
            # Actualizamos contadores en memoria para Mongo
            mongo_updates[usuario_origen]['siguiendo'] += 1
            mongo_updates[usuario_destino]['seguidores'] += 1

    # Insertar Relaciones en Neo4j (Batch)
    # Creamos lotes de 1000 para no saturar la memoria si son muchos
    batch_size = 1000
    for i in range(0, len(relaciones), batch_size):
        lote = relaciones[i:i + batch_size]
        with neo4j_driver.session() as session:
            session.run("""
                UNWIND $rels AS r
                MATCH (a:Usuario {username: r.from})
                MATCH (b:Usuario {username: r.to})
                MERGE (a)-[:SIGUE_A {fecha: date()}]->(b)
            """, rels=lote)
        print(f"   ... Lote de relaciones {i} a {i+len(lote)} procesado.")

    print("Neo4j: Relaciones creadas.")

    # --- PASO 3: Actualizar Contadores en MongoDB ---
    print("Actualizando contadores en MongoDB...")
    
    # Esto puede tardar un poco, se hace uno por uno o con bulk_write
    # Para 500 es rápido hacerlo así:
    from pymongo import UpdateOne
    bulk_ops = []
    
    for username, counts in mongo_updates.items():
        if counts['seguidores'] > 0 or counts['siguiendo'] > 0:
            bulk_ops.append(
                UpdateOne(
                    {"username": username},
                    {"$set": {
                        "contador.seguidores_count": counts['seguidores'],
                        "contador.siguiendo_count": counts['siguiendo']
                    }}
                )
            )
    
    if bulk_ops:
        Collection.bulk_write(bulk_ops)
        print(f"MongoDB: {len(bulk_ops)} perfiles actualizados con sus contadores.")

    print("\n¡PROCESO TERMINADO CON ÉXITO!")
    print(f"Total usuarios: {N_usuarios}")
    print(f"Total relaciones generadas: {len(relaciones)}")
    print("Password para todos los usuarios: 123456")

# Ejecutar
seed_database()
Client.close()
neo4j_driver.close()

#Password para todos los usuarios 123456