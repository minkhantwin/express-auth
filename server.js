const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const authController = require("./controller/authController");
const errorController = require("./controller/errorController");

const app = express();

// configuring for enviroment variable
dotenv.config({ path: "./.env" });

const db_url = process.env.DATABASE.replace(
	"<password>",
	process.env.DATABASE_PASSWORD
);

// establishing db connection
mongoose
	.connect(db_url, {
		useUnifiedTopology: true,
		useNewUrlParser: true,
	})
	.then((con) => {
		console.log("DB connection successful!");
	});

app.use(express.json());

const prefix = process.env.URL_PREFIX;
app.post(prefix + "/user", authController.createUser); 
app.post(prefix + "/login", authController.login); 
app.get(prefix + "/user", authController.protect, authController.findAll); 

// catching wildcard routes
app.use('*', (req, res, next) => {
	res.status(404).json({
		status: 'Not Found'
	})
})


// global error handler
app.use(errorController);


const port = process.env.PORT;
// running server
app.listen(port, () => {
	console.log("Server listening on port ", port);
});
