const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
const generateRandomString = require("./helper");

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });
// app.get("/", (req, res) => {
//   res.send("Hello!");
// });
// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// });

//all get routes.
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]; // const longURL = ...
  res.redirect(longURL);
});

//route for creating a new url
app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`http://localhost:8080/urls/${shortURL}`);
});

//route for deleting a url
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

//route for updating a url
app.post("/urls/:shortURL", (req, res) => {
  let newURL = req.body.newURL;
  urlDatabase[req.params.shortURL] = newURL;
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
