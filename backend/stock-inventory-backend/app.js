const express = require('express');
const cors = require('cors');
const db = require('./database');
const app = express();
app.use(cors());
app.use(express.json());