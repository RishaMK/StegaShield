const vscode = require('vscode');

function embedSpecialData(text) {
    const zeroWidthMap = { '0': '\u200B', '1': '\u200C' }; // ZWSP for 0, ZWNJ for 1
    const hiddenMessage = "MSFT";

    if (hiddenMessage.length > text.length) {
        console.warn('Message is too short');
        return text;
    }

    // Convert message to binary (8-bit per character)
    let binaryData = hiddenMessage.split('')
        .map(char => char.charCodeAt(0).toString(2).padStart(8, '0'))
        .join('');

    let binaryChars = [...binaryData].map(bit => zeroWidthMap[bit]);
    let textArray = text.split(''); // Correctly split text into an array
    let arr = [];

    while (textArray.length > 0 || binaryChars.length > 0) {
        if (textArray.length > 0) {
            arr.push(textArray.shift()); // Take and remove the first char
        }

        let count = Math.floor(Math.random() * 5); // Insert up to 4 hidden chars
        while (count > 0 && binaryChars.length > 0) {
            arr.push(binaryChars.shift()); // Take and remove the first binary char
            count--;
        }
    }

    return arr.join('');
}

function extractSpecialData(text) {
    const zeroWidthMap = { '\u200B': '0', '\u200C': '1' }; // ZWSP → 0, ZWNJ → 1

    // Extract only zero-width characters
    let binaryData = text.split('')
        .filter(char => char in zeroWidthMap)
        .map(char => zeroWidthMap[char])
        .join('');

    if (binaryData.length === 0) {
        return undefined; // No hidden message found
    }

    // Convert binary back to text (8-bit per character)
    let extractedText = binaryData.match(/.{1,8}/g) // Split into 8-bit chunks
        .map(byte => String.fromCharCode(parseInt(byte, 2))) // Convert to characters
        .join('');

    return extractedText;
}



const copyAction = async () => {
    await vscode.commands.executeCommand('editor.action.clipboardCopyAction');
    await new Promise(resolve => setTimeout(resolve, 50));
    const copiedText = await vscode.env.clipboard.readText();
    const embedded = embedSpecialData(copiedText);
    await vscode.env.clipboard.writeText(embedded)
        .then(() => { });
}


const pasteAction = async () => {
    let pastedText = await vscode.env.clipboard.readText();
    let extracted = extractSpecialData(pastedText);
    if (extracted === "MSFT") {
        let x = pastedText.replaceAll('\u200B', '').replaceAll('\u200C', '');
        // vscode.window.showInformationMessage(`x=>${x.length} | ${pastedText.length}`);
        await vscode.env.clipboard.writeText(x)
            .then(() => { });
        vscode.commands.executeCommand('editor.action.clipboardPasteAction'); // Perform actual paste
        await vscode.env.clipboard.writeText(pastedText)
            .then(() => { });
    } else {
        vscode.window.showInformationMessage('UNAUTHORIZED PASTE BUDDY, NOTED BUDDY');
        vscode.commands.executeCommand('editor.action.clipboardPasteAction');
    }
}


module.exports = { copyAction, pasteAction };