// server.js
const Hapi = require('@hapi/hapi');
const Path = require('path');
const pool = require('./db');
const Inert = require('@hapi/inert');
const Vision = require('@hapi/vision');

const init = async () => {
  const server = Hapi.server({
    port: 3000,
    routes: {
      files: {
        relativeTo: Path.join(__dirname, 'public')
      }
    }
  });

  await server.register([Inert, Vision]);


  // Route for static files (HTML)
  server.route({
    method: 'GET',
    path: '/{param*}',
    handler: {
      directory: {
        path: '.',
        index: ['login.html']
      }
    }
  });

  // Register
  server.route({
    method: 'POST',
    path: '/register',
    handler: async (request, h) => {
      const { username, password } = request.payload;

      try {
        const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
        if (rows.length > 0) {
          return 'Username already taken.';
        }

        await pool.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, password]);
        return 'Registration successful. <a href="/login.html">Login here</a>';
      } catch (err) {
        console.error(err);
        return h.response('Server error').code(500);
      }
    }
  });

  // Login
  server.route({
    method: 'POST',
    path: '/login',
    handler: async (request, h) => {
      const { username, password } = request.payload;

      try {
        const [rows] = await pool.query('SELECT * FROM users WHERE username = ? AND password = ?', [username, password]);
        if (rows.length > 0) {
          return `Welcome, ${username}!`;
        } else {
          return 'Invalid username or password. <a href="/login.html">Try again</a>';
        }
      } catch (err) {
        console.error(err);
        return h.response('Server error').code(500);
      }
    }
  });

  await server.start();
  console.log('Server running on %s', server.info.uri);
};

init();
