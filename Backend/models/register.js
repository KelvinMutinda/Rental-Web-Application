const mongoose = require('mongoose');

const registerSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName:  { type: String, required: true, trim: true },
  email:     { type: String, required: true, unique: true, lowercase: true, trim: true },
  phoneno:   { type: String, required: true, trim: true },
  regno:     { type: String, required: true, unique: true, trim: true },
  course:    { type: String, required: true, trim: true },
  password:  { type: String, required: true, minlength: 6 },
  role:      { type: String, enum: ['admin', 'tenant'], default: 'tenant' },


<<<<<<< HEAD
  roomType:    { type: String, enum: ['Single room', '2 Bedroom', 'Bedsitter'] },
  parentPhone: { type: String, trim: true },
=======
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
    }
    
>>>>>>> eb26c5fc09e9050a855d98b3b2c79407f9eb4aaa

  status:     { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  roomNumber: { type: String, trim: true },   // set by admin on approval
  rent:       { type: Number, min: 0 },       // monthly rent set by admin on approval
  dueDay:     { type: Number, min: 1, max: 28, default: 5 },
  approvedAt: Date,
  rejectReason: String,
}, { timestamps: true });

module.exports = mongoose.model('register', registerSchema);
