import { useEffect, useState } from "react";
import { Address, OpenedContract } from "ton-core";
import { address, beginCell } from "@ton/core";
import {toNano} from 'ton-core'
import { useTonConnect } from "./useTonConnect"; 
import { MainContract } from "../contracts/MainContract";
import { useTonClient } from "./useTonClient";
import { useAsyncInitialize } from "./useAsyncInitialize";
import { generateUniqueHashFromAddress } from "../common/helpers";

export function useMainContract() {
  const client = useTonClient();
  const {sender} = useTonConnect();
  const [balance, setBalance] = useState('')

  const mainContract = useAsyncInitialize(async () => {
    if (!client) return;
    const contract = new MainContract(
      Address.parse("") // todo - replace with your address from tutorial 2 step 8
    );
    return client.open(contract as never) as OpenedContract<MainContract>;
  }, [client]);

  async function getValue() {
    if (!mainContract) return;
    const {balance = 0} = await mainContract.getContractBalance();
    setBalance(balance)
  }

  const sendCreateCampaign = async () => {
    const campaignUniqueHash = await generateUniqueHashFromAddress("")
    const campaignUniqueHashHexString = campaignUniqueHash.toString('hex')

    console.log('campaignUniqueHashHexString--->', campaignUniqueHashHexString)

    const companyNameCell = beginCell().storeBuffer(Buffer.from('test company','utf-8')).endCell();
    const originalUrlCell = beginCell().storeBuffer(Buffer.from('www.originalUrl.com', 'utf-8')).endCell();
    const categoryCell = beginCell().storeBuffer(Buffer.from('gaming', 'utf-8')).endCell();

    
    const campaignconfig = {
      budget: 1,
      campaignWalletAddress: address(""),
      category: categoryCell,
      companyName: companyNameCell,
      originalUrl: originalUrlCell,
      campaignHashAddress: address(""),
    }

    await mainContract?.sendCampaignCreation(sender, toNano("1"), campaignconfig)
  }

  const withdrawCampaign = async () => {
    await mainContract?.sendWithdrawRequest(sender, toNano("0.05"), address(""), toNano("0.5"))
  }

  useEffect(() => {
    getValue();
  }, [mainContract]);

  return {
    contract_address: mainContract?.address.toString(),
    balance,
    sendCreateCampaign,
    withdrawCampaign
  };
}