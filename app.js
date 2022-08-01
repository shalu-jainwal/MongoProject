
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");
const md5 = require("md5");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/customerDB", {
  useNewUrlParser: true
});

const customerSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  age: Number,
  mobileNumber: String,
  gender: {
    type: String,
    enum: ["female", "male", "other"]
  },
  email: String,
  password: String
});

customerSchema.plugin(mongoosePaginate);

const Customer = new mongoose.model("Customer", customerSchema);

app.route("/customers")

  .get(function(req, res) {

    if (req.query.page && req.query.limit) {
      Customer.paginate({}, {
          page: req.query.page,
          limit: req.query.limit
        })
        .then(data => {
          res.status(200).json({
            data
          })
        })
        .catch(error => {
          res.status(400).json({
            error
          })
        })
    } else {
      Customer.find()
        .then(data => {
          res.status(200).json({
            data
          })
        })
        .catch(error => {
          res.status(400).json({
            error
          })
        })
    }

  })

  .delete(function(req, res) {
    Customer.deleteMany(function(err) {
      if (!err) {
        res.send("Successfully deleted all customers");
      } else {
        res.send(err);
      }
    });
  });


app.get("/", function(req, res) {
  res.render("home");
});

app.get("/login", function(req, res) {
  res.render("login");
});

app.get("/register", function(req, res) {
  res.render("register");
});


app.post("/register", function(req, res) {

  const newCustomer = new Customer({
    firstName: req.body.fName,
    lastName: req.body.lName,
    age: req.body.age,
    mobileNumber: req.body.phone,
    gender: req.body.gender,
    email: req.body.username,
    password: md5(req.body.password)
  });

  newCustomer.save(function(err) {
    if (err) {
      console.log(err);
    } else {
      res.render("secrets");
    }
  });
});

app.post("/login", function(req, res) {

  const username = req.body.username;
  const password = md5(req.body.password);

  Customer.findOne({
    email: username
  }, function(err, foundCustomer) {
    if (err) {
      console.log(err);
    } else {
      if (foundCustomer) {
        if (foundCustomer.password === password) {
          res.render("secrets");
        }
      }
    }
  })

});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
