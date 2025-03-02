const vscode = require("vscode");
const { hashAll } = require("./hashall.js");
const { extractApiKey } = require("./extractApiKey");
const { hideApiKey } = require("./hideApiKey");

/**
 * @param {{ subscriptions: vscode.Disposable[]; }} context
 */
function activate(context) {

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

  context.subscriptions.push(
    hashAllCommand,
    hideCommand,
    extractCommand,
    disposable
  );
}

function deactivate() {}

module.exports = { activate, deactivate };
