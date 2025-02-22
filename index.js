//* ============================================= Module Import ============================================= \\
//for environment
require('dotenv').config();
//import express
const express = require('express');
const cors = require('cors');
const app = express();

//jwt & cookie parse
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

//default port
const port = process.env.PORT || 3000;
const morgan = require('morgan');

//mongodb
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

//middleware
const corsOptions = {
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));

//! ========================================================================================================= \\

//* ============================================= Mongo DB ============================================= \\
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@my-mongodb.2rdes.mongodb.net/?retryWrites=true&w=majority&appName=My-MongoDB`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const db = client.db('medical-camp');
    const usersCollection = db.collection('users');



    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db('admin').command({ ping: 1 });
    console.log(
      'Pinged your deployment. You successfully connected to MongoDB!'
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);
//! ==================================================================================================== \\

// Home
app.get('/', (req, res) => {
  res.send({
    server: 'Medical Camp Management System server run successfully',
  });
});
app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});
