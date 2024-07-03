import React, { useState } from 'react';
import { Layout, Typography, Divider, Card, Button, Input, Row, Col, Avatar, Descriptions, Alert } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { ethers } from 'ethers';
import axios from 'axios';
import contractABI from './IDCDS.json';
import StudentRecord from "./StudentRecord.json"; // Import your StudentRecord contract ABI

const { Header, Content } = Layout;
const { Title } = Typography;

const contractAddress = "0x7EF8C8c735aF5e06f03D1a10CfC8C06C2f4aCA9b"; // Replace with your actual contract address
const studentRecordAddress = "0x664C935800D333006f3C74aB5CB5b91AD8577680"; // Replace with your actual student record contract address

function CompaniesPage() {
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

          const verificationResponse = await axios.get(`https://server-divine-grass-2313.fly.dev/status/${data.universityWallet}`);
          const isVerified = verificationResponse.data.verification_status === 'verified';

          ipfsUrls.push({
            url: data.ipfsUrl,
            isVerified,
            universityName: data.universityName,
            issuedDate: data.IssuedDate,
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
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ backgroundColor: '#001529', padding: '10px 60px', minHeight: '150px', marginTop: '20px' }}>
        <Divider>
          <Title style={{ color: '#fff', lineHeight: '64px' }}>Companies Portal</Title>
        </Divider>
      </Header>
      <Content style={{ padding: '50px' }}>
      <Card style={{ maxWidth: '800px', margin: '0 auto' }}>
  <Row gutter={16}>
    <Col flex="auto">
      <Input
        type="text"
        placeholder="Enter custom wallet address"
        value={customWalletAddress}
        onChange={(e) => setCustomWalletAddress(e.target.value)}
      />
    </Col>
    <Col>
      <Button type="primary" onClick={handleGetOwnedTokens}>
        Get Owned Tokens
      </Button>
    </Col>
  </Row>

  {student && (
    <div style={{ marginTop: '20px', textAlign: 'center' }}>
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
  )}

  {displayOwnedTokens && ipfsUrls.length > 0 && (
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
</Card>
      </Content>
    </Layout>
  );
}

export default CompaniesPage;
