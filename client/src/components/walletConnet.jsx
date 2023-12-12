import React, { useState, useEffect } from 'react';
import contractABI from './IDCDS.json';
import { ethers, BigNumber } from 'ethers';

const WalletConnect = () => {
  const [account, setAccount] = useState("");
  const contractAddress = "0xaA7e16c4b5640226519D0CD4ed0115F2894d68ab";
  const mintAmount = 1;

  async function handleMint() {
    if (window.ethereum) {
      try {
        // Request account access
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        setAccount(accounts[0]);

        // Instantiate the contract
        const contract = new ethers.Contract(contractAddress, contractABI.abi, signer);

        // Mint tokens with dynamic tokenURI
        const tokenURI = "https://ipfs.io/ipfs/QmUo2puzGXeW63bjT82Sq72qesvFrMpaVZpjcPs4XkNCAB";
        const response = await contract.mint(BigNumber.from(mintAmount), tokenURI, {
          value: ethers.utils.parseEther((mintAmount * 0.02).toString()),
        });

        console.log("Mint response", response);
      } catch (err) {
        console.log("Error connecting to Ethereum or minting", err);
      }
    }
  }

  return (
    <div>
      <button onClick={handleMint}>Mint</button>
      <h1>Account: {account}</h1>
    </div>
  );
};

export default WalletConnect;
