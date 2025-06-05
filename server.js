require('dotenv').config();
const Hapi = require('@hapi/hapi');
const mongoose = require('mongoose');
const Path = require('path');

// Koneksi ke MongoDB Atlas
const init = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅ MongoDB Connected");

  // Buat Schema dan Model
  const UserSchema = new mongoose.Schema({
    username: String,
    password: String,
  });
  const User = mongoose.model('User', UserSchema);

  // Setup Server Hapi
  const server = Hapi.server({
    port: process.env.PORT || 3000,
    host: 'localhost',
    routes: {
      files: {
        relativeTo: Path.join(__dirname, 'public')
      }
    }
  });

  // Plugin untuk file statis (HTML, CSS)
  await server.register(require('@hapi/inert'));

  // Serve file HTML utama
  server.route({
    method: 'GET',
    path: '/',
    handler: (request, h) => {
      return h.file('register.html'); // default halaman awal
    }
  });

  // Serve file HTML statis
  server.route({
    method: 'GET',
    path: '/{param*}',
    handler: {
      directory: {
        path: '.',
        index: false,
      }
    }
  });

  // Route register user
  server.route({
    method: 'POST',
    path: '/register',
    options: {
      payload: {
        parse: true,
        multipart: true,
        output: 'data'
      }
    },
    handler: async (request, h) => {
      const { username, password } = request.payload;
      await User.create({ username, password });
      return '✅ Registrasi berhasil!';
    }
  });

  // Route login user
  server.route({
    method: 'POST',
    path: '/login',
    options: {
      payload: {
        parse: true,
        multipart: true,
        output: 'data'
      }
    },
    handler: async (request, h) => {
      const { username, password } = request.payload;
      const user = await User.findOne({ username, password });

      if (user) {
        return `👋 Selamat datang, ${user.username}!`;
      } else {
        return '❌ Login gagal. Username atau password salah.';
      }
    }
  });

  // Jalankan server
  await server.start();
  console.log('🚀 Server running at:', server.info.uri);
};

// Tangani error
process.on('unhandledRejection', err => {
  console.log(err);
  process.exit(1);
});

init();
