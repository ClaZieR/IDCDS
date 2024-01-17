// OwnedTokens.js

import React, { useState } from 'react';
import { ethers } from 'ethers';

const OwnedTokens = ({ contract, account }) => {
  const [ownedTokens, setOwnedTokens] = useState([]);

  const retrieveOwnedTokens = async () => {
    try {
      const result = await contract.getOwnedTokens(account);
      setOwnedTokens(result);
    } catch (err) {
      console.log("Error retrieving owned tokens", err);
    }
  };

  return (
    <div>
      <button onClick={retrieveOwnedTokens}>Retrieve Owned Tokens</button>
      {ownedTokens.length > 0 && (
        <div>
          <h2>Owned Token IDs:</h2>
          <ul>
            {ownedTokens.map((tokenId, index) => (
              <li key={index}>{tokenId}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default OwnedTokens;
