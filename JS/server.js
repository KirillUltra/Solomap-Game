// server.js — Мок-бекенд для Solomap MVP

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 4000;

app.use(cors());
app.use(bodyParser.json());

let results = [];

app.post('/api/guess', (req, res) => {
    const { task, coords, wallet, distance, reward } = req.body;
    const entry = {
        id: Date.now(),
        task,
        coords,
        wallet,
        distance,
        reward,
        timestamp: new Date().toISOString()
    };
    results.push(entry);
    res.json({ success: true, message: "Result saved.", entry });
});

app.get('/api/history/:wallet', (req, res) => {
    const wallet = req.params.wallet;
    const userResults = results.filter(r => r.wallet === wallet);
    res.json(userResults);
});

app.get('/api/leaderboard', (req, res) => {
    const leaderboard = results.reduce((acc, r) => {
        const existing = acc.find(u => u.wallet === r.wallet);
        if (existing) {
            existing.total += r.reward;
        } else {
            acc.push({ wallet: r.wallet, total: r.reward });
        }
        return acc;
    }, []);

    leaderboard.sort((a, b) => b.total - a.total);

    res.json(leaderboard);
});

app.listen(PORT, () => {
    console.log(`Mock API running on http://localhost:${PORT}`);
});
