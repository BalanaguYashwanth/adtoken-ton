import { Cell, beginCell, toNano } from "@ton/core";
import { hex } from '../build/main.compiled.json';
import { Blockchain, SandboxContract, TreasuryContract } from "@ton/sandbox";
import { AffiliateContractData, CampaignContractData, MainContract } from "../wrappers/MainContract";
import {compile} from "@ton-community/blueprint";
import "@ton/test-utils";
import { generateUniqueHashFromAddress } from "../helpers";

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
        const codeCell = await Cell.fromBoc(Buffer.from(hex, 'hex'))[0];

        senderWallet = await blockchain.treasury('sender');
        adminWallet = await blockchain.treasury('adminWallet');
        affiliateWallet = await blockchain.treasury('affiliateWallet');

        const config = {
            adminAddress: adminWallet.address,
        }

        const createConfig = await MainContract.createFromConfig(config, codeCell);
        myContract = await blockchain.openContract(createConfig);
    })

    it("Campaign creation tests", async()=>{
        const companyNameCell = beginCell().storeBuffer(Buffer.from('test company','utf-8')).endCell();
        const originalUrlCell = beginCell().storeBuffer(Buffer.from('www.originalUrl.com', 'utf-8')).endCell();
        const categoryCell = beginCell().storeBuffer(Buffer.from('gaming', 'utf-8')).endCell();

        const campaignUniqueHash = await generateUniqueHashFromAddress(senderWallet.address.toString())
        const campaignUniqueHashHexString = campaignUniqueHash.toString('hex')
        
        const campaignconfig = {
            budget: 1,
            campaignWalletAddress: senderWallet.address,
            category: categoryCell,
            companyName: companyNameCell,
            originalUrl: originalUrlCell,
            campaignUniqueHashHexString: campaignUniqueHashHexString,
        }
        const sentMessageResult = await myContract.sendCampaignCreation(senderWallet.getSender(), toNano("5"), CampaignContractData(campaignconfig));
        
        expect(sentMessageResult.transactions).toHaveTransaction({
            from: myContract.address,
            to: senderWallet.address,
            success: true,
          });

        const shortner_url = beginCell().storeBuffer(Buffer.from('www.shortUrl.com', 'utf-8')).endCell();
        const original_url = beginCell().storeBuffer(Buffer.from('www.originalUrl.com', 'utf-8')).endCell();

        const affiliateconfig = {
            affiliate_address: affiliateWallet.address,
            campaign_address: senderWallet.address,
            shortner_url,
            original_url,
            total_clicks: 2,
            total_earned: 1,
            campaignUniqueHashHexString: campaignUniqueHashHexString
        }
        await myContract.sendCampaignCreation(senderWallet.getSender(), toNano("5"), AffiliateContractData(affiliateconfig));
        

        // const withdrawRequest = await myContract.sendWithdrawRequest(adminWallet.getSender(), toNano("0.05"), affiliateWallet.address, toNano("1"));
        // expect(withdrawRequest.transactions).toHaveTransaction({
        //     from: myContract.address,
        //     to: affiliateWallet.address,
        //     success: true,
        //     value: toNano(1),
        //   });


        // const data = await myContract.getContractBalance();
        // console.log('data--->', data)
    })
})