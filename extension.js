const vscode = require("vscode");
const { hashAll } = require("./hashall.js");
const { extractApiKey } = require("./extractApiKey");
const { hideApiKey } = require("./hideApiKey");
const { copyAction, pasteAction } = require("./anticopy");

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

  const copyCommand = vscode.commands.registerCommand('extension.handleCopyAction', async () => {
    await copyAction();
  });

  const pasteCommand = vscode.commands.registerCommand('extension.handlePasteAction', async () => {
    await pasteAction();
  });

  context.subscriptions.push(
    hashAllCommand,
    hideCommand,
    extractCommand,
    copyCommand,
    pasteCommand,
    disposable
  );
}

function deactivate() { }

module.exports = { activate, deactivate };
