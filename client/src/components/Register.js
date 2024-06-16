import React, { useState } from 'react';
import axios from 'axios';

function Register({ walletAddress }) {
  const [formData, setFormData] = useState({ name: '', website: '', domain: '' });
  const [txtRecord, setTxtRecord] = useState('');

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prevState => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const response = await axios.post('http://localhost:1433/register', { ...formData, walletAddress });
    setTxtRecord(response.data.txtRecord);
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input name="name" placeholder="University Name" onChange={handleChange} />
        <input name="website" placeholder="University Website" onChange={handleChange} />
        <input name="domain" placeholder="University Domain" onChange={handleChange} />
        <button type="submit">Register</button>
      </form>
      {txtRecord && (
        <div>
          <p>TXT Record: {txtRecord}</p>
          <p>Add this TXT record to your DNS settings.</p>
        </div>
      )}
    </div>
  );
}

export default Register;