import React, { useState } from 'react';
import { ethers } from 'ethers';

const OwnedTokens = ({ contract, account }) => {
  const [ownedTokens, setOwnedTokens] = useState([]);
  const [ipfsUrls, setIpfsUrls] = useState([]);

  const retrieveOwnedTokens = async () => {
    try {
      const result = await contract.getOwnedTokens(account);
      setOwnedTokens(result);

      // Fetch IPFS URLs for each token
      const urlsPromises = result.map(async (tokenId) => {
        try {
          const response = await fetch(`https://ipfs.io/ipfs/${tokenId}`);
          const data = await response.json();
          return data.ipfsUrl;
        } catch (error) {
          console.error(`Error fetching data for tokenId ${tokenId}:`, error);
          return null;
        }
      });

      // Wait for all fetches to complete
      const urls = await Promise.all(urlsPromises);

      // Set ipfsUrls state
      setIpfsUrls(urls.filter((url) => url !== null));
    } catch (err) {
      console.log("Error retrieving owned tokens", err);
    }
  };

  return (
    <div>
      <button onClick={retrieveOwnedTokens}>Retrieve Owned Tokens</button>
      {ipfsUrls.length > 0 && (
        <div>
          <h2>IPFS Images:</h2>
          {ipfsUrls.map((url, index) => (
            <img key={index} src={url} alt={`IPFS Image ${index}`} />
          ))}
        </div>
      )}
    </div>
  );
};

export default OwnedTokens;
