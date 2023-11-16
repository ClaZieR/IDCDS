import React, { useState } from 'react';
const ethers = require("ethers")


const WalletConnect = () => {
  const [walletBalance, setWalletBalance] = useState('');

  const connectWallet = async () => {

    //check if Metamask is installed
    if (window.ethereum) {
      try {
        console.log("Wallet connected");

        //connect to Metamask
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const signer = provider.getSigner();

        //get wallet balance
        const balance = await provider.getBalance("ethers.eth");
        setWalletBalance(ethers.utils.formatEther(balance));
        console.log('Balance:', balance);
      } catch (error) {
        console.error('Error connecting wallet:', error);
      }
    } else {
      console.log("Wallet not connected");
    }
  };

  return (
    <div>
      <h1>Hello from WalletConnect component!</h1>
      <button onClick={connectWallet}>Connect Wallet</button>
      <h1>{walletBalance}</h1>
    </div>
  );
};

export default WalletConnect;
