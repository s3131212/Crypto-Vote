var express = require('express');
var cors = require('cors');
var sha256 = require('js-sha256');
var srs = require('secure-random-string');
var rsablind = require('./rsablind');
var db = require('./db');
var router = express.Router();

router.get('/', function(req, res, next) {
    res.send('api');
});

router.get('/getElectionsList', function(req, res, next) {
    data = {};
    let promises = [];
    promises.push(
        db.queryElectionList(true).then(results => {
            data["ongoing"] = results ? results : [];
        }).catch(err => {
            console.log(err);
        })
    )
    promises.push(
        db.queryElectionList(false).then(results => {
            data["ended"] = results ? results : [];
        }).catch(err => {
            console.log(err);
        })
    )
    Promise.all(promises)
    .then(() => {
        res.send(data);
    })
    .catch(err => {
        console.log(err);
    })
});

router.get('/getElectionInfo', function(req, res, next) {
    if(! "id" in req.query){
        res.json([{err: "Missing Parameter"}]);
        return;
    }
    db.queryElectionByID(req.query.id).then(results => {
        if(results.length == 0){
            res.json([]);
        }else{
            res.send(results);
}
    }).catch(err => {
        res.json([{err: "Internal Server Error"}]);
        console.log(err);
    })
});

router.get('/getVoteInfo', function(req, res, next) {
    if(! "id" in req.query){
        res.json([{err: "Missing Parameter"}]);
        return;
    }
    db.queryVotesByElectionID(req.query.id).then(results => {
        if(results.length == 0){
            res.json([]);
        }else{
            res.send(results);
        }
    }).catch(err => {
        res.json([{err: "Internal Server Error"}]);
        console.log(err);
    })
});

router.get('/getVoteResult', function(req, res, next){
    if(! "id" in req.query){
        res.json([{err: "Missing Parameter"}]);
        return;
    }
    db.queryVoteResultByVoteID(req.query.id).then(results => {
        res.send(results);
    })
});

router.get('/getCandidateInfo', function(req, res, next) {
    if(! "vote_id" in req.query){
        res.json([{err: "Missing Parameter"}]);
        return;
    }
    db.queryCandidatesByVoteID(req.query.vote_id).then(results => {
        if(results.length == 0){
            res.json([]);
        }else{
            res.send(results);
        }
    }).catch(err => {
        res.json([{err: "Internal Server Error"}]);
        console.log(err);
    })
});

router.get('/checkToken', function(req, res, next) {
    if(!("electionid" in req.query && "token" in req.query)){
        res.json({ available: false, err: "Missing Parameter" });
        return;
    }
    db.queryToken(req.query.token, req.query.electionid).then(results => {
        if(results.length > 0){
            let key = rsablind.getKeyInfo(req.query.electionid);
            if(key != null) res.json({ available: true, key: key });
            else res.json({ available: false, err: "Internal Server Error" });
        }else{
            res.json({ available: false, err: "Token doesn't exist." });
        }
    }).catch(err => {
        res.json({ available: false, err: "Internal Server Error" });
        console.log(err);
    })
});

router.post('/signBallot', (req,res) => {
    if(!( "blinded" in req.body && "token" in req.body && "electionid" in req.body)){
        res.send("missing data");
        return;
    }
    db.queryToken(req.body.token, req.body.electionid).then(results => {
        if(results.length > 0){
            db.updateTokenToUsed(req.body.token).then(re => {
                res.json(rsablind.sign(req.body.blinded, req.body.electionid));
            }).catch(err =>{
                res.send("Internal Server Error");
                console.log(err);
            })
        }else{
            res.send("illegal token");
        }
    }).catch(err => {
        res.send("Internal Server Error");
        console.log(err);
    })
});

router.post('/submitBallot', (req,res) => {
    if(!( "chosen" in req.body && "original" in req.body && "signed" in req.body && "electionid" in req.body)){
        res.send("missing data");
        return;
    }
    if(rsablind.verify(req.body.signed, req.body.original, req.body.electionid)){
        db.queryUsedRandStr(sha256(req.body.original))
        .then(() => {
            let promises = [];
            req.body.chosen.forEach(val => {
                promises.push(
                    db.queryCandidateAndVoteID(val[0], val[1])
                    .then(() => {
                        // well... do nothing
                    }).catch(err => {
                        console.log(err);
                    })
                )
            });
            Promise.all(promises).then(() => { Promise.resolve(); })
        })
        .then(db.insertUsedRandStr(sha256(req.body.original)))
        .then(() => {
            let receipt = srs({length: 6})
            let promises = [];
            req.body.chosen.forEach(val => {
                promises.push(
                    db.insertVoteRecords(receipt, val[0], val[1])
                    .then(res => {
                        // well... do nothing
                    }).catch(err => {
                        console.log(err);
                    })
                )
            })
            Promise.all(promises).then(() => {
                res.send(receipt);
            }).catch(err => {
                console.log(err);
            })
        })
        .catch(err => {
            if(err == "Duplicate Random String"){
                res.send("Duplicate Random String")
            }else if(err == "Candidate not found"){
                res.send("Candidate not found");
            }else{
                res.send("Internal Server Error");
                console.log(err);
            }
        });
    }else{
        res.send("Illegal ballot");
    }
});

module.exports = router;
