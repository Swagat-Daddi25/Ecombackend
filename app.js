// filessystem nodemodule

// import filesystem module
// const fs = require('fs');

// wrilefile method----is used create a new file and write data into it
// fs.writeFile('a.txt', 'Hello', function (err) {
//     if (err) throw err;
//     console.log("Done👍")
// })

// readfile method----is used to read data from a file
// fs.readFile('a.txt', 'utf-8', function (err, data) {
//     if (err) throw err;
//     console.log(data + "😊");
// })

// rename file method
// fs.rename('a.txt', 'hello.txt', function (err) {
//     if (err) throw err;
// })

// delete file method
// fs.unlink('a.txt', function (err) {
//     if (err) throw err;
// })

// bulid server
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const helmet = require("helmet");
// const sendMail = require("./gmail");
const dotenv = require("dotenv");
dotenv.config();
const { rateLimit } = require("express-rate-limit");
const nodemailer = require("nodemailer");
const app = express();
const port = process.env.PORT;
let secretkey = process.env.SECRETKEY;

// connecting mongoose
// step-1---require package
const mongoose = require("mongoose");

// step-2----establish connection
// pass connection string
async function connection() {
  await mongoose.connect(process.env.MONGO_URL);
}

// step-3----create schema
let productschema = new mongoose.Schema({
  title: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, required: true },
});

// Step-4----create a model
const productsmodel = mongoose.model("products", productschema);

//

let userschema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  password: { type: String, required: true },
});
const finalusers = mongoose.model("users", userschema);
// ratelimit

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 10, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
  standardHeaders: "draft-8", // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
  ipv6Subnet: 56, // Set to 60 or 64 to be less aggressive, or 52 or 48 to be more aggressive
  // store: ... , // Redis, Memcached, etc. See below.
});

// middleware
app.use(cors());
app.use(limiter);
app.use(express.json());
app.use(helmet());

// dispaly an message
// app.get('/fact', (req, res) => {
//     res.json({
//         data: ['KLE BCA']
//     })
// })
app.get("/", (req, res) => {
  res.json({
    message: ["Welcome to KLE BCA"],
  });
});
// app.get('/name', (req, res) => {
//     res.json({
//         name: ["Sindhu"]
//     })
// })
// app.get('/products', (req, res) => {
//     res.json(products)
// })

// design an api where seller send product(data) now i will store

// app.post('/products', (req, res) => {
//     const { id, title, price, image } = req.body;
//     const newProduct = { id, title, price, image };
//     products.push(newProduct);
//     res.json({
//         mes: "products stored"
//     })
// })

// design an api where seller send the details and i will store in database

app.post("/products", async (req, res) => {
  try {
    const { title, price, image } = req.body;
    await productsmodel.create({ title, price, image });
    res.status(201).json({ msg: "products are added succesfuly" });
    let transporter = await nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    let mailOptions = {
      from: process.env.GMAIL_USER,
      to: "daddiswagat@gmail.com",
      subject: "PRODUCT  REGISTRATION",
      html: `new product added in our store`,
    };
    transporter.sendMail(mailOptions, (error) => {
      if (error) throw error;
      console.log("product recieved  successfully");
    });
  } catch (error) {
    res.json({
      msg: error.message,
    });
  }
});

// api-3 --- fetch the data from the data base and send these data to client
app.get("/products", async (req, res) => {
  try {
    let products = await productsmodel.find();
    res.status(200).json(products);
  } catch (error) {
    res.json({
      mes: error.message,
    });
  }
});

app.get("/details", (req, res) => {
  let location = req.query.location;
  let age = req.query.age;
  let company = req.query.company;
  res.send(`my location is ${location}, age is ${age}, company is ${company}`);
});

// delete
app.delete("/products", async (req, res) => {
  try {
    let products = await productsmodel.findByIdAndDelete(
      "6957737a0419366dd05d9952"
    );
    res.status(200).json({ msg: "product deleted succesfuly" });
  } catch (error) {
    res.json({
      mes: error.message,
    });
  }
});

