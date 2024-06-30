import React, { useState } from 'react';
import { Input, Button, Grid } from 'antd';
import contractABI from './IDCDS.json';
import StudentRecord from "./StudentRecord.json"; // Import your StudentRecord contract ABI
import { ethers } from 'ethers';
import axios from 'axios';

const { useBreakpoint } = Grid;

const contractAddress = "0x7EF8C8c735aF5e06f03D1a10CfC8C06C2f4aCA9b"; // Replace with your actual contract address
const studentRecordAddress = "0x664C935800D333006f3C74aB5CB5b91AD8577680"; // Replace with your actual student record contract address

function CompaniesPage() {
  const screens = useBreakpoint();
  const [customWalletAddress, setCustomWalletAddress] = useState("");
  const [tokens, setTokens] = useState([]);
  const [ipfsUrls, setIpfsUrls] = useState([]);
  const [student, setStudent] = useState(null);
  const [displayOwnedTokens, setDisplayOwnedTokens] = useState(false);

  const handleGetOwnedTokens = async () => {
    if (customWalletAddress && window.ethereum) {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const contract = new ethers.Contract(contractAddress, contractABI.abi, provider);
        const studentContract = new ethers.Contract(studentRecordAddress, StudentRecord.abi, provider);

        // Fetch student data by wallet address
        const student = await studentContract.getStudentByAddress(customWalletAddress);
        if (student.firstName) {
          setStudent(student);
          console.log("Student record found:", student);
        } else {
          console.log("No student record found.");
        }

        // Fetch owned tokens
        const tokens = await contract.getOwnedTokens(customWalletAddress);
        setTokens(tokens);

        // Fetch the token URIs and verification status
        const ipfsUrls = [];
        for (const token of tokens) {
          const uri = await contract.getTokenURI(token);
          const response = await axios.get(uri);
          const data = response.data;

          const verificationResponse = await axios.get(`http://localhost:1433/status/${data.universityWallet}`);
          const isVerified = verificationResponse.data.verification_status === 'verified';

          ipfsUrls.push({
            url: data.ipfsUrl,
            isVerified,
            universityName: data.universityName,
            issuedDate: data.issuedDate,
            certificate: data.name
          });
        }

        setIpfsUrls(ipfsUrls);
        setDisplayOwnedTokens(true);
      } catch (err) {
        console.error("Error connecting to Ethereum or fetching data", err);
      }
    }
  };

  return (
    <center>
      <h1>Companies Page</h1>
      <Input
        type="text"
        placeholder="Enter custom wallet address"
        value={customWalletAddress}
        style={{ width: '400px', marginTop: '20px' }}
        onChange={(e) => setCustomWalletAddress(e.target.value)}
      />
      <Button type="primary" onClick={handleGetOwnedTokens} style={{ marginTop: '10px' }}>
        Get Owned Tokens
      </Button>

      {student && (
        <div style={{ marginTop: '20px' }}>
          <h2>Student Record</h2>
          <p>First Name: {student.firstName}</p>
          <p>Middle Name: {student.middleName}</p>
          <p>Last Name: {student.lastName}</p>
          <p>Birthday: {student.birthday}</p>
          <p>Occupancy: {student.occupancy}</p>
          <p>College: {student.college}</p>
        </div>
      )}

      {displayOwnedTokens && ipfsUrls.length > 0 && (
        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>
          <h2>Student Certificates</h2>
          {ipfsUrls.map((ipfsData, index) => (
            <div key={index} style={{ margin: '10px' }}>
              <img src={ipfsData.url} alt={`Student Certificate ${index}`} style={{ width: '200px', height: '200px' }} />
              <p>University: {ipfsData.universityName}</p>
              <p>Issued Date: {ipfsData.issuedDate}</p>
              <p>Certificate: {ipfsData.certificate}</p>
              {ipfsData.isVerified && <p>Verified</p>}
            </div>
          ))}
        </div>
      )}
    </center>
  );
}

export default CompaniesPage;
