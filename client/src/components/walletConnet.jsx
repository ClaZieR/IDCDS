import React, { useState, useEffect } from 'react';
import contractABI from './IDCDS.json';
import { ethers, BigNumber } from 'ethers';
import axios from 'axios';

const WalletConnect = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [ipfsHash, setIpfsHash] = useState(null);
  const [jsonIpfsHash, setJsonIpfsHash] = useState(null);
  const [fileInfo, setFileInfo] = useState(null);
  const [account, setAccount] = useState("");
  const contractAddress = "0xaA7e16c4b5640226519D0CD4ed0115F2894d68ab";
  const [tokenURI, setTokenURI] = useState("");
  const mintAmount = 1;
  const [ownedTokens, setOwnedTokens] = useState([]);
  const tokenList = ownedTokens.map((token, index) => token.toString());
  const [displayOwnedTokens, setDisplayOwnedTokens] = useState(false);
  const [tokens, setTokens] = useState([]);
  const [tokenURIs, setTokenURIs] = useState([]);

  const handleGetOwnedTokens = async () => {
    if (window.ethereum) {
      try {
        // Request account access
        
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const contract = new ethers.Contract(contractAddress, contractABI.abi, provider);

        // Get owned tokens for the connected account
        setTokens(await contract.getOwnedTokens(accounts[0]))

        // Set owned tokens to state
        setOwnedTokens(tokens);
        setDisplayOwnedTokens(true);
        console.log(tokens)


      
      } catch (err) {
        console.error("Error connecting to Ethereum or fetching owned tokens", err);
      }
    }
  }
  const TokenURI = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const contract = new ethers.Contract(contractAddress, contractABI.abi, provider);
  
        for (const token of tokens) {
          const uri = await contract.getTokenURI(token);
          setTokenURIs(uri);
          console.log(uri)
        }

        // Log information for debugging
        // Update state or perform other actions as needed
      } catch (err) {
        console.error("Error connecting to Ethereum or fetching token URI", err);
      }
    }
  }
  
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
  }

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
  }

  // Function to download JSON file
  const downloadJsonFile = () => {
    if (fileInfo) {
      const jsonString = JSON.stringify(fileInfo, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      // Create a link and trigger a click to download the file
      const link = document.createElement('a');
      link.href = url;
      link.download = 'fileInfo.json';
      link.click();

      // Clean up
      URL.revokeObjectURL(url);
    }
  }

  const handleMint = async () => {
    if (window.ethereum) {
      try {

        // Request account access
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        setAccount(accounts[0]);
        const contract = new ethers.Contract(contractAddress, contractABI.abi, signer);
        //IPFS
        // Mint tokens with dynamic tokenURI
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
      <input type="file" onChange={(e) => setSelectedFile(e.target.files[0])} />
      <button onClick={() => pinFileToIPFS("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJhYzVjZDUzNC0wMWNiLTQzNmItYWQ2Yy05Y2ZlNGE3YjMwMzEiLCJlbWFpbCI6ImpyLmNsYXppZXJAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siaWQiOiJGUkExIiwiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjF9LHsiaWQiOiJOWUMxIiwiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjF9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6IjQ2YjhkNDVhNGRmMGYzODZjNDkzIiwic2NvcGVkS2V5U2VjcmV0IjoiNjFlMmU1MTQ4ODc3MjhkZDBhYmJlN2U0NTIzNWYxMTc5MjY4YjhjYTllMWQ4OTY1YWM0YTZmMDg1Y2Y2YzdkYyIsImlhdCI6MTcwMjM1MjIyMH0.gYvpYgy-tF_BZ4xH68PGePgMfMCeEh_D_ILz85Wxd4E")}>Upload to IPFS</button>
      {/* Display IPFS link if hash is available */}
      {ipfsHash && (
        <div>
          <h2>IPFS Link:</h2>
          <a href={`https://ipfs.io/ipfs/${ipfsHash}`} target="_blank" rel="noopener noreferrer">
            {`https://ipfs.io/ipfs/${ipfsHash}`}
          </a>
        </div>
      )}

      {/* Display JSON IPFS link if JSON hash is available */}
      {jsonIpfsHash && (
        <div>
          <h2>JSON IPFS Link:</h2>
          <a href={`https://ipfs.io/ipfs/${jsonIpfsHash}`} target="_blank" rel="noopener noreferrer">
            {`https://ipfs.io/ipfs/${jsonIpfsHash}`}
          </a>
        </div>
      )}

      {/* Download JSON button */}
      <button onClick={downloadJsonFile}>Download JSON</button>

      {/* Mint button */}
      <button onClick={handleMint}>Mint</button>

      {/* Display account */}
      <h1>Account: {account}</h1>
      {/* Display owned tokens when the button is pressed */}
            {/* Button to fetch and display owned tokens */}
            <button onClick={handleGetOwnedTokens}>Get Owned Tokens</button>
            <button onClick={TokenURI}>Get Token URI</button>

      {/* Display owned tokens when the button is pressed */}
      {displayOwnedTokens && tokenList.length > 0 && (
  <div>
    <h2>Owned Token IDs:</h2>
    <ul>
      {tokenList.map((tokenId, index) => (
        <li key={index}>{tokenId}</li>
      ))}
    </ul>
  </div>
)}
    </div>
  );
};

export default WalletConnect;