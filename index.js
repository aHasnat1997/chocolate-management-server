const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const cors = require('cors');
const port = 5000;
require('dotenv').config();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('chocolate is running!!!');
})


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@chocolate-management.r9to089.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});


async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const chocolateCollection = client.db("chocolateDB").collection("chocolateInfo");

    app.get('/chocolates', async (req, res) => {
      const cursor = chocolateCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })

    app.get('/chocolates/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await chocolateCollection.findOne(query);
      res.send(result);
    })

    app.post('/chocolates', async (req, res) => {
      const newChocolate = req.body;
      const result = await chocolateCollection.insertOne(newChocolate);
      res.send(result);
    })

    app.put('/chocolates/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateChocolate = req.body;
      const newChocolate = {
        $set: {
          name: updateChocolate.name,
          country: updateChocolate.country,
          image: updateChocolate.image,
          category: updateChocolate.category
        },
      };
      const result = await chocolateCollection.updateOne(query, newChocolate, options);
      res.send(result);
    })

    app.delete('/chocolates/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await chocolateCollection.deleteOne(query);
      res.send(result);
    })


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
