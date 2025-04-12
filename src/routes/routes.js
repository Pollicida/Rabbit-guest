const Router = require('express').Router;
const router = new Router();

const Product = require("../models/product.js");
const amqp = require("amqplib");

let connection, channel, order;

async function connectToRabbitMQ() {
    const amqpServer = "amqp://guest:guest@localhost:5672";
    connection = await amqp.connect(amqpServer);
    channel = await connection.createChannel();
    await channel.assertQueue("producto-cola");
}

connectToRabbitMQ();

// Crear un producto
router.post("/", async (req, res) => {
    const { nombre, precio, cantidad } = req.body;
    if (!nombre || !precio || !cantidad) {
        return res.status(400).json({
            message: "Por favor Proporcione detalles del producto",
        });
    }

    // Guardar producto en mongodb
    const product = await new Product({ nombre, precio, cantidad });
    await product.save();

    return res.status(201).json({
        message: "Producto creado con exito",
    });
});

router.post('/comprar', async (req, res) => {
    const { productIds } = req.body;
    const products = await Product.find({ _id: { $in: productIds } });

    channel.sendToQueue(
        "orden en cola",
        Buffer.from(JSON.stringify({ products }))
    );

    channel.consume('producto-cola', (data) => {
        console.log('Producto consumido cola');
        order = JSON.parse(data);
        channel.ack(data);
    });

    return res.status(201).json({
        message: 'Orden con Exito!',
        order
    });
});

module.exports = router;