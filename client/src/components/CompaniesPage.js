import React, { useState } from 'react';
import { Input, Button, Grid } from 'antd';
import contractABI from './IDCDS.json'; // Import your contract ABI here
import { ethers } from 'ethers';
import axios from 'axios';

const { useBreakpoint } = Grid;

function CompaniesPage() {
  const screens = useBreakpoint();
  const [customWalletAddress, setCustomWalletAddress] = useState("");
  const [tokens, setTokens] = useState([]);
  const [ipfsUrl, setIpfsUrl] = useState([]);
  const [displayOwnedTokens, setDisplayOwnedTokens] = useState(false);

  const handleGetOwnedTokens = async () => {
    if (customWalletAddress && window.ethereum) {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const contractAddress = "0x7EF8C8c735aF5e06f03D1a10CfC8C06C2f4aCA9b";
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
    <center>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop:'20px', width:'100%' }}>
        <Input
          type="text"
          placeholder="Enter custom wallet address"
          value={customWalletAddress}
          style={{ width: '400px' }}
          onChange={(e) => setCustomWalletAddress(e.target.value)}
        />
        <Button type="primary" onClick={handleGetOwnedTokens} style={{ marginTop: '10px' }}>Get Owned Tokens</Button>

        {/* Display owned tokens when the button is pressed */}
        {displayOwnedTokens && tokens.length > 0 && (
          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>
            {ipfsUrl.map((url, index) => (
              <div key={index} style={{ width: screens.lg ? 'calc(33.33% - 20px)' : 'calc(50% - 20px)', margin: '10px', textAlign: 'center' }}>
                <img src={url} alt={`IPFS Image ${index}`} style={{ maxWidth: '100%', maxHeight: '300px' }} />
              </div>
            ))}
          </div>
        )}
      </div>
    </center>
  );
}

export default CompaniesPage;