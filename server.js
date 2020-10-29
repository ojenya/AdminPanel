const express = require("express")
const server = express();
// const request = require('request')
const session = require('express-session')
const passport = require('passport')
const mongodb = require('mongodb')
const pug = require("pug");
const fetch = require("node-fetch");

const LocalStrategy = require('passport-local').Strategy
const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://j3nqa:093zheka4067@cluster0-ksudn.gcp.mongodb.net/test?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true });

server.set("views", "./views");
server.set("view engine", "pug");

const body_parser = require("body-parser");
server.use(body_parser.json());
const urlencodedParser = body_parser.urlencoded({ extended: false });
const port = 4000;


server.use(express.urlencoded({
  extended: false
}))

server.use(session({
  secret: 'banana juice'
}))

server.use(passport.initialize());
server.use(passport.session());


server.get('/', (req, res) => {
  res.render('auth')
})

server.post('/',passport.authenticate('local', {
    successRedirect: '/push',
    failureRedirect: '/',
  })
)

/////////////////////// passport-config ////////////////////
function authentication() {
  return function (req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    res.redirect("/push");
  };
}

passport.serializeUser(function (user, done) {

  done(null, user);
});

passport.deserializeUser(function (user, done) {
  if (user !== undefined) {
    session.login = user.login
    session.id = user.id
    done(null, user)
  } else {
    done(null, false)
  }
});

passport.use(
  new LocalStrategy(
    {
      usernameField: "login",
      passwordField: "password"
    },
    function (login, password, done) {

      client.connect(err => {
        const collection = client.db("585").collection("adminPanel");
          collection.find({ login: `${login}`}).toArray(function(err, user) {
            if (err) { return done(err); }

            if (password !== user[0].password) {
              return done(null, false, { message: 'Неверный пароль' });
            }else {

             return done(null, user[0]);}
            
          })
      });
      
    }
  )
)



function sendNotifications(message, user_ids){
// API ВКонтакте через POST-запрос
// https://api.vk.com/method/notifications.sendMessage?v=5.110&access_token=7d7966bf7d7966bf7d7966bf587d0d28cf77d797d7966bf22078987bac7c518cd2b3f5b&user_ids=124467110&message=%22qq%22&fragment=%22https://vk.com/app7622256#stock%22
  const v = '5.110'
  const access_token = '7d7966bf7d7966bf7d7966bf587d0d28cf77d797d7966bf22078987bac7c518cd2b3f5b'
  const fragment = '#stock'
  fetch(`https://api.vk.com/method/notifications.sendMessage?v=${v}&access_token=${access_token}&user_ids=${user_ids}&message=${message}&fragment=${encodeURIComponent(fragment)}`)
  .then(res => res.text())
  .then(body => console.log(body));

}


// GET
server.get("/push",authentication(), (request, response) => {
  response.render('index')
});


// POST
server.post('/push',(req,res) =>{
  const userVK = [124467110];
  // client.connect(err => {
  //   const collectionVK = client.db("585").collection("users");
  // collectionVK.find({ vk_id: { $exists: true }}).toArray(function(err, results) {
  //   for (let i = 0; i < results.length; i++) {
  //     userVK.push(results[i].vk_id)          
  //   }
  // })
    sendNotifications(req.body.text,userVK)
    res.end()
  // });
})

server.listen(port, () => {
    console.log(`Server listening at ${port}`);
});