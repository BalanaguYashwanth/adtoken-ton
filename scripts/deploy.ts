import { toNano } from "ton-core";
import { beginCell } from "@ton/core";
import { compile, NetworkProvider } from "@ton/blueprint";
import { MainContract } from "../wrappers/MainContract";
import { getTestNetWalletAddress } from "../helpers";

export async function run(provider: NetworkProvider) {
  try{
    const companyNameCell = beginCell().storeBuffer(Buffer.from('test company','utf-8')).endCell();
    const originalUrlCell = beginCell().storeBuffer(Buffer.from('www.originalUrl.com', 'utf-8')).endCell();
    const categoryCell = beginCell().storeBuffer(Buffer.from('gaming', 'utf-8')).endCell();

    const senderWalletAddress = await getTestNetWalletAddress(process.env.SENDER_MNEMONIC || '')
    const myContract = MainContract.createFromConfig(
      {
        adminAddress: senderWalletAddress,
        budget: 1,
        campaignWalletAddress: senderWalletAddress,
        category: categoryCell,
        companyName: companyNameCell,
        originalUrl: originalUrlCell,
    },
      await compile("MainContract")
    );
  
    const openedContract = provider.open(myContract);
  
    openedContract.sendDeploy(provider.sender(), toNano("0.05"));
  
    await provider.waitForDeploy(myContract.address);
  } catch(err){
  console.log('err--->', err)
 }
}