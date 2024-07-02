import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import { Button, Card, Layout, Typography, Spin, Divider } from 'antd';
import Register from './Register';
import Status from './Status';
import Verify from './Verify';

const { Header, Content, Footer } = Layout;
const { Title } = Typography;

function Unifront() {
  const [walletAddress, setWalletAddress] = useState(null);
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [renderRegister, setRenderRegister] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (walletAddress) {
      checkStatus();
    }
  }, [walletAddress]);

  useEffect(() => {
    if (verificationStatus && verificationStatus.verification_status === 'verified') {
      navigate('/university');
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
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ backgroundColor: '#001529', padding: '10px 60px', minHeight: '150px', marginTop: '20px' }}>
        <Divider>
          <Title style={{ color: '#fff', lineHeight: '64px' }}>University Verification</Title>
        </Divider>
      </Header>
      <Content style={{ padding: '50px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Card style={{ maxWidth: '800px', width: '100%' }}>
          {walletAddress ? (
            verificationStatus ? (
              <div>
                <Status status={verificationStatus} />
                {(verificationStatus.verification_status === 'pending' || verificationStatus.verification_status === 'failed') && (
                  <Verify walletAddress={walletAddress} refreshStatus={checkStatus} />
                )}
              </div>
            ) : (
              renderRegister ? (
                <div>
                  <Register walletAddress={walletAddress} />
                </div>
              ) : (
                <Spin size="large" />
              )
            )
          ) : (
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <Button type="primary" onClick={connectWallet}>Connect Metamask</Button>
            </div>
          )}
          {walletAddress && renderRegister && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
              <Button type="primary" onClick={checkStatus}>Check Status</Button>
            </div>
          )}
        </Card>
      </Content>
      <Footer style={{ textAlign: 'center' }}>
        University Verification ©2024 Created By Chamith Silva
      </Footer>
    </Layout>
  );
}

export default Unifront;
