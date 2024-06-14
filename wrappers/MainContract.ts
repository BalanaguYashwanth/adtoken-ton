import { Address, Contract, Cell, contractAddress, beginCell, ContractProvider, SendMode, Sender } from "@ton/core";

export type createConfigTypes = {
    adminAddress: Address,
    budget: number,
    campaignWalletAddress : Address,
    category: Cell,
    companyName: Cell,
    originalUrl: Cell,
}

export const MainContractData = (config: createConfigTypes): Cell => {
    return beginCell().storeAddress(config.adminAddress).storeUint(config.budget, 32).storeAddress(config.campaignWalletAddress).storeRef(config.category).storeRef(config.companyName).storeRef(config.originalUrl).endCell();
}

export class MainContract implements Contract{
    constructor(
        readonly address: Address, readonly init?: {code: Cell, data: Cell}
    ){}

    static createFromConfig(config: createConfigTypes, code: Cell, workchain = 0){
        const data = MainContractData(config);
        const init = {code, data}
        const address = contractAddress(workchain,init);
        return new MainContract(address, init)
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint){
        await provider.internal(via,{
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell()
        })
    }

    async sendCampaignCreation(provider: ContractProvider, sender: any, value: bigint, op: number){
        await provider.internal(sender, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().storeUint(op, 32).endCell(),
        })
    }

    async sendWithdrawRequest(provider: ContractProvider, sender : Sender ,value: bigint, affiliateAddress: Address ,amount: bigint) {

        const msg_body = beginCell()
            .storeUint(3, 32)
            .storeCoins(amount)
            .storeAddress(affiliateAddress)
            .endCell()

        await provider.internal(sender, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: msg_body
        })
    }

    async getContractBalance(provider: ContractProvider){
        const {stack} = await provider.get('balance', []);
        return { balanace: stack.readNumber()}
    }
}