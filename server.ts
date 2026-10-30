import express from 'express';
import type { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';

// Increase payload limit to support base64 images for barber photos and gallery
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Database file path
const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'imperio_db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial DB structure fallback
interface DBStructure {
  config: any;
  services: any[];
  barbers: any[];
  products: any[];
  supplies: any[];
  plans: any[];
  appointments: any[];
  customers: any[];
  financialEntries: any[];
  comandas: any[];
  subscriptions: any[];
  updatedAt: string;
}

function readDB(): DBStructure {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      if (content.trim()) {
        return JSON.parse(content);
      }
    }
  } catch (err) {
    console.error('Error reading DB_FILE:', err);
  }

  // Return empty structure if not initialized yet
  return {
    config: null,
    services: [],
    barbers: [],
    products: [],
    supplies: [],
    plans: [],
    appointments: [],
    customers: [],
    financialEntries: [],
    comandas: [],
    subscriptions: [],
    updatedAt: new Date().toISOString(),
  };
}

function writeDB(data: Partial<DBStructure>): DBStructure {
  try {
    const current = readDB();
    const updated: DBStructure = {
      ...current,
      ...data,
      updatedAt: new Date().toISOString(),
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(updated, null, 2), 'utf-8');
    return updated;
  } catch (err) {
    console.error('Error writing DB_FILE:', err);
    throw err;
  }
}

// ==========================================
// API ROUTES FOR REAL MULTI-BROWSER SYNC
// ==========================================

// Get entire database state
app.get('/api/db', (_req: Request, res: Response) => {
  const db = readDB();
  res.json(db);
});

// Update or merge database state (used by sync service)
app.post('/api/db', (req: Request, res: Response) => {
  try {
    const incoming = req.body;
    const current = readDB();

    const merged: DBStructure = {
      ...current,
      config: incoming.config !== undefined ? incoming.config : current.config,
      services: incoming.services !== undefined ? incoming.services : current.services,
      barbers: incoming.barbers !== undefined ? incoming.barbers : current.barbers,
      products: incoming.products !== undefined ? incoming.products : current.products,
      supplies: incoming.supplies !== undefined ? incoming.supplies : current.supplies,
      plans: incoming.plans !== undefined ? incoming.plans : current.plans,
      appointments: incoming.appointments !== undefined ? incoming.appointments : current.appointments,
      customers: incoming.customers !== undefined ? incoming.customers : current.customers,
      financialEntries: incoming.financialEntries !== undefined ? incoming.financialEntries : current.financialEntries,
      comandas: incoming.comandas !== undefined ? incoming.comandas : current.comandas,
      subscriptions: incoming.subscriptions !== undefined ? incoming.subscriptions : current.subscriptions,
      updatedAt: new Date().toISOString(),
    };

    writeDB(merged);
    res.json({ success: true, updatedAt: merged.updatedAt });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Barbers CRUD
app.get('/api/barbers', (_req: Request, res: Response) => {
  const db = readDB();
  res.json(db.barbers || []);
});

app.post('/api/barbers', (req: Request, res: Response) => {
  const db = readDB();
  const barber = req.body;
  if (!barber.id) {
    barber.id = 'barber-' + Date.now();
  }
  const current = db.barbers || [];
  const existingIndex = current.findIndex((b: any) => b.id === barber.id);

  let updatedBarbers: any[];
  if (existingIndex >= 0) {
    updatedBarbers = current.map((b: any) => (b.id === barber.id ? barber : b));
  } else {
    updatedBarbers = [...current, barber];
  }

  writeDB({ barbers: updatedBarbers });
  res.json({ success: true, barber, barbers: updatedBarbers });
});

app.delete('/api/barbers/:id', (req: Request, res: Response) => {
  const db = readDB();
  const { id } = req.params;
  const updatedBarbers = (db.barbers || []).filter((b: any) => b.id !== id);
  writeDB({ barbers: updatedBarbers });
  res.json({ success: true, barbers: updatedBarbers });
});

// Appointments CRUD
app.get('/api/appointments', (_req: Request, res: Response) => {
  const db = readDB();
  res.json(db.appointments || []);
});

app.post('/api/appointments', (req: Request, res: Response) => {
  const db = readDB();
  const appointment = req.body;
  if (!appointment.id) {
    appointment.id = 'apt-' + Date.now();
  }
  const current = db.appointments || [];
  const updated = [appointment, ...current.filter((a: any) => a.id !== appointment.id)];

  // Also auto-register customer on server
  let updatedCustomers = db.customers || [];
  if (appointment.customerWhatsapp) {
    const existingCust = updatedCustomers.find((c: any) => c.whatsapp === appointment.customerWhatsapp);
    if (existingCust) {
      updatedCustomers = updatedCustomers.map((c: any) =>
        c.id === existingCust.id
          ? {
              ...c,
              totalAppointments: (c.totalAppointments || 1) + 1,
              lastVisit: appointment.date || new Date().toISOString().slice(0, 10),
            }
          : c
      );
    } else {
      updatedCustomers = [
        {
          id: 'cust-' + Date.now(),
          name: appointment.customerName,
          whatsapp: appointment.customerWhatsapp,
          totalAppointments: 1,
          lastVisit: appointment.date || new Date().toISOString().slice(0, 10),
          createdAt: new Date().toISOString().slice(0, 10),
        },
        ...updatedCustomers,
      ];
    }
  }

  writeDB({ appointments: updated, customers: updatedCustomers });
  res.json({ success: true, appointment, appointments: updated });
});

app.put('/api/appointments/:id', (req: Request, res: Response) => {
  const db = readDB();
  const { id } = req.params;
  const updatedData = req.body;
  const current = db.appointments || [];
  const updated = current.map((a: any) => (a.id === id ? { ...a, ...updatedData } : a));
  writeDB({ appointments: updated });
  res.json({ success: true, appointments: updated });
});

app.delete('/api/appointments/:id', (req: Request, res: Response) => {
  const db = readDB();
  const { id } = req.params;
  const current = db.appointments || [];
  const updated = current.filter((a: any) => a.id !== id);
  writeDB({ appointments: updated });
  res.json({ success: true, appointments: updated });
});

// Comandas CRUD
app.get('/api/comandas', (_req: Request, res: Response) => {
  const db = readDB();
  res.json(db.comandas || []);
});

app.post('/api/comandas', (req: Request, res: Response) => {
  const db = readDB();
  const comanda = req.body;
  const current = db.comandas || [];
  const existingIdx = current.findIndex((c: any) => c.id === comanda.id);

  let updatedComandas: any[];
  if (existingIdx >= 0) {
    updatedComandas = current.map((c: any) => (c.id === comanda.id ? comanda : c));
  } else {
    updatedComandas = [comanda, ...current];
  }

  writeDB({ comandas: updatedComandas });
  res.json({ success: true, comanda, comandas: updatedComandas });
});

// Subscriptions CRUD
app.get('/api/subscriptions', (_req: Request, res: Response) => {
  const db = readDB();
  res.json(db.subscriptions || []);
});

app.post('/api/subscriptions', (req: Request, res: Response) => {
  const db = readDB();
  const subscription = req.body;
  const current = db.subscriptions || [];
  const existingIdx = current.findIndex((s: any) => s.id === subscription.id);

  let updated: any[];
  if (existingIdx >= 0) {
    updated = current.map((s: any) => (s.id === subscription.id ? subscription : s));
  } else {
    updated = [subscription, ...current];
  }

  writeDB({ subscriptions: updated });
  res.json({ success: true, subscription, subscriptions: updated });
});

// Reset Operational Data across all devices
app.post('/api/reset-operational', (_req: Request, res: Response) => {
  writeDB({
    appointments: [],
    financialEntries: [],
    customers: [],
    comandas: [],
  });
  res.json({ success: true, message: 'Dados operacionais zerados no servidor.' });
});

// Mount Vite or static server
async function startServer() {
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(process.cwd(), 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(process.cwd(), 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`> Servidor Barbearia Império rodando na porta ${PORT}`);
  });
}

startServer();
