const express = require('express');
const crypto = require('crypto');
const fs = require('fs');
let app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static('public'));


app.listen(80,()=>{
    console.log('listen on port 80...');
})

