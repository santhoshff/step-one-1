import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, 'operators.json');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend clients
app.use(cors());
app.use(express.json());

// Endpoint to register operator and sync configuration
app.post('/api/register', (req, res) => {
  try {
    const { firstName, lastName, email, password, config } = req.body;

    if (!firstName || !lastName || !email || !password) {
      console.log('[-] Registration Failed: Missing required credentials');
      return res.status(400).json({
        status: 'error',
        message: 'Missing required credentials'
      });
    }

    const frequency = config?.frequency || 'Quantum Sync';
    const voice = config?.voice || 'EVA-01 (Soprano)';
    const theme = config?.theme || 'Monochrome Dark';

    // Generate simulated Operator key
    const operatorId = `EVA-OP-${Math.floor(100000 + Math.random() * 900000)}`;
    const timestamp = new Date().toISOString();

    const newOperator = {
      operatorId,
      firstName,
      lastName,
      email,
      config: {
        frequency,
        voice,
        theme
      },
      timestamp
    };

    // Console Logging for Visual Feedback
    console.log('\n=========================================');
    console.log(`[+] NEW OPERATOR ACTIVE: ${operatorId}`);
    console.log(`    NAME:      ${firstName} ${lastName}`);
    console.log(`    EMAIL:     ${email}`);
    console.log(`    CORE CLK:  ${frequency}`);
    console.log(`    VOICE:     ${voice}`);
    console.log(`    THEME:     ${theme}`);
    console.log('=========================================\n');

    // Save to operators.json file
    let operators = [];
    if (fs.existsSync(DATA_FILE)) {
      try {
        const fileData = fs.readFileSync(DATA_FILE, 'utf8');
        operators = JSON.parse(fileData);
      } catch (err) {
        console.error('[-] Error reading database file, resetting database:', err.message);
      }
    }

    operators.push(newOperator);
    fs.writeFileSync(DATA_FILE, JSON.stringify(operators, null, 2), 'utf8');

    return res.status(200).json({
      status: 'success',
      message: 'Operator neural link successfully established.',
      operatorId,
      timestamp,
      syncChannel: email.toLowerCase()
    });
  } catch (error) {
    console.error('[-] Server Error during registration:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server initialization error.'
    });
  }
});

// GET endpoint to see registered operators (optional diagnostic)
app.get('/api/operators', (req, res) => {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const fileData = fs.readFileSync(DATA_FILE, 'utf8');
      return res.status(200).json(JSON.parse(fileData));
    }
    return res.status(200).json([]);
  } catch (error) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`[SYS] EVA AI Backend listening on port ${PORT}`);
  console.log(`[SYS] CORS enabled for external clients`);
});
