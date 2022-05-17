const express = require('express')
const helmet = require('helmet')
const cors = require('cors')

const apiRouter = require('./api-router');
const morgan = require('morgan');

const server = express();
server.use(express.json());
server.use(helmet());
server.use(cors());
server.use(morgan('dev'));

server.use('/api', apiRouter);

server.use('*', (req, res) => {
  res.status(200).json({
    api: "UP"
  });
})

module.exports = server