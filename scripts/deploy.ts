import { toNano } from "ton-core";
import { compile, NetworkProvider } from "@ton/blueprint";
import { MainContract } from "../wrappers/MainContract";
import { getWalletAddress } from "../helpers";

export async function run(provider: NetworkProvider) {
  try{
    const adminWalletAddress = await getWalletAddress(process.env.SENDER_MNEMONIC || '')
    const myContract = MainContract.createFromConfig(
      {
        adminAddress: adminWalletAddress,
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