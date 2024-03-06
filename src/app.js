require("dotenv").config();
const express = require("express");
const app = express();
const path = require("path");
const hbs = require("hbs");
const bcrypt = require("bcryptjs");
const cookieParser = require("cookie-parser");
const auth = require("./middleware/auth");
const Port = process.env.PORT || 8000;

require("./db/connect");
const Employee = require("./models/employee");
const { log } = require("console");

const staticPath = path.join(__dirname, "../public");
const viewsPath = path.join(__dirname, "../template/views");
const partialPath = path.join(__dirname, "../template/partials");

app.use(express.urlencoded({extended : false}));
app.use(express.static(staticPath));
app.use(cookieParser());
app.set("view engine", "hbs");
app.set("views", viewsPath);
hbs.registerPartials(partialPath);

console.log(process.env.SECRET_KEY);

app.get("/", (req, res) => {
    res.render("index");
});

app.get("/secret", auth, (req, res) => {
    // console.log(`User Valid token from cookie is ${req.cookies.jwt}`);
    res.render("secret");
});

app.get("/Registration", (req, res) => {
    res.render("registration");
});

app.get("/Login", (req, res) => {
    res.render("login");
});

app.get("/Logout", auth, async (req, res) => {
    try {

        //Single devise logout
        req.user.tokens = req.user.tokens.filter((currEl) => {
            return currEl.token != req.token;
        })

        //all devise log out
        req.user.tokens = [];

        res.clearCookie("jwt");
        console.log("Logged Out Successfully!");
        await req.user.save();
        res.render("login");

    } catch (error) {
        res.status(500).send(error)
    }
});

app.post("/Registration", async (req, res) => {
    try{
        const password = req.body.password;
        const cpassword = req.body.confirmpassword;
        // console.log(password);
        // console.log(cpassword);
        
        if(password === cpassword){
            const addEmployee = new Employee({
                firstname : req.body.firstname,
                lastname : req.body.lastname,
                email : req.body.email,
                phone : req.body.phone,
                age : req.body.age,
                gender : req.body.gender,
                password : req.body.password,
                confirmpassword : req.body.confirmpassword
            });
            //middleware
            const token = await addEmployee.generateAuthToken();
            // console.log(`App.js walu token ${token}`);

            // res.cookie("jwt", token);
            res.cookie("jwt", token, {
                expires : new Date(Date.now() + 30000),
                httpOnly : true
            });
            // console.log("cookie created successfully");

            const registered = await addEmployee.save();
            res.status(201).render("index");
        }else{
            res.send("Paswords are not Matching");
        }
    }catch(err){
        res.status(400).send(err);
    }
});

app.post("/Login", async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;
        const userdata = await Employee.findOne({email : email});
        if (!userdata) {
            return res.send("Invalid Email");
        }
        // console.log(password);
        // console.log(userdata.password);
        const passwordMatch = await bcrypt.compare(password, userdata.password);
        // console.log(passwordMatch);

        const token = await userdata.generateAuthToken();
        // console.log(token);

        res.cookie("jwt", token, {
            expires : new Date(Date.now() + 600000),
            httpOnly : true,
            // secure : true
        });
        // console.log("cookie created successfully");

        if(passwordMatch == true){
            res.status(201).render("index");
        }
        else{
            res.send("Wrong Password");
        }
    } catch (error) {
        res.status(400).send("Invalid Email");
    }
});

app.listen(Port, ()=> {
    console.log(`Listening to Port No. ${Port}`);
});