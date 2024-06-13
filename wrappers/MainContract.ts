import { Address, Contract, Cell, contractAddress, beginCell, ContractProvider, SendMode } from "@ton/core";

export type createConfigTypes = {
    address: Address,
    counter: number,
    name: Cell,
}

const MainContractData = (config: createConfigTypes) => {
    return beginCell().storeAddress(config.address).storeUint(config.counter, 32).storeRef(config.name).endCell();
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


    async sendIncrementCounter(provider: ContractProvider, sender: any ,value: bigint, op: number, incrementBy: number, ownerAddres: Address){
        await provider.internal(sender,{
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().storeUint(op, 32).storeUint(incrementBy, 32).storeAddress(ownerAddres).endCell(),
        })
    }

    async getData(provider: ContractProvider){
        const {stack} = await provider.get('get_contract_latest_counter', []);
        return { address: stack.readAddress(), counter: stack.readNumber(), name: stack.readCell()}
    }
}