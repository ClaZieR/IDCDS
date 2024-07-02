import React, { useState } from 'react';
import axios from 'axios';
import { Button } from 'antd';

function Verify({ walletAddress, refreshStatus }) {
  const [isVerified, setIsVerified] = useState(false);

  const handleVerify = async () => {
    try {
      const response = await axios.post('http://localhost:1433/verify', { walletAddress });
      console.log(response.data); // Log the response data to the console
      if (response.data.msg.includes('Verification verified')) {
        setIsVerified(true); // Set state to true when verification is successful
        refreshStatus(); // Call the function to refresh the status in the parent component
      }
    } catch (error) {
      console.error('Error verifying DNS TXT record:', error);
    }
  };

  return (
    <>
      {!isVerified && (
        <div>
          <Button type="primary" onClick={handleVerify}>Verify DNS TXT Record</Button>
        </div>
      )}
    </>
  );
}

export default Verify;
