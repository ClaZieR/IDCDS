import React, { useState } from 'react';

const Test = () => {
  const [ipfsUrl, setIpfsUrl] = useState('');

  const fetchData = async () => {
    try {
      const response = await fetch('https://ipfs.io/ipfs/QmPFfsbgmARBViMM9uKWPFsJzSeQ6pxFREZMCHYKe5e4eM');
      const data = await response.json();

      // Extract ipfsUrl from the data
      const imageUrl = data.ipfsUrl;

      // Set ipfsUrl state
      setIpfsUrl(imageUrl);

      // Log ipfsUrl to the console
      console.log(imageUrl);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleButtonClick = () => {
    // Call fetchData when the button is clicked
    fetchData();
  };

  return (
    <div>
      <button onClick={handleButtonClick}>Fetch Data</button>
      {ipfsUrl && <img src={ipfsUrl} alt="IPFS Image" />}
    </div>
  );
};

export default Test;
