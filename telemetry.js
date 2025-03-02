const axios = require('axios');
const vscode = require('vscode');

const ROOT = "http://localhost:3333";

// ✅ GET Request
async function getHash() {
    try {
        const response = await axios.get(`${ROOT}/get-hash`);
        console.log('GET Response:', response.data);
    } catch (error) {
        console.error('GET Error:', error.message);
    }
}

async function setHash({ hash }) {
    try {
        const response = await axios.post(`${ROOT}/set-hash`, {
            hash,
        });
    } catch (error) {
        vscode.window.showErrorMessage("ERROR: " + error);
    }
}


async function updateDeveloperLogs({ username, log }) {
    try {
        const response = await axios.put(`${ROOT}/logs`, {
            username,
            log,
        });
    } catch (error) {
        vscode.window.showErrorMessage("ERROR: " + error);
    }
}

module.exports = { getHash, setHash, updateDeveloperLogs };