import { useEffect, useState } from "react";
import {toNano} from 'ton-core'
import { useTonConnect } from "./useTonConnect"; 
import { MainContract } from "../contracts/MainContract";
import { useTonClient } from "./useTonClient";
import { useAsyncInitialize } from "./useAsyncInitialize";
import { Address, OpenedContract } from "ton-core";

export function useMainContract() {
  const client = useTonClient();
  const {sender} = useTonConnect();
  const [balance, setBalance] = useState('')

  const mainContract = useAsyncInitialize(async () => {
    if (!client) return;
    const contract = new MainContract(
      Address.parse("") // replace with your address from tutorial 2 step 8
    );
    return client.open(contract as never) as OpenedContract<MainContract>;
  }, [client]);

  async function getValue() {
    if (!mainContract) return;
    const {balance = 0} = await mainContract.getContractBalance();
    setBalance(balance)
  }

  const sendCreateCampaign = async () => {
    return mainContract?.sendCampaignCreation(sender, toNano("0.05"), 1)
  }

  useEffect(() => {
    getValue();
  }, [mainContract]);

  return {
    contract_address: mainContract?.address.toString(),
    balance,
    sendCreateCampaign
  };
}