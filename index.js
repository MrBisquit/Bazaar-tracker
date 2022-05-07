const express = require('express');
const config = require("./config.json") // Website config
const fs = require('fs');
const FormData = require('form-data');
//const fetch = require('node-fetch');
const crypto = require('crypto');
const app = express();
//app.use(require('express-session')(config.session))
const expresslLayouts = require('express-ejs-layouts');
const cookieParser = require('cookie-parser');
app.use(cookieParser());
const request = require('request');
const moment = require('moment');

app.set('view engine', 'ejs')
app.set('views', __dirname + '/pages')
app.set('layout', 'layouts/layout')
app.use(expresslLayouts)
app.use(express.static('public'))

var list = null;
//var json = null;
var url = `https://api.hypixel.net/skyblock/bazaar?key=${config.api_token}`;
var lastgot = null;

var profiles = null;
//var profile = null;
var profile = JSON.parse(fs.readFileSync("./profile.json"));
var user = null;

var ru1 = `https://api.hypixel.net/player?key=${config.api_token}&name=${config.Username}`;

request(ru1, (error, response, body)=>{
    if(error) { return console.log(error) }

    var userj = JSON.parse(fs.readFileSync("user.json"));
    user = JSON.parse(body);
    userj = JSON.parse(body);
    fs.writeFileSync("./user.json", JSON.stringify(userj));
    console.log(user);
});

request(`https://api.hypixel.net/skyblock/profiles?key=${config.api_token}&uuid=${config.UUID}`, (error, response, body)=>{
     
    // Printing the error if occurred
    if(error) return console.log(error)
    
    // Printing status code
    //console.log(response.statusCode);
      
    // Printing body
    //console.log(body);
    //console.log(response.toJSON());
    profiles = JSON.parse(body).profiles;
    console.log(JSON.parse(body).profiles);
});

setInterval(() => {
    request(url, (error, response, body)=>{
     
        // Printing the error if occurred
        if(error) console.log(error)
        
        // Printing status code
        //console.log(response.statusCode);
          
        // Printing body
        //console.log(body);
        //console.log(response.toJSON());
        list = Object.values(JSON.parse(body).products);
        json = JSON.parse(body).products;
        lastgot = moment().local().format('hh:mm a');
    });
}, 2500);
function RequestItem(id) {
    //var json;
    request(url, (error, response, body)=>{
     
        // Printing the error if occurred
        if(error) console.log(error)
        
        // Printing status code
        //console.log(response.statusCode);
          
        // Printing body
        //console.log(body);
        //console.log(response.toJSON());
        //list = Object.values(JSON.parse(body).products);
        //json = JSON.parse(body)[id];
        console.log(JSON.parse(body).products[id]);
        return JSON.parse(body).products[id];
    });
    //return json;
}

/*app.get("/", (req, res) => {
    var list = null;
    var url = `https://api.hypixel.net/skyblock/bazaar?key=${config.api_token}`;
    request(url, (error, response, body)=>{
     
        // Printing the error if occurred
        if(error) console.log(error)
        
        // Printing status code
        //console.log(response.statusCode);
          
        // Printing body
        //console.log(body);
        //console.log(response.toJSON());
        list = Object.values(JSON.parse(body).products);
        res.render('index.ejs', { list : list });
    });
});*/
app.get('/', (req, res) => {
    var profile = JSON.parse(fs.readFileSync("./profile.json"));
    var userj = JSON.parse(fs.readFileSync("user.json"));
    if(!profile.profile_id) {
        if(req.query.selected_profile_UUID) {
            var url = `https://api.hypixel.net/skyblock/profile?key=${config.api_token}&profile=${req.query.selected_profile_UUID}`;
            request(url, (error, response, body)=>{
     
            // Printing the error if occurred
            if(error) console.log(error)
    
            // Printing status code
            //console.log(response.statusCode);
      
            // Printing body
            //console.log(body);
            //console.log(response.toJSON());
            console.log(url);
                console.log(JSON.parse(body));
                profile = JSON.parse(body).profile;
                fs.writeFileSync("./profile.json", JSON.stringify(profile));
            });
            /*for (let i = 0; i < profiles.length; i++) {
                if(profiles[i].profile_id == req.query.selected_profile_UUID) {
                    profile = profiles[i];
                    console.log(profiles);
                    fs.writeFileSync("./profile.json", JSON.stringify(profile));
                    console.log(profile);
                }
            }*/
            return res.redirect('/');
        } else {
            return res.render("select_profile.ejs", { profiles : profiles });
        }
    }
    console.log(profile);
    console.log(userj);
    res.render('index.ejs', { list : list, lastgot : lastgot, user : userj, profile : profile, uuid : config.UUID, purse : profile.members[config.UUID].coin_purse });
    console.log(profile.members[config.UUID].coin_purse);
    console.log(user);
});
app.get('/sp/', (req, res) => {
    return res.render("select_profile.ejs", { profiles : profiles });
});
app.get('/search/', (req, res) => {
    res.render('search.ejs', { list : list, lastgot : lastgot, query : req.query.q, user : user, profile : profile });
});
app.get('/item/:item_id/', (req, res) => {
    //var data = RequestItem(req.params.item_id);
    //console.log(data);
    //console.log(list);
    request(url, (error, response, body)=>{
     
        // Printing the error if occurred
        if(error) console.log(error)
        
        // Printing status code
        //console.log(response.statusCode);
          
        // Printing body
        //console.log(body);
        //console.log(response.toJSON());
        //list = Object.values(JSON.parse(body).products);
        //json = JSON.parse(body)[id];
        //console.log(JSON.parse(body).products[id]);
        //return JSON.parse(body).products[id];
        console.log(JSON.parse(body).products[req.params.item_id]);
        res.render('item.ejs', { item : JSON.parse(body).products[req.params.item_id], user : user, profile : profile });
    });
    //res.render('item.ejs', { item : data });
});
app.get('/settings/', (req, res) => {
    res.render('settings.ejs');
});

app.listen(80, () => {
    console.log(`Listening on port ${80}`)
});