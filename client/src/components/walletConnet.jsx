import React, { useState, useEffect } from 'react';
import contractABI from './IDCDS.json';
import { ethers,BigNumber } from 'ethers';


const WalletConnect = () => {
  const [account, setAccount] = useState("");
  const contractAddress = "0x1abe7811BC41761Bd30cC4B4e554d232e6b6eaaA";
  const mintAmount = 1;

  async function handleMint(){
    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setAccount(accounts[0]);
      const contract = new ethers.Contract(contractAddress, contractABI.abi, signer);
      try {
        const response = await contract.mint(BigNumber.from(mintAmount),{
          value: ethers.utils.parseEther((mintAmount * 0.02).toString())
        });
        console.log("response", response);
      } catch (err) {
        console.log("Error", err);
      }
    }
  }

  return (
    <div>
      <button onClick={handleMint}>Mint</button>
      <h1>Account: {account}</h1>
    </div>
  );

}

  


export default WalletConnect;
