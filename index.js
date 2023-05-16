const express = require("express");
const { format } = require("mysql");
const cfun = require("./function.js");
const db = require("./database.js");
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const bodyParser = require('body-parser');


const app = express();


app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

app.use(express.json());



app.use(express.urlencoded({
    extended: true
}));

const productData = [];
app.listen(2000, () => {
    console.log("Connect to server at 2000");
    console.log(cfun);
});
//connect to sql


//post Api

// register the user for Anonymousboy 
app.post("/api/register", async (req, res) => {
    console.log("data:", req.body);
    const aData = {
        "name": req.body.name,
        "email": req.body.email,
        "password": req.body.password,
        "added_on": format(new Date()),
    };


    //genrating Random hexCode...
    var hexCode = cfun.randomValueHex(4) + "-" + cfun.randomValueHex(4) + "_" + aData.name;
    try {
        // HashCode for Password
        var hashPassword = await cfun.hashPassword(aData.password);
        aData.password = hashPassword;
        let aResult = await db.addUser(aData, hexCode);
        let aRData = {
            "iInsertId": aResult.insertId,
            "affectedRows": aResult.affectedRows,
        };
        console.log(aRData);
        res.status(200).send({
            "status_code": 200,
            "message": "Register Successfully",
            "body": aRData
        });

    } catch (error) {
        console.log(error);
        res.status(500).send({
            "status_code": 500,
            "message": "Something Wrong...",
            "body": ''
        });
    }
});

//login the user for AnonymousBoy
app.post("/api/loginUser", async (req, res) => {
    const LData = {
        "email": req.body.email,
        "password": req.body.password
    };
    try {
        //hashing the Password
        var hashPassword = await cfun.hashPassword(LData.password);
        LData['HashPassword'] = hashPassword;
        //comparing data
        let aResult = await db.compareLoginUser(LData);
        let aRData = null;
        for (let ele of aResult) {
            let compareData = await cfun.hashCompare(LData.password, ele.password);
            if (compareData) {
                aRData = {
                    'id': ele.id,
                    'name': ele.username,
                    'hexCode': ele.hexcode,
                    '_isLoginStatus': compareData,
                }
            }
            break;
        }
        console.log(aRData);
        if (aRData) {
            res.status(200).send({
                "status_code": 200,
                "message": "Login Successfully",
                "body": aRData
            });
        } else {
            res.status(401).send({
                "status_code": 401,
                "message": "Invalid Email or Password",
                "body": ''
            });
        }

    } catch (error) {
        console.log(error);
        res.status(500).send({
            "status_code": 500,
            "message": "Something Wrong...",
            "body": ''
        });
    }
});

// upload the thoughts in App
app.post("/api/uploadthought", upload.single('data'), async (req, res) => {
    let uData = {
      "thoughts": req.body.thoughts,
      "name": req.body.name,
      "hexKey": req.body.hexKey,
      "added_on": format(new Date())
    };
    if (req.file) {
      // If a file was uploaded, save it to the file system
      const fileName = 'IMAGE_'+req.body.hexKey+'_'+req.file.originalname;
      const filePath = path.join('A:\\programing\\Flutter_project\\node_api\\images\\', fileName);
  
      fs.writeFile(filePath, req.file.buffer, (err) => {
        if (err) {
          console.error(err);
          res.status(500).send({
            "status_code": 500,
            "message": "Error while saving the file",
            "body": ''
          });
          return;
        }
  
        console.log('File uploaded successfully');
        uData.file = fileName;
        addThought(uData, res);
      });
    } else {
      // If no file was uploaded, simply add the thought to the database
      addThought(uData, res);
    }
  });
  
  async function addThought(uData, res) {
    console.log(uData);
    try {
      let aResult = await db.addThought(uData);
      let aRData = {
        "iInsertId": aResult.insertId,
        "affectedRows": aResult.affectedRows,
      };
      if (aResult.insertId) {
        res.status(200).send({
          "status_code": 200,
          "message": "Uploaded Successfully...",
          "body": aRData
        });
      } else {
        res.status(401).send({
          "status_code": 401,
          "message": "Invalid Data Enter...",
          "body": ''
        });
      }
    } catch (error) {
      console.log(error);
      res.status(500).send({
        "status_code": 500,
        "message": "Something Wrong...",
        "body": ''
      });
    }
  }

app.post('/api/getthoughts',async (req,res)=>{

    const aData = {
            "iOffset": req.body.iOffset,
            "iLenght":req.body.iLenght
    };

    try {
        let aResult = await db.getThoughtData(aData);
        // console.log(aResult);
        let aRData = Array();
        let i=0;
        for (let ele of aResult) {
            const filePath = path.join('A:\\programing\\Flutter_project\\node_api\\images\\', ele.file);
                aRData.push( [
                    id = ele.id,
                    username = ele.username,
                    hexCode = ele.haxcode,
                    thoughts = ele.thougths,
                    image_path = ele.file,
                    stream = await cfun.getImage(filePath)
                ]);
        }
       console.log(aRData);
        if (aRData) {
            res.status(200).send({
                "status_code": 200,
                "message": "Data Fetch Successfully...",
                "body": aRData
            });
        }
        else {
            res.status(401).send({
                "status_code": 401,
                "message": "Invalid Data ...",
                "body": ''
            });
        }

    } catch (error) {
        console.log(error);
        res.status(500).send({
            "status_code": 500,
            "message": "Something Wrong...",
            "body": ''
        });
    }
});

app.get("/api/getthoughtscount",async(req,res)=>{

    try {
        let iResult = await db.getthoughtsCount();
        if (iResult) {
            res.status(200).send({
                "status_code": 200,
                "message": "Data Fetch Successfully...",
                "body": iResult
            });
        }
        else {
            res.status(401).send({
                "status_code": 401,
                "message": "Invalid Data ...",
                "body": ''
            });
        }

    } catch (error) {
        console.log(error);
        res.status(500).send({
            "status_code": 500,
            "message": "Something Wrong...",
            "body": ''
        });
    }
});

app.post('/api/images',async (req, res) => {
    const  filename  = req.body.image;
    const filePath = path.join(__dirname, 'images', filename);
  
    fs.readFile(filePath, (err, data) => {
      if (err) {
        console.error(err);
        res.status(404).send('Image not found');
        return;
      }
  console.log(data);
      res.writeHead(200, {'Content-Type': 'image/jpeg'});
      res.end(data);
    });
  });
  