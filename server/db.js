const mysql = require('mysql');
let pool;

function connect(option){
    let { host, user, password, database } = option;
    pool = mysql.createPool({
        connectionLimit: 10,
        host: host,
        user: user,
        password: password,
        database: database,
        dateStrings : true
    });
}

function queryElectionList(ongoing){
    if(ongoing){
        return new Promise((resolve, reject) => {
            pool.query('SELECT id, title, description FROM elections WHERE starttime <= NOW() AND endtime >= NOW();',(err, rows, fields) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }else{
        return new Promise((resolve, reject) => {
            pool.query('SELECT id, title, description FROM elections WHERE endtime < NOW();',(err, rows, fields) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }
}

function queryElectionByID(election_id){
    return new Promise((resolve, reject) => {
        pool.query('SELECT id, title, description FROM elections WHERE id = ?', election_id,(err, rows, fields) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

function queryVotesByElectionID(election_id){
    return new Promise((resolve, reject) => {
        pool.query('SELECT * FROM votes WHERE election_id = ?;', election_id,(err, rows, fields) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

function queryCandidatesByVoteID(vote_id){
    return new Promise((resolve, reject) => {
        pool.query('SELECT * FROM candidates WHERE vote_id = ? ORDER BY code;', vote_id,(err, rows, fields) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

function queryToken(token, election_id){
    return new Promise((resolve, reject) => {
        pool.query('SELECT * FROM tokens WHERE token = ? AND election_id = ? AND used = 0;', [ token, election_id ],(err, rows, fields) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

function queryCandidateAndVoteID(vote_id, candidate_id){
    return new Promise((resolve, reject) => {
        pool.query('SELECT * FROM candidates WHERE id = ? AND vote_id = ?;', [ candidate_id, vote_id ],(err, rows, fields) => {
            if (err) reject(err);
            else if (rows.length == 0) reject("Candidate not found");
            else resolve();
        });
    });
}


function queryUsedRandStr(randstr){
    return new Promise((resolve, reject) => {
        pool.query('SELECT * FROM used_randstr WHERE string = ?;', randstr,(err, rows, fields) => {
            if (err) reject(err);
            else if (rows.length > 0) reject("Duplicate Random String");
            else resolve(randstr);
        });
    });
}

function queryVoteResultByVoteID(vote_id){
    return new Promise((resolve, reject) => {
        pool.query('SELECT receipt, candidate_id FROM vote_records INNER JOIN (SELECT votes.id AS vote_id FROM votes INNER JOIN elections WHERE votes.id = ? AND elections.endtime < NOW() AND votes.election_id = elections.id) AS b WHERE vote_records.vote_id = b.vote_id ORDER BY vote_records.receipt;', vote_id,(err, rows, fields) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

function updateTokenToUsed(token){
    return new Promise((resolve, reject) => {
        pool.query('UPDATE tokens SET used = 0 WHERE token = ?;', token,(err, rows, fields) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

function insertUsedRandStr(randstr){
    return new Promise((resolve, reject) => {
        pool.query('INSERT INTO used_randstr (string) VALUES (?);', [randstr],(err, rows, fields) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

function insertToken(token, election_id){
    return new Promise((resolve, reject) => {
        pool.query('INSERT INTO tokens (token, election_id, used) VALUES (?, ? ,?);', [token, election_id, 0],(err, rows, fields) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

function insertVoteRecords(receipt, vote_id, candidate_id){
    return new Promise((resolve, reject) => {
        pool.query('INSERT INTO vote_records (receipt, vote_id, candidate_id) VALUES (?, ?, ?);', [receipt, vote_id, candidate_id],(err, rows, fields) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

function deleteVoteRecordsByReceipt(receipt){
    return new Promise((resolve, reject) => {
        pool.query('DELETE FROM vote_records WHERE receipt = ?;', receipt,(err, results) => {
            if (err) reject(err);
            else resolve(results);
        });
    });
}

module.exports = {
    connect,
    queryElectionList,
    queryElectionByID,
    queryVotesByElectionID,
    queryCandidatesByVoteID,
    queryToken,
    queryCandidateAndVoteID,
    queryUsedRandStr,
    queryVoteResultByVoteID,
    updateTokenToUsed,
    insertUsedRandStr,
    insertToken,
    insertVoteRecords,
    deleteVoteRecordsByReceipt
}