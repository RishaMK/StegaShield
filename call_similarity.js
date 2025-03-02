const { spawn } = require('child_process');
const vscode = require('vscode');

const checkForSimilarity = async (input1, input2) => {
    try {
        const similarity = await new Promise((resolve, reject) => {
            const pythonProcess = spawn(`${__dirname}/venv/bin/python`, [`${__dirname}/similarity.py`, input1, input2]);
            let output = '';
            pythonProcess.stdout.on('data', data => {
                output += data.toString();
            });

            pythonProcess.stderr.on('data', data => {
                reject(data.toString());
            });

            pythonProcess.on('close', () => {
                resolve(output.trim());
            });
        });
        return similarity.toString();
    } catch (error) {
        return null;
    }
}

module.exports = { checkForSimilarity };