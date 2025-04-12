const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ProductSchema = new Schema({
   nombre: String,
   descripcion: String,
   precio: Number,
   created_at: {
    type: Date,
    default: Date.now(),
   }
})

module.exports = Product =  mongoose.model("product", ProductSchema) 