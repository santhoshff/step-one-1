import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, 'operators.json');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'eva_fallback_secret_key';

// Initialize Supabase Client if credentials are provided
let supabase = null;
if (process.env.SUPABASE_URL && process.env.SUPABASE_KEY) {
  try {
    supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
    console.log('[SYS] Supabase connection configured.');
  } catch (err) {
    console.error('[-] Supabase initialization failed:', err.message);
  }
} else {
  console.log('[SYS] No Supabase credentials. Falling back to local offline JSON storage.');
}

app.use(cors());
app.use(express.json());

// Helper: read local DB
const getLocalOperators = () => {
  if (fs.existsSync(DATA_FILE)) {
    try {
      const data = fs.readFileSync(DATA_FILE, 'utf8');
      return JSON.parse(data);
    } catch (e) {
      console.error('[-] Error reading local operators database:', e.message);
      return [];
    }
  }
  return [];
};

// Helper: write local DB
const saveLocalOperators = (operators) => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(operators, null, 2), 'utf8');
    return true;
  } catch (e) {
    console.error('[-] Error writing local operators database:', e.message);
    return false;
  }
};

// Middleware: Authenticate JWT Token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ status: 'error', message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ status: 'error', message: 'Invalid or expired token' });
    }
    req.user = decoded;
    next();
  });
};

// Route: User Registration
app.post('/api/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password, config } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ status: 'error', message: 'All registration credentials are required' });
    }

    const emailLower = email.toLowerCase();
    const operatorId = `EVA-OP-${Math.floor(100000 + Math.random() * 900000)}`;
    const hashedPassword = await bcrypt.hash(password, 10);
    const timestamp = new Date().toISOString();

    const initialConfig = config || {
      frequency: '4.8 GHz',
      voice: 'Silent Interface',
      theme: 'Monochrome Dark',
      personality: 'Assistant',
      responseSpeed: 'Fast',
      reasoningDepth: 'Standard',
      memoryMode: 'Temporary',
      privacyMode: 'Standard'
    };

    if (supabase) {
      // Check if email exists in Supabase
      const { data: existingUser } = await supabase
        .from('operators')
        .select('email')
        .eq('email', emailLower)
        .single();

      if (existingUser) {
        return res.status(400).json({ status: 'error', message: 'Email address already bound to another operator shell' });
      }

      // Insert into Supabase
      const { error: insertError } = await supabase
        .from('operators')
        .insert({
          operator_id: operatorId,
          first_name: firstName,
          last_name: lastName,
          email: emailLower,
          password_hash: hashedPassword,
          config: initialConfig,
          created_at: timestamp
        });

      if (insertError) {
        throw insertError;
      }
    } else {
      // Local fallback DB operations
      const operators = getLocalOperators();
      if (operators.some(op => op.email === emailLower)) {
        return res.status(400).json({ status: 'error', message: 'Email address already bound to another operator shell' });
      }

      const newOp = {
        operatorId,
        firstName,
        lastName,
        email: emailLower,
        passwordHash: hashedPassword,
        config: initialConfig,
        timestamp
      };

      operators.push(newOp);
      saveLocalOperators(operators);
    }

    console.log(`[+] OPERATOR LINKED: ${operatorId} (${firstName} ${lastName})`);

    // Generate JWT token
    const token = jwt.sign({ operatorId, email: emailLower }, JWT_SECRET, { expiresIn: '7d' });

    return res.status(200).json({
      status: 'success',
      message: 'Operator neural link established successfully.',
      token,
      operator: {
        operatorId,
        firstName,
        lastName,
        email: emailLower,
        config: initialConfig
      }
    });
  } catch (error) {
    console.error('[-] Error during operator registration:', error);
    return res.status(500).json({ status: 'error', message: 'Internal server initialization error during registration.' });
  }
});

// Route: User Login (Sign In)
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ status: 'error', message: 'Email and password are required' });
    }

    const emailLower = email.toLowerCase();
    let user = null;

    if (supabase) {
      const { data, error } = await supabase
        .from('operators')
        .select('*')
        .eq('email', emailLower)
        .single();

      if (data) {
        user = {
          operatorId: data.operator_id,
          firstName: data.first_name,
          lastName: data.last_name,
          email: data.email,
          passwordHash: data.password_hash,
          config: data.config
        };
      }
    } else {
      const operators = getLocalOperators();
      const localUser = operators.find(op => op.email === emailLower);
      if (localUser) {
        user = localUser;
      }
    }

    if (!user) {
      return res.status(401).json({ status: 'error', message: 'Invalid credentials or operator signature' });
    }

    // Verify Password Hash
    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      return res.status(401).json({ status: 'error', message: 'Security password mismatch' });
    }

    console.log(`[+] OPERATOR INGRESS: ${user.operatorId}`);

    // Generate JWT token
    const token = jwt.sign({ operatorId: user.operatorId, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    return res.status(200).json({
      status: 'success',
      message: 'Operator validated. Welcome back.',
      token,
      operator: {
        operatorId: user.operatorId,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        config: user.config
      }
    });
  } catch (error) {
    console.error('[-] Error during login verification:', error);
    return res.status(500).json({ status: 'error', message: 'Internal login verification failed.' });
  }
});

// Route: Get Session profile (auto-login)
app.get('/api/session', authenticateToken, async (req, res) => {
  try {
    const { operatorId, email } = req.user;
    let user = null;

    if (supabase) {
      const { data } = await supabase
        .from('operators')
        .select('*')
        .eq('operator_id', operatorId)
        .single();

      if (data) {
        user = {
          operatorId: data.operator_id,
          firstName: data.first_name,
          lastName: data.last_name,
          email: data.email,
          config: data.config
        };
      }
    } else {
      const operators = getLocalOperators();
      const localUser = operators.find(op => op.operatorId === operatorId);
      if (localUser) {
        user = {
          operatorId: localUser.operatorId,
          firstName: localUser.firstName,
          lastName: localUser.lastName,
          email: localUser.email,
          config: localUser.config
        };
      }
    }

    if (!user) {
      return res.status(404).json({ status: 'error', message: 'Operator credentials profile not found' });
    }

    return res.status(200).json({
      status: 'success',
      operator: user
    });
  } catch (error) {
    console.error('[-] Error checking session token:', error);
    return res.status(500).json({ status: 'error', message: 'Failed to verify active synapse link.' });
  }
});

// Route: Update Operator settings configuration
app.post('/api/save-config', authenticateToken, async (req, res) => {
  try {
    const { operatorId } = req.user;
    const { config } = req.body;

    if (!config) {
      return res.status(400).json({ status: 'error', message: 'Configuration parameters required' });
    }

    if (supabase) {
      const { error } = await supabase
        .from('operators')
        .update({ config })
        .eq('operator_id', operatorId);

      if (error) throw error;
    } else {
      const operators = getLocalOperators();
      const idx = operators.findIndex(op => op.operatorId === operatorId);
      if (idx === -1) {
        return res.status(404).json({ status: 'error', message: 'Operator signature not found' });
      }
      operators[idx].config = {
        ...operators[idx].config,
        ...config
      };
      saveLocalOperators(operators);
    }

    console.log(`[+] CONFIG SAVED FOR ${operatorId}`);

    return res.status(200).json({
      status: 'success',
      message: 'Workspace settings synchronized with neural core.'
    });
  } catch (error) {
    console.error('[-] Error saving configuration settings:', error);
    return res.status(500).json({ status: 'error', message: 'Unable to synchronize workspace configuration.' });
  }
});

app.listen(PORT, () => {
  console.log(`[SYS] EVA AI Neural Core listening on port ${PORT}`);
});
