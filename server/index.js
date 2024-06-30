const express = require('express');
const bodyParser = require('body-parser');
const sql = require('mssql');
const dns = require('dns');
const crypto = require('crypto');
const cors = require('cors'); // Import CORS middleware
require('dotenv').config();

const app = express();
app.use(bodyParser.json());
app.use(cors()); // Use CORS middleware

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER, 
  database: process.env.DB_DATABASE,
  options: {
    encrypt: true, // for azure
    trustServerCertificate: true // change to true for local dev / self-signed certs
  }
};

sql.connect(config, err => {
  if (err) throw err;
  console.log('Database connected!');
});

function generateTxtRecord() {
  return crypto.randomBytes(16).toString('hex');
}

app.post('/register', async (req, res) => {
  const { walletAddress, name, website, domain } = req.body;
  const txtRecord = generateTxtRecord();

  try {
    const pool = await sql.connect(config);
    const result = await pool.request()
      .input('walletAddress', sql.NVarChar, walletAddress)
      .query('SELECT * FROM universities WHERE wallet_address = @walletAddress');

    if (result.recordset.length > 0) {
      res.status(400).send('Wallet address already registered');
    } else {
      await pool.request()
        .input('name', sql.NVarChar, name)
        .input('website', sql.NVarChar, website)
        .input('domain', sql.NVarChar, domain)
        .input('walletAddress', sql.NVarChar, walletAddress)
        .input('txtRecord', sql.NVarChar, txtRecord)
        .input('verificationStatus', sql.NVarChar, 'pending')
        .query('INSERT INTO universities (name, website, domain, wallet_address, txt_record, verification_status) VALUES (@name, @website, @domain, @walletAddress, @txtRecord, @verificationStatus)');
      
      res.send({ msg: 'University registered', txtRecord });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal server error');
  }
});

app.get('/status/:walletAddress', async (req, res) => {
  const { walletAddress } = req.params;

  try {
    const pool = await sql.connect(config);
    const result = await pool.request()
      .input('walletAddress', sql.NVarChar, walletAddress)
      .query('SELECT * FROM universities WHERE wallet_address = @walletAddress');

    if (result.recordset.length > 0) {
      res.send(result.recordset[0]);
    } else {
      res.status(200).json({ msg: 'No record found' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal server error');
  }
});

app.post('/verify', async (req, res) => {
    const { walletAddress } = req.body;
  
    try {
      const pool = await sql.connect(config);
      const result = await pool.request()
        .input('walletAddress', sql.NVarChar, walletAddress)
        .query('SELECT * FROM universities WHERE wallet_address = @walletAddress');
  
      if (result.recordset.length > 0) {
        const university = result.recordset[0];
        
        // Check if verification status is 'pending'
        if (university.verification_status == 'verified' ) {
          return res.status(400).send('Verification already completed');
        }
  
        // Resolve TXT records for the university's domain
        dns.resolveTxt(university.domain, async (err, records) => {
          if (err) {
            console.error(err);
            return res.status(500).send('DNS Resolution Failed');
          }
  
          // Check if the TXT record includes the university's generated record
          console.log(records)
          const verified = records.some(record => record.includes(university.txt_record));
          const status = verified ? 'verified' : 'failed';
          
          // Update verification status in the database
          await pool.request()
            .input('status', sql.NVarChar, status)
            .input('walletAddress', sql.NVarChar, walletAddress)
            .query('UPDATE universities SET verification_status = @status WHERE wallet_address = @walletAddress');
  
          res.send({ msg: `Verification ${status}` });
        });
      } else {
        res.status(404).send('No record found');
      }
    } catch (err) {
      console.error(err);
      res.status(500).send('Internal server error');
    }
  });
  

  app.get('/university/:walletAddress', async (req, res) => {
    const { walletAddress } = req.params;
  
    try {
      const pool = await sql.connect(config);
      const result = await pool.request()
        .input('walletAddress', sql.NVarChar, walletAddress)
        .query('SELECT name, website ,id FROM universities WHERE wallet_address = @walletAddress');
  
      if (result.recordset.length > 0) {
        res.send(result.recordset[0]);
      } else {
        res.status(404).send('No record found');
      }
    } catch (err) {
      console.error(err);
      res.status(500).send('Internal server error');
    }
  });

const PORT = process.env.DB_PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});