require("dotenv").config();         // Paquete para acceder a los .env

// Conexión a la base de datos:
const mongoose = require("mongoose")
mongoose.connect("mongodb://127.0.0.1:27017/songs-and-artists-db")    // Nos conectamos a nuestro servidor (cuando no sea local... habrá contraseña en la URL)
.then(() => {     // Es una petición a nuestra BDD
  console.log("Conectados a la base de datos, todo OK")
})
.catch((error) => {
  console.log(error)
})


const express = require("express"); // Requerir el módulo express para crear un servidor web
const logger = require("morgan");   // Requerir el módulo morgan para registrar las peticiones HTTP en la consola (se le suele llamar "logger")
const cors = require("cors");       // Requerir el módulo cors para habilitar el acceso a la API desde cualquier origen

const app = express();              // Crear una instancia de la aplicación de Express

// all middlewares & configurations here
app.use(logger("dev"));               // Configurar morgan para usar el modo 'dev', que muestra información detallada de cada petición en la consola
app.use(express.static("public"));    // Servir archivos estáticos desde la carpeta "public" // Le decimos que hay una carpeta public

// Permitir que cualquier dominio haga peticiones (acceso desde cualquier origen)
app.use(cors({
  origin: '*'
}));

// below two configurations will help express routes at correctly receiving data.
// Configuraciones para manejar datos entrantes en las rutas
app.use(express.json()); // recognize an incoming Request Object as a JSON Object
app.use(express.urlencoded({ extended: false })); // recognize an incoming Request Object as a string or array


// all routes here...
app.get("/", (req, res, next) => {
  res.json({ message: "all good here!" })   // Este mensaje me muestra postman al hacer un get simple
})

app.get("/patata/:bookId/:ingrediente/algo-estatico", (req, res) => {

  // console.log(req)    Es la petición, donde sale muchísima información del cliente que hace la petición
  // console.log(req.path)   
  // console.log(req.headers)   // Título de la información, host, user-agent...

  // El cliente nos quiere dar información adicional:
  // params, query, body
  console.log("req.params", req.params) // Se pasan en el URL. Algo que define el servidor. bookId será el nombre de la propiedad y en el cliente se le da el valor. Para identificar por sus ids
  console.log("req.query", req.query)   // Se pasan por el URL, el cliente lo define y envía. Para realizar filtros
  console.log("req.body", req.body)     // Es seguro, no se ve en el URL. (contenido de la llamada). Lo define el cliente y lo envía

  res.send("Accediendo a esta ruta, todo bien")   // respuesta al acceder a esta ruta
})

// Ruta de Artistas
const Artist = require("./models/Artist.model.js")

// CRUD
//* Create
app.post("/artist", (req, res) => {

  console.log(req.body)
  // Queremos acceder a la bd y crear un documento con toda la información del req.body (que lo envía el usuario)
  Artist.create({
    name: req.body.name,
    awardsWon: req.body.awardsWon,
    isTouring: req.body.isTouring,
    genre: req.body.genre
  })
  .then(() => {   // es una puta petición a la base de datos. por eso se hace el puto then
    res.send("Todo ok, documento creado")
  })
  .catch((error) => {
    console.log(error)
  })

})

//* Read
app.get("/artist", (req, res) => {
  Artist.find()     // Busca en todos los documentos
  .select({name: 1, awardsWon: 1})   // Funciona como el 'project' de mongo Compass. Indica las propiedades que necesito
  .sort({awardsWon: -1}) // no es el mismo de JS, es el de mongo Compass
  .limit(3)           // Limita la cantidad de elementos a recibir (igual que el compass)
  .then((response) => { 
    console.log(response)
    res.json(response)  // Devuelve al cliente lo encontrado
  })
  .catch((error) => {
    console.log(error)
  })
})

app.get("/search", (req, res) => {
  // query de búsqueda en el *find
  // Artist.find({ name: "Pet Duo" })
  console.log(req.query)  //../search?isTouring=true&genre=tech-house

  Artist.find(req.query)
  .then((response) => { 
    console.log(response)
    res.json(response)
  })
  .catch((error) => {
    console.log(error)
  })
})

//* Búsqueda con parámetros dinámicos
// Buscar los detalles de un artista (por su id)
// No hacemos el find porque no necesitamos buscar todos los documentos
// Sintaxis con async / await
app.get("/artist/:artistId", async (req, res) => {
  try {

    const response = await Artist.findById( req.params.artistId )
    res.json(response)

  } catch (error) {
    console.log(error)
  }
})

//* Delete
// Borrar un artista (por su ID)
app.delete("/artist/:artistId", async(req, res) => {
  try {
    
    await Artist.findByIdAndDelete(req.params.artistId)
    res.send("Todo OK. Artista eliminado")  // Para informar al cliente

  } catch (error) {
    console.log(error)
  }
})

//* Update
// Editar un artista completamente
app.put("/artist/:artistId", async(req, res) => {
  try {
    // 2/3 argumentos, el ID y la información modificada (objeto) que viene del body, objeto new: true
    const response = await Artist.findByIdAndUpdate(req.params.artistId, {
      name: req.body.name,
      awardsWon: req.body.awardsWon,
      isTouring: req.body.isTouring,
      genre: req.body.genre
    }, {new: true})

    // mongoose nos da como respuesta la data antes de la actualización
    // si queremos la data después de la actualización agregamos un tercer argumento (que suelen ser configuraciones) {new: true}


    res.json(response)    // Asumimos que le interesa el nuevo documento al cliente

  } catch (error) {
    console.log(error)
  }
})

// Editar un artista parcialmente
// Se crea cuando el cliente lo necesita
// Se añade algo estático a la URL
app.patch("/artist/:artistId/is-touring-false", async(req, res) => {
  try {
    
    await Artist.findByIdAndUpdate(req.params.artistId, {
      isTouring: false
    })
    res.send("Todo OK. Artista cambiado a que ya no hace tour")

  } catch (error) {
    console.log(error)
  }
})

// server listen & PORT
const PORT = process.env.PORT || 5005

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});