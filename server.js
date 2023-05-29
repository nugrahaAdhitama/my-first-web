// Mengimpor modul-modul yang diperlukan
const express = require("express"); // Modul express digunakan untuk membuat aplikasi web
const expressLayouts = require("express-ejs-layouts"); // Modul express-ejs-layouts digunakan untuk pengaturan tata letak dengan EJS
const { registerUser, loginUser } = require("./utils/users"); // Mengimpor fungsi registerUser dari file ./utils/users.js
const session = require("express-session"); // Modul express-session digunakan untuk manajemen sesi
const cookieParser = require("cookie-parser"); // Modul cookie-parser digunakan untuk parsing cookie
const flash = require("connect-flash"); // Modul connect-flash digunakan untuk mengirim pesan flash antar permintaan
const { v4: uuidv4 } = require("uuid"); // Mengimpor fungsi v4 dari modul uuid sebagai uuidv4
const { body, check, validationResult } = require("express-validator"); // Mengimpor fungsi body, check, validationResult dari modul express-validator untuk validasi input
const path = require("path"); // Mengimpor modul path

const app = express(); // Membuat aplikasi Express baru
const port = 3000; // Menentukan nomor port yang akan digunakan

app.set("view engine", "ejs"); // Mengatur mesin rendering yang digunakan sebagai EJS
app.use(expressLayouts); // Menggunakan modul express-ejs-layouts untuk pengaturan tata letak
app.use(express.json()); // Menggunakan middleware express.json untuk parsing permintaan dengan tipe konten application/json
app.use(express.urlencoded({ extended: true })); // Menggunakan middleware express.urlencoded untuk parsing permintaan dengan tipe konten application/x-www-form-urlencoded

app.use(express.static(path.join(__dirname, "public"))); // Mengatur folder "public" sebagai folder statis yang akan digunakan untuk file seperti CSS, JavaScript, dan gambar

app.use(cookieParser("secret")); // Menggunakan modul cookie-parser dengan kunci "secret" untuk parsing cookie
app.use(
  session({
    cookie: { maxAge: null },
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);

app.use(flash()); // Menggunakan modul connect-flash untuk mengirim pesan flash antar permintaan

// Fungsi middleware untuk memeriksa apakah pengguna terotentikasi
const checkAuthenticated = (req, res, next) => {
  if (req.session.isAuthenticated) {
    next(); // Lanjutkan ke langkah berikutnya jika pengguna terotentikasi
  } else {
    res.redirect("/login"); // Alihkan ke halaman login jika pengguna tidak terotentikasi
  }
};

app.get("/", (req, res) => {
  // Menangani permintaan GET ke route "/"
  res.render("index", {
    title: "Home", // Mengatur judul halaman menjadi "Home"
    layout: "layouts/main-layout", // Menggunakan tata letak "layouts/main-layout"
    js: "", // Tidak ada file JavaScript yang akan digunakan
  });
});

app.post(
  "/register",
  [body("username").notEmpty(), body("password").notEmpty()], // Menggunakan express-validator untuk memvalidasi input username dan password
  (req, res) => {
    // Menangani permintaan POST ke route "/register"
    const errors = validationResult(req); // Mengecek apakah terdapat kesalahan validasi pada input
    if (!errors.isEmpty()) {
      // Jika terdapat kesalahan validasi
      res.render("index", {
        title: "Home", // Mengatur judul halaman menjadi "Home"
        layout: "layouts/main-layout", // Menggunakan tata letak "layouts/main-layout"
        msg: req.flash("msg"), // Mengirimkan pesan flash dengan kunci "msg" ke tampilan
        errors: errors.array(), // Mengirimkan array kesalahan validasi ke tampilan
      });
    } else {
      // Jika tidak terdapat kesalahan validasi
      const id = uuidv4(); // Menghasilkan UUID v4 sebagai ID unik untuk user
      req.body.id = id; // Menetapkan ID pada permintaan (req.body)

      console.log(req.body); // Menampilkan data permintaan di konsol

      const user = {
        id: req.body.id,
        username: req.body.username,
        password: req.body.password,
      }; // Membuat objek user dari data permintaan

      registerUser(user); // Memanggil fungsi registerUser untuk mendaftarkan user

      req.flash("Success", "Congratulation Registration Success"); // Mengirimkan pesan flash dengan kunci "Success" dan isi pesan "Congratulation Registration Success"

      res.redirect("/register/success"); // Mengalihkan pengguna ke halaman "/register/success"
    }
  }
);

app.get("/register/success", (req, res) => {
  // Menangani permintaan GET ke route "/register/success"
  res.render("register-success", {
    title: "Register Success", // Mengatur judul halaman menjadi "Register Success"
    layout: "layouts/main-layout", // Menggunakan tata letak "layouts/main-layout"
    js: "/js/register-succes.js", // Menggunakan file JavaScript "/js/register-succes.js"
    illustration: "/assets/img/confirm.png", // Mengatur path gambar ilustrasi yang benar
    msg: req.flash("Success"), // Mengirimkan pesan flash dengan kunci "Success" ke tampilan
  });
});

app.get("/register/success-redirect", (req, res) => {
  // Menangani permintaan GET ke route "/register/success-redirect"
  res.redirect("/login"); // Mengalihkan pengguna ke halaman "/login"
});

app.get("/login", (req, res) => {
  // Menangani permintaan GET ke route "/login"
  res.render("login", {
    title: "Login", // Mengatur judul halaman menjadi "Login"
    layout: "layouts/main-layout", // Menggunakan tata letak "layouts/main-layout"
    js: "", // Tidak ada file JavaScript yang akan digunakan
  });
});

app.post("/login", (req, res) => {
  // Menangani permintaan POST ke route "/login"
  const user = {
    username: req.body.username,
    password: req.body.password,
  };

  const result = loginUser(user.username, user.password); // Memanggil fungsi loginUser untuk memeriksa keberhasilan login
  if (result.success) {
    req.session.isAuthenticated = true; // Menandai pengguna sebagai terotentikasi di sesi
    req.session.username = result.user.username; // Menyimpan username pengguna di sesi

    req.flash("login-success", "Login Success!"); // Mengirimkan pesan flash dengan kunci "login-success" dan isi pesan "Login Success!"
    res.redirect("/dashboard"); // Mengalihkan pengguna ke halaman "/dashboard"
  } else {
    req.flash("login-failed", "Login Failed!"); // Mengirimkan pesan flash dengan kunci "login-failed" dan isi pesan "Login Failed!"
    res.redirect("/login"); // Mengalihkan pengguna ke halaman "/login"
  }
});

app.get("/dashboard", checkAuthenticated, (req, res) => {
  // Menangani permintaan GET ke route "/dashboard"
  console.log(req.session); // Menampilkan data sesi pengguna di konsol

  res.render("dashboard", {
    title: "Dashboard",
    layout: "layouts/main-layout",
    js: "",
    username: req.session.username, // Mengirimkan username pengguna ke tampilan
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`); // Menampilkan pesan di konsol saat aplikasi berjalan
});
