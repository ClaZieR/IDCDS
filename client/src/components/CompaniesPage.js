// CompaniesPage.js
import React, { useState, useEffect } from 'react';
import contractABI from './IDCDS.json'; // Import your contract ABI here
import { ethers } from 'ethers'
import axios from 'axios';

function CompaniesPage() {
  const [customWalletAddress, setCustomWalletAddress] = useState("");
  const [tokens, setTokens] = useState([]);
  const [ipfsUrl, setIpfsUrl] = useState("");
  const [displayOwnedTokens, setDisplayOwnedTokens] = useState(false);

  const handleGetOwnedTokens = async () => {
    if (customWalletAddress && window.ethereum) {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const contractAddress = "0xaA7e16c4b5640226519D0CD4ed0115F2894d68ab";
        const contract = new ethers.Contract(contractAddress, contractABI.abi, provider);

        const tokens = await contract.getOwnedTokens(customWalletAddress);
        setTokens(tokens);

        // Fetch the token URIs
        const ipfsUrls = [];
        for (const token of tokens) {
          const uri = await contract.getTokenURI(token);
          const response = await axios.get(uri);
          const data = response.data;
          ipfsUrls.push(data.ipfsUrl);
        }
        setIpfsUrl(ipfsUrls);

        setDisplayOwnedTokens(true);
      } catch (err) {
        console.error("Error connecting to Ethereum or fetching owned tokens", err);
      }
    }
  }

  return (
    <div>
      <input
        type="text"
        placeholder="Enter custom wallet address"
        value={customWalletAddress}
        onChange={(e) => setCustomWalletAddress(e.target.value)}
      />
      <button onClick={handleGetOwnedTokens}>Get Owned Tokens</button>

      {/* Display owned tokens when the button is pressed */}
      {displayOwnedTokens && tokens.length > 0 && (
  <div>
    <h2>Owned Token IDs:</h2>
    <ul>
      {tokens.map((tokenId, index) => (
        <li key={index}>{tokenId.toString()}</li>
      ))}
      {ipfsUrl.map((url, index) => (
        <img key={index} src={url} alt={`IPFS Image ${index}`} />
      ))}
    </ul>
  </div>
)}
    </div>
  );
};
export default CompaniesPage;
