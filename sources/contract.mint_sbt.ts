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
import { printAddress, printDeploy, printHeader, printSeparator } from "./utils/print";
import { mnemonicToPrivateKey } from "@ton/crypto";
import * as dotenv from "dotenv";
dotenv.config();
// ================================================================= //
import { NftCollection } from "./output/sample_NftCollection";
import { NftItem } from "./output/sample_NftItem";
// ================================================================= //

(async () => {
    const client4 = new TonClient4({
        endpoint: "https://mainnet-v4.tonhubapi.com",
    });

    let mnemonics = (process.env.mnemonics || "").toString(); // 🔴 Change to your own, by creating .env file!
    let keyPair = await mnemonicToPrivateKey(mnemonics.split(" "));
    let secretKey = keyPair.secretKey;
    let workchain = 0;
    let wallet = WalletContractV4.create({ workchain, publicKey: keyPair.publicKey });
    let wallet_contract = client4.open(wallet);
    console.log("Wallet address: ", wallet_contract.address);

    // Replace owner with your address
    let owner = wallet.address;
    
    // ========================================
    let packed = beginCell()
        .storeUint(0x0f8a7ea5, 32)
        .storeUint(0, 64)
        .storeStringTail("Mint")
        .storeAddress(Address.parse("UQB6b0_RpgUiiT6fF8Tp3YTJDyB95zAyeANrimc3lQ6PdYb3"))
        .endCell();

    // ========================================
    let deployAmount = toNano("0.3");
    let seqno: number = await wallet_contract.getSeqno();
    let balance: bigint = await wallet_contract.getBalance();
    // ========================================
    console.log("Current deployment wallet balance: ", fromNano(balance).toString(), "💎TON");
    printSeparator();
    console.log("Deploying contract to address: ", 'EQDWyQzPVJ4Fv-YMera5E2Zgkv42bBuQV7jtVPaD5QYum11e');
    await wallet_contract.sendTransfer({
        seqno,
        secretKey,
        messages: [
            internal({
                to: 'EQDWyQzPVJ4Fv-YMera5E2Zgkv42bBuQV7jtVPaD5QYum11e',
                value: deployAmount,
                bounce: true,
                body: packed,
            }),
        ],
    });

    let collection_client = client4.open(NftCollection.fromAddress(deployContract));
    console.log("Deployed");
})();
