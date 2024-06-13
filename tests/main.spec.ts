import { Cell, beginCell, toNano } from "@ton/core";
import { hex } from '../build/main.compiled.json';
import { Blockchain } from "@ton/sandbox";
import { MainContract } from "../wrappers/MainContract";
import "@ton/test-utils";

describe('main.fc contract tests', ()=>{
    it("our first tests", async()=>{
        const blockchain = await Blockchain.create();
        const codeCell = await Cell.fromBoc(Buffer.from(hex, 'hex'))[0];
        const nameCell = beginCell().storeBuffer(Buffer.from('{name:yash, age:20}', 'utf-8')).endCell();
        const senderWallet = await blockchain.treasury('sender');
        const initWallet = await blockchain.treasury('initWallet')
        const config = {
            address: senderWallet.address,
            counter: 1,
            name: nameCell,
        }
        const createConfig = await MainContract.createFromConfig(config, codeCell);
        const myContract = await blockchain.openContract(createConfig);
        
        await myContract.sendIncrementCounter(senderWallet.getSender(), toNano("1"), 1, 1, initWallet.address);

        const data = await myContract.getData();
        const decodeNameCell = data.name
        const nameSlice = decodeNameCell.beginParse();
        const nameBytes = nameSlice.preloadBuffer(nameSlice.remainingBits / 8); // Preload the buffer from the slice
        const name = Buffer.from(nameBytes).toString('utf-8'); // Convert buffer to string
        expect(name).toBe('{name:yash, age:20}')
        expect(data.counter).toBe(3)
    })
})