import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import idl from './src/idl.json' with { type: 'json' };

const PROGRAM_ID = new PublicKey(idl.address);

async function run() {
  const connection = new Connection(clusterApiUrl('devnet'));
  
  const res = await fetch('http://127.0.0.1:5000/api/next-id');
  const data = await res.json();
  const idStr = data.nextId;
  
  const [productInfoPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("product"), Buffer.from(idStr)],
    PROGRAM_ID
  );
  console.log("Next ID from DB:", idStr);
  console.log("Product Info PDA:", productInfoPda.toBase58());
  
  const info = await connection.getAccountInfo(productInfoPda);
  console.log("Account Info:", info ? "Exists (AccountAlreadyInUse!)" : "Does Not Exist");
}

run().catch(console.error);
