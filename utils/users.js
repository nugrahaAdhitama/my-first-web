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

module.exports = { registerUser };
