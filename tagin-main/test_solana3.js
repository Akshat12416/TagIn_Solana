import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import idl from './src/idl.json' with { type: 'json' };

const PROGRAM_ID = new PublicKey(idl.address);

async function run() {
  const connection = new Connection(clusterApiUrl('devnet'));
  
  for (let i = 562386; i <= 562390; i++) {
    const idStr = i.toString();
    const [pda] = PublicKey.findProgramAddressSync(
      [Buffer.from("product"), Buffer.from(idStr)],
      PROGRAM_ID
    );
    const info = await connection.getAccountInfo(pda);
    console.log(`ID ${idStr} PDA: ${pda.toBase58()} - ${info ? "EXISTS" : "Free"}`);
  }
}

run().catch(console.error);
