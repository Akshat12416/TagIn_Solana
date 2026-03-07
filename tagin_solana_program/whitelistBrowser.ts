import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import fs from "fs";
import { Keypair, Connection, PublicKey } from "@solana/web3.js";

const BROWSER_WALLET_PUBKEY = "CRXkwS79isocDJAzseDxVpJe4Cw13yYcM8kzWZyiWmCs";

async function main() {
  const connection = new Connection("https://api.devnet.solana.com", "confirmed");
  
  const idlBytes = fs.readFileSync("./target/idl/tagin_solana_program.json", "utf-8");
  const idl = JSON.parse(idlBytes);

  // Load the keypair from ~/.config/solana/id.json
  const secretKeyPath = `${process.env.HOME}/.config/solana/id.json`;
  const secretKey = JSON.parse(fs.readFileSync(secretKeyPath, "utf-8"));
  const adminKeypair = Keypair.fromSecretKey(new Uint8Array(secretKey));

  const wallet = new anchor.Wallet(adminKeypair);
  const provider = new anchor.AnchorProvider(connection, wallet, { preflightCommitment: "confirmed" });
  anchor.setProvider(provider);

  const program = new Program(idl as anchor.Idl, provider);

  console.log("Admin Wallet:", adminKeypair.publicKey.toBase58());
  console.log("Whitelisting:", BROWSER_WALLET_PUBKEY);

  try {
    const userPubkey = new PublicKey(BROWSER_WALLET_PUBKEY);

    // 1. Initialize Global State if it hasn't been initialized yet
    const [globalStatePda] = PublicKey.findProgramAddressSync(
      [Buffer.from("global_state")],
      program.programId
    );

    const globalStateInfo = await connection.getAccountInfo(globalStatePda);
    if (!globalStateInfo) {
      console.log("Initializing Global State...");
      const txInit = await program.methods
        .initializeGlobal()
        .accounts({
          globalState: globalStatePda,
          admin: adminKeypair.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([adminKeypair])
        .rpc();
      console.log("Global State Initialized! Signature:", txInit);
    } else {
      console.log("Global State already initialized.");
    }

    // 2. Add to Whitelist
    const [whitelistPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("whitelist"), userPubkey.toBuffer()],
      program.programId
    );

    console.log("Adding to whitelist...");
    const txAdd = await program.methods
      .addToWhitelist(userPubkey)
      .accounts({
        globalState: globalStatePda,
        admin: adminKeypair.publicKey,
        whitelistEntry: whitelistPda,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([adminKeypair])
      .rpc();
      
    console.log("Successfully Whitelisted! Signature:", txAdd);

  } catch (error) {
    console.error("Error during operations:", error);
  }
}

main();
