import React, { useState, useEffect } from 'react';
import contractABI from './IDCDS.json';
import { ethers, BigNumber } from 'ethers';
import { Layout, Button, Input } from 'antd';
import axios from 'axios';

function UniversityPage() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [ipfsHash, setIpfsHash] = useState(null);
  const [jsonIpfsHash, setJsonIpfsHash] = useState(null);
  const [fileInfo, setFileInfo] = useState(null);
  const [account, setAccount] = useState("");
  const [walletConnected, setWalletConnected] = useState(false);
  const [recipientWallet, setRecipientWallet] = useState("");
  const contractAddress = "0xaA7e16c4b5640226519D0CD4ed0115F2894d68ab";
  const [tokenURI, setTokenURI] = useState("");
  const mintAmount = 1;
  const [tokenId, setTokenId] = useState(null);

  const { Content } = Layout;

  const connectWallet = async () => {
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setAccount(accounts[0]);
      setWalletConnected(true);
    } catch (err) {
      console.error("Error connecting to wallet", err);
    }
  };

  const pinFileToIPFS = async (JWT) => {
    if (!selectedFile) {
      console.log("Please select a file");
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);

    const pinataMetadata = JSON.stringify({
      name: 'File name',
    });
    formData.append('pinataMetadata', pinataMetadata);

    const pinataOptions = JSON.stringify({
      cidVersion: 0,
    });
    formData.append('pinataOptions', pinataOptions);

    try {
      const res = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
        maxBodyLength: "Infinity",
        headers: {
          'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
          'Authorization': `Bearer ${JWT}`
        }
      });

      console.log("File pinned successfully:", res.data);

      // Set the IPFS hash to state
      setIpfsHash(res.data.IpfsHash);

      // Set file information to state
      const fileInformation = {
        name: selectedFile.name,
        ipfsUrl: `https://ipfs.io/ipfs/${res.data.IpfsHash}`,
      };
      setFileInfo(fileInformation);

      // Upload JSON file to IPFS
      uploadJsonFileToIPFS(JWT, fileInformation);

      // Display IPFS hash, Pin Size, and Timestamp
      console.log("IPFS Hash:", res.data.IpfsHash);
      console.log("Pin Size:", res.data.PinSize);
      console.log("Timestamp:", res.data.Timestamp);
    } catch (error) {
      console.error("Error pinning file to IPFS:", error.message);
      if (error.response) {
        console.error("Response data:", error.response.data);
      }
    }
  };

  const uploadJsonFileToIPFS = async (JWT, fileInformation) => {
    const jsonContent = JSON.stringify(fileInformation, null, 2);
    const jsonBlob = new Blob([jsonContent], { type: 'application/json' });

    const jsonFormData = new FormData();
    jsonFormData.append('file', jsonBlob);

    try {
      const jsonRes = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", jsonFormData, {
        maxBodyLength: "Infinity",
        headers: {
          'Content-Type': `multipart/form-data; boundary=${jsonFormData._boundary}`,
          'Authorization': `Bearer ${JWT}`
        }
      });

      console.log("JSON file pinned successfully:", jsonRes.data);

      // Set the JSON IPFS hash to state
      setJsonIpfsHash(jsonRes.data.IpfsHash);
      setTokenURI(`https://ipfs.io/ipfs/${jsonRes.data.IpfsHash}`);

      // Display JSON IPFS link
      console.log("JSON IPFS Link:", `https://ipfs.io/ipfs/${jsonRes.data.IpfsHash}`);
    } catch (error) {
      console.error("Error pinning JSON file to IPFS:", error.message);
      if (error.response) {
        console.error("Response data:", error.response.data);
      }
    }
  };

  const handleMint = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddress, contractABI.abi, signer);
  
      // Mint tokens with dynamic tokenURI
      const response = await contract.mint(BigNumber.from(mintAmount), tokenURI, {
        value: ethers.utils.parseEther((mintAmount * 0.02).toString()),
      });
  
      console.log("Mint response", response);
    } catch (err) {
      console.log("Error minting", err);
    }
  };

  const handleGetOwnedTokens = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddress, contractABI.abi, signer);
  
      const ownedTokens = await contract.getOwnedTokens(signer.getAddress());
      console.log("Owned tokens", ownedTokens);
  
      // Get the last token ID
      const lastTokenId = ownedTokens[ownedTokens.length - 1];
  
      // Set tokenId state
      setTokenId(lastTokenId);
  
      // Return the lastTokenId
      return lastTokenId;
    } catch (error) {
      console.error("Error fetching owned tokens:", error);
      throw error; // Throw the error to handle it later
    }
  };
  
  const fetchTokenAndTransfer = async () => {
    try {
      const tokenId = await handleGetOwnedTokens(); // Wait for tokenId to be set
      if (!tokenId) {
        console.log("Token ID is null. Aborting transfer.");
        return;
      }
  
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddress, contractABI.abi, signer);
  
      const transferResponse = await contract.transferFrom(
        signer.getAddress(), // Sender's address (your address)
        recipientWallet, // Recipient's wallet address from state
        tokenId // Token ID obtained from minting
      );
  
      console.log("Transfer response", transferResponse);
    } catch (error) {
      console.error("Error transferring:", error);
    }
  };



  return (

<Layout style={{ minHeight: '100vh' }}>
  <Content style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
    {!walletConnected && (
      <Button onClick={connectWallet} style={{ alignSelf: 'center' }}>Connect Wallet</Button>
    )}

    {walletConnected && (
      <>
        <h1>Account: {account}</h1>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Input type="file" onChange={(e) => setSelectedFile(e.target.files[0])} />
        </div>
        <Button onClick={() => pinFileToIPFS("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJhYzVjZDUzNC0wMWNiLTQzNmItYWQ2Yy05Y2ZlNGE3YjMwMzEiLCJlbWFpbCI6ImpyLmNsYXppZXJAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siaWQiOiJGUkExIiwiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjF9LHsiaWQiOiJOWUMxIiwiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjF9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6IjQ2YjhkNDVhNGRmMGYzODZjNDkzIiwic2NvcGVkS2V5U2VjcmV0IjoiNjFlMmU1MTQ4ODc3MjhkZDBhYmJlN2U0NTIzNWYxMTc5MjY4YjhjYTllMWQ4OTY1YWM0YTZmMDg1Y2Y2YzdkYyIsImlhdCI6MTcwMjM1MjIyMH0.gYvpYgy-tF_BZ4xH68PGePgMfMCeEh_D_ILz85Wxd4E")}>
          Upload to IPFS
        </Button>

        {ipfsHash && (
          <div>
            <h2>IPFS Link:</h2>
            <a href={`https://ipfs.io/ipfs/${ipfsHash}`} target="_blank" rel="noopener noreferrer">
              {`https://ipfs.io/ipfs/${ipfsHash}`}
            </a>
          </div>
        )}

        {jsonIpfsHash && (
          <div>
            <h2>JSON IPFS Link:</h2>
            <a href={`https://ipfs.io/ipfs/${jsonIpfsHash}`} target="_blank" rel="noopener noreferrer">
              {`https://ipfs.io/ipfs/${jsonIpfsHash}`}
            </a>
          </div>
        )}

        <Input
          type="text"
          placeholder="Recipient's wallet address"
          value={recipientWallet}
          onChange={(e) => setRecipientWallet(e.target.value)}
          style={{ width: '200px' }} // Added style to shorten the input field
        />

        <Button onClick={handleMint}>Mint</Button>
        <Button onClick={fetchTokenAndTransfer}>Transfer Token</Button>
      </>
    )}
  </Content>
</Layout>


  );
};

export default UniversityPage;
