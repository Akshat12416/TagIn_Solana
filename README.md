# TagIn: Blockchain-Verified Product Authenticity on Solana

**TagIn** is a revolutionary anti-counterfeiting platform built natively on the **Solana Blockchain**. By linking physical NFC tags to cryptographic on-chain data, TagIn empowers manufacturers to permanently register authenticated products and enables consumers to instantly verify a product's origin with zero trust via a simple smartphone tap.

Say goodbye to fake sneakers, counterfeit watches, and forged documents. TagIn bridges the physical gap to Web3 using highly optimized **Program Derived Addresses (PDAs)**.


## Architecture Overview

TagIn is built from the ground up to be ultra-fast and cost-effective on Solana. The ecosystem consists of 4 core pillars:

1. **The Anchor Smart Contract (`tagin_solana_program`)**
   - The heart of the platform written in Rust.
   - Eschews heavy NFT standard protocols to utilize a **Custom PDA Architecture**, driving minting costs down to practically zero (~0.0001 SOL).
   - Manages an administrative `GlobalState` to whitelist approved manufacturers.
   - Maps sequential 6-digit `Token IDs` directly to immutable PDAs holding the product's `metadata_hash`, `manufacturer`, and `owner` public keys.

2. **The Python Aggregation Engine (`taginbackend-main`)**
   - A lightweight Flask + MongoDB backend that securely stages the heavy metadata off-chain (Product Name, Serial Number, Image References, Detailed Specs).
   - Computes deterministic SHA-256 Metadata Hashes to be anchored on the Solana blockchain.
   - Syncs universal 6-digit `Token IDs` continuously across all applications.

3. **Manufacturer & Admin Dashboard (`tagin-main`)**
   - A React-based command center for authorized brands to log in via Phantom Wallet.
   - Intuitive UI to register new physical stock, minting the TagIn PDAs directly to the Solana Devnet.
   - Provides rich, real-time geographic heatmaps and analytics regarding consumer scanning behavior and potential counterfeit interception.

4. **Consumer Verification Portal (`taginUser-main`)**
   - A frictionless mobile-first React application. Consumers tap their NFC-enabled phones on a physical product, triggering an immediate cross-reference between the backend off-chain server and the Solana Smart Contract.
   - Abstracted Web3 experience: Consumers do not need crypto wallets to verify authenticity, as the UI trustlessly queries the public Solana nodes on their behalf!

---

## 🛠 Prerequisites

To run this project locally, ensure you have the following installed:

- **Node.js** (v16+) & **npm**
- **Python 3.9+** & `pip`
- **MongoDB** (running locally or a via a cluster URI)
- **Rust**, **Solana CLI**, and the **Anchor CLI** (to deploy the program).
- A browser with the **Phantom Wallet** extension (configured to Solana Devnet).
- **Whitelisted wallet address** to use the manufacturer side features, the whitelisting of wallet can be done by us if needed.

---

## 🚀 Quick Start Local Development Guide

Since TagIn utilizes a microservice architecture, you will need **4 terminal windows** to run the ecosystem concurrently.

### 1. Smart Contract Deployment (Terminal 1)

Before launching the web apps, the Solana program must be built and deployed to Devnet.

```bash
cd tagin_solana_program

# Build the Rust Anchor Program
anchor build

# Deploy to Solana Devnet (requires Devnet SOL)
anchor deploy
```
*(After deployment, ensure the new Program ID aligns with the references in the `lib.rs` and frontend `idl.json` constants.)*

### 2. Flask API Server (Terminal 2)

The Python backend handles the Token ID generation, scan logging, and rich metadata storage.

```bash
cd taginbackend-main

# Install dependencies
pip install -r requirements.txt

# Start the Python server
python app.py
```
*The server will boot on `http://127.0.0.1:5000` or `http://0.0.0.0:5000` via WLAN.*

### 3. Manufacturer Dashboard (Terminal 3)

The central portal where authenticated brands mint the product identities onto the blockchain.

```bash
cd tagin-main

# Install frontend dependencies (including @solana/wallet-adapter)
npm install

# Start the React Vite Server
npm run dev
```
*Access this site logically from your desktop browser to connect your Phantom wallet.*

### 4. Consumer NFC Verifier (Terminal 4)

The public verification app for scanning and authenticating the products.

```bash
cd taginUser-main

# Install dependencies
npm install

# Start the mobile-facing React server
# We use --host to broadcast over your local WiFi network for mobile NFC testing!
npm run dev -- --host
```

---

## 📲 Testing the NFC Flow

1. Program an NFC tag with the local IP of your Verification app appended with the generated Token ID. Example:
   `http://192.168.1.XX:5174/?tokenId=562376` (Replace with your actual WLAN IP).
2. Register a product via the **Manufacturer Dashboard** and approve the Solana transaction. 
3. Tap the NFC tag with your smartphone! Your phone will route to the Consumer App over WLAN, hit the TagIn backend for metadata, and independently verify the signature mismatch against the Solana blockchain.
4. Go back to the **Manufacturer Dashboard -> Analytics** page. Your physical tap will have logged instantaneously to the global mapping tracker!

---

## 🛡 Security & Flow Optimization

We built TagIn natively on Solana for its unparalleled speed, but custom optimizations were required:

- **Zero-Storage Blockchain:** Storing JSON metadata directly on-chain is incredibly expensive. Instead, the backend generates a `metadataHash` representing the state of the product fields. Only the hash is stored on Solana in the PDA. If even a single character in the backend product name is maliciously altered, the blockchain validation fails.
- **PDA Native Architecture:** By dropping generalized SPL/Metaplex interfaces, minting costs plummeted from thousands of compute units to less than a fraction of a cent per product initialization.

---

### Developed for the Web3 Generation. Build Trust, Not Counterfeits.
