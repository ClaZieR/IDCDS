import React, { useState } from 'react';
import axios from 'axios';
import { Form, Input, Button, Card, Typography, Alert } from 'antd';

const { Title } = Typography;

function Register({ walletAddress }) {
  const [formData, setFormData] = useState({ name: '', website: '', domain: '' });
  const [txtRecord, setTxtRecord] = useState('');

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prevState => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      const response = await axios.post('http://localhost:1433/register', { ...formData, walletAddress });
      setTxtRecord(response.data.txtRecord);
    } catch (error) {
      console.error("Error during registration:", error);
    }
  };

  return (
    <Card style={{ maxWidth: '600px', margin: '0 auto', padding: '24px' }}>
      <Title level={2}>Register University</Title>
      <Form layout="vertical" onFinish={handleSubmit}>
        <Form.Item label="University Name" required>
          <Input name="name" placeholder="University Name" onChange={handleChange} />
        </Form.Item>
        <Form.Item label="University Website" required>
          <Input name="website" placeholder="University Website" onChange={handleChange} />
        </Form.Item>
        <Form.Item label="University Domain" required>
          <Input name="domain" placeholder="University Domain" onChange={handleChange} />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">Register</Button>
        </Form.Item>
      </Form>
      {txtRecord && (
        <Alert
          message="TXT Record"
          description={
            <div>
              <p>{txtRecord}</p>
              <p>Add this TXT record to your DNS settings.</p>
            </div>
          }
          type="info"
          showIcon
        />
      )}
    </Card>
  );
}

export default Register;
