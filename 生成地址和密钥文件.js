const fs = require('fs');
const crypto = require('crypto');
const TronWeb = require('tronweb');
const readline = require('readline');

const encryptedFilePath = 'encrypted_privateKeys.txt';
const addressFilePath = 'address.txt';

const encryptionKeyBase64 = 'an4dlV9ju1ZM04R_o-2RDwl7fxX-nGZQRHYc5N5OchM=';
const encryptionKey = Buffer.from(encryptionKeyBase64, 'base64'); // Decode base64

const algorithm = 'aes-256-cbc';

function generatePrivateKeyAndAddress(index, mnemonic) {
    const path = `m/44'/195'/0'/0/${index}`;
    const privateKeyObject = TronWeb.fromMnemonic(mnemonic, path);
    const privateKey = privateKeyObject.privateKey;
    const address = privateKeyObject.address;

    console.log(` ${address}`);

    return { index, address, privateKey };
}

function encryptPrivateKey(privateKey, key) {
    // Remove '0x' prefix if it exists
    if (privateKey.startsWith('0x')) {
        privateKey = privateKey.substring(2);
    }

    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(privateKey, 'hex', 'hex');
    encrypted += cipher.final('hex');
    return { iv: iv.toString('hex'), encryptedPrivateKey: encrypted };
}

function saveToEncryptedFile(encryptedStream, addressStream, data) {
    const encryptedData = encryptPrivateKey(data.privateKey, encryptionKey);
    const encryptedDataString = `${data.address}\n-${encryptedData.iv}-${encryptedData.encryptedPrivateKey}\n`;
    encryptedStream.write(encryptedDataString);

    // Save address to address.txt
    addressStream.write(`${data.address}\n`);
}

async function generateAndSaveKeys() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    try {
        const mnemonic = await new Promise((resolve) => {
            rl.question('Enter your mnemonic: ', (answer) => {
                resolve(answer.trim());
                rl.close();
            });
        });

        const encryptedStream = fs.createWriteStream(encryptedFilePath);
        const addressStream = fs.createWriteStream(addressFilePath);

        for (let i = 1; i <= 10000; i++) {
            const data = generatePrivateKeyAndAddress(i, mnemonic);
            saveToEncryptedFile(encryptedStream, addressStream, data);
        }

        encryptedStream.end();
        addressStream.end();

        console.log('Encrypted addresses/privateKeys saved to encrypted_privateKeys.txt');
        console.log('Addresses saved to address.txt');
    } catch (error) {
        console.error('Error:', error.message);
    }
}

generateAndSaveKeys();
