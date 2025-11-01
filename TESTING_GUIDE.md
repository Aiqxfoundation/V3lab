# Solana Token Deployment Testing Guide

## Critical Information

**This guide will help you test the token deployment fixes on both testnet and mainnet.**

---

## Prerequisites

### 1. Install a Solana Wallet
You need one of these wallets:
- **Phantom** (Recommended): https://phantom.app/
- **OKX Wallet**: https://www.okx.com/web3
- **Solflare**: https://solflare.com/
- **Backpack**: https://www.backpack.app/

### 2. Get SOL for Testing

#### For Devnet (Free Testing):
1. Visit: https://faucet.solana.com/
2. Paste your wallet address
3. Select "Devnet"
4. Click "Confirm Airdrop"
5. You'll receive 1-2 SOL (free, not real money)

#### For Testnet (Free Testing):
1. Same process as Devnet but select "Testnet"
2. Get at least 0.01 SOL for testing

#### For Mainnet (Real Money):
1. Buy SOL from an exchange (Coinbase, Binance, etc.)
2. Transfer to your wallet
3. **Start with 0.01 SOL** for testing (current price ~$200, so ~$2)

---

## Testing Procedure

### Step 1: Test on Devnet (100% Free)

1. **Connect Your Wallet**
   - Open the app at `/create-solana`
   - Click "Connect Wallet" button
   - Select your wallet (Phantom recommended)
   - Approve the connection

2. **Fill Out Token Form**
   ```
   Token Name: Test Token Devnet
   Symbol: TTD
   Decimals: 9
   Total Supply: 1000000
   Network: Select "Devnet"
   
   Authority Controls:
   ✅ Mint Authority: ON
   ✅ Freeze Authority: ON
   ✅ Update Authority: ON
   ```

3. **Deploy Token**
   - Click "Deploy SPL Token"
   - Approve transaction in wallet
   - **Watch the console** (F12 → Console tab)

4. **What to Look For**
   ```
   ✅ Good Signs:
   - Console shows: "Transaction sent! Signature: ..."
   - Console shows: "Confirming transaction..."
   - Console shows: "Transaction confirmed successfully!"
   - You see success toast notification
   - You get a mint address
   
   ❌ Bad Signs:
   - Stuck on "Deploying Token..." for more than 2 minutes
   - Console shows: "Transaction confirmation timed out"
   - Error in console about "Blockhash not found"
   - No transaction signature appears
   ```

5. **Verify Token Creation**
   - Copy the transaction signature from console
   - Visit: https://solscan.io/tx/[YOUR_SIGNATURE]?cluster=devnet
   - Check if transaction status is "Success"
   - Copy the mint address
   - Visit: https://solscan.io/token/[MINT_ADDRESS]?cluster=devnet
   - Verify token exists with correct name, symbol, supply

---

### Step 2: Test on Testnet (Free)

1. **Switch Network**
   - In the app, change network dropdown to "Testnet"
   - Your wallet should automatically switch (Phantom does this)

2. **Deploy Another Token**
   ```
   Token Name: Test Token Testnet
   Symbol: TTT
   Decimals: 9
   Total Supply: 500000
   Network: Testnet
   ```

3. **Same Verification Process**
   - Check transaction on: https://solscan.io/tx/[SIGNATURE]?cluster=testnet
   - Check token on: https://solscan.io/token/[MINT_ADDRESS]?cluster=testnet

---

### Step 3: Test on Mainnet (Real Money - OPTIONAL)

⚠️ **WARNING**: Mainnet uses real SOL. Each deployment costs ~0.002-0.005 SOL (~$0.40-$1.00)

1. **Get Premium RPC (Highly Recommended)**
   
   Free Mainnet RPC is VERY unreliable. Get a free tier from:
   
   **Helius (Recommended - Best Free Tier)**
   - Visit: https://www.helius.dev/
   - Sign up for free
   - Create a new project
   - Copy your RPC URL: `https://mainnet.helius-rpc.com/?api-key=YOUR_KEY`
   - Add to Replit Secrets:
     ```
     Key: VITE_SOLANA_RPC_MAINNET
     Value: https://mainnet.helius-rpc.com/?api-key=YOUR_KEY
     ```
   - Restart the workflow

   **Alternative: QuickNode**
   - Visit: https://www.quicknode.com/
   - Free tier: 100,000 requests/month
   - Copy your endpoint URL
   - Add to Replit Secrets as above

2. **Deploy Small Test Token**
   ```
   Token Name: My Real Token
   Symbol: MRT
   Decimals: 9
   Total Supply: 1000000
   Network: Mainnet
   
   Add Logo (Optional):
   - Upload a small PNG (< 1MB for faster upload)
   - Add description
   - Add website, Twitter, Telegram links
   ```

3. **Verify on Mainnet**
   - Check transaction: https://solscan.io/tx/[SIGNATURE]
   - Check token: https://solscan.io/token/[MINT_ADDRESS]
   - Your token should appear on:
     - Solscan
     - Jupiter (after a few minutes)
     - Birdeye (after indexing)

---

## Common Issues and Solutions

### Issue 1: "Transaction submitted but stuck on deploying"

**This was the bug you reported!**

**Diagnosis:**
- Open browser console (F12)
- Look for: "Confirming transaction (attempt 1/3)..."
- If stuck here for > 60 seconds, this means:
  - RPC is not responding
  - Transaction might be on-chain but confirmation is hanging

**Solution:**
- The timeout fix I added should prevent this
- If it still hangs, check the transaction on Solscan manually
- Copy the signature from console and check if token was created

**After My Fix:**
- Should timeout after 60 seconds
- Should check transaction status as fallback
- Should either succeed or fail with clear error message

---

### Issue 2: "Insufficient SOL balance"

**Solution:**
- For Devnet/Testnet: Get more from faucet
- For Mainnet: Add more SOL to wallet
- Need at least: 0.005 SOL

---

### Issue 3: "Transaction expired"

**Cause:** Network congestion or slow RPC

**Solution:**
- Click deploy again - new transaction will be created
- Use premium RPC for mainnet
- Try during off-peak hours

---

### Issue 4: "RPC rate limit exceeded"

**Cause:** Too many requests to free RPC

**Solution:**
- Wait 5-10 minutes
- Use premium RPC (Helius, QuickNode)
- This is why free Mainnet RPC is unreliable

---

## What I Fixed

Based on your report "transaction submitted but no token created, keeps showing deploying token":

### The Root Cause:
The `confirmTransaction()` call was **hanging indefinitely** because:
1. Free Solana RPCs can be slow or unresponsive
2. No timeout was set on confirmation
3. UI would show "Deploying Token..." forever
4. User has no idea if token was created or not

### The Fixes:
1. ✅ **Added 60-second timeout** to prevent infinite hanging
2. ✅ **Fallback transaction status check** - if confirmation times out, check if transaction actually succeeded
3. ✅ **Retry logic** with exponential backoff
4. ✅ **Better error messages** to tell you exactly what went wrong
5. ✅ **Support for premium RPC endpoints**

---

## Expected Deployment Times

### Without Logo:
- **Devnet**: 5-15 seconds
- **Testnet**: 10-30 seconds
- **Mainnet (free RPC)**: 30-120 seconds (unreliable!)
- **Mainnet (premium RPC)**: 10-30 seconds

### With Logo Upload (Irys):
- Add 20-60 seconds for image + metadata upload
- Total: 30-90 seconds typically

---

## How to Report Results

After testing, please tell me:

1. **Which networks did you test?**
   - Devnet / Testnet / Mainnet

2. **What happened?**
   - Did deployment complete successfully?
   - Did you get a mint address?
   - How long did it take?
   - Did it hang or timeout?

3. **Console Logs**
   - Open browser console (F12)
   - Copy any error messages
   - Send me the transaction signature if available

4. **Solscan Verification**
   - Did the token appear on Solscan?
   - Does it have correct metadata?

---

## Quick Test Checklist

```
☐ Devnet Test
  ☐ Wallet connected
  ☐ Token deployed
  ☐ Transaction confirmed on Solscan
  ☐ Token visible on Solscan
  ☐ Time taken: ___ seconds
  
☐ Testnet Test
  ☐ Network switched to testnet
  ☐ Token deployed
  ☐ Transaction confirmed on Solscan
  ☐ Token visible on Solscan
  ☐ Time taken: ___ seconds
  
☐ Mainnet Test (Optional)
  ☐ Premium RPC configured (Helius/QuickNode)
  ☐ Wallet has SOL (0.01+)
  ☐ Token deployed
  ☐ Transaction confirmed on Solscan
  ☐ Token visible on Solscan, Jupiter
  ☐ Time taken: ___ seconds
```

---

## Support

If you encounter issues:
1. Check browser console for errors
2. Copy transaction signature and check on Solscan
3. Send me the console logs
4. Tell me which network you tested on

The fixes I made should resolve the "stuck deploying" issue. If it still happens, we'll debug further based on the console logs.
