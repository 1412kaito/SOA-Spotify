const express = require('express');
const router = express.Router();


router.get("/", (req, res)=>{
    res.send("ini user");
} );

module.exports=router;