import React, { useState, useEffect } from "react";
import StudentRecord from "./StudentRecord.json";
import { ethers } from "ethers";
import contractABI from './IDCDS.json';
import axios from 'axios';

const studentRecordAddress = "0x664C935800D333006f3C74aB5CB5b91AD8577680";
const contractAddress = "0x7EF8C8c735aF5e06f03D1a10CfC8C06C2f4aCA9b"; // Replace with your actual contract address

function StudentsPage() {
  const [formInput, setFormInput] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    birthday: "",
    occupancy: "",
    college: ""
  });
  const [student, setStudent] = useState(null);
  const [walletConnected, setWalletConnected] = useState(false);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [ipfsUrls, setIpfsUrls] = useState([]);
  const [tokens, setTokens] = useState([]);
  const [walletAddress, setWalletAddress] = useState(null);
  const [University, setUniversity] = useState(null);
  const [IssuedDate, setIssuedDate] = useState(null);
  const [Certificate, setCertificate] = useState(null);

  useEffect(() => {
    if (walletConnected) {
      fetchStudent();
    }
  }, [walletConnected]);

  const connectWallet = async () => {
    try {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        setProvider(provider);
        setSigner(signer);
        setWalletConnected(true);
        setWalletAddress(accounts[0]);
        console.log("Wallet connected:", accounts[0]);
      } else {
        alert("Please install MetaMask to use this feature.");
      }
    } catch (err) {
      console.error("Error connecting to wallet", err);
    }
  };

  const addStudent = async () => {
    try {
      if (!signer) {
        await connectWallet();
      }
      const contract = new ethers.Contract(studentRecordAddress, StudentRecord.abi, signer);
      const transaction = await contract.addStudent(
        formInput.firstName,
        formInput.middleName,
        formInput.lastName,
        formInput.birthday,
        formInput.occupancy,
        formInput.college,
        { value: ethers.utils.parseEther("0.005") }
      );
      await transaction.wait();
      alert("Student record added!");
      fetchStudent();
    } catch (error) {
      console.error("Error adding student record", error);
    }
  };

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

  const fetchImages = async (walletAddress) => {
    console.log("Fetching images for wallet address:", walletAddress);
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(contractAddress, contractABI.abi, provider);
      const tokens = await contract.getOwnedTokens(walletAddress); // Assuming this function exists on your contract
      console.log("Owned tokens:", tokens);
      const ipfsUrls = [];

      for (const token of tokens) {
        const uri = await contract.getTokenURI(token);
        console.log("Token URI:", uri);
        const response = await axios.get(uri);
        const data = response.data;
        setUniversity(data.universityName);
        setIssuedDate(data.IssuedDate);
        setCertificate(data.name);
        // Fetch verification status
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

      setTokens(tokens);
      setIpfsUrls(ipfsUrls);
    } catch (error) {
      console.error("Error fetching images:", error);
    }
  };

  return (
    <div>
      <h1>Student Registration</h1>
      {!walletConnected ? (
        <button onClick={connectWallet}>Connect Wallet</button>
      ) : (
        <>
          {student ? (
            <div>
              <h2>Student Record</h2>
              <p>First Name: {student.firstName}</p>
              <p>Middle Name: {student.middleName}</p>
              <p>Last Name: {student.lastName}</p>
              <p>Birthday: {student.birthday}</p>
              <p>Occupancy: {student.occupancy}</p>
              <p>College: {student.college}</p>
            </div>
          ) : (
            <>
              <input
                placeholder="First Name"
                onChange={(e) => setFormInput({ ...formInput, firstName: e.target.value })}
              />
              <input
                placeholder="Middle Name"
                onChange={(e) => setFormInput({ ...formInput, middleName: e.target.value })}
              />
              <input
                placeholder="Last Name"
                onChange={(e) => setFormInput({ ...formInput, lastName: e.target.value })}
              />
              <input
                placeholder="Birthday"
                onChange={(e) => setFormInput({ ...formInput, birthday: e.target.value })}
              />
              <input
                placeholder="Occupancy"
                onChange={(e) => setFormInput({ ...formInput, occupancy: e.target.value })}
              />
              <input
                placeholder="College"
                onChange={(e) => setFormInput({ ...formInput, college: e.target.value })}
              />
              <button onClick={addStudent}>Register</button>
            </>
          )}
          {ipfsUrls.length > 0 && (
            <div>
              <h2>Student Certificates</h2>
              <div style={{ display: 'flex', flexWrap: 'wrap' }}>
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
            </div>
          )}
        </>
      )}
    </div>
  );
  
}

export default StudentsPage;
