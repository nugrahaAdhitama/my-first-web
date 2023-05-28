// Mengimpor modul-modul yang diperlukan
const express = require("express"); // Modul express digunakan untuk membuat aplikasi web
const expressLayouts = require("express-ejs-layouts"); // Modul express-ejs-layouts digunakan untuk pengaturan tata letak dengan EJS
const { registerUser } = require("./utils/users"); // Mengimpor fungsi registerUser dari file ./utils/users.js
const session = require("express-session"); // Modul express-session digunakan untuk manajemen sesi
const cookieParser = require("cookie-parser"); // Modul cookie-parser digunakan untuk parsing cookie
const flash = require("connect-flash"); // Modul connect-flash digunakan untuk mengirim pesan flash antar permintaan
const { v4: uuidv4 } = require("uuid"); // Mengimpor fungsi v4 dari modul uuid sebagai uuidv4
const { body, check, validationResult } = require("express-validator"); // Mengimpor fungsi body, check, validationResult dari modul express-validator untuk validasi input
const app = express(); // Membuat aplikasi Express baru
const port = 3000; // Menentukan nomor port yang akan digunakan

app.set("view engine", "ejs"); // Mengatur mesin rendering yang digunakan sebagai EJS
app.use(expressLayouts); // Menggunakan modul express-ejs-layouts untuk pengaturan tata letak

app.use(express.json()); // Menggunakan middleware express.json untuk parsing permintaan dengan tipe konten application/json
app.use(express.urlencoded({ extended: true })); // Menggunakan middleware express.urlencoded untuk parsing permintaan dengan tipe konten application/x-www-form-urlencoded

app.use(cookieParser("secret")); // Menggunakan modul cookie-parser dengan kunci "secret" untuk parsing cookie
app.use(
  session({
    cookie: { maxAge: 6000 }, // Menentukan masa berlaku cookie dalam milidetik
    secret: "secret", // Menentukan kunci rahasia untuk mengenkripsi data sesi
    resave: true, // Menentukan apakah sesi akan disimpan ulang pada setiap permintaan
    saveUninitialized: true, // Menentukan apakah sesi akan disimpan bahkan jika tidak ada data yang ditetapkan
  })
);
app.use(flash()); // Menggunakan modul connect-flash untuk mengirim pesan flash antar permintaan

app.get("/", (req, res) => {
  // Menangani permintaan GET ke route "/"
  res.render("index", {
    title: "Home", // Mengatur judul halaman menjadi "Home"
    layout: "layouts/main-layout", // Menggunakan tata letak "layouts/main-layout"
    msg: req.flash("Success"), // Mengirimkan pesan flash dengan kunci "Success" ke tampilan
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

      req.flash("Success", "Registration Success"); // Mengirimkan pesan flash dengan kunci "Success" dan isi pesan "Registration Success"

      res.redirect("/"); // Mengalihkan pengguna kembali ke halaman utama ("/")
    }
  }
);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`); // Menampilkan pesan di konsol saat aplikasi berjalan
});
