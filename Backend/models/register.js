const mongoose = require('mongoose');


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
        enum:['admin', 'tenant'],
        default:'tenant'
    },
  status:     { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  roomNumber: { type: String, trim: true },   // set by admin on approval
  rent:       { type: Number, min: 0 },       // monthly rent set by admin on approval
  dueDay:     { type: Number, min: 1, max: 28, default: 5 },
  approvedAt: Date,
  rejectReason: String,
}, { timestamps: true });

module.exports = mongoose.model('register', registerSchema);
