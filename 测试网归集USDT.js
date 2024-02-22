const fs = require('fs').promises;
const crypto = require('crypto');

// 读取文件中的地址和私钥
async function readAddressesAndKeysFromFile(filePath) {
    try {
        const data = await fs.readFile(filePath, 'utf-8');
        const lines = data.trim().split('\n');
        const addressesAndKeys = [];

        for (let i = 0; i < lines.length; i += 2) {
            const address = lines[i].trim();

            let privateKey = lines[i + 1].trim();
            privateKey = decryptPrivateKey(privateKey, encryptionKey)

            addressesAndKeys.push({ address, privateKey });
            //console.log("开始迭代地址:", address);
            //console.log("开始迭代密钥数据:", privateKey);
        }

        return addressesAndKeys;
    } catch (error) {
        console.error('Error reading file:', error.message || error);
        throw error;
    }
}



//配置解密需要的信息

const encryptionKeyBase64 = 'an4dlV9ju1ZM04R_o-2RDwl7fxX-nGZQRHYc5N5OchM=';
const encryptionKey = Buffer.from(encryptionKeyBase64, 'base64');
const algorithm = 'aes-256-cbc';


// 解密函数1


function decryptPrivateKey(encryptedDataString, key) {



    const parts = encryptedDataString.split('-');
    const iv = Buffer.from(parts[1], 'hex');
    const encryptedPrivateKey = Buffer.from(parts[2], 'hex');
    //console.log(iv);
    //console.log(encryptedPrivateKey);
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encryptedPrivateKey);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted.toString('hex');

}



// 主函数
async function main() {




    const filePath = 'encrypted_privateKeys.txt'; // 替换为实际文件路径
    const addressesAndKeys = await readAddressesAndKeysFromFile(filePath);

    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    for (const { address, privateKey } of addressesAndKeys) {
        console.log("开始迭代地址:", address);
        //console.log("开始迭代私钥:", privateKey);



        const TronWeb = require('tronweb');
        const HttpProvider = TronWeb.providers.HttpProvider;
        const fullNode = new HttpProvider("https://api.shasta.trongrid.io");
        const solidityNode = new HttpProvider("https://api.shasta.trongrid.io");
        const eventServer = new HttpProvider("https://api.shasta.trongrid.io");
        const tronWeb = new TronWeb(fullNode, solidityNode, eventServer, privateKey);






        tronWeb.setAddress(address);

        const tokenContractAddress = 'TG3XXyExBkPp9nzdajDZsozEu4BkaSJozs';
        const accountAddress = address;

        const getTRC20TokenBalance = async (contractAddress, account) => {
            try {
                const accountHex = tronWeb.address.toHex(account);
                const contract = await tronWeb.contract().at(contractAddress);
                const balance = await contract.balanceOf(accountHex).call();
                return tronWeb.toDecimal(balance._hex);
            } catch (error) {
                console.error('Error al obtener el balance de USDT:', error);
                //throw error;
                return -1;
            }
        };



        const balancefirst = await getTRC20TokenBalance(tokenContractAddress, accountAddress);
        console.log("USDT余额：" + balancefirst / 1000000);


        if (balancefirst > 0) {









            const CONTRACT = "TG3XXyExBkPp9nzdajDZsozEu4BkaSJozs";
            const transferAmount = balancefirst;
            const ACCOUNT = "TL1R6YacZuY2dVqNyreWexzb77Ct2QCick";







            try {
                const { abi } = await tronWeb.trx.getContract(CONTRACT);
                const contract = tronWeb.contract(abi.entrys, CONTRACT);

                //const balance = await contract.methods.balanceOf(ACCOUNT).call();
                // console.log("balance:", balance.toString());

                const resp = await contract.methods.transfer(ACCOUNT, transferAmount).send();
                console.log("transfer:", resp);

                //console.log("完成迭代地址:", address);



                await delay(5000);
            } catch (error) {
                console.error("转账失败:", error);
                // Handle the error as needed, you may want to log the error or perform some other action.
                // The loop will continue to the next iteration even if an error occurs.
            }



            //复核转账后的余额
            const balancecheck = await getTRC20TokenBalance(tokenContractAddress, accountAddress);
            console.log("第二次检查USDT余额：" + balancecheck / 1000000);

        }



    }







}



// 运行主函数
main().then(() => {


    // console.log('Script executed successfully.');


}).catch((error) => {


    //   console.error('Error during script execution:', error.message || error);


});


//更新即使中途有发送失败的循环也不会终止。

