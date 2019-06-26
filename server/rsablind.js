const BlindSignature = require('blind-signatures');
let key = {}

function generateKey(election_id){
    if(!(election_id in key)){
        key[election_id] = BlindSignature.keyGeneration({ b: 2048 });
    }
}

function getKeyInfo(election_id){
    if(!(election_id in key)){
        return;
    }
    return {
        n : key[election_id].keyPair.n.toString(),
        e: key[election_id].keyPair.e.toString()
    }
}

function sign(blinded_message, election_id){
    if(!(election_id in key)){
        return;
    }
    return BlindSignature.sign({
        blinded: blinded_message,
        key: key[election_id],
    }).toString();    
}

function verify(signed, original, election_id){
    if(!(election_id in key)){
        return;
    }
    return BlindSignature.verify2({
        unblinded: signed,
        key: key[election_id],
        message: original
    });
}

module.exports = { generateKey, getKeyInfo, sign, verify }