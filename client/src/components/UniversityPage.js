import React, { useState } from 'react';
import contractABI from './IDCDS.json';
import { ethers, BigNumber } from 'ethers';
import { Layout, Button, Input, notification } from 'antd';
import axios from 'axios';

const { Content } = Layout;

function UniversityPage() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [ipfsHash, setIpfsHash] = useState(null);
  const [jsonIpfsHash, setJsonIpfsHash] = useState(null);
  const [fileInfo, setFileInfo] = useState(null);
  const [account, setAccount] = useState("");
  const [walletConnected, setWalletConnected] = useState(false);
  const [recipientWallet, setRecipientWallet] = useState("");
  const contractAddress = "0x7EF8C8c735aF5e06f03D1a10CfC8C06C2f4aCA9b";
  const [tokenURI, setTokenURI] = useState("");
  const mintAmount = 1;
  const [tokenId, setTokenId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [walletInputDisabled, setWalletInputDisabled] = useState(true);
  const [universityName, setUniversityName] = useState(null); 
  const [universityWebsite, setUniversityWebsite] = useState(null);
  const [universityID, setUniversityID] = useState(null);
  const [universityWallet, setUniversityWallet] = useState(null);

  const connectWallet = async () => {
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setAccount(accounts[0]);
      setWalletConnected(true);
      setWalletInputDisabled(false);
      fetchUnidata(accounts[0]);
      setUniversityWallet(accounts[0]);
    } catch (err) {
      console.error("Error connecting to wallet", err);
    }
  };

  const fetchUnidata = async (addressWallet) => {
    try {
      const response = await axios.get(`http://localhost:1433/university/${addressWallet}`);
      setUniversityID(response.data.id);
      setUniversityName(response.data.name);
      setUniversityWebsite(response.data.website);      
    } catch (error) {
      console.error("Error fetching university data:", error);
    }
  }

  const pinFileToIPFS = async (JWT) => {
    if (!selectedFile) {
      console.log("Please select a file");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append('file', selectedFile);

    const pinataMetadata = JSON.stringify({
      name: `File-${Date.now()}`,
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


      const fetchStudent = async () => {
        try {
          if (!signer) {
            await connectWallet();
          }
          const contract = new ethers.Contract(studentRecordAddress, StudentRecord.abi, signer);
          const student = await contract.getStudent();
          if (student.firstName) {
            setStudent(student);
            console.log("Student record found:", student);
            await fetchImages(walletAddress); // Fetch images related to student's wallet address
          } else {
            console.log("No student record found.");
          }
        } catch (error) {
          console.error("No student record found:", error);
        }
      };
      console.log("File pinned successfully:", res.data);

      setIpfsHash(res.data.IpfsHash);

      const fileInformation = {
        name: selectedFile.name,
        ipfsUrl: `https://ipfs.io/ipfs/${res.data.IpfsHash}`,
        universityWallet: universityWallet,
        universityID: universityID,
        universityName: universityName,
        universityWebsite: universityWebsite,
        IssuedDate: Date.now(),
      };
      setFileInfo(fileInformation);

      pinJSONToIPFS(JWT, fileInformation);

      console.log("IPFS Hash:", res.data.IpfsHash);
      console.log("Pin Size:", res.data.PinSize);
      console.log("Timestamp:", res.data.Timestamp);

      setLoading(false);
    } catch (error) {
      console.error("Error pinning file to IPFS:", error.message);
      if (error.response) {
        console.error("Response data:", error.response.data);
      }
      setLoading(false);
    }
  };

  const pinJSONToIPFS = async (JWT, fileInformation) => {
    const jsonContent = {
      ...fileInformation,
      timestamp: Date.now(),
    };

    try {
      const res = await axios.post("https://api.pinata.cloud/pinning/pinJSONToIPFS", jsonContent, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${JWT}`
        }
      });

      console.log("JSON file pinned successfully:", res.data);

      setJsonIpfsHash(res.data.IpfsHash);
      setTokenURI(`https://ipfs.io/ipfs/${res.data.IpfsHash}`);

      console.log("JSON IPFS Link:", `https://ipfs.io/ipfs/${res.data.IpfsHash}`);
    } catch (error) {
      console.error("Error pinning JSON file to IPFS:", error.message);
      if (error.response) {
        console.error("Response data:", error.response.data);
      }
    }
  };

  const handleMint = async () => {
    try {
      setLoading(true);

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddress, contractABI.abi, signer);

      const response = await contract.mint(BigNumber.from(mintAmount), tokenURI, {
        value: ethers.utils.parseEther((mintAmount * 0.0002).toString()),
      });

      console.log("Mint response", response);

      const receipt = await response.wait();
      console.log("Transaction receipt", receipt);

      await handleGetOwnedTokens();

      notification.success({
        message: "Minting Successful",
        description: "Your token has been minted successfully.",
      });

      setLoading(false);
    } catch (err) {
      console.log("Error minting", err);
      setLoading(false);
      notification.error({
        message: "Minting Failed",
        description: "There was an error while minting your token.",
      });
    }
  }

  const handleGetOwnedTokens = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddress, contractABI.abi, signer);

      const ownedTokens = await contract.getOwnedTokens(signer.getAddress());
      console.log("Owned tokens", ownedTokens);

      const lastTokenId = ownedTokens[ownedTokens.length - 1];

      setTokenId(lastTokenId);

      return lastTokenId;
    } catch (error) {
      console.error("Error fetching owned tokens:", error);
      throw error;
    }
  };

  const fetchTokenAndTransfer = async () => {
    try {
      const tokenId = await handleGetOwnedTokens();
      if (!tokenId) {
        console.log("Token ID is null. Aborting transfer.");
        return;
      }

      setLoading(true);

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddress, contractABI.abi, signer);

      const transferResponse = await contract.transferFrom(
        signer.getAddress(),
        recipientWallet,
        tokenId
      );

      console.log("Transfer response", transferResponse);

      notification.success({
        message: "Transfer Successful",
        description: "Your token has been transferred successfully.",
      });

      setLoading(false);
    } catch (error) {
      console.error("Error transferring:", error);

      notification.error({
        message: "Transfer Failed",
        description: "There was an error while transferring your token.",
      });

      setLoading(false);
    }
  };

  return (
    <Layout style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <Content>
        {!walletConnected ? (
          <Button onClick={connectWallet}>Connect Wallet</Button>
        ) : (
          <>
            <h2>University Name: {universityName}</h2>
            <h2>University Website: {universityWebsite}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
              <Input type="file" style={{ width: '200px' }} onChange={(e) => setSelectedFile(e.target.files[0])} />
            </div>
            <Button
              style={{ width: '200px' }}
              onClick={() => pinFileToIPFS("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJhYzVjZDUzNC0wMWNiLTQzNmItYWQ2Yy05Y2ZlNGE3YjMwMzEiLCJlbWFpbCI6ImpyLmNsYXppZXJAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siaWQiOiJGUkExIiwiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjF9LHsiaWQiOiJOWUMxIiwiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjF9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6IjQ2YjhkNDVhNGRmMGYzODZjNDkzIiwic2NvcGVkS2V5U2VjcmV0IjoiNjFlMmU1MTQ4ODc3MjhkZDBhYmJlN2U0NTIzNWYxMTc5MjY4YjhjYTllMWQ4OTY1YWM0YTZmMDg1Y2Y2YzdkYyIsImlhdCI6MTcwMjM1MjIyMH0.gYvpYgy-tF_BZ4xH68PGePgMfMCeEh_D_ILz85Wxd4E")}
              loading={loading}
            >
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
              style={{ width: '200px' }}
              disabled={loading || !jsonIpfsHash || walletInputDisabled}
            />

            <Button
              onClick={handleMint}
              style={{ width: '200px' }}
              disabled={loading || !jsonIpfsHash}
              loading={loading}
            >
              Mint
            </Button>

            <Button
              onClick={fetchTokenAndTransfer}
              style={{ width: '200px' }}
              disabled={loading || !tokenId}
              loading={loading}
            >
              Transfer Token
            </Button>
          </>
        )}
      </Content>
    </Layout>
  );
}

export default UniversityPage;
