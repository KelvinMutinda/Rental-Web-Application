
const express=require('express')
const cors=require('cors')
const bcrypt=require('bcrypt')
const mongoose=require('mongoose')

require('dotenv').config()

const app=express()

app.use(cors())
app.use(express.json())


const PORT=process.env.PORT
const MONGO_URI=process.env.MONGO_URI

if(MONGO_URI){
   mongoose.connect(MONGO_URI)
 
   .then(() => console.log("Database connected successfully ✅"))
   .catch((error) => console.error("Database connection failed ❌", error));
}
else{
    console.log("MongoDb uri is missing ")
}
app.listen(PORT,()=>{
console.log(`Backend connected  running on port ${PORT}`)   
})



