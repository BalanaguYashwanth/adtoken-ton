import { Blockchain } from '@ton/sandbox';
import { mnemonicToWalletKey } from 'ton-crypto';
import { sha256 } from 'ton-crypto';
import { getHttpEndpoint } from "@orbs-network/ton-access";
import { Address } from 'ton-core';
import { TonClient, WalletContractV4 } from '@ton/ton';

export const getWalletAddress = async (mnemonic: string): Promise<Address> => {
    const endpoint = await getHttpEndpoint({ network: "testnet" });
    const client = new TonClient({ endpoint });
    const keypair = await mnemonicToWalletKey([mnemonic]);
    const wallet = WalletContractV4.create({ 
        publicKey: keypair.publicKey,
        workchain: 0
      });
    console.log('wallet--->', wallet.address)
      const walletContract = client.open(wallet);
      const walletSender = walletContract.sender(keypair.secretKey);
      const seqno = await walletContract.getSeqno();
      console.log("manager wallet seqno:", seqno.toString());

      const adsAddress = Address.parse(''); 
      console.log("adsAddress=====>", adsAddress.toString());

    return adsAddress
}

export async function generateUniqueHashFromAddress(walletAddress: string): Promise<Buffer> {
    const address = Address.parse(walletAddress);
    const addressBytes = address.hash;
    const nonce = Buffer.from(Date.now().toString());
    const dataToHash = Buffer.concat([addressBytes, nonce]);
    const hash = await sha256(dataToHash);
    return hash;
}