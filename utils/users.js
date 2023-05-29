// Mengimpor modul-modul yang diperlukan
const fs = require("fs"); // Modul fs digunakan untuk berinteraksi dengan sistem berkas (file system)
const path = require("path"); // Modul path digunakan untuk memanipulasi jalur (path)
const bcrypt = require("bcrypt"); // Modul bcrypt digunakan untuk hashing password

// Mendefinisikan fungsi registerUser sebagai fungsi async dengan parameter user
const registerUser = async (user) => {
  // Mendapatkan jalur direktori data dengan menggabungkan jalur saat ini (__dirname) dengan "../data"
  const dataDir = path.join(__dirname, "../data");
  // Mendapatkan jalur file users.json dengan menggabungkan jalur direktori data dengan "users.json"
  const file = path.join(dataDir, "users.json");

  // Mengecek apakah direktori data sudah ada, jika tidak, maka buat direktori tersebut
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
  }

  let users;
  // Mengecek apakah file users.json sudah ada, jika ada, maka baca isi file tersebut
  if (fs.existsSync(file)) {
    users = JSON.parse(fs.readFileSync(file));
  } else {
    // Jika file users.json tidak ada, inisialisasi users sebagai array kosong
    users = [];
  }

  // Menghasilkan salt untuk digunakan dalam proses hashing password
  const salt = await bcrypt.genSalt(10);
  // Melakukan hashing terhadap password yang diberikan menggunakan salt yang dihasilkan
  const hashedPassword = await bcrypt.hash(user.password, salt);

  // Menambahkan data user baru ke dalam array users
  users.push({
    id: user.id,
    username: user.username,
    password: hashedPassword,
  });

  // Menulis kembali file users.json dengan data users yang sudah ditambahkan
  fs.writeFileSync(file, JSON.stringify(users, null, 2));
};

// Mendefinisikan fungsi loginUser dengan parameter username dan password
const loginUser = (username, password) => {
  const dataDir = path.join(__dirname, "../data"); // Mendapatkan jalur direktori data dengan menggabungkan jalur saat ini (__dirname) dengan "../data"
  const file = path.join(dataDir, "users.json"); // Mendapatkan jalur file users.json dengan menggabungkan jalur direktori data dengan "users.json"

  if (fs.existsSync(file)) {
    const users = JSON.parse(fs.readFileSync(file)); // Membaca isi file users.json dan mengurai JSON menjadi objek users

    const user = users.find((user) => user.username === username); // Mencari user dengan username yang sesuai dalam objek users

    if (user) {
      // Jika user ditemukan
      if (bcrypt.compareSync(password, user.password)) {
        // Membandingkan password yang dimasukkan dengan password yang di-hash di file
        return { success: true, user, message: "Login successful!" }; // Mengembalikan objek dengan status login berhasil, user yang sesuai, dan pesan sukses
      } else {
        return { success: false, message: "Invalid username or password!" }; // Mengembalikan objek dengan status login gagal dan pesan kesalahan
      }
    } else {
      return { success: false, message: "Invalid username or password!" }; // Mengembalikan objek dengan status login gagal dan pesan kesalahan
    }
  } else {
    return { success: false, message: "User database not found!" }; // Mengembalikan objek dengan status login gagal dan pesan kesalahan karena database pengguna tidak ditemukan
  }
};

// Mengekspor fungsi registerUser, loginUser agar dapat digunakan pada modul lain
module.exports = { registerUser, loginUser };
