const express = require('express');
require('dotenv').config()
const bodyParser = require('body-parser');
const cokieeParser=require('cookie-parser')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
const jwt =require('jsonwebtoken');
const nodemailer = require("nodemailer");

const app =express();
const port =process.env.PORT || 5000;

// middlewere

app.use(cors({
  origin:[
    'http://localhost:5174',
    'http://localhost:5173',
    'https://simple-blog-e67d9.web.app',
    'https://simple-blog-e67d9.firebaseapp.com'
  
  ],
  credentials:true
}));
app.use(express.json());
app.use(cokieeParser());


console.log(process.env.TRANSPROTER_EMAIL);
console.log(process.env.TRANSPROTER_PASS);


const sendMail=(emailAddress,emailData)=>{
  const transporter = nodemailer.createTransport({
    service:'gmail',
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // Use `true` for port 465, `false` for all other ports
    auth: {
      user: process.env.TRANSPROTER_EMAIL,
      pass: process.env.TRANSPROTER_PASS,
    },
  });


  // varify transport 
  transporter.verify(function (error, success) {
    if (error) {
      console.log(error);
    } else {
      console.log("Server is ready to take our messages");
    }
  });


  const data=    {
    from: `"Simple-Blog👻" <${process.env.TRANSPROTER_EMAIL}>`, // sender address
    to: emailAddress, // list of receivers
    subject: emailData.subject, // Subject line
    html: emailData.message, // html body
  }

 transporter.sendMail( data,(error,info)=>{
  if (error) {
    console.log(error);
  }
  else{
    console.log("email send",info.response);
  }
}

);

}




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.x9xlpou.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// middleware
const logger=(req,res,next)=>{
  // console.log('loginfo', req.method,req.url);
  next()
}

const varifiyToken=(req,res,next)=>{
  const token=req?.cookies?.token;
  // console.log("cookies in the middleare",token);
  // no token availabail
  if (!token) {
    return res.status(401).send({message:'unautharazied access'})
  }
  jwt.verify(token,process.env.ACCESS_TOKEN,(err,decoded)=>{
    if (err) {
      return res.status(401).send({massage:'unautharized access'})
    }
  req.user=decoded;
  next();
  })
  // next()
}

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production" ? true : false,
  sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
};


async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
  const blogCollection= client.db('simpleDB').collection('blogDB')
  const commentCollection= client.db('simplecommentDB').collection('commentDB')
  const wishlistCollection= client.db('simplewishlistDB').collection('wishlistDB')

// console.log(process.env.ACCESS_TOKEN);

app.post("/jwt" ,async(req,res)=>{
const user =req.body;
const token=jwt.sign(user,process.env.ACCESS_TOKEN,{expiresIn:'1h'})
// console.log("user",user);
res.cookie('token',token,cookieOptions)
.send({sucess:true})
})


app.post("/logout",async(req,res)=>{
  const  user=req.body;
  // console.log(user);
  res.clearCookie('token',{...cookieOptions, maxAge:0}).send({sucess:true})
})







// services related api
// add blog on db
  app.post("/blog",async(req,res)=>{
    const newBlog=req.body;
    console.log(newBlog.userEmail,"dfdfdsfdsff");
    const result=await blogCollection.insertOne(newBlog);
    

    sendMail(newBlog?.userEmail,{
      subject:"Add Blog Sucessfully!",
      message:`You have successfully Added a Blog Thanks ${newBlog?.userName} `
    })
    sendMail(`${process.env.TRANSPROTER_EMAIL}`,{
      subject:"A  User Added Blog Sucessfully!",
      message:`${newBlog?.userName} successfully Added a Blog ${newBlog?.formattedDate} ${newBlog?.userEmail} `
    })
    res.send(result)
  })


// update blog
 // update
 app.put("/blog/id/:id",async(req,res)=>{
  const id=req.params.id;
  const filter={_id:new ObjectId(id)};
  const option={upsert:true};
  const updateBlog=req.body;
  // console.log(updateBlog);
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
    // console.log(newComment);
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
      // console.log(newWishlist);
      const result=await wishlistCollection.insertOne(newWishlist)
      res.send(result)
    })

    app.post("/wish",async(req,res)=>{
      const newWishlist=req.body;
      // console.log(newWishlist);
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

    // filterd featured data 

  app.get("/featured", async(req,res)=>{
    const cursor=blogCollection.find().sort({"long": 1});
    const result = await cursor.toArray();
    res.send(result);
    })
 
 
// single blog item
    app.get("/blog/id/:id",async(req,res)=>{
        const id =req.params.id;
        // console.log("token owner info",req.user);
       
        const quary={_id:new ObjectId(id)};
        const result=await blogCollection.findOne(quary);
        res.send(result)
      })
    // app.get("/blog/categories/:categories",async(req,res)=>{
    //     const id =req.params.categories;
    //     console.log(id);
    //     const quary={categories:new ObjectId(id)};
    //     const result=await blogCollection.find(quary);
    //     res.send(result)
    //   })
    // app.get('/blog/categories/:category', async (req, res) => {
    //   const cat = (req.params.category); 
    //   console.log(cat);
    //     const cursor = blogCollection.find();
    //     const result = await cursor.toArray();
    //     res.send(result);
     
    // });



    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
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
