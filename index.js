import express from "express"
import dotenv from "dotenv"
import connectDb from "./src/Database/index.js";
import cors from "cors"
import cookieParser from "cookie-parser";
import { Sendmail } from "./src/controllers/sendmail.js";
import Stripe from 'stripe';
dotenv.config({
    path : '.env'
})

const app = express();


app.use(cors({
    origin : process.env.CORS_ORIGIN
}))
app.use(express.json({limit: '10mb'}))
app.use(express.urlencoded({extended: true, limit: '10mb'}))
app.use("/public/temp", express.static("public/temp"));
app.use(cookieParser())
//routes import
import userRouter from './src/routes/user.routes.js'
import GuideRouter from './src/routes/LocalGuide.routes.js'
import TripsRouter from './src/routes/TripPackage.routes.js'

//routes use
// app.use("/api/v1/users", userRouter)
// app.use("/api/v1/Guide", GuideRouter)



//routes use
app.use("/api/v1/users", userRouter)
app.use("/api/v1/Guide", GuideRouter)
app.use("/api/v1/Trips", TripsRouter)


//Mail sending api
app.post('/sendmail' , Sendmail)
//api for stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

app.post('/create-payment-intent', async (req, res) => {
  const { amount } = req.body;

  try {
   
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount, 
      currency: 'usd',
      payment_method_types: ['card'], 
    });

    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});







connectDb()
.then(() => {
  app.listen(process.env.PORT || 8000, () => {
      console.log(`⚙️ Server is running at port : ${process.env.PORT}`);
  })
})
.catch((err) => {
  console.log("MONGO db connection failed !!! ", err);
})
