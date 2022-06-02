const router = require("express").Router();
const bcryptjs = require('bcryptjs')
const User = require('../models/User.model')
const saltRounds = 10
const session = require("express-session")
const mongo = require("connect-mongo")

//require auth middleware
const { isLoggedIn, isLoggedOut } = require('../middleware/route-guard.js');

/* GET home page */
router.get("/", (req, res, next) => {
  res.render("index");
});

/*Get to Sign Up*/
router.get("/sign-up", (req, res, next) => {
  res.render("sign-up");
});

router.post("/sign-up", (req, res, next) => {

  const { username, email, password } = req.body;

  bcryptjs
    .genSalt(saltRounds)
    .then(salt => bcryptjs.hash(password, salt))
    .then(hashedPassword => {
      return User.create({
        username,
        email,
        password: hashedPassword
      });
    })
    .then(userFromDB => {
      console.log('Newly created user is: ', userFromDB);

    })
    .then( () => {
      res.redirect('/login')
    })
    .catch(error => {
      if (error.code === 11000) {
        res.status(500).render('sign-up', {
           errorMessage: 'Username or Email already taken.'
        });
      } else {
        next(error);
      }
    });
    //.catch(error => next(error))
});

/*Get to Login*/
router.get("/login", (req, res, next) => {
  res.render("login");
});

router.post('/login', (req, res, next) => {
  console.log('SESSION =====> ', req.session);
  const { email, password } = req.body;
 
 if (email === '' || password === '') {
    res.render('login', {
      errorMessage: 'Please enter both, email and password to login.'
    });
    return;
  }
  User.findOne({ email })
    .then(user => {
      if (!user) {
        res.render('login', {
          errorMessage: 'Email is not registered. Try with other email.'
        });
        return;
      }
      else if (bcryptjs.compareSync(password, user.password)) {
        console.log(user, "this is my user")
        req.session.currentUser = user
        res.redirect('/profile');
      } else {
        res.render('login', { errorMessage: 'Incorrect password.' });
      }
    })
    .catch(error => next(error))
});

router.get("/profile", isLoggedIn, (req, res, next) => {
  res.render("user-profile", { user: req.session.currentUser });
});

/// ------  GET CAT VIEW ----- \\\\\
router.get("/main", isLoggedIn, (req, res, next) => {
  res.render("cat");
});

/// ------  GET GIF VIEW ----- \\\\\
router.get("/private", isLoggedIn, (req, res, next) => {
  res.render("gif");
})

module.exports = router;

// else if (user === username) { 
 // res.render('login', { errorMessage: "The username can't be repeated" });
//}