const { compare, hash } = require('bcrypt');
var mysql = require('mysql');
const cfun = require("./function.js");


var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "app_badBoy"
});

con.connect(function (err) {
  if (err) throw err;
  console.log("Connected!");
});

// function for addUser

function addUser(aData, hexCode) {
  let registerUser = {
    id: '',
    username: aData.name,
    email: aData.email,
    password: aData.password,
    hexCode: hexCode,
    added_on: aData.added_on,
    update_on: '',
  }

  return new Promise((resolve, reject) => {
    con.query('INSERT INTO app_userprofile SET ?', registerUser, function (error, result, fields) {
      if (error) {
        return reject(error);
      }
      console.log(result.insertId);
      return resolve(result);
    });
  });

}

function compareLoginUser(aData){
  let loginUserData = {
    email : aData.email,
    password : aData.password,
    hashPassword : aData.hashPassword,
  };
  return new Promise((resolve, reject)=>{
    con.query('select * from app_userprofile WHERE email = ?',loginUserData.email,function(error,result,fields){
      if(error){
        console.log(error);
        return reject(error);
      }
      return resolve(result);
    });
  });

}

//function to add thoughts
function addThought(aData){

  let thoughtsData = aData.file != null ? {
    id : null,
    username: aData.name,
    haxcode : aData.hexKey,
    thougths : aData.thoughts,
    added_on: aData.added_on,
    file : aData.file,
    updated_on: '',
  } : {
    id : null,
    username: aData.name,
    haxcode : aData.hexKey,
    thougths : aData.thoughts,
    added_on: aData.added_on,
    updated_on: '',
  };

  return new Promise((resolve,reject)=>{
    con.query("INSERT INTO app_thoughts set ? ",thoughtsData,function(error,result,fields){
      if(error){
        console.log(error);
        return reject(error);
      }
      console.log(result);
      return resolve(result);
    });
  });
}

function getThoughtData(aData){
  let pagination = +parseInt(aData.iOffset)+','+parseInt(aData.iLenght);

  return new Promise((resolve, reject)=>{
    con.query('select * from app_thoughts LIMIT '+pagination,function(error,result,fields){
      if(error){
        console.log(error);
        return reject(error);
      }
      return resolve(result);
    });
  });
}


function getthoughtsCount(){
  return new Promise((resolve,reject)=>{
    con.query('select count(*) from app_thoughts',function(error,result,fields){
      if(error){
        console.log(error)
        return reject(error);
      }
      return resolve(result);
    });
  });
}

module.exports = { addUser ,compareLoginUser,addThought,getThoughtData,getthoughtsCount}