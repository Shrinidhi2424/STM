// backend/server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const cookieParser = require('cookie-parser');
const usersRouter = require('./routes/users');
const teamsRouter = require('./routes/teams');
const playersRouter = require('./routes/players');
const tournamentsRouter = require('./routes/tournaments');
const matchesRouter = require('./routes/matches');
const resultsRouter = require('./routes/results');
const statsRouter = require('./routes/stats');

const { init: initSocket, getIO } = require('./socket');

const app = express();
app.use(cors({ origin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(cookieParser());

// auth must be mounted before other routes so /api/auth/me works on load
const authRouter = require('./routes/auth');
app.use('/api/auth', authRouter);

// mount routes
app.use('/api/users', usersRouter);
app.use('/api/teams', teamsRouter);
app.use('/api/players', playersRouter);
app.use('/api/tournaments', tournamentsRouter);
app.use('/api/matches', matchesRouter);
app.use('/api/results', resultsRouter);
app.use('/api/stats', statsRouter);

// health
app.get('/api/health', (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// init socket.io
const io = initSocket(server);

// expose io to routes through getIO()
