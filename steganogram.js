const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const vscode = require("vscode");
const { encrypt, decrypt } = require("./encryption");

const MARKER ="  \t  \t"; 
const LOG_DIR = path.join(vscode.workspace.rootPath || __dirname, "log_data");
const DISPLAY_DIR = path.join(vscode.workspace.rootPath || __dirname, "log_display");
const METADATA_FILE = path.join(LOG_DIR, ".stegonogram.meta");
const LOG_FILE = path.join(LOG_DIR, ".stegonogram.log");
const PASSPHRASE_FILE = path.join(LOG_DIR, ".passphrase");


async function savePassphrase(passkey) {
    const encryptedPasskey = encrypt(passkey);
    fs.writeFileSync(   PASSPHRASE_FILE, encryptedPasskey, "utf8");
}

async function verifyPassphrase(passkey) {
    if (!fs.existsSync(PASSPHRASE_FILE)) return false;
    const storedEncryptedPasskey = fs.readFileSync(PASSPHRASE_FILE, "utf8");
    return storedEncryptedPasskey === encrypt(passkey);
}

async function getAllSourceFiles() {
    const files = await vscode.workspace.findFiles("**/*.{js,ts,py,java,jsx,txt}", "**/{node_modules,.git}/**");
    return files.map(file => file.fsPath);
}

async function injectSignatures() {

    
    [LOG_DIR, DISPLAY_DIR].forEach(dir => {
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    });
    

    const passkey = await vscode.window.showInputBox({
        placeHolder: "Enter a secret passkey for encryption",
        password: true
    });

    if (!passkey) {
        vscode.window.showErrorMessage("Passkey is required to inject signatures.");
        return;
    }

    await savePassphrase(passkey);

    let fileSignatures = {};
    const files = await getAllSourceFiles();

    files.forEach((filePath) => {
        try {
            let content = fs.readFileSync(filePath, "utf8");
            let lines = content.split("\n");

            let markersAdded = 0;
            for (let i = 0; i < lines.length; i += Math.floor(lines.length / 5) || 1) {
                lines[i] += MARKER;
                markersAdded++;
            }

            fs.writeFileSync(filePath, lines.join("\n"), "utf8");
            fileSignatures[filePath] = markersAdded;
        } catch (error) {
            console.error(`Error processing ${filePath}:`, error);
        }
    });

    fs.writeFileSync(METADATA_FILE, encrypt(JSON.stringify(fileSignatures)), "utf8");
    vscode.window.showInformationMessage("Signatures injected successfully!");
}

async function checkSignatureTampering(filePath) {
    if (!fs.existsSync(METADATA_FILE)) return;

    let fileSignatures = JSON.parse(decrypt(fs.readFileSync(METADATA_FILE, "utf8")));
    if (!fileSignatures[filePath]) return;

    let logData = "";
    let tamperingDetected = false;

    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, "utf8");
        let markersPresent = (content.match(new RegExp(MARKER, "g")) || []).length;
        let originalCount = fileSignatures[filePath];

        if (markersPresent === 0) {
            logData += `[${new Date().toISOString()}]  ${filePath}: ALL signatures removed! Possible full replacement.\n`;
            tamperingDetected = true;
        } else {
            let removedCount = originalCount - markersPresent;
            let removedPercentage = (removedCount / originalCount) * 100;

            if (removedPercentage >= 50) {
                logData += `[${new Date().toISOString()}] ⚠️ ${filePath}: Removed ${removedCount}/${originalCount} signatures.\n`;
                tamperingDetected = true;
            }
        }
    }

    if (tamperingDetected) {
        fs.appendFileSync(LOG_FILE, encrypt(logData) + "\n", "utf8");
        vscode.window.showWarningMessage("⚠️ Signature tampering detected! Logs updated.");
    }
}

function registerOnSaveCheck(context) {
    let saveEvent = vscode.workspace.onDidSaveTextDocument((document) => {
        const filePath = document.fileName;
        checkSignatureTampering(filePath);
    });

    context.subscriptions.push(saveEvent);
}

async function decryptLogFiles() {

    [LOG_DIR, DISPLAY_DIR].forEach(dir => {
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    });

    const passkey = await vscode.window.showInputBox({
        placeHolder: "Enter your secret passkey to decrypt logs",
        password: true
    });

    if (!passkey || !(await verifyPassphrase(passkey))) {
        vscode.window.showErrorMessage(" Invalid passkey. Cannot decrypt logs.");
        return;
    }

    if (!fs.existsSync(LOG_FILE) && !fs.existsSync(METADATA_FILE)) {
        vscode.window.showWarningMessage("⚠️ No logs or metadata found.");
        return;
    }

    if (fs.existsSync(LOG_FILE)) {
        const logOutput = decrypt(fs.readFileSync(LOG_FILE, "utf8"));
        fs.writeFileSync(path.join(DISPLAY_DIR, "decrypted_logs.txt"), logOutput, "utf8");
    }

    if (fs.existsSync(METADATA_FILE)) {
        const metadataOutput = JSON.stringify(JSON.parse(decrypt(fs.readFileSync(METADATA_FILE, "utf8"))), null, 2);
        fs.writeFileSync(path.join(DISPLAY_DIR, "decrypted_metadata.json"), metadataOutput, "utf8");
    }

    vscode.window.showInformationMessage(" Logs decrypted! Files saved in 'log_display' folder.");
}

module.exports = { injectSignatures, decryptLogFiles, checkSignatureTampering, registerOnSaveCheck }; 
