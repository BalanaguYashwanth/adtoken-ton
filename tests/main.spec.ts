import { Cell, beginCell, toNano } from "@ton/core";
import { hex } from '../build/main.compiled.json';
import { Blockchain, SandboxContract, TreasuryContract } from "@ton/sandbox";
import { MainContract } from "../wrappers/MainContract";
import {compile} from "@ton-community/blueprint";
import "@ton/test-utils";

describe('main.fc contract tests', ()=>{

    let blockchain: Blockchain;
    let myContract: SandboxContract<MainContract>;
    let senderWallet: SandboxContract<TreasuryContract>;
    let adminWallet: SandboxContract<TreasuryContract>;
    let affiliateWallet: SandboxContract<TreasuryContract>;
    let codeCell: Cell;

    beforeAll(async () => {
        codeCell = await compile("MainContract") as any;
    });

    beforeEach(async ()=>{
        blockchain = await Blockchain.create();
        // const codeCell = await Cell.fromBoc(Buffer.from(hex, 'hex'))[0];
        const companyNameCell = beginCell().storeBuffer(Buffer.from('test company','utf-8')).endCell();
        const originalUrlCell = beginCell().storeBuffer(Buffer.from('www.originalUrl.com', 'utf-8')).endCell();
        const categoryCell = beginCell().storeBuffer(Buffer.from('gaming', 'utf-8')).endCell();

        senderWallet = await blockchain.treasury('sender');
        adminWallet = await blockchain.treasury('adminWallet');
        affiliateWallet = await blockchain.treasury('affiliateWallet');

        const config = {
            adminAddress: adminWallet.address,
            budget: 1,
            campaignWalletAddress: senderWallet.address,
            category: categoryCell,
            companyName: companyNameCell,
            originalUrl: originalUrlCell,
        }
        const createConfig = await MainContract.createFromConfig(config, codeCell);
        myContract = await blockchain.openContract(createConfig);
    })

    it("Campaign creation tests", async()=>{
        await myContract.sendCampaignCreation(senderWallet.getSender(), toNano("5"), 1);

        const withdrawRequest = await myContract.sendWithdrawRequest(adminWallet.getSender(), toNano("0.05"), affiliateWallet.address, toNano("1"));
        expect(withdrawRequest.transactions).toHaveTransaction({
            from: myContract.address,
            to: affiliateWallet.address,
            success: true,
            value: toNano(1),
          });


        const data = await myContract.getContractBalance();
        console.log('data--->', data)
    })
})