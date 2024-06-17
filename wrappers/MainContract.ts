import { Address, Contract, Cell, contractAddress, beginCell, ContractProvider, SendMode, Sender, Dictionary } from "@ton/core";

export type createConfigTypes = {
    adminAddress: Address,
}

export type CampaignConfigTypes = {
    budget: number,
    campaignWalletAddress: Address,
    category: Cell,
    companyName: Cell,
    originalUrl: Cell,
    campaignId: number,
};

export type AffiliateConfigTypes = {
    affiliate_address: Address,
    campaignId: number,
    campaign_address: Address,
    shortner_url: Cell,
    original_url: Cell,
    total_clicks: number,
    earned: number,
    affiliateId: number,
}

export const MainContractData = (config: createConfigTypes): Cell => {
    return beginCell().storeAddress(config.adminAddress).storeDict(Dictionary.empty(Dictionary.Keys.Uint(256), Dictionary.Values.Address())).endCell();
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

    async sendCampaignCreation(provider: ContractProvider, sender: any, value: bigint, config: CampaignConfigTypes){
        await provider.internal(sender, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().storeUint(1, 32).storeUint(config.budget, 32).storeAddress(config.campaignWalletAddress).storeRef(config.category).storeRef(config.companyName).storeRef(config.originalUrl).storeUint(config.campaignId, 32).endCell(),
        })
    }

    async sendAffiliateCreation(provider: ContractProvider, sender: any, value: bigint, config: AffiliateConfigTypes){
        await provider.internal(sender, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().storeUint(2, 32).storeAddress(config.affiliate_address).storeUint(config.campaignId, 32).storeAddress(config.campaign_address).storeRef(config.shortner_url).storeRef(config.original_url).storeUint(config.total_clicks, 32).storeUint(config.earned, 32).storeUint(config.affiliateId, 32).endCell(),
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

    async sendUpdateAffiliate(provider: ContractProvider, sender: any, value: bigint, affiliateId: number, earnedCoin: bigint){
        await provider.internal(sender, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().storeUint(4, 32).storeUint(affiliateId, 32).storeUint(earnedCoin, 32).endCell(),
        })
    }

    async getContractBalance(provider: ContractProvider){
        const {stack} = await provider.get('balance', []);
        return { balanace: stack.readNumber()}
    }
}