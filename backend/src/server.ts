import express from 'express'
import cors from 'cors'

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




app.listen(PORT, ()=>{
    console.log("Server is running on PORT: ", PORT);
})
