import { Cell, beginCell, toNano } from "@ton/core";
import { hex } from '../build/main.compiled.json';
import { Blockchain, SandboxContract, TreasuryContract } from "@ton/sandbox";
import {  MainContract } from "../wrappers/MainContract";
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
        //todo - disable while deploying
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
        
        const campaignconfig = {
            budget: 1,
            campaignWalletAddress: senderWallet.address,
            category: categoryCell,
            companyName: companyNameCell,
            originalUrl: originalUrlCell,
            campaignHashAddress: senderWallet.address,
        }
        const sentMessageResult = await myContract.sendCampaignCreation(senderWallet.getSender(), toNano("1"),campaignconfig);

        
        expect(sentMessageResult.transactions).toHaveTransaction({
            from: senderWallet.address,
            to: myContract.address,
            success: true,
          });
         
          const campaignconfig1 = {
            budget: 1,
            campaignWalletAddress: affiliateWallet.address,
            category: categoryCell,
            companyName: companyNameCell,
            originalUrl: originalUrlCell,
            campaignHashAddress: affiliateWallet.address,
        }
        const sentMessageResult1 = await myContract.sendCampaignCreation(senderWallet.getSender(), toNano("1"),campaignconfig1);

        expect(sentMessageResult1.transactions).toHaveTransaction({
            from: senderWallet.address,
            to: myContract.address,
            success: true,
          });

          const data1 = await myContract.getContractBalance();
          console.log('before balance--->', data1)

          const withdrawRequest = await myContract.sendWithdrawRequest(adminWallet.getSender(), toNano("0.05"), affiliateWallet.address, toNano("1.4")); //this 1.4 should be same
          expect(withdrawRequest.transactions).toHaveTransaction({
              from: myContract.address,
              to: affiliateWallet.address,
              success: true,
              value: toNano(1.4),  //this 1.4 should be same
            });
  
  
          const data = await myContract.getContractBalance();
          console.log('after balance--->', data)
    })

    it('other', async ()=>{
        const companyNameCell = beginCell().storeBuffer(Buffer.from('test company','utf-8')).endCell();
        const originalUrlCell = beginCell().storeBuffer(Buffer.from('www.originalUrl.com', 'utf-8')).endCell();
        const categoryCell = beginCell().storeBuffer(Buffer.from('gaming', 'utf-8')).endCell();

        const campaignconfig1 = {
            budget: 1,
            campaignWalletAddress: affiliateWallet.address,
            category: categoryCell,
            companyName: companyNameCell,
            originalUrl: originalUrlCell,
            campaignHashAddress: affiliateWallet.address,
        }
        const sentMessageResult1 = await myContract.sendCampaignCreation(senderWallet.getSender(), toNano("1"),campaignconfig1);

        expect(sentMessageResult1.transactions).toHaveTransaction({
            from: senderWallet.address,
            to: myContract.address,
            success: true,
          });
    })

    it('affiliate creation', async()=>{
        const shortner_url = beginCell().storeBuffer(Buffer.from('www.shortUrl.com', 'utf-8')).endCell();
        const original_url = beginCell().storeBuffer(Buffer.from('www.originalUrl.com', 'utf-8')).endCell();

        const affiliateconfig = {
            affiliate_address: affiliateWallet.address,
            campaign_address: senderWallet.address,
            shortner_url,
            original_url,
            total_clicks: 2,
            total_earned: 1,
            affiliateHashAddress: affiliateWallet.address
        }
        const sendAffiliateResult = await myContract.sendAffiliateCreation(senderWallet.getSender(), toNano("1"), affiliateconfig);
        
        expect(sendAffiliateResult.transactions).toHaveTransaction({
            from: senderWallet.address,
            to: myContract.address,
            success: true,
          });
          
          const affiliateconfig1 = {
            affiliate_address: adminWallet.address,
            campaign_address: senderWallet.address,
            shortner_url,
            original_url,
            total_clicks: 2,
            total_earned: 1,
            affiliateHashAddress: adminWallet.address
        }
        const sendAffiliateResult1 = await myContract.sendAffiliateCreation(senderWallet.getSender(), toNano("1"), affiliateconfig1);
        
        expect(sendAffiliateResult1.transactions).toHaveTransaction({
            from: senderWallet.address,
            to: myContract.address,
            success: true,
          });
    })

    // it('withdraw', async()=>{
    //     const withdrawRequest = await myContract.sendWithdrawRequest(adminWallet.getSender(), toNano("0.05"), affiliateWallet.address, toNano("1"));
    //     expect(withdrawRequest.transactions).toHaveTransaction({
    //         from: myContract.address,
    //         to: affiliateWallet.address,
    //         success: true,
    //         value: toNano(1),
    //       });


    //     const data = await myContract.getContractBalance();
    //     console.log('data--->', data)
    // })
})