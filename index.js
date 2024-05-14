const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
require('dotenv').config()
const app =express();
const port =process.env.PORT || 5000;

// middlewere

app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.x9xlpou.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
  const blogCollection= client.db('simpleDB').collection('blogDB')
  const commentCollection= client.db('simplecommentDB').collection('commentDB')
  const wishlistCollection= client.db('simplewishlistDB').collection('wishlistDB')




// add blog on db
  app.post("/blog",async(req,res)=>{
    const newBlog=req.body;
    console.log(newBlog);
    const result=await blogCollection.insertOne(newBlog)
    res.send(result)
  })


// update blog
 // update
 app.put("/blog/id/:id",async(req,res)=>{
  const id=req.params.id;
  const filter={_id:new ObjectId(id)};
  const option={upsert:true};
  const updateBlog=req.body;
  console.log(updateBlog);
  const blog={
    $set:{
      photo:updateBlog.photo,
      title:updateBlog.title,
      categories:updateBlog.categories,
      short:updateBlog.short,
      long:updateBlog.long,
      formattedDate:updateBlog.formattedDate
    }
  }
  const result =await blogCollection.updateOne(filter,blog,option);
  res.send(result)
})

  // add comment on db
  app.post("/comment",async(req,res)=>{
    const newComment=req.body;
    console.log(newComment);
    const result=await commentCollection.insertOne(newComment)
    res.send(result)
  })
  // all comment get on db
  app.get("/comment", async(req,res)=>{
    const cursor=commentCollection.find();
    const result = await cursor.toArray();
    res.send(result);
    })


    // get comment on id 
    app.get(`/comment/id/:id`,async(req,res)=>{
      // console.log(req.params.id);
      const result=await commentCollection.find({id:req.params.id}).toArray();
      res.send(result)
    })


    // wishlist added on db
    app.post("/wishlist",async(req,res)=>{
      const newWishlist=req.body;
      console.log(newWishlist);
      const result=await wishlistCollection.insertOne(newWishlist)
      res.send(result)
    })

    app.post("/wish",async(req,res)=>{
      const newWishlist=req.body;
      console.log(newWishlist);
      const result=await wishlistCollection.insertOne(newWishlist)
      res.send(result)
    })

// wishlist  get on db
app.get("/wishlist", async(req,res)=>{
  const cursor=wishlistCollection.find();
  const result = await cursor.toArray();
  res.send(result);
  })
  app.get(`/wishlist/wish/:email`,async(req,res)=>{
    // console.log(req.params.id);
    const result=await wishlistCollection.find({
      email:req.params.email}).toArray();
    res.send(result)
  })

  // delete one 
    //  delete one 
    app.delete("/wishlist/wish/:id",async(req,res)=>{
      const id =req.params.id;
      const quary={_id : new ObjectId(id)}
      const result= await wishlistCollection.deleteOne(quary);
      res.send(result);
    })

  // all blog get
//   db.events.find().sort({"timestamp": 1})
  app.get("/blog", async(req,res)=>{
    const cursor=blogCollection.find().sort({"formattedDate": -1});
    const result = await cursor.toArray();
    res.send(result);
    })

 
// single blog item
    app.get("/blog/id/:id",async(req,res)=>{
        const id =req.params.id;
        const quary={_id:new ObjectId(id)};
        const result=await blogCollection.findOne(quary);
        res.send(result)
      })
    app.get("/blog/categories/:categories",async(req,res)=>{
        const id =req.params.categories;
        console.log(id);
        const quary={categories:new ObjectId(id)};
        const result=await blogCollection.find(quary);
        res.send(result)
      })



    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    
  }
}
run().catch(console.dir);



app.get(("/"),(req,res)=>{
    res.send("simple blog is running")
})

app.listen(port,()=>{
    console.log(`simple blog server is running on port ${port}`);
})
