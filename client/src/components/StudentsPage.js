import React, { useState, useEffect } from "react";
import StudentRecord from "./StudentRecord.json";
import { ethers } from "ethers";
import contractABI from './IDCDS.json';
import axios from 'axios';
import { Layout, Typography, Divider, Card, Button, Form, Input, Row, Col, Avatar, Descriptions, Alert } from 'antd';
import { UserOutlined } from '@ant-design/icons';

const { Header, Content } = Layout;
const { Title, Text } = Typography;


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
    <Layout style={{ minHeight: '100vh' }}>
  <Header style={{ backgroundColor: '#001529', padding: '10px 60px', minHeight: '150px', marginTop: '20px' }}>
    <Divider>
      <Title style={{ color: '#fff', lineHeight: '64px' }}>Student Portal</Title>
    </Divider>
  </Header>
  <Content style={{ padding: '50px' }}>
    <Card style={{ maxWidth: '800px', margin: '0 auto' }}>
      {!walletConnected ? (
        <Button type="primary" onClick={connectWallet} style={{ width: 'auto', margin: '0 auto', display: 'block' }}>
          Connect Wallet
        </Button>
      ) : (
        <>
          {student ? (
            <div style={{ textAlign: 'center' }}>
              <Avatar size={64} icon={<UserOutlined />} />
              <Title level={3} style={{ marginTop: '16px' }}>{student.firstName} {student.lastName}</Title>
              <Descriptions bordered column={1}>
                <Descriptions.Item label="First Name">{student.firstName}</Descriptions.Item>
                <Descriptions.Item label="Middle Name">{student.middleName}</Descriptions.Item>
                <Descriptions.Item label="Last Name">{student.lastName}</Descriptions.Item>
                <Descriptions.Item label="Birthday">{student.birthday}</Descriptions.Item>
                <Descriptions.Item label="Occupancy">{student.occupancy}</Descriptions.Item>
                <Descriptions.Item label="College">{student.college}</Descriptions.Item>
              </Descriptions>
            </div>
          ) : (
            <Form layout="vertical">
              <Form.Item label="First Name">
                <Input
                  placeholder="First Name"
                  onChange={(e) => setFormInput({ ...formInput, firstName: e.target.value })}
                />
              </Form.Item>
              <Form.Item label="Middle Name">
                <Input
                  placeholder="Middle Name"
                  onChange={(e) => setFormInput({ ...formInput, middleName: e.target.value })}
                />
              </Form.Item>
              <Form.Item label="Last Name">
                <Input
                  placeholder="Last Name"
                  onChange={(e) => setFormInput({ ...formInput, lastName: e.target.value })}
                />
              </Form.Item>
              <Form.Item label="Birthday">
                <Input
                  placeholder="Birthday"
                  onChange={(e) => setFormInput({ ...formInput, birthday: e.target.value })}
                />
              </Form.Item>
              <Form.Item label="Occupancy">
                <Input
                  placeholder="Occupancy"
                  onChange={(e) => setFormInput({ ...formInput, occupancy: e.target.value })}
                />
              </Form.Item>
              <Form.Item label="College">
                <Input
                  placeholder="College"
                  onChange={(e) => setFormInput({ ...formInput, college: e.target.value })}
                />
              </Form.Item>
              <Form.Item>
                <Button type="primary" onClick={addStudent} block>
                  Register
                </Button>
              </Form.Item>
            </Form>
          )}
          {ipfsUrls.length > 0 && (
            <div>
              <Title level={3}>STUDENT CERTIFICATES</Title>
              <Row gutter={16}>
                {ipfsUrls.map((ipfsData, index) => (
                  <Col span={8} key={index} style={{ marginBottom: '16px' }}>
                    <Card
                      cover={<img src={ipfsData.url} alt={`Student Certificate ${index}`} style={{ width: '100%', height: 'auto' }} />}
                    >
                      <Card.Meta
                        title={ipfsData.certificate}
                        description={
                          <div>
                            <p><b>University:</b>{ipfsData.universityName}</p>
                            <p><b>Issued Date:</b>{ipfsData.issuedDate}</p>
                            {ipfsData.isVerified && <Alert message="Verified" type="success" showIcon />}
                          </div>
                        }
                      />
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>
          )}
        </>
      )}
    </Card>
  </Content>
</Layout>
  );
}

export default StudentsPage;
