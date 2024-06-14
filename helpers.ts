import { Blockchain } from '@ton/sandbox';
import { mnemonicToWalletKey } from 'ton-crypto';

export const getTestNetWalletAddress = async (mnemonic: string) => {
    const walletKey = await mnemonicToWalletKey([mnemonic]);
    const blockchain = await Blockchain.create();
    const wallet = await blockchain.treasury(walletKey.publicKey.toString());
    return  wallet?.address
}