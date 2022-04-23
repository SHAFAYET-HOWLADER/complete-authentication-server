const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
require('dotenv').config();
const cors = require('cors')
app.use(cors());
app.use(express.json())
const port = process.env.PORT || 5000;
app.get('/', (req, res) => {
    res.send("hello js developer")
})

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.3vxsx.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run() {
    try {
        await client.connect();
        const serviceCollection = client.db('geniusCar').collection('service');
        app.get('/service', async (req, res) => {
            const query = {};
            const cursor = serviceCollection.find(query);
            const service = await cursor.toArray();
            res.send(service);
        })
        app.get('/service/:id', async (req,res)=>{
             const id = req.params.id;
             const query = {_id: ObjectId(id)};
             const service = await serviceCollection.findOne(query);
             res.send(service);
        })
        app.post('/service', async (req,res)=>{
            const newUser = req.body;
            const result = await serviceCollection.insertOne(newUser);
            res.send(result);
        })
        app.delete('/service/:id', async (req,res)=>{
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
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