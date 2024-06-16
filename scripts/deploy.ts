import { toNano } from "ton-core";
import { Address } from "@ton/core";
import { compile, NetworkProvider } from "@ton/blueprint";
import { MainContract } from "../wrappers/MainContract";

export async function run(provider: NetworkProvider) {
  try{
    const myContract = MainContract.createFromConfig(
      {
        adminAddress: Address.parse("admin-address"),
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