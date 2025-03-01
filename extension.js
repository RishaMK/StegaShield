const vscode = require("vscode");
const {
  injectSignatures,
  decryptLogFiles,
  registerOnSaveCheck,
} = require("./steganogram");
const { hashAll } = require("./hashall.js");
const { extractApiKey } = require("./extractApiKey");
const { hideApiKey } = require("./hideApiKey");

/**
 * @param {{ subscriptions: vscode.Disposable[]; }} context
 */
function activate(context) {
  let helloWorldCommand = vscode.commands.registerCommand(
    "extension.helloWorld",
    () => {
      vscode.window.showInformationMessage("steganogram extension is Running!");
    }
  );

  let injectSignaturesCommand = vscode.commands.registerCommand(
    "steganogram.injectSignatures",
    async () => {
      await injectSignatures();
    }
  );

  let decryptLogsCommand = vscode.commands.registerCommand(
    "steganogram.decryptLogs",
    async () => {
      await decryptLogFiles();
    }
  );

  let hashAllCommand = vscode.commands.registerCommand(
    "steganogram.hashAll",
    async () => {
      await hashAll();
    }
  );

  let hideCommand = vscode.commands.registerCommand(
    "extension.hideApiKey",
    function () {
      hideApiKey();
    }
  );

  let extractCommand = vscode.commands.registerCommand(
    "extension.extractApiKey",
    function () {
      extractApiKey();
    }
  );

  const disposable = vscode.commands.registerCommand(
    "stegashield.helloWorld",
    function () {
      vscode.window.showInformationMessage("Hello World from StegaShield!");
    }
  );

  registerOnSaveCheck(context);

  context.subscriptions.push(
    helloWorldCommand,
    injectSignaturesCommand,
    decryptLogsCommand,
    hashAllCommand,
    hideCommand,
    extractCommand,
    disposable
  );
}

function deactivate() {}

module.exports = { activate, deactivate };
