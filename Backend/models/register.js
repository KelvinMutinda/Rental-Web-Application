
const mongoose=require('mongoose')


const registerSchema=new mongoose.Schema({
    firstName:{type:String,required:true},
    lastName:{type:String,required:true},
    email:{type:String,required:true},
    phoneno:{type:String,required:true},
    regno:{type:String,required:true},
    course:{type:String,required:true},
    password:{type:String,required:true},
    role:{
        type:String,
        enum:['admin, tenant'],
        default:'tenant'
    }
    

},
{
    timestamps:true
})
module.exports =mongoose.model('register',registerSchema)