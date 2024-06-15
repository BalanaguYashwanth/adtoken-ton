import { Blockchain } from '@ton/sandbox';
import { mnemonicToWalletKey } from 'ton-crypto';
import { sha256 } from 'ton-crypto';
import { Address } from 'ton-core';

export const getTestNetWalletAddress = async (mnemonic: string) => {
    const walletKey = await mnemonicToWalletKey([mnemonic]);
    const blockchain = await Blockchain.create();
    const wallet = await blockchain.treasury(walletKey.publicKey.toString());
    return  wallet?.address
}

export async function generateUniqueHashFromAddress(walletAddress: string): Promise<Buffer> {
    const address = Address.parse(walletAddress);
    const addressBytes = address.hash;
    const nonce = Buffer.from(Date.now().toString());
    const dataToHash = Buffer.concat([addressBytes, nonce]);
    const hash = await sha256(dataToHash);
    return hash;
}