var crypto = require('crypto');
const bcrypt = require("bcrypt");
const fs = require('fs');
const path = require('path');
const { resolve } = require('path');



//function for Genrating RandomValueHex
function randomValueHex(len) {
    return crypto.randomBytes(Math.ceil(len / 2))
        .toString('hex') // convert to hexadecimal format
        .slice(0, len).toUpperCase();   // return required number of characters
}

//function for hashing..
async function hashPassword(plaintextPassword) {
    return new Promise(async (resolve,reject)=>{
        const hash = await bcrypt.hash(plaintextPassword, 10,function(error,result,fields){
            if(error){
                return reject(error);
            }
            return resolve(result);
        });

    });
}

//function for comparing password
async function hashCompare(plaintextPassword,hash) {

    try {
        const result = await bcrypt.compare(plaintextPassword,hash);
        // handle the resolved value here
        return result;
      } catch (error) {
        console.log(error); // handle the error here
        return error;
      }
}

//fetch image 
async function getImage(filePath){
    return new Promise((resolve, reject)=>{
        fs.readFile(filePath, (err, data) => {
            if (err) {
            console.error(err);
            return reject(err);
            }

            return resolve(data);
        });
    });
}




module.exports = { randomValueHex,hashPassword ,hashCompare,getImage};