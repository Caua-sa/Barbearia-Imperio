import fs from 'fs';
import path from 'path';

// Vercel Serverless Function entry point
// Handles /api/db, /api/barbers, /api/appointments, etc. with in-memory & /tmp persistence
const DATA_FILE = path.resolve('/tmp', 'imperio_db.json');

// In-memory fallback if filesystem is cold
let memoryDB: any = null;

// Parse request body reliably on Vercel
async function parseBody(req: any): Promise<any> {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  return new Promise((resolve) => {
    let raw = '';
    req.on('data', (chunk: any) => {
      raw += chunk;
    });
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        resolve({});
      }
    });
    req.on('error', () => resolve({}));
  });
}

function getDefaultBarbers() {
  return [
    {
      id: 'barber-marcus',
      name: 'Marcus Vinicius',
      nickname: 'Marcus',
      role: 'Master Barber & Fundador',
      rating: 4.98,
      totalReviews: 142,
      photoUrl: '/assets/images/barber_marcus_1793279571037.jpg',
      bio: 'Especialista em Degradê Imperial, cortes na tesoura artesanal e alinhamento milimétrico.',
      specialties: ['Degradê Navalhado', 'Corte Clássico', 'Visagismo'],
      active: true,
      commissionPercentage: 50,
      workingHours: { start: '09:00', end: '20:00' },
    },
    {
      id: 'barber-lucas',
      name: 'Lucas Rocha',
      nickname: 'Lucas',
      role: 'Especialista em Barboterapia',
      rating: 4.95,
      totalReviews: 98,
      photoUrl: '/assets/images/barber_lucas_1793279572541.jpg',
      bio: 'Mestre na navalha clássica, tratamento de pele com toalha quente aromática e ozonioterapia.',
      specialties: ['Barboterapia Quente', 'Tratamento Facial', 'Barba Terapêutica'],
      active: true,
      commissionPercentage: 50,
      workingHours: { start: '09:00', end: '20:00' },
    },
    {
      id: 'barber-rafael',
      name: 'Rafael Silva',
      nickname: 'Rafael',
      role: 'Barbeiro & Visagista',
      rating: 4.92,
      totalReviews: 87,
      photoUrl: '/assets/images/barber_rafael_1793279571807.jpg',
      bio: 'Designer de corte moderno, platinados, reflexos e alinhamento de sobrancelha na navalha.',
      specialties: ['Corte Moderno', 'Platinado / Nevou', 'Sobrancelha'],
      active: true,
      commissionPercentage: 50,
      workingHours: { start: '10:00', end: '20:00' },
    },
  ];
}

function readDatabase(): any {
  if (memoryDB) return memoryDB;
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf-8');
      if (data && data.trim()) {
        memoryDB = JSON.parse(data);
        if (memoryDB.barbers && memoryDB.barbers.length > 0) {
          return memoryDB;
        }
      }
    }
  } catch (err) {
    console.warn('Vercel serverless read error, using fallback:', err);
  }

  memoryDB = {
    config: null,
    services: [],
    barbers: getDefaultBarbers(),
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
  return memoryDB;
}

function writeDatabase(patch: any): any {
  const current = readDatabase();
  const updated = {
    ...current,
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  memoryDB = updated;
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(updated, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Vercel serverless write warning (relying on memory):', err);
  }
  return updated;
}

export default async function handler(req: any, res: any) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const url = req.url || '';
  const parsedUrl = new URL(url, 'http://localhost');
  const pathname = parsedUrl.pathname;
  const body = req.method === 'POST' ? await parseBody(req) : {};

  try {
    // 1. /api/db (Full database sync)
    if (pathname.endsWith('/db') || pathname === '/api') {
      if (req.method === 'POST') {
        const updated = writeDatabase(body);
        return res.status(200).json({ success: true, updatedAt: updated.updatedAt });
      }
      const db = readDatabase();
      return res.status(200).json(db);
    }

    // 2. /api/barbers
    if (pathname.includes('/barbers')) {
      const db = readDatabase();
      if (req.method === 'POST') {
        const barber = body;
        if (!barber.id) barber.id = 'barber-' + Date.now();
        const current = db.barbers || [];
        const idx = current.findIndex((b: any) => b.id === barber.id);
        const updatedBarbers = idx >= 0
          ? current.map((b: any) => (b.id === barber.id ? barber : b))
          : [...current, barber];
        writeDatabase({ barbers: updatedBarbers });
        return res.status(200).json({ success: true, barber, barbers: updatedBarbers });
      }
      return res.status(200).json(db.barbers || getDefaultBarbers());
    }

    // 3. /api/appointments
    if (pathname.includes('/appointments')) {
      const db = readDatabase();
      if (req.method === 'POST') {
        const apt = body;
        if (!apt.id) apt.id = 'apt-' + Date.now();
        const current = db.appointments || [];
        const updatedApts = [apt, ...current.filter((a: any) => a.id !== apt.id)];
        writeDatabase({ appointments: updatedApts });
        return res.status(200).json({ success: true, appointment: apt, appointments: updatedApts });
      }
      return res.status(200).json(db.appointments || []);
    }

    // 4. /api/comandas
    if (pathname.includes('/comandas')) {
      const db = readDatabase();
      if (req.method === 'POST') {
        const comanda = body;
        if (!comanda.id) comanda.id = 'cmd-' + Date.now();
        const current = db.comandas || [];
        const idx = current.findIndex((c: any) => c.id === comanda.id);
        const updatedCmds = idx >= 0
          ? current.map((c: any) => (c.id === comanda.id ? comanda : c))
          : [comanda, ...current];
        writeDatabase({ comandas: updatedCmds });
        return res.status(200).json({ success: true, comanda, comandas: updatedCmds });
      }
      return res.status(200).json(db.comandas || []);
    }

    // 5. /api/subscriptions
    if (pathname.includes('/subscriptions')) {
      const db = readDatabase();
      if (req.method === 'POST') {
        const sub = body;
        if (!sub.id) sub.id = 'sub-' + Date.now();
        const current = db.subscriptions || [];
        const updatedSubs = [sub, ...current.filter((s: any) => s.id !== sub.id)];
        writeDatabase({ subscriptions: updatedSubs });
        return res.status(200).json({ success: true, subscription: sub, subscriptions: updatedSubs });
      }
      return res.status(200).json(db.subscriptions || []);
    }

    // 6. /api/reset-operational
    if (pathname.includes('/reset-operational')) {
      writeDatabase({
        appointments: [],
        financialEntries: [],
        customers: [],
        comandas: [],
      });
      return res.status(200).json({ success: true, message: 'Dados operacionais zerados.' });
    }

    // Fallback default response
    const db = readDatabase();
    return res.status(200).json(db);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Server error' });
  }
}