// update
app.put("/products", async (req, res) => {
  try {
    let products = await productsmodel.findByIdAndUpdate(
      "69575fd6834e2161c8d4d3ed",
      { title: "new chair", price: 70000 }
    );
    res.status(200).json({ msg: "product Updated succesfuly" });
  } catch (error) {
    res.json({
      mes: error.message,
    });
  }
});

// registration
app.post("/register", async (req, res) => {
  try {
    const { email, username, password } = req.body;
    let users = await finalusers.findOne({ email });
    if (users) return res.json({ msg: "user already exists" });

    //hashing password
    let hashedpassword = await bcrypt.hash(password, 10);
    finalusers.create({ email, username, password: hashedpassword });
    // await sendMail(email, username);
    res.status(201).json({ msg: "user registered successfully" });
    let transporter = await nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    let mailOptions = {
      from: process.env.GMAIL_USER,
      to: email,
      subject: "ACCOUNT REGISTRATION",
      html: `Hi ${username}  your account is created`,
    };
    transporter.sendMail(mailOptions, (error) => {
      if (error) throw error;
      console.log("email sent successfully");
    });
  } catch (error) {
    res.json({
      msg: error.message,
    });
  }
});

// login
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    let users = await finalusers.findOne({ email });
    if (!users) return res.json({ msg: "user not found" });
    let checkpassword = await bcrypt.compare(password, users.password);
    if (!checkpassword)
      return res.json({ msg: "email or password is incorrect" });

    //create a token
    let payload = { email: email };
    let token = await jwt.sign(payload, secretkey, { expiresIn: "1h" });

    res.json({ msg: "login successful", token: token });
  } catch (error) {
    res.json({
      msg: error.message,
    });
  }
});

app.get("/products/:id", async (req, res) => {
  id = req.params.id;
  let singleproduct = await productsmodel.findById(id);
  res.json(singleproduct);
});
// demo
// async function hashing(){
//     let password="sindhu123"
//     let hashpassword=await bcrypt.hash(password,10)
//     console.log(hashpassword)
// hashing()
// }

app.listen(port, async () => {
  console.log(`server is running:${port}`);
  connection();
  console.log("DB Connected");
});
// create is used to insert data

// for one data ---- create

// await productsmodel.create({
//     title:"premium bag",
//     price: 20000,
//     image:"https://res.cloudinary.com/dhdepk5ib/image/upload/v1757696461/samples/ecommerce/leather-bag-gray.jpg"
// })

// multiple data ------ insertMany
//     await productsmodel.insertMany([
//         {

//     title:"chair",
//     price:100000,
//     image:"https://res.cloudinary.com/dhdepk5ib/image/upload/v1757696469/samples/chair-and-coffee-table.jpg"
// },{

//     title:"watch",
//     price:30000,
//     image:"https://res.cloudinary.com/dhdepk5ib/image/upload/v1757696459/samples/ecommerce/analog-classic.jpg"
// }
//     ])

//    await productsmodel.create({
//     title:"chair",
//  price:50000,
//   image:"https://res.cloudinary.com/dhdepk5ib/image/upload/v1757696469/samples/chair-and-coffee-table.jpg"
// })

// fetch all the product ---- find -- to get all products
// let finalproducts=await productsmodel.find()
// console.log(finalproducts)
// })

// findOne -- first product
// let finalproducts=await productsmodel.findOne({title:"chair"})
// console.log(finalproducts)
// })

// findByid -- to get product by id number
// let finalproducts=await productsmodel.findById('6957637835d462224f8768cb')
// console.log(finalproducts)
// })

// findByIdAndDelete  ----- delete the product
// let finalproducts=await productsmodel.findByIdAndDelete('69575cce69e1f03fad5a45aa')
// console.log(finalproducts)
// })

// findByIdAndUpdate ------ update values
// let finalproducts=await productsmodel.findByIdAndUpdate('69576055d3da205b13a0b146',{title:'Premium chair'})
// console.log(finalproducts)
// })
