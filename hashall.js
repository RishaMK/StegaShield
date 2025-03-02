const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

/**
 * @param {fs.PathLike} filePath
 */
function hashFile(filePath) {
    return new Promise((resolve, reject) => {
        const hash = crypto.createHash('sha256');
        const stream = fs.createReadStream(filePath);
        stream.on('data', chunk => hash.update(chunk));
        stream.on('end', () => resolve(hash.digest('hex')));
        stream.on('error', reject);
    });
}
async function getAllFiles(dirPath) {
    let entries = await fs.promises.readdir(dirPath, { withFileTypes: true });
    let files = await Promise.all(entries.map(async (entry) => {
        let fullPath = path.join(dirPath, entry.name);
        if (fullPath.includes('node_modules')) return [];
        if (fullPath.includes('.git')) return [];
        if (fullPath.includes('venv')) return [];
        if (fullPath.includes('.env')) return [];
        if (fullPath.includes('package-lock')) return [];
        return entry.isDirectory() ? await getAllFiles(fullPath) : fullPath;
    }));
    return files.flat();
}

async function hashAll() {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
        vscode.window.showErrorMessage('No workspace folder found!');
        return;
    }

    const folderPath = workspaceFolders[0].uri.fsPath;
    const outputFilePath = path.join(folderPath, 'file_hashes.txt');

    try {
        let allFiles = await getAllFiles(folderPath);
        let output = '';

        for (let filePath of allFiles) {
            if (filePath === outputFilePath) continue;
            let relativePath = path.relative(folderPath, filePath);
            try {
                let hash = await hashFile(filePath);
                output += `${relativePath}\t${hash}\n`;
            } catch (err) {
                console.error(`Error hashing file: ${relativePath}`, err);
            }
        }

        await fs.promises.writeFile(outputFilePath, output);
        vscode.window.showInformationMessage('Hashes saved to file_hashes.txt');
    } catch (err) {
        vscode.window.showErrorMessage('Error reading files.');
        console.error(err);
    }
}

module.exports = { hashAll }; 
