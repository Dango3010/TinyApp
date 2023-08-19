const cookieSession = require('cookie-session')
const express = require("express");
const app = express();
const PORT = 8080; //default port 8080
const bcrypt = require("bcryptjs");
const getUserByEmail = require('./helpers');

app.set("view engine", "ejs"); //tells the Express app to use EJS as its templating engine.
app.use(cookieSession({
  name: 'session',
  keys: ['mushroom', 'broccoli'],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))

//for a post request, form submission:
app.use(express.urlencoded({ extended: true }));

app.post("/urls", (req, res) => {
  const userID = req.session.user_id;
  if(!userID) return res.send('you cannot shorten URLs because you are not logged in');
  
  //add new id-longURL key object-key pair to the object
  const id = generateRandomString();
  urlDatabase[id] = {
    'longURL': req.body.longURL,
    'userID': userID
  }; 
  res.redirect(`/urls/${id}`); 
});

//to handle the edit button
app.post("/urls/:id/edit", (req, res) => {
  const urlId = req.params.id; // = shortened URL = b2xVn2 / 9sm5xK
  const userID = req.session.user_id;
  if (!urlDatabase[urlId]) return res.send('the URL id does not exist');
  if(!userID) return res.send('you need to login or register first');
  if (urlDatabase[urlId].userID !== userID) return res.send('you do not own this URL page');

  urlDatabase[urlId].longURL = req.body.longURL; 
  res.redirect("/urls"); 
});

//to handle the delete button
app.post("/urls/:id/delete", (req, res) => {
  const urlId = req.params.id; 
  const userID = req.session.user_id;
  if (!urlDatabase[urlId]) return res.send('the URL id does not exist');
  if(!userID) return res.send('you need to login or register first');
  if (urlDatabase[urlId].userID !== userID) return res.send('you do not own this URL page');

  delete urlDatabase[urlId]; 
  res.redirect("/urls"); 
});

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

//to handle the login form
app.post("/login", (req, res) => {
  const email = req.body.email;
  const user = getUserByEmail(email, users);
  if(!user) return res.status(403).send('user not found');
  const pass = req.body.password;
  const password = bcrypt.compareSync(pass, user.password); //if matched, password = true
  if(user && !password) return res.status(403).send('user not found');

  req.session.user_id = user.id; 
  res.redirect("/urls");
});

app.get("/login", (req, res) => {
  const userID = req.session.user_id;
  if(userID) return res.redirect('/urls');
  const templateVars = {user: users[userID]};
  res.render("urls_login", templateVars);
});

//to handle the logout button
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

//go to the registration page
app.get("/register", (req, res) => {
  const userID = req.session.user_id;
  if(userID) return res.redirect('/urls');
  const templateVars = {user: users[userID]};
  res.render("urls_register", templateVars);
});

//how to register for a new user
app.post('/register', (req, res) => {
  const userId = generateRandomString();
  const email = req.body.email;
  const pass = req.body.password;
  const password = bcrypt.hashSync(pass, 10);

  if (!email || !password) return res.send('400 status code');
  if(getUserByEmail(email, users)) return res.status(400).send('cannot use the same email to register');

  users[userId] = {
    id: userId,
    email: email,
    password: password
  };
  req.session.user_id = userId;
  res.redirect("/urls");
});

//randomly create a short URL id
function generateRandomString() {
    var result = '';
    const length = 6;
    const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
    return result;
}

//filter out logged in user's URLs list
const urlsForUser = (id) => {
  let urlList = {};
  for (url in urlDatabase) {
    if (urlDatabase[url].userID === id) {
      urlList[url] = urlDatabase[url];
    }
  }
  return urlList; //an object of URLs of a particular user
};

app.get("/u/:id", (req, res) => {
  const urlId = req.params.id; 
  if (!urlDatabase[urlId]) return res.send('The url id cannot be found');

  const longURL = urlDatabase[urlId].longURL;
  res.redirect(longURL);
});

//used to keep track of all the URLs and their shortened forms. 
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
}; 

app.get("/urls", (req, res) => {
  const userID = req.session.user_id;
  if (!userID) return res.send('you need to login or register for an account to view the URLs list')

  const urlList = urlsForUser(userID);
  const templateVars = { urls: urlList, user: users[userID] };
  res.render("urls_index", templateVars); 
});

//a GET route that renders the page with the form to present the form to the user
app.get("/urls/new", (req, res) => {
  const userID = req.session.user_id;
  if(!userID) return res.redirect('/login');
  const templateVars = {user: users[userID]};
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => { 
  const urlId = req.params.id; 
  const userID = req.session.user_id;
  if (!userID) return res.send('you need to login to view the URL page')
  if (urlDatabase[urlId].userID !== userID) return res.send('you do not own this URL page');

  const templateVars = { 
    id: req.params.id, longURL: urlDatabase[urlId].longURL,
    user: users[userID]
  };
  res.render("urls_show", templateVars);
});

app.get("/", (req, res) => {
  res.send("Hello! Please go to http://localhost:8080/register url");
}); //apply to path: http://localhost:8080/

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase); 
}); 

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
