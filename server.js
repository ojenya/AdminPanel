const express = require("express");
const server = express();

const session = require('express-session')
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
// server.set('trust proxy', '78.46.200.216');


const pug = require("pug");
server.set("views", "./views");
server.set("view engine", "pug");
const body_parser = require("body-parser");
server.use(body_parser.json());
const urlencodedParser = body_parser.urlencoded({ extended: false });
const port = 4000;
// const port = 60341

server.use(express.urlencoded({
  extended: false
}))

server.use(session({
  secret: 'banana juice'
}))

server.use(passport.initialize());
server.use(passport.session());


server.get('/auth', (req, res) => {
  res.render('auth')
})

server.post(
  '/auth',
  passport.authenticate('local', {
    successRedirect: '/course/1',
    failureRedirect: '/auth',
  })
)



// ////////////////////// passport-config ////////////////////
function authentication() {
  return function (req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    res.redirect("/course");
  };
}

passport.serializeUser(function (user, done) {

  done(null, user);
});

passport.deserializeUser(function (user, done) {
  if (user !== undefined) {
    session.login = user.login
    session.id = user.id
    // session.isAdmin = user.isAdmin;
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

      const MongoClient = require('mongodb').MongoClient;
      const uri = "mongodb+srv://j3nqa:093zheka4067@cluster0-ksudn.gcp.mongodb.net/schedule?retryWrites=true&w=majority";
      const client = new MongoClient(uri, { useNewUrlParser: true });
      client.connect(err => {
        const collection = client.db("schedule").collection("adminPanel");
          collection.find({ login: `${login}`}).toArray(function(err, user) {
            if (err) { return done(err); }

            if (password !== user[0].password) {
              return done(null, false, { message: 'Неверный пароль' });
            }else {

             return done(null, user[0]);}

           

            
          })
        client.close();
      });
      
    }
  )
)

server.get('/group',(req,res)=>{
  const MongoClient = require('mongodb').MongoClient;
  const uri = "mongodb+srv://j3nqa:093zheka4067@cluster0-ksudn.gcp.mongodb.net/schedule?retryWrites=true&w=majority";
  const client = new MongoClient(uri, { useNewUrlParser: true });
  client.connect(err => {
    const collection = client.db("schedule").collection("users_vk");
      collection.find({ group: `02461-ДБ`}).toArray(function(err, res) {
        console.log(res)

      })
    client.close();
})

})


server.post('/telegram',(req,res) =>{
  const request = require('request');
  const MongoClient = require('mongodb').MongoClient;
  const uri = "mongodb+srv://j3nqa:093zheka4067@cluster0-ksudn.gcp.mongodb.net/test?retryWrites=true&w=majority";
  const client = new MongoClient(uri, { useNewUrlParser: true });
  client.connect(err => {
      const collection = client.db("schedule").collection("users_tg");
      const collectionVK = client.db("schedule").collection("users_vk");
      // collectionVK.find( { vk_id: { $exists: true }}).toArray(function(err, results) {
      collectionVK.find( { vk_id: { $exists: true }}).toArray(function(err, results) {

        for (let i = 0; i < results.length; i++) {
          const groupVK = results[i].group;
          const userVK = results[i].vk_id;
          if(groupVK === req.body.group){
            request.get({
                url : `https://api.vk.com/method/messages.send?user_id=${encodeURIComponent(userVK)}&message=${encodeURIComponent(req.body.text)}&v=5.37&access_token=12a362057da8855f031764e0f0de870c7a4fea657117897a8ecaae7c4fd7554f042f7288342816420ec93`
            },function (err,result){
              res.end()
            });
          
        }}
      })
      collection.find( { tg_id: { $exists: true }}).toArray(function(err, results) {
        for (let i = 0; i < results.length; i++) {
          const group = results[i].group;
          const user = results[i].tg_id;
          if(group === req.body.group){
            request.get({
                url : `https://api.telegram.org/bot1018893445:AAEqLiBRxgzo4Z4z6nL9p-ymaqSBA_T9QX8/sendMessage?chat_id=${encodeURIComponent(user)}&text=${encodeURIComponent(req.body.text)}`,
                proxy: 'http://51.158.111.242:8811'
            
            },function (err,result){
              res.end()
            });
          
        }}
      })

  });
  client.close();
  

})
// =================GET=================
// server.get('/', (request, response) => {
//     response.redirect('/course')
//   })

server.get("/course",authentication(), (request, response) => {
    const MongoClient = require('mongodb').MongoClient;
    const uri = "mongodb+srv://j3nqa:093zheka4067@cluster0-ksudn.gcp.mongodb.net/test?retryWrites=true&w=majority";
    const client = new MongoClient(uri, { useNewUrlParser: true });
    client.connect(err => {
        const collection = client.db("schedule").collection("group");
        collection.find().sort( { group_id: 1 } ).toArray(function(err, results) {
            response.render('index', { courses: results })
        })
    });
    client.close();
});

server.get("/course/:id", authentication(),(request, response) => {
    const MongoClient = require('mongodb').MongoClient;
    const uri = "mongodb+srv://j3nqa:093zheka4067@cluster0-ksudn.gcp.mongodb.net/test?retryWrites=true&w=majority";
    const client = new MongoClient(uri, { useNewUrlParser: true });
    client.connect(err => {
        const collection = client.db("schedule").collection("group");
        collection.find({ course: `${request.params.id}` }).sort( { group_id: 1 } ).toArray(function(err, results) {

            // const getCourse = results.filter(e => e.course === request.params.id)
            // console.log(getCourse)
            response.render('index', { courses: results })
        })

    });
    client.close();
});


// =================POST=================

server.post("/course", authentication(), async function(request, response) {

    if (!request.body) return response.sendStatus(400);
    const MongoClient = require('mongodb').MongoClient;
    const uri = "mongodb+srv://j3nqa:093zheka4067@cluster0-ksudn.gcp.mongodb.net/test?retryWrites=true&w=majority";
    const client = new MongoClient(uri, { useNewUrlParser: true });
    client.connect(err => {
        const collection = client.db("schedule").collection("group");
        collection.insertOne({ course: request.body.course, group_id: `${request.body.group}` })
        client.close();
        response.redirect('/course')

    });
});

server.post("/delete", urlencodedParser, async function(request, response) {
    const mongodb = require('mongodb')
    const MongoClient = require('mongodb').MongoClient;
    const uri = "mongodb+srv://j3nqa:093zheka4067@cluster0-ksudn.gcp.mongodb.net/test?retryWrites=true&w=majority";
    const client = new MongoClient(uri, { useNewUrlParser: true });
    client.connect(err => {
        const collection = client.db("schedule").collection("group");
        collection.deleteOne({ _id: new mongodb.ObjectID(`${request.body.id }`)})

        client.close();
        response.redirect('/course')
    });
});



server.listen(port, () => {
    console.log(`Server listening at ${port}`);
});