const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// MiddleWare
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mp2awoi.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    const database = client.db("coffeDb");
    const coffeColletion = database.collection("coffes");
    const userCollection = database.collection("users");

    app.get("/coffes", async (req, res) => {
      const cursor = coffeColletion.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/coffes/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await coffeColletion.findOne(query);
      res.send(result);
    });

    app.put("/coffes/:id", async (req, res) => {
      const id = req.params.id;
      const coffe = req.body;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const UpdtatedCoffe = {
        $set: {
          name: coffe.name,
          chef: coffe.chef,
          price: coffe.price,
          supplier: coffe.supplier,
          category: coffe.category,
          photo: coffe.photo,
          details: coffe.details,
        },
      };
      const result = await coffeColletion.updateOne(
        filter,
        UpdtatedCoffe,
        options
      );
      res.send(result);
    });

    app.delete("/coffes/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await coffeColletion.deleteOne(query);
      res.send(result);
    });

    app.post("/coffes", async (req, res) => {
      const coffe = req.body;
      const result = await coffeColletion.insertOne(coffe);
      res.send(result);
    });

    // User Related Api
    app.get("/user", async (req, res) => {
      const query = userCollection.find();
      const result = await query.toArray();
      res.send(result);
    });

    app.post("/user", async (req, res) => {
      const user = req.body;
      const result = await userCollection.insertOne(user);
      res.send(result);
    });

    app.patch(`/user`, async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const updateUser = {
        $set: {
          email: user.email,
          lastSignInTime: user.lastSignInTime,
        },
      };
      const result = await userCollection.updateOne(filter, updateUser);
      res.send(result);
    });

    app.delete("/user/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await userCollection.deleteOne(query);
      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Coffe Shop Server Runing");
});

app.listen(port, () => {
  console.log("CoffeShop Server Running on port", port);
});
