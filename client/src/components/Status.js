import React from 'react';

function Status({ status }) {
  return (
    <div>
      <h2>Verification Status</h2>
      <p>University Name: {status.name}</p>
      <p>Website: {status.website}</p>
      <p>Domain: {status.domain}</p>
      <p>Status: {status.verification_status}</p>
      <p>TXT Record: {status.txt_record}</p>
    </div>
  );
}

export default Status;