const vscode = require("vscode");
const { injectSignatures, decryptLogFiles, registerOnSaveCheck } = require("./steganogram");
const { hashAll } = require("./hashall.js");

/**
 * @param {{ subscriptions: vscode.Disposable[]; }} context
 */
function activate(context) {
    let helloWorldCommand = vscode.commands.registerCommand("steganogram.helloWorld", () => {
        vscode.window.showInformationMessage("steganogram extension is Running!");
    });

    let injectSignaturesCommand = vscode.commands.registerCommand("steganogram.injectSignatures", async () => {
        await injectSignatures();
    });

    let decryptLogsCommand = vscode.commands.registerCommand("steganogram.decryptLogs", async () => {
        await decryptLogFiles();
    });

    let hashAllCommand = vscode.commands.registerCommand("steganogram.hashAll", async () => {
        await hashAll();
    });

    registerOnSaveCheck(context);

    context.subscriptions.push(helloWorldCommand, injectSignaturesCommand, decryptLogsCommand, hashAllCommand);
}

function deactivate() {}

module.exports = { activate, deactivate };
