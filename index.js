const express = require('express')
const app = express()
const cors = require('cors')
const PORT = 5000
const dotenv= require('dotenv')
const { MongoClient, ServerApiVersion } = require('mongodb');




//middleware
dotenv.config()
app.use(express.json());
app.use(cors());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.UB_PASSWORD}@cluster0.1clhhlt.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

 
let users = [];


async function run() {
  try {
    const levels = ['root', 'child1', 'child2', 'child3'];
    let currentLevelIndex = 0;

    const  UserHandler = client.db("User-Handler");
    const usersCollection = UserHandler.collection("Users")


    app.post('/users' , async(req, res)=>{
      const data = req.body
      const result = await usersCollection.insertOne(data)
      res.send(result)
    })


    app.post('/addUser', (req, res) => {
      const userId = users.length + 1;
      const userData = { userId, name: `User ${userId}` };
  
      if (userId === 1) {
          // First user goes to root
          users.push({ ...userData, parent: null });
      } else {
          // Other users go to children nodes
          const parentIndex = Math.floor((userId - 3) / 3);
          users.push({ ...userData, parent: parentIndex });
      }
  
      res.json({ message: 'User added successfully', userData });
  });


  app.get('/userTreeData', (req, res) => {
    const userTreeData = buildUserTree();
    res.json(userTreeData);
});

// Function to build user tree data
function buildUserTree() {
    const tree = { name: 'root', children: [] };

    // Group users by parent
    const groupedUsers = users.reduce((acc, user) => {
        acc[user.parent] = acc[user.parent] || [];
        acc[user.parent].push(user);
        return acc;
    }, {});

    // Add children to the tree
    Object.values(groupedUsers).forEach((children, index) => {
        tree.children.push({
            name: `Child ${index + 1}`,
            children: children.map(user => ({ name: user.name }))
        });
    });

    return tree;
}
  
 

    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(PORT, () => {
  console.log(` Server Running on PORT ${PORT}`)
})