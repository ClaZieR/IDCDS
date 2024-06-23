import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Register from './Register';
import Status from './Status';
import Verify from './Verify';
import { ethers } from 'ethers'; // Import ethers.js

function Unifront() {
  const [walletAddress, setWalletAddress] = useState(null);
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [renderRegister, setRenderRegister] = useState(false);
  const navigate = useNavigate(); // Use the useNavigate hook

  useEffect(() => {
    if (walletAddress) {
      checkStatus();
    }
  }, [walletAddress]);

  useEffect(() => {
    if (verificationStatus && verificationStatus.verification_status === 'verified') {
      navigate('/university'); // Redirect to /university if verified
    }
  }, [verificationStatus, navigate]);

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const address = await signer.getAddress();
        setWalletAddress(address);
      } catch (error) {
        console.error("User denied account access or error:", error);
      }
    } else {
      console.error("MetaMask not found");
    }
  };

  const checkStatus = async () => {
    if (walletAddress) {
      try {
        const response = await axios.get(`http://localhost:1433/status/${walletAddress}`);
        console.log(response.data);
        if (response.data.msg === 'No record found') {
          setRenderRegister(true);
          setVerificationStatus(null);
        } else {
          setVerificationStatus(response.data);
          setRenderRegister(false);
        }
      } catch (error) {
        console.error("Error fetching status:", error);
      }
    }
  };

  return (
    <div>
      <h1>University Verification</h1>
      {walletAddress ? (
        verificationStatus ? (
          <div>
            <Status status={verificationStatus} />
            {(verificationStatus.verification_status === 'pending' || verificationStatus.verification_status === 'failed') && (
              <Verify walletAddress={walletAddress} refreshStatus={checkStatus} />
            )}
          </div>
        ) : (
          renderRegister && (
            <div>
              <Register walletAddress={walletAddress} />
              <button onClick={checkStatus}>Check Status</button>
            </div>
          )
        )
      ) : (
        <button onClick={connectWallet}>Connect Metamask</button>
      )}
    </div>
  );
}

export default Unifront;
