import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import prisma from './prismaClient.js'

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors({
    origin:[
        'http://localhost:8081'
    ],
    methods:['GET','POST','PUT','PATCH','DELETE'],
    credentials: true
}));

app.get('/', async(req, res)=>{
   try{
    await prisma.$queryRaw`SELECT 1`;
    res.json("DB working properly")
   }catch(err){
    res.status(500).json({"message":"Database client not wired properly"})
   }
})


app.listen(PORT, ()=>{
    console.log("Server is running on PORT: ", PORT);
})
