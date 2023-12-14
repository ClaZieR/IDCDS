import React, { useState } from 'react';
import axios from 'axios';
import FormData from 'form-data';

const UploadIPFS = () => {
  const [account, setAccount] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [ipfsHash, setIpfsHash] = useState(null);
  const [jsonIpfsHash, setJsonIpfsHash] = useState(null);
  const [fileInfo, setFileInfo] = useState(null);
  //const contractAddress = "0x1abe7811BC41761Bd30cC4B4e554d232e6b6eaaA";

  const handleMint = async () => {
    // ... existing minting logic ...
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

  return (
    <div>
      <button onClick={handleMint}>Mint</button>
      
      {/* File input */}
      <input type="file" onChange={(e) => setSelectedFile(e.target.files[0])} />

      {/* Upload button */}
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

      <h1>Account: {account}</h1>
    </div>
  );
}

export default UploadIPFS;
