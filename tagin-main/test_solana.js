import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import idl from './src/idl.json' with { type: 'json' };

const PROGRAM_ID = new PublicKey(idl.address);

async function run() {
  const connection = new Connection(clusterApiUrl('devnet'));
  
  const idStr = "100001";
  const [productInfoPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("product"), Buffer.from(idStr)],
    PROGRAM_ID
  );
  console.log("Product Info PDA for", idStr, ":", productInfoPda.toBase58());
  
  const info = await connection.getAccountInfo(productInfoPda);
  console.log("Account Info:", info ? "Exists" : "Does Not Exist");
}

run().catch(console.error);
