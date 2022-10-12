const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/electrondb')
    .then(db => console.log('DB is connected'))
    .catch(err => console.log(err));