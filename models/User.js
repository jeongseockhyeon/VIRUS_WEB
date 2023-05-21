const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
    성:{
         type:String,
         required: true,
    },
    이름:{
        type:String,
        required: true,
   },
    아이디:{
        type:String,
        required: true,
   },
   이메일:{
         type:String,
         required: true,
         unique:true
    },
    비밀번호:{
         type:String,
         required: true,
    },
    주소:{
        type:String,
   },
    국가:{
         type:String,
         required: true,
    },
    세부지역:{
        type:String,
        required: true,
   },
    
})


module.exports = User = mongoose.model('user',UserSchema)