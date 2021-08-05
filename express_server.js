const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
const { generateRandomString } = require("./helper");
const { findEmail } = require("./helper");
const cookieParser = require("cookie-parser");
app.use(cookieParser());

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

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
  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies["user_id"]],
  };

  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { user: users[req.cookies["user_id"]] };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    user: users[req.cookies["user_id"]],
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

//route fot login & logout
app.get("/login", (req, res) => {
  const templateVars = { user: users[req.cookies["user_id"]] };

  res.render("urls_login", templateVars);
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = findEmail(users, email);
  if (!user) {
    res.status(403).send("User name not valid");
  } else if (password !== user.password) {
    res.status(403).send("Incorrect password");
  } else {
    res.cookie("user_id", user.id);
  }
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

app.get("/register", (req, res) => {
  const templateVars = { user: users[req.cookies["user_id"]] };
  res.render("urls_Registration", templateVars);
});

app.post("/register", (req, res) => {
  const newID = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  const user = findEmail(users, email);
  if (email.length === 0 && password.length === 0) {
    res.status(400).send("Empty and nothing entered");
  } else if (!user) {
    users[newID] = {
      id: newID,
      email: email,
      password: password,
    };
    res.cookie("user_id", newID);
    res.redirect("/urls");
  } else {
    res.status(400).send("User already exists.");
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
