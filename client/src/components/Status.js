import React from 'react';
import { Card, Typography } from 'antd';

const { Title } = Typography;

function Status({ status }) {
  return (
    <Card>
      <Title level={3}>Verification Status</Title>
      <p><strong>University Name:</strong> {status.name}</p>
      <p><strong>Website:</strong> {status.website}</p>
      <p><strong>Domain:</strong> {status.domain}</p>
      <p><strong>Status:</strong> {status.verification_status}</p>
      <p><strong>TXT Record:</strong> {status.txt_record}</p>
    </Card>
  );
}

export default Status;
