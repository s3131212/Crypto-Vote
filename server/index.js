const express = require('express');
const path = require('path');
const db = require("./db");
const rsablind = require("./rsablind");
const xAdmin = require('express-admin');

/* Database */
let dbinfo = {
    host: '',
    user: '',
    password: '',
    database: ''
}
db.connect(dbinfo);
let adminConfigFile = require('./admin/config.json');
adminConfigFile.mysql = dbinfo;

/* Generate RSA Key */
db.queryElectionList(true).then(results => {
    results.forEach(val => {
        rsablind.generateKey(val.id);
    });
}).catch(err => {
    console.log(err);
})

let initServer = function (err, admin) {
    if (err) return console.log(err);
    const app = express();
    app.use('/admin', admin);
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    const apiRouter = require('./api.js');
    app.use('/api', apiRouter);

    // Serve the static files from the React app
    app.use(express.static(path.join(__dirname, '/../client/build')));

    app.get('*', (req,res) =>{
        res.sendFile(path.join(__dirname+'/../client/build/index.html'));
    });

    const port = process.env.PORT || 5000;
    app.listen(port);

    console.log('App is listening on port ' + port);
}

let adminConfig = {
    dpath: './admin/',
    config: adminConfigFile,
    settings: require('./admin/settings.json'),
    custom: require('./admin/custom.json'),
    users: require('./admin/users.json')
};

xAdmin.init(adminConfig, initServer);


