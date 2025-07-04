const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");

const { api } = require("./routes/api.routes");

const app = express();

// middleware
app.use(cors());
app.use(morgan("combined"));
app.use(helmet());
app.use(express.json());
app.use(bodyParser.text());
app.use('/v1', api);

module.exports = { app };
