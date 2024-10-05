import {
    Address,
    beginCell,
    contractAddress,
    toNano,
    TonClient4,
    internal,
    fromNano,
    WalletContractV4,
} from "@ton/ton";
import { mnemonicToPrivateKey } from "@ton/crypto";
import { Bot } from 'grammy';
import * as dotenv from "dotenv";
// import { CronJob } from 'cron';
import axios from 'axios';
dotenv.config();
import { NftCollection } from "./sources/output/sample_NftCollection";

// Chat ID of your private group
const privateGroupChatId = '-1002434080239';

async function mintSbt(userAddress: string) {
    if (!userAddress) {
        return;
    }

    console.log('minting for: ' + userAddress);
    const client4 = new TonClient4({
        endpoint: "https://mainnet-v4.tonhubapi.com",
    });

    // OP code and address. Followed tutorial from Howard.
    const opPrefix = 0x01;
    const nftAddressContent = process.env.nftAddress ?? '';
    
    // Construct body based on content.
    let newContent = beginCell()
        .storeInt(opPrefix, 8)
        .storeStringRefTail(nftAddressContent)
        .endCell();

    // Project wallet setup.
    let mnemonics = (process.env.mnemonics || "").toString();
    let keyPair = await mnemonicToPrivateKey(mnemonics.split(" "));
    let secretKey = keyPair.secretKey;
    let workchain = 0;
    let wallet = WalletContractV4.create({ workchain, publicKey: keyPair.publicKey });
    let minterWalletContract = client4.open(wallet);

    // User wallet = owner; Admin project wallet = authority
    let owner = Address.parse(userAddress);
    let authority = wallet.address;

    // Prepare the initial code and data for the contract.
    let init = await NftCollection.init(owner, newContent, authority);
    let deployContract = contractAddress(0, init);

    // Construct body message to mint SBT.
    let packed = beginCell()
        .storeUint(0, 32)
        .storeStringTail("Mint")
        .endCell();

    // ? To be developed: Check balance to ensure minting is always available, send notification if no balance.
    // let balance: bigint = await minterWalletContract.getBalance();

    // Send transaction.
    let seqno: number = await minterWalletContract.getSeqno();
    await minterWalletContract.sendTransfer({
        seqno,
        secretKey,
        messages: [
            internal({
                to: deployContract,
                value: toNano("0.2"),
                init: { code: init.code, data: init.data },
                bounce: true,
                body: packed,
            }),
        ],
    });

    console.log('minted for: ' + userAddress);
};

async function botSendMessage(message: string) {
    // Send the swap notification message with an inline button
    const sentMessage = await bot.api.sendMessage(privateGroupChatId, message, {
        parse_mode: 'HTML',
        message_thread_id: 1
    });
}

async function getSbtToMint() {
    const response = await axios.post(process.env.webUrl ?? '', {}, {
        headers: {
            'X-SBT-API-KEY': process.env.botToken
        }
    });

    if (response.status == 200) {
        for (const element of response.data.data) {
            await mintSbt(element.wallet_address)
        };
    }
}

// getSbtToMint();

const bot = new Bot(process.env.botToken ?? '');
// bot.start();

// Run cron every 5 minutes.
// cron.schedule('5 * * * * *', () => {
    
// });