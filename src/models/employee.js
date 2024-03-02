const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const employeeSchema = new mongoose.Schema({
    firstname : {
        type : String,
        required : true
    },
    lastname : {
        type : String,
        required : true
    },
    email : {
        type : String,
        required : true,
        unique : true
    },
    phone : {
        type : Number,
        required : true,
        unique : true
    },
    age : {
        type : Number,
        required : true
    },
    gender : {
        type : String,
        required : true
    },
    password : {
        type : String,
        required : true
    },
    confirmpassword : {
        type : String,
        required : true
    },
    tokens : [{
        token : {
            type : String,
            required : true
        }
    }]
});

//middleware
employeeSchema.methods.generateAuthToken = async function(){
    try {
        // console.log(`This.id is ${this._id}`);
        const token = jwt.sign({_id : this._id.toString()}, "process.env.SECRET_KEY");
        // console.log(`Employee.js Walu token ${token}`);
        this.tokens = this.tokens.concat({token : token});
        await this.save();
        return token;
    } catch (error) {
        res.send(error)
    }
}

employeeSchema.pre("save", async function(next) {
    // this.password = await bcrypt.hash(this.password, 10);
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    // this.confirmpassword = await bcrypt.hash(this.password, 10);
    next();
})

const Employee = new mongoose.model("Employee", employeeSchema);

module.exports = Employee;