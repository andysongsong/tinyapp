const generateRandomString = () => {
  let length = 6;
  let result = "";
  let characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

const getUserByEmail = (email, users) => {
  for (let userId in users) {
    if (users[userId].email === email) {
      return users[userId];
    }
  }
  return null;
};

const urlsForUser = (id, db) => {
  const userURLs = {};
  for (let url in db) {
    if (id === db[url].userID) {
      userURLs[url] = db[url];
    }
  }
  return userURLs;
};

module.exports = { generateRandomString, getUserByEmail, urlsForUser };
