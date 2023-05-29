// Mengimpor modul-modul yang diperlukan
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const { registerUser, loginUser } = require("./utils/users");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const flash = require("connect-flash");
const { v4: uuidv4 } = require("uuid");
const { body, check, validationResult } = require("express-validator");
const path = require("path");

const app = express();
const port = 3000;

app.set("view engine", "ejs");
app.use(expressLayouts);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser("secret"));
app.use(
  session({
    cookie: { maxAge: null },
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);

app.use(flash());

const checkAuthenticated = (req, res, next) => {
  if (req.session.isAuthenticated) {
    next();
  } else {
    res.redirect("/login");
  }
};

app.get("/", (req, res) => {
  res.render("index", {
    title: "Home",
    layout: "layouts/main-layout",
    js: "",
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

      req.flash("Success", "Congratulation Registration Success");

      res.redirect("/register/success");
    }
  }
);

app.get("/register/success", (req, res) => {
  res.render("register-success", {
    title: "Register Success",
    layout: "layouts/main-layout",
    js: "/js/register-succes.js",
    illustration: "/assets/img/confirm.png",
    msg: req.flash("Success"),
  });
});

app.get("/register/success-redirect", (req, res) => {
  res.redirect("/login");
});

app.get("/login", (req, res) => {
  res.render("login", {
    title: "Login",
    layout: "layouts/main-layout",
    js: "",
  });
});

app.post("/login", (req, res) => {
  const user = {
    username: req.body.username,
    password: req.body.password,
  };

  const result = loginUser(user.username, user.password);
  if (result.success) {
    req.session.isAuthenticated = true;
    req.session.username = result.user.username;

    req.flash("login-success", "Login Success!");
    res.redirect("/dashboard");
  } else {
    req.flash("login-failed", "Login Failed!");
    res.redirect("/login");
  }
});

app.get("/dashboard", checkAuthenticated, (req, res) => {
  console.log(req.session);

  res.render("dashboard", {
    title: "Dashboard",
    layout: "layouts/main-layout",
    js: "",
    username: req.session.username,
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
