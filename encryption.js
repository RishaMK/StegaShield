const crypto = require("crypto");

const ENCRYPTION_KEY = "12345678901234567890123456789012"; 
const BlockSize = 16; 

/**
 * @param {string} text
 */
function encrypt(text) {
    const iv = Buffer.alloc(BlockSize, 0);
    const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(ENCRYPTION_KEY), iv);
    let encrypted = cipher.update(text, "utf8", "hex") + cipher.final("hex");
    return encrypted;
}

/**
 * @param {string} encryptedText
 */
function decrypt(encryptedText) {
    if (!encryptedText || typeof encryptedText !== "string") {
        throw new Error("Invalid encrypted data. Expected a hex string.");
    }

    const iv = Buffer.alloc(BlockSize, 0);
    const decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(ENCRYPTION_KEY), iv);
    
    let decrypted = decipher.update(encryptedText.trim(), "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
}


module.exports = { encrypt, decrypt };
