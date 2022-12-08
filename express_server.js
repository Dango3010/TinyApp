const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs"); //tells the Express app to use EJS as its templating engine.

//for a post request, form submission:
app.use(express.urlencoded({ extended: true }));
//this body-parser library will convert the request body from a Buffer into string that we can read

app.post("/urls", (req, res) => {
  console.log('req.body:', req.body); //req.body = the POST request body = the long URL we submit
  //its output: in the urls_new template, we specified this longURL key using the input attribute name. The value is the content from the input field. This lovely formatting is courtesy of the Express library!
  const id = generateRandomString();
  urlDatabase[id] = req.body.longURL; //add new id-longURL key-value pair to the object
  res.redirect(`/urls/${id}`); //when the server receives a POST request to /urls, it responds with a redirection to /urls/:id.
});

//randomly create a short URL id
function generateRandomString() {
    var result = '';
    const length = 6;
    const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
    return result;
}

app.get("/u/:id", (req, res) => {
  const urlId = req.params.id; // = shortened URL = b2xVn2 / 9sm5xK
  const longURL = urlDatabase[urlId];
  res.redirect(longURL);
});
//e.g. when we click the link: http://localhost:8080/u/b2xVn2, we will be taken to http://www.lighthouselabs.ca.
//the short URL ID links have /u/id by default by the urls_show template 
//we can also test it by using curl command in the terminal 

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
}; //used to keep track of all the URLs and their shortened forms. 

app.get("/urls", (req, res) => {
  console.log('urlDatabase:', urlDatabase);
  const templateVars = { urls: urlDatabase }; //urls = the key of the variable urlDatabase that we wanna put into the HTML file
  res.render("urls_index", templateVars); //name of the template + an object
});

//a GET route that renders the page with the form to present the form to the user
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => { 
  //the : in front of id means that id is a route parameter. 
  const urlId = req.params.id; // = shortened URL = b2xVn2 / 9sm5xK
  const templateVars = { id: req.params.id, longURL: urlDatabase[urlId]};
  res.render("urls_show", templateVars);
});

app.get("/", (req, res) => {
  res.send("Hello!");
}); //apply to path: http://localhost:8080/

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase); //prints out a JSON string representing the entire urlDatabase object.
}); //apply to path: http://localhost:8080/urls.json

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
