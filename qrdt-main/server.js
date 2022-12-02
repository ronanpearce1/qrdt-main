if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

//CONSTANTS TO REQUIRE SERVER DEPENDENCIES
const express = require('express')
const app = express()
const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')
const port = process.env.PORT || 3000;
const host = '0.0.0.0';

//DATABASE CONNECTION
//const mongoose = require('mongoose')
//mongoose.connect(process.env.DATABASE_URL, {useNewUrlParser: true})
//const db = mongoose.connection
//db.on('error', error => console.error(error))
//db.once('open', () => console.log('Connected to Mongoose'))

//PASSPORT
const initializePassport = require('./passport-config')
initializePassport(
  passport,
  email => users.find(user => user.email === email),
  id => users.find(user => user.id === id)
)

const users = [{
  id: '1668519999893',
  name: 'Ronan',
  email: 'ronanp34@gmail.com',
  password: '$2b$10$eUNYcFy1UpeRrDWRXMz9Ze82c1fRi2j5VPFZDRWjnEWsdKXHeGcmO'
}]


app.use(express.static("public"));
app.set('view-engine', 'ejs')
app.use(express.urlencoded({ extended: false }))
app.use(flash())
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))

app.get('/', checkAuthenticated, (req, res) => {
  res.render('index.ejs', { name: req.user.name })
})

app.get('/login', checkNotAuthenticated, (req, res) => {
  res.render('login.ejs')
})

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true
}))

app.get('/register', checkNotAuthenticated, (req, res) => {
  res.render('register.ejs')
})

app.post('/register', checkNotAuthenticated, async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10)
    users.push({
      id: Date.now().toString(),
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword
    })
    res.redirect('/login')
  } catch {
    res.redirect('/register')
  }
  console.log(users)
})

app.get('/info', (req, res) => {
  res.render('info.ejs')
})


app.delete('/logout', (req, res, next) => {
  req.logOut((err) => {
    if (err) {
      return next(err);
    }
    res.redirect('/login');
  });
});

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  }

  res.redirect('/login')
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect('/')
  }
  next()
}

app.listen(port, host);

