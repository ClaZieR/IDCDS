import React, { useState, useEffect } from "react";
import StudentRecord from "./StudentRecord.json";
import { ethers } from "ethers";
import contractABI from './IDCDS.json';

const studentRecordAddress = "0xD83B69B76f8e8a45722BfbeBb4D88b329ac593De";
const contractAddress = "0x03826837bd6660932d824a3F939166a6DF0479e8"; // Replace with your actual contract address
const contract = new ethers.Contract(contractAddress, contractABI.abi);

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
        await fetchImages(student.walletAddress); // Fetch images related to student's wallet address
      }
    } catch (error) {
      console.error("No student record found:", error);
    }
  };

  const fetchImages = async (walletAddress) => {
    try {
      const tokens = await contract.getOwnedTokens(walletAddress); // Assuming this function exists on your contract
      const ipfsUrls = [];
      for (const token of tokens) {
        const uri = await contract.getTokenURI(token);
        // Assuming the URI format is correct and you fetch the image URL from IPFS
        const response = await fetch(uri);
        const data = await response.json();
        ipfsUrls.push(data.ipfsUrl);
      }
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
              <h2>Student Images</h2>
              <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                {ipfsUrls.map((url, index) => (
                  <img key={index} src={url} alt={`Student Image ${index}`} style={{ width: '200px', height: '200px', margin: '10px' }} />
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
