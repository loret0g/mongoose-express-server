// Hacemos el modelo, asik necesitamos la librería aquí también
const mongoose = require("mongoose")

// Creamos el esquema:  
// Estructura de nuestra bdd - Validaciones, tiene que concordar cuando se 'añada' un dato al documento
const artistSchema = new mongoose.Schema({    // El argumento es un objeto con cada una de las propiedades
  // name: String,
  // awardsWon: Number,
  // isTouring: Boolean,
  // genre: [String]     // Array y definir correctamente el tipo
  // Eso servía para únicamente decir que tipo de data tiene que ser, pero si no se añadía alguna propiedad, x ej, no daría error
  name: {
    type: String,
    required: true,
    unique: true
  },
  awardsWon: {
    type: Number,
    min: 0,
    default: 0
  }, 
  isTouring: Boolean,
  genre: {
    type: [String],
    enum: ["house", "tech-house", "techno"]
  }
})

//! Cada vez que modifiquemos los esquemas de la bdd, debemos borrar la colección en el compass

// Creamos el modelo:   
// Utiliza el esquema para permitirnos acceder a la bdd (uno por cada una de las colecciones)
const Artist = mongoose.model("Artist", artistSchema) 
// 1. nombre interno con el que mongo reconoce este modelo y la colección - Creará en la bdd la colección en plural
// 2. el esquema


// Exportar el archivo para poder acceder a el
module.exports = Artist