# Flow Blockchain + Magic SDK Example

A React application demonstrating integration between Flow blockchain and Magic SDK for seamless user authentication and transaction signing.

## Overview

This example shows how to:

- Authenticate users using Magic's email login
- Connect to Flow testnet
- Sign and submit Cadence transactions using Magic's Flow extension
- Verify transactions on the Flow blockchain

## Features

- **Magic Authentication**: Email-based login using Magic's authentication service
- **Flow Integration**: Connected to Flow testnet for blockchain interactions
- **Transaction Verification**: Submit and verify Cadence transactions
- **Modern UI**: Clean React interface with real-time transaction status

## Prerequisites

- Node.js (v14 or higher)
- pnpm (or npm/yarn)
- Magic account with Flow extension enabled

## Installation

1. Clone this repository
2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Start the development server:

   ```bash
   pnpm start
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. **Login**: Enter your email address and click "Send" to receive a magic link
2. **Verify**: Click the magic link in your email to authenticate
3. **View Address**: Your Flow testnet address will be displayed
4. **Test Transaction**: Click "Verify" to submit a simple Cadence transaction

## Configuration

The app is pre-configured for Flow testnet:

- **Access Node**: `https://rest-testnet.onflow.org`
- **Network**: testnet
- **Magic Key**: Uses a demo public key (replace with your own for production)

## Transaction Details

The verification transaction is a simple Cadence script that:

- Prepares an account reference
- Logs the account address to verify the connection works
- Uses modern Cadence syntax (`&Account` instead of deprecated `AuthAccount`)

## Key Dependencies

- `@magic-ext/flow`: Magic SDK Flow blockchain extension
- `@onflow/fcl`: Flow Client Library for blockchain interactions
- `magic-sdk`: Core Magic SDK for authentication
- `react`: Frontend framework

## Notes

- This example uses Flow testnet for safe testing
- The Magic public key included is for demonstration only
- For production use, replace with your own Magic keys and consider mainnet configuration

## Troubleshooting

- **AuthAccount Error**: This has been fixed - the app now uses modern `&Account` syntax
- **Transaction Fails**: Ensure you're connected to testnet and have a valid account
- **Login Issues**: Check that Magic emails aren't in spam folder
