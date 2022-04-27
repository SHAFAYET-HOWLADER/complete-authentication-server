const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
require('dotenv').config();
const cors = require('cors')
app.use(cors());
app.use(express.json())
const port = process.env.PORT || 5000;
const jwt = require('jsonwebtoken');
app.get('/', (req, res) => {
    res.send("hello js developer")
})
function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(404).send({ message: 'unauthorized access' })
    }
    const token = authHeader.split(' ')[1]
    jwt.verify(token, process.env.ACCESS_TOKEN, (err, decoded) => {
        if (err) {
            return res.status(403).send({ message: 'forbidden access' });
        }
        console.log('decode', decoded)
        req.decoded = decoded;
        next()

    })
}
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.3vxsx.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run() {
    try {
        await client.connect();
        const serviceCollection = client.db('geniusCar').collection('service');
        const orderCollection = client.db('geniusCar').collection('order');
        app.post('/login', async (req, res) => {
            const user = req.body;
            const accessToken = await jwt.sign(user, process.env.ACCESS_TOKEN, {
                expiresIn: '1d'
            })
            res.send({ accessToken })
        })
        app.get('/order', verifyJWT, async (req, res) => {
            const decodedEmail = req.decoded.email;
            const email = req.query.email;
            if (email === decodedEmail) {
                const query = { email }
                const cursor = orderCollection.find(query)
                const result = await cursor.toArray();
                res.send(result);
            }
            else {
                res.status(403).send({ message: 'forbidden access' })
            }
        })
        app.post('/order', async (req, res) => {
            const voucher = req.body;
            const order = await orderCollection.insertOne(voucher);
            res.send(order);
        })
        //find all data
        app.get('/service', async (req, res) => {
            const query = {};
            const cursor = serviceCollection.find(query);
            const service = await cursor.toArray();
            res.send(service);
        })

        //find data by id
        app.get('/service/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const service = await serviceCollection.findOne(query);
            res.send(service);
        })

        //post data
        app.post('/service', async (req, res) => {
            const newUser = req.body;
            const result = await serviceCollection.insertOne(newUser);
            res.send(result);
        })

        //delete data
        app.delete('/service/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await serviceCollection.deleteOne(query);
            res.send(result)
        })
    }
    finally {

    }
}
run().catch(console.dir)

app.listen(port, () => {
    console.log("CRUD is running", port);
})