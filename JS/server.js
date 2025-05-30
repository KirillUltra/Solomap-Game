const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const bs58 = require('bs58');
const { Connection, PublicKey, Keypair, clusterApiUrl } = require('@solana/web3.js');
const { getOrCreateAssociatedTokenAccount, transfer } = require('@solana/spl-token');

dotenv.config();

const app = express();
const PORT = 4000;

app.use(cors());
app.use(bodyParser.json());

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const TOKEN_MINT = new PublicKey(process.env.TOKEN_MINT);
const RPC_URL = process.env.RPC_URL || clusterApiUrl('devnet');

const connection = new Connection(RPC_URL, "confirmed");
const senderKeypair = Keypair.fromSecretKey(bs58.decode(PRIVATE_KEY));

let results = [];

async function sendTokens(receiverWallet, amount) {
    const receiver = new PublicKey(receiverWallet);
    const fromTokenAccount = await getOrCreateAssociatedTokenAccount(connection, senderKeypair, TOKEN_MINT, senderKeypair.publicKey);
    const toTokenAccount = await getOrCreateAssociatedTokenAccount(connection, senderKeypair, TOKEN_MINT, receiver);
    const signature = await transfer(
        connection,
        senderKeypair,
        fromTokenAccount.address,
        toTokenAccount.address,
        senderKeypair.publicKey,
        amount
    );
    return signature;
}

app.post('/api/guess', async (req, res) => {
    const { task, coords, wallet, distance, reward } = req.body;
    if (!wallet) return res.status(400).json({ success: false, message: "Wallet address is required" });
    try {
        const signature = await sendTokens(wallet, reward);
        const entry = {
            id: Date.now(),
            task,
            coords,
            wallet,
            distance,
            reward,
            signature,
            timestamp: new Date().toISOString()
        };
        results.push(entry);
        res.json({ success: true, message: "Tokens sent!", entry });
    } catch (err) {
        console.error("Error sending tokens:", err);
        res.status(500).json({ success: false, message: "Failed to send tokens", error: err.message });
    }
});

app.get('/api/history/:wallet', (req, res) => {
    const wallet = req.params.wallet;
    const userResults = results.filter(r => r.wallet === wallet);
    res.json(userResults);
});

app.get('/api/leaderboard', (req, res) => {
    const leaderboard = results.reduce((acc, r) => {
        const existing = acc.find(u => u.wallet === r.wallet);
        if (existing) existing.total += r.reward;
        else acc.push({ wallet: r.wallet, total: r.reward });
        return acc;
    }, []);
    leaderboard.sort((a, b) => b.total - a.total);
    res.json(leaderboard);
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});