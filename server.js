const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const { registerUser } = require("./utils/users");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const flash = require("connect-flash");
const { v4: uuidv4 } = require("uuid");
const { body, check, validationResult } = require("express-validator");
const app = express();
const port = 3000;

app.set("view engine", "ejs");
app.use(expressLayouts);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser("secret"));
app.use(
  session({
    cookie: { maxAge: 6000 },
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);
app.use(flash());

app.get("/", (req, res) => {
  res.render("index", {
    title: "Home",
    layout: "layouts/main-layout",
    msg: req.flash("Success"),
  });
});

app.post(
  "/register",
  [body("username").notEmpty(), body("password").notEmpty()],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render("index", {
        title: "Home",
        layout: "layouts/main-layout",
        msg: req.flash("msg"),
        errors: errors.array(),
      });
    } else {
      const id = uuidv4();
      req.body.id = id;

      console.log(req.body);

      const user = {
        id: req.body.id,
        username: req.body.username,
        password: req.body.password,
      };

      registerUser(user);

      req.flash("Success", "Registration Success");

      res.redirect("/");
    }
  }
);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
