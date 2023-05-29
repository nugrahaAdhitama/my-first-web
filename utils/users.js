const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");

const registerUser = async (user) => {
  const dataDir = path.join(__dirname, "../data");
  const file = path.join(dataDir, "users.json");

  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
  }

  let users;

  if (fs.existsSync(file)) {
    users = JSON.parse(fs.readFileSync(file));
  } else {
    users = [];
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(user.password, salt);

  users.push({
    id: user.id,
    username: user.username,
    password: hashedPassword,
  });

  fs.writeFileSync(file, JSON.stringify(users, null, 2));
};

const loginUser = (username, password) => {
  const dataDir = path.join(__dirname, "../data");
  const file = path.join(dataDir, "users.json");

  if (fs.existsSync(file)) {
    const users = JSON.parse(fs.readFileSync(file));

    const user = users.find((user) => user.username === username);

    if (user) {
      if (bcrypt.compareSync(password, user.password)) {
        return { success: true, user, message: "Login successful!" };
      } else {
        return { success: false, message: "Invalid username or password!" };
      }
    } else {
      return { success: false, message: "Invalid username or password!" };
    }
  } else {
    return { success: false, message: "User database not found!" };
  }
};

const responseUser = (username, user) => {
  const dataDir = path.join(__dirname, "../responses");
  const file = path.join(dataDir, `${username}.json`);

  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
  }

  let users;

  if (fs.existsSync(file)) {
    users = JSON.parse(fs.readFileSync(file));
  } else {
    users = [];
  }

  users.push({
    response: user.response,
  });

  fs.writeFileSync(file, JSON.stringify(users, null, 2));
};

module.exports = { registerUser, loginUser, responseUser };
