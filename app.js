const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
require("dotenv").config();


const modalitysRoutes = require('./api/routes/modalitys');
const placesRoutes = require('./api/routes/places');
const userRouter = require('./api/routes/user');
const reviewRouter = require('./api/routes/review');
const profileRouter = require('./api/routes/profile');
const chatRouter = require('./api/routes/chat');



mongoose.connect(
    "mongodb+srv://" +
      "caio" +
      ":" +
      "r3YV1xxgEpFqHfVW" +
      "@cluster0.txezli4.mongodb.net/?retryWrites=true&w=majority",
      {useNewUrlParser: true, useUnifiedTopology: true}
  );
mongoose.Promise = global.Promise;


app.use(morgan('dev'));
app.use('//uploads', express.static('wip/uploads'));
// app.use('//uploads', express.static('uploads'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    if(req.method === 'OPTIONS'){
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, GET, DELETE');
        return res.status(200).json({});
    }
    next();
});

// app.use('/chat', chatRouter);
app.use('/modalitys', modalitysRoutes);
app.use('/places', placesRoutes);
app.use('/review', reviewRouter);
app.use('/profile', profileRouter);
app.use('/user', userRouter);




app.use((req, res, next) => {
    const error = new Error('Not Found');
    error.status= 404;
    next(error);
});

app.use((error, req, res, next) =>{
    res.status(error.status || 500);
    res.json({
        error:{
            message: error.message
        }
    });
});

module.exports = app;