// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const {PNG} = require('pngjs');
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "stegashield" is now active!');
	const helloCommand = vscode.commands.registerCommand('helloworld.helloWorld', function () {
        vscode.window.showInformationMessage('aye yarivanu eee manmathanu!');});

		async function hideApiKey() {
			const fileUri = await vscode.window.showOpenDialog({
				canSelectMany: false,
				openLabel: 'Select an image to embed API key',
				filters: { 'Images': ['png'] }
			});
	
			if (!fileUri) {
				vscode.window.showErrorMessage("No image selected!");
				return;
			}
	
			const imagePath = fileUri[0].fsPath;
	
			const apiKey = await vscode.window.showInputBox({ prompt: "Enter API Key to embed" });
			if (!apiKey) {
				vscode.window.showErrorMessage("No API Key entered!");
				return;
			}
			
			// Pad the API key with whitespace to reach the standard length
			const paddedApiKey = apiKey.padEnd(100, ' ');
	
			const outputPath = imagePath.replace('.png', '_hidden.png');
	
			fs.createReadStream(imagePath)
				.pipe(new PNG())
				.on("parsed", function () {
					for (let i = 0; i < paddedApiKey.length; i++) {
						this.data[i] = paddedApiKey.charCodeAt(i); // Embed padded API Key
					}
					this.pack()
						.pipe(fs.createWriteStream(outputPath))
						.on("finish", () => {
							vscode.window.showInformationMessage(`✅ API Key hidden in: ${outputPath}`);
						})
						.on("error", (err) => {
							vscode.window.showErrorMessage("❌ Error writing image: " + err.message);
						});
				})
				.on("error", (err) => {
					vscode.window.showErrorMessage("❌ Error reading image: " + err.message);
				});
		}
	
		// extraction of API key from image
		async function extractApiKey() {
			const fileUri = await vscode.window.showOpenDialog({
				canSelectMany: false,
				openLabel: "Select an image to extract API key",
				filters: { "Images": ["png"] }
			});
		
			if (!fileUri) {
				vscode.window.showErrorMessage("No image selected!");
				return;
			}
		
			const imagePath = fileUri[0].fsPath;
		
			const keyLength = await vscode.window.showInputBox({ 
				prompt: "Enter API Key Length", 
				value: "100" 
			});
			
		
			if (!keyLength) {
				vscode.window.showErrorMessage("No length entered!");
				return;
			}
		
			fs.createReadStream(imagePath)
				.pipe(new PNG())
				.on("parsed", async function () {
					let extractedKey = "";
					// @ts-ignore
					for (let i = 0; i < parseInt(keyLength); i++) {
						extractedKey += String.fromCharCode(this.data[i]);
					}
					
					// Trim the whitespace padding from the extracted key
					const trimmedKey = extractedKey.trim();
		
					// ✅ OPEN AN EDITABLE TEXT BOX WITH THE EXTRACTED API KEY
					const updatedKey = await vscode.window.showInputBox({
						prompt: "Modify the extracted API Key if needed",
						value: trimmedKey
					});
		
					if (updatedKey !== null && updatedKey !== undefined) {
						// Create a completely new PNG to ensure no traces of old key remain
						const dirName = path.dirname(imagePath);
						const baseName = path.basename(imagePath, '.png');
						const timestamp = new Date().getTime();
						const newOutputPath = path.join(dirName, `${baseName}_${timestamp}.png`);
						
						// Create a new PNG with the same dimensions but fresh data
						const newPng = new PNG({
							width: this.width,
							height: this.height,
							colorType: this.colorType,
							inputHasAlpha: true
						});
						
						// Copy all the original image data
						for (let i = 0; i < this.data.length; i++) {
							newPng.data[i] = this.data[i];
						}
						
						// Clean the area where we'll store the key (complete reset)
						const cleanLength = parseInt(keyLength);
						for (let i = 0; i < cleanLength; i++) {
							newPng.data[i] = 32; // ASCII for space character (whitespace)
						}
						
						// Now embed the new key, padded with whitespace
						const paddedKey = updatedKey.padEnd(parseInt(keyLength), ' ');
						const binaryKey = Buffer.from(paddedKey, "utf-8");
						for (let i = 0; i < binaryKey.length; i++) {
							newPng.data[i] = binaryKey[i];
						}
						
						// Write to the new file
						newPng.pack().pipe(fs.createWriteStream(newOutputPath))
							.on("finish", () => {
								// Delete the original file after creating the new one
								fs.unlink(imagePath, (err) => {
									if (err) {
										vscode.window.showErrorMessage(`❌ Couldn't delete original image: ${err.message}`);
									} else {
										vscode.window.showInformationMessage(`✅ API Key completely replaced in: ${newOutputPath} and original image deleted`);
									}
								});
							})
							.on("error", (err) => {
								vscode.window.showErrorMessage("❌ Error writing image: " + err.message);
							});
					}
				})
				.on("error", (err) => {
					vscode.window.showErrorMessage("❌ Error reading image: " + err.message);
				});
		}
		
		let hideCommand = vscode.commands.registerCommand("extension.hideApiKey", function () {
			hideApiKey();
		});
	
		let extractCommand = vscode.commands.registerCommand("extension.extractApiKey", function () {
			extractApiKey();
		});
		
	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	const disposable = vscode.commands.registerCommand('stegashield.helloWorld', function () {
		// The code you place here will be executed every time your command is executed

		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from StegaShield!');
	});

	context.subscriptions.push(disposable);
	context.subscriptions.push(helloCommand);
	context.subscriptions.push(hideCommand);
	context.subscriptions.push(extractCommand);
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}