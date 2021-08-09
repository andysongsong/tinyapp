const { generateRandomString } = require("./helper");
const { getUserByEmail } = require("./helper");
const { urlsForUser } = require("./helper");
const express = require("express");
const morgan = require("morgan");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const bcrypt = require("bcrypt");
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(morgan("dev"));
app.use(
  cookieSession({
    name: "session",
    keys: ["abc123"],
  })
);

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

const users = {
  aJ48lW: {
    id: "aJ48lW",
    email: "1@3.com",
    password: bcrypt.hashSync("234", 10),
  },
  andy: {
    id: "andy",
    email: "1@2.com",
    password: bcrypt.hashSync("123", 10),
  },
};

app.get("/urls", (req, res) => {
  const user = users[req.session["user_id"]];
  console.log("user", user);
  if (user) {
    const urls = urlsForUser(user.id, urlDatabase);
    const templateVars = { user: users[req.session["user_id"]], urls: urls };
    res.render("urls_index", templateVars);
  } else {
    res.render("urls_index", { user: undefined });
  }
});

app.get("/urls/new", (req, res) => {
  const templateVars = { user: users[req.session["user_id"]] };
  const user = users[req.session["user_id"]];
  if (!user) {
    res.redirect("/login");
  } else {
    res.render("urls_new", templateVars);
  }
});

app.get("/urls/:shortURL", (req, res) => {
  if (!req.session["user_id"]) {
    res.status(400).send(" OOPS! Please Login or Register!");
  } else if (!urlDatabase[req.params.shortURL]) {
    res.status(404).send("URL not found! This URL doesn't exist");
  } else if (
    urlDatabase[req.params.shortURL].userID === req.session["user_id"]
  ) {
    const templateVars = {
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL].longURL,
      user: users[req.session["user_id"]],
    };
    res.render("urls_show", templateVars);
  } else if (
    urlDatabase[req.params.shortURL].userID !== req.session["user_id"]
  ) {
    res.status(403).send(" This is not your URL");
  } else {
    res.status(400).send(" Please Login!");
  }
});

app.get("/u/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    const longURL = urlDatabase[req.params.shortURL].longURL; // const longURL = ...
    res.redirect(longURL);
  } else {
    res.send("URL does not exit");
  }
});

//route for creating a new url
app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: req.session["user_id"],
  };

  req.body.longURL;
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
  urlDatabase[req.params.shortURL].longURL = newURL;
  res.redirect("/urls");
});

//route fot login & logout
app.get("/login", (req, res) => {
  const templateVars = { user: users[req.session["user_id"]] };

  res.render("urls_login", templateVars);
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password1 = req.body.password;
  const user = getUserByEmail(email, users);

  if (user) {
    if (bcrypt.compareSync(password1, user.password)) {
      req.session["user_id"] = user.id;
      res.redirect("/urls");
    } else {
      res.status(403).send("Incorrect password");
    }
  } else {
    return res
      .status(403)
      .send("No user with that email found, please register an account.");
  }

  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  req.session["user_id"] = null;
  res.redirect("/urls");
});

app.get("/register", (req, res) => {
  const templateVars = { user: users[req.session["user_id"]] };
  res.render("urls_Registration", templateVars);
});

app.post("/register", (req, res) => {
  const newID = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  const user = getUserByEmail(email, users);
  if (email.length === 0 && password.length === 0) {
    res.status(400).send("Empty and nothing entered");
  } else if (!user) {
    users[newID] = {
      id: newID,
      email: email,
      password: bcrypt.hashSync(password, 10),
    };
    req.session["user_id"] = newID;
    res.redirect("/urls");
  } else {
    res.status(400).send("User already exists.");
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
