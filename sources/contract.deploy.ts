import { beginCell, contractAddress, toNano, Address } from "@ton/ton";
import { deploy } from "./utils/deploy";
import { printAddress, printDeploy, printHeader } from "./utils/print";
// ================================================================= //
import { NftCollection } from "./output/sample_NftCollection";
// ================================================================= //

(async () => {
    const OFFCHAIN_CONTENT_PREFIX = 0x01;
    const string_first = "https://api-dev.ownershipcoin.com/sbt/bo/"; // Change to the content URL you prepared
    let newContent = beginCell().storeInt(OFFCHAIN_CONTENT_PREFIX, 8).storeStringRefTail(string_first).endCell();

    // ===== Parameters =====
    // Replace owner with your address
    let owner = Address.parse("0QB5w8w-1ngiV7Kf737Dc753juBXxqxnBb9JyZnevkOcqXa8"); // 🔴🔴🔴

    // Prepare the initial code and data for the contract
    let init = await NftCollection.init(owner, newContent);

    let address = contractAddress(0, init);
    let deployAmount = toNano("0.15");
    let testnet = true;

    // The Transaction body we want to pass to the smart contract
    let body = beginCell().endCell();

    // Do deploy
    await deploy(init, deployAmount, body, testnet);
    printHeader("sampleNFT_Contract");
    printAddress(address);
})();
