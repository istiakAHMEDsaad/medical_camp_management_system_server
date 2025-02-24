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

//verify token
const verifyToken = async (req, res, next) => {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).send({ message: 'unauthorized access' });
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      console.log(err);
      return res.status(401).send({ message: 'unauthorized access' });
    }
    req.user = decoded;
    next();
  });
};

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
    const campsCollection = db.collection('camps');

    // Generate jwt token
    app.post('/jwt', async (req, res) => {
      const email = req.body;
      const token = jwt.sign(email, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '365d',
      });
      res
        .cookie('token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        })
        .send({ success: true });
    });

    //logout
    app.get('/logout', async (req, res) => {
      try {
        res
          .clearCookie('token', {
            maxAge: 0,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
          })
          .send({ success: true });
      } catch (error) {
        res.status(500).send(error);
      }
    });

    // save or update user in db
    app.post('/users/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const user = req.body;
      //check user exist or not in db
      const isExist = await usersCollection.findOne(query);
      if (isExist) {
        return res.send(isExist);
      }

      const result = await usersCollection.insertOne({
        ...user,
        role: 'organizer',
        timestamp: Date.now(),
      });
      res.send(result);
    });

    //TODO (1)===============> save a camp data in database <===============
    app.post('/camps', verifyToken, async (req, res) => {
      const camp = req.body;
      const result = await campsCollection.insertOne(camp);
      res.send(result);
    });
    //TODO (2) ===============> get all camps data <===============
    app.get('/camps', async (req, res) => {
      const result = await campsCollection.find().toArray();
      res.send(result);
    });
    // TODO (3) ===============> get cmaps data by id <===============
    app.get('/camps/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await campsCollection.findOne(query);
      res.send(result);
    });

    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
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
