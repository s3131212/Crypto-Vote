function getElectionsList(cb){
    fetch("/api/getElectionsList", { credentials: 'omit' })
    .then(res => res.json())
    .then((data) => cb(data));
}
function getElectionInfo(id, cb){
    fetch("/api/getElectionInfo?id=" + id, { credentials: 'omit' })
    .then(res => res.json())
    .then((data) => cb(data));
}
function getVoteInfo(id, cb){
    fetch("/api/getVoteInfo?id=" + id, { credentials: 'omit' })
    .then(res => res.json())
    .then((data) => cb(data));
}
function getCandidateInfo(id, cb){
    fetch("/api/getCandidateInfo?vote_id=" + id, { credentials: 'omit' })
    .then(res => res.json())
    .then((data) => cb(data));
}
function getVoteResult(id, cb){
    fetch("/api/getVoteResult?id=" + id, { credentials: 'omit' })
    .then(res => res.json())
    .then((data) => cb(data));
}
function checkToken(electionid, token, cb){
    fetch("/api/checkToken?electionid=" + electionid + "&token=" + token, { credentials: 'omit' })
    .then(res => res.json())
    .then((data) => cb(data));
}
function signBallot(blinded, token, electionid, cb){
    fetch("/api/signBallot", {
        method: 'POST',
        body: JSON.stringify({
            blinded: blinded,
            token: token,
            electionid: electionid
        }),
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'omit'
    })
    .then(res => res.json())
    .then((data) => cb(data));
}
function submitBallot(chosen, original, signed, electionid, cb){
    fetch("/api/submitBallot", {
        method: 'POST',
        body: JSON.stringify({
            chosen: chosen,
            original: original,
            signed: signed,
            electionid: electionid
        }),
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'omit'
    })
    .then(res => res.text())
    .then((data) => cb(data));
}
export { getElectionsList, getElectionInfo, getVoteInfo, getCandidateInfo, getVoteResult, checkToken, signBallot, submitBallot};