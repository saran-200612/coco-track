import express from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';
import { WebSocketServer } from 'ws';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { randomUUID } from 'crypto';

const app = express();
const PORT = 3000;
app.use(cors());
app.use(express.json());

const db = new Database(':memory:');

db.exec(`
CREATE TABLE owners (id TEXT PRIMARY KEY, name TEXT, phone TEXT, address TEXT, status TEXT);
CREATE TABLE fields (id TEXT PRIMARY KEY, owner_id TEXT, name TEXT, location TEXT, area_acres REAL, tree_count INTEGER, agreed_contract_amount REAL, contract_start_date TEXT, contract_end_date TEXT, status TEXT);
CREATE TABLE workers (id TEXT PRIMARY KEY, name TEXT, phone TEXT, worker_type TEXT, default_daily_rate REAL, default_climb_rate_per_tree REAL, status TEXT);
CREATE TABLE attendance (id TEXT PRIMARY KEY, worker_id TEXT, work_date TEXT, status TEXT);
CREATE TABLE daily_work (id TEXT PRIMARY KEY, worker_id TEXT, work_date TEXT, task_type TEXT, duration_hours REAL, trees_count INTEGER, notes TEXT);
CREATE TABLE harvests (id TEXT PRIMARY KEY, field_id TEXT, harvest_date TEXT, total_coconuts INTEGER, mature_count INTEGER, tender_count INTEGER, grade TEXT, batch_revenue REAL, notes TEXT);
CREATE TABLE vehicles (id TEXT PRIMARY KEY, vehicle_name TEXT, plate_number TEXT, vehicle_type TEXT, driver_name TEXT, status TEXT, total_trips INTEGER);
CREATE TABLE vehicle_trips (id TEXT PRIMARY KEY, vehicle_id TEXT, trip_date TEXT, destination TEXT, load_coconuts INTEGER, fuel_expense REAL, driver_name TEXT, notes TEXT);

INSERT INTO owners VALUES 
  ('o1', 'Rajesh Kumar', '+91 98765 43210', 'Tumkur Road, Bengaluru, KA', 'ACTIVE'), 
  ('o2', 'Venkat Swamy', '+91 98765 43211', 'Mandya Estate, Mysuru, KA', 'ACTIVE'),
  ('o3', 'Anand Gowda', '+91 98765 43212', 'Hassan Belt, KA', 'ACTIVE');

INSERT INTO fields VALUES 
  ('f1', 'o1', 'Green Grove North', 'Block A - Highway Rd', 12.5, 500, 250000, '2024-01-01', '2025-01-01', 'ACTIVE'),
  ('f2', 'o2', 'Riverside Palms', 'Canal East Sector', 8.0, 350, 180000, '2024-03-15', '2025-03-15', 'ACTIVE'),
  ('f3', 'o3', 'Highland Plantation', 'Hill View Slopes', 15.0, 620, 320000, '2024-02-01', '2025-02-01', 'ACTIVE');

INSERT INTO workers VALUES 
  ('w1', 'Ravi Gowda', '+91 98765 43222', 'CLIMBER', 0, 35.00, 'ACTIVE'), 
  ('w2', 'Kumar Swamy', '+91 98765 43233', 'COLLECTOR', 650.00, 0, 'ACTIVE'),
  ('w3', 'Manjunath B', '+91 98765 43244', 'CLIMBER', 0, 35.00, 'ACTIVE'),
  ('w4', 'Suresh Reddy', '+91 98765 43255', 'DRIVER', 750.00, 0, 'ACTIVE');

INSERT INTO daily_work VALUES 
  ('dw1', 'w1', '2026-08-20', 'Climbing & Harvesting', 6.0, 52, 'Climbed 52 trees in North Sector'),
  ('dw2', 'w2', '2026-08-20', 'Husk Peeling & Stacking', 7.5, 0, 'Processed 1,400 coconuts at shed'),
  ('dw3', 'w3', '2026-08-21', 'Climbing', 4.5, 38, 'Early morning climb at Block A');

INSERT INTO harvests VALUES
  ('h1', 'f1', '2026-08-18', 4200, 3600, 600, 'Grade A', 105000, 'Monsoon yield high density batch'),
  ('h2', 'f2', '2026-08-12', 2800, 2400, 400, 'Grade A', 70000, 'Riverside standard monthly cycle');

INSERT INTO vehicles VALUES
  ('v1', 'Mahindra 575 DI Tractor', 'KA-06-EA-4122', 'Tractor', 'Suresh Reddy', 'ACTIVE', 14),
  ('v2', 'Tata 407 Pickup Truck', 'KA-06-B-8831', 'Truck', 'Ramesh K', 'ACTIVE', 28);

INSERT INTO vehicle_trips VALUES
  ('vt1', 'v2', '2026-08-19', 'APMC Mandi Yard Tumkur', 3500, 1800, 'Ramesh K', 'Delivered Grade A batch to wholesale yard'),
  ('vt2', 'v1', '2026-08-20', 'Processing Shed 2', 1200, 650, 'Suresh Reddy', 'In-field tractor haulage from Riverside');
`);

let wss: WebSocketServer;

function broadcast(event: any) {
  if (wss) wss.clients.forEach(c => c.send(JSON.stringify(event)));
}

app.get('/api/dashboard/summary', (req, res) => {
  const workersCount = db.prepare('SELECT count(*) as count FROM workers').get() as any;
  const fieldsCount = db.prepare('SELECT count(*) as count FROM fields').get() as any;
  const treesTotal = db.prepare('SELECT sum(tree_count) as total FROM fields').get() as any;
  const harvestTotal = db.prepare('SELECT sum(total_coconuts) as nuts FROM harvests').get() as any;
  const tripsCount = db.prepare('SELECT count(*) as trips FROM vehicle_trips').get() as any;

  res.json({
    totalTrees: treesTotal?.total || 1470,
    totalFields: fieldsCount?.count || 3,
    totalWorkers: workersCount?.count || 4,
    ownerAmountPaid: 120000,
    ownerAmountPending: 230000,
    weeklySalaryEarned: 8450,
    weeklySalaryPaid: 6500,
    weeklySalaryPending: 1950,
    workersPresentToday: 3,
    treesWorkedToday: 90,
    coconutsHarvestedMonth: harvestTotal?.nuts || 7000,
    harvestDueSoon: 1,
    harvestOverdue: 0,
    vehicleTripsToday: tripsCount?.trips || 2,
    weather: { temp: 28, condition: 'Partly Cloudy', humidity: 72, windKmh: 14 }
  });
});

app.get('/api/owners', (req, res) => res.json(db.prepare('SELECT * FROM owners').all()));
app.post('/api/owners', (req, res) => {
  const { name, phone, address, status = 'ACTIVE' } = req.body;
  const id = 'o_' + randomUUID().substring(0, 6);
  db.prepare('INSERT INTO owners (id, name, phone, address, status) VALUES (?, ?, ?, ?, ?)')
    .run(id, name, phone, address, status);
  broadcast({ type: 'OWNERS_UPDATED' });
  res.json({ success: true, id });
});

app.get('/api/fields', (req, res) => {
  const fields = db.prepare(`
    SELECT f.*, o.name as owner_name, o.phone as owner_phone
    FROM fields f
    LEFT JOIN owners o ON f.owner_id = o.id
  `).all();
  res.json(fields);
});
app.post('/api/fields', (req, res) => {
  const { ownerId, name, location, areaAcres, treeCount, agreedContractAmount, contractStartDate, contractEndDate } = req.body;
  const id = 'f_' + randomUUID().substring(0, 6);
  db.prepare('INSERT INTO fields (id, owner_id, name, location, area_acres, tree_count, agreed_contract_amount, contract_start_date, contract_end_date, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
    .run(id, ownerId, name, location, areaAcres, treeCount, agreedContractAmount, contractStartDate, contractEndDate, 'ACTIVE');
  broadcast({ type: 'FIELDS_UPDATED' });
  res.json({ success: true, id });
});

app.get('/api/workers', (req, res) => res.json(db.prepare('SELECT * FROM workers').all()));
app.post('/api/workers', (req, res) => {
  const { name, phone, workerType, defaultDailyRate, defaultClimbRatePerTree } = req.body;
  const id = 'w_' + randomUUID().substring(0, 6);
  db.prepare('INSERT INTO workers (id, name, phone, worker_type, default_daily_rate, default_climb_rate_per_tree, status) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .run(id, name, phone, workerType, defaultDailyRate || 0, defaultClimbRatePerTree || 0, 'ACTIVE');
  broadcast({ type: 'WORKERS_UPDATED' });
  res.json({ success: true, id });
});

app.get('/api/daily-work', (req, res) => {
  const logs = db.prepare(`
    SELECT dw.*, w.name as worker_name, w.worker_type
    FROM daily_work dw 
    LEFT JOIN workers w ON dw.worker_id = w.id 
    ORDER BY dw.work_date DESC
  `).all();
  res.json(logs);
});

app.post('/api/daily-work', (req, res) => {
  const { workerId, workDate, taskType, durationHours, treesCount, notes } = req.body;
  db.prepare('INSERT INTO daily_work (id, worker_id, work_date, task_type, duration_hours, trees_count, notes) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .run(randomUUID(), workerId, workDate, taskType, durationHours, treesCount || 0, notes || '');
  broadcast({ type: 'DAILY_WORK_UPDATED' });
  res.json({ success: true });
});

app.get('/api/attendance', (req, res) => {
  const records = db.prepare(`
    SELECT a.*, w.name as worker_name, w.worker_type
    FROM attendance a
    JOIN workers w ON a.worker_id = w.id
    ORDER BY a.work_date DESC
  `).all();
  res.json(records);
});

app.post('/api/attendance', (req, res) => {
  const { workerId, status } = req.body;
  const workDate = req.body.workDate || new Date().toISOString().split('T')[0];
  // Remove existing attendance for today if any, then insert
  db.prepare('DELETE FROM attendance WHERE worker_id = ? AND work_date = ?').run(workerId, workDate);
  db.prepare('INSERT INTO attendance (id, worker_id, work_date, status) VALUES (?, ?, ?, ?)')
    .run(randomUUID(), workerId, workDate, status);
  broadcast({ type: 'ATTENDANCE_UPDATED' });
  res.json({ success: true });
});

app.get('/api/harvests', (req, res) => {
  const harvests = db.prepare(`
    SELECT h.*, f.name as field_name, f.location as field_location
    FROM harvests h
    LEFT JOIN fields f ON h.field_id = f.id
    ORDER BY h.harvest_date DESC
  `).all();
  res.json(harvests);
});

app.post('/api/harvests', (req, res) => {
  const { fieldId, harvestDate, totalCoconuts, matureCount, tenderCount, grade, batchRevenue, notes } = req.body;
  const id = 'h_' + randomUUID().substring(0, 6);
  db.prepare('INSERT INTO harvests (id, field_id, harvest_date, total_coconuts, mature_count, tender_count, grade, batch_revenue, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
    .run(id, fieldId, harvestDate, totalCoconuts, matureCount, tenderCount, grade, batchRevenue, notes || '');
  broadcast({ type: 'HARVESTS_UPDATED' });
  res.json({ success: true, id });
});

app.get('/api/vehicles', (req, res) => {
  res.json(db.prepare('SELECT * FROM vehicles').all());
});

app.post('/api/vehicles', (req, res) => {
  const { vehicleName, plateNumber, vehicleType, driverName } = req.body;
  const id = 'v_' + randomUUID().substring(0, 6);
  db.prepare('INSERT INTO vehicles (id, vehicle_name, plate_number, vehicle_type, driver_name, status, total_trips) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .run(id, vehicleName, plateNumber, vehicleType, driverName, 'ACTIVE', 0);
  broadcast({ type: 'VEHICLES_UPDATED' });
  res.json({ success: true, id });
});

app.get('/api/vehicle-trips', (req, res) => {
  const trips = db.prepare(`
    SELECT vt.*, v.vehicle_name, v.plate_number
    FROM vehicle_trips vt
    LEFT JOIN vehicles v ON vt.vehicle_id = v.id
    ORDER BY vt.trip_date DESC
  `).all();
  res.json(trips);
});

app.post('/api/vehicle-trips', (req, res) => {
  const { vehicleId, tripDate, destination, loadCoconuts, fuelExpense, driverName, notes } = req.body;
  const id = 'vt_' + randomUUID().substring(0, 6);
  db.prepare('INSERT INTO vehicle_trips (id, vehicle_id, trip_date, destination, load_coconuts, fuel_expense, driver_name, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
    .run(id, vehicleId, tripDate, destination, loadCoconuts, fuelExpense, driverName, notes || '');
  db.prepare('UPDATE vehicles SET total_trips = total_trips + 1 WHERE id = ?').run(vehicleId);
  broadcast({ type: 'VEHICLE_TRIPS_UPDATED' });
  res.json({ success: true, id });
});

app.get('/api/reports/summary', (req, res) => {
  res.json({
    monthlyRevenue: 175000,
    monthlyWagesPaid: 32000,
    monthlyFuelExpense: 7400,
    leasePayable: 45000,
    netProfit: 90600,
    totalNutsHarvested: 7000,
    avgYieldPerTree: 14.2,
    climbingEfficiencyRate: '94%'
  });
});

app.post('/api/sync/batch', (req, res) => {
  // Mocked sync batch
  broadcast({ type: 'SYNC_COMPLETE' });
  res.json({ synced: req.body.length, status: "SUCCESS" });
});

async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: 'spa' });
    app.use(vite.middlewares);
  } else {
    const dist = path.join(process.cwd(), 'dist');
    app.use(express.static(dist));
    app.get('*all', (req, res) => res.sendFile(path.join(dist, 'index.html')));
  }
  
  const server = app.listen(PORT, "0.0.0.0", () => console.log(`Server running on http://localhost:${PORT}`));
  wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('error', (error) => {
    console.error('WebSocket Server error:', error);
  });

  const shutdown = () => {
    wss.close();
    server.close(() => {
      process.exit(0);
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

start();
