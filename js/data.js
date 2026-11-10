/* SQL Reps — practice datasets.
   All data is generated deterministically (seeded RNG), so every load produces the same rows. */
(function () {
  'use strict';

  // ---------- helpers ----------
  function rng(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function tools(r) {
    const int = (a, b) => a + Math.floor(r() * (b - a + 1));
    const pick = (a) => a[Math.floor(r() * a.length)];
    const wpick = (pairs) => {
      let t = 0; for (const p of pairs) t += p[1];
      let x = r() * t;
      for (const p of pairs) { x -= p[1]; if (x < 0) return p[0]; }
      return pairs[pairs.length - 1][0];
    };
    const between = (a, b) => a + r() * (b - a);
    return { int, pick, wpick, between };
  }
  const DAY = 86400000;
  const D = (s) => new Date(s + 'T00:00:00Z');
  const fmt = (d) => d.toISOString().slice(0, 10);
  const addDays = (d, n) => new Date(d.getTime() + n * DAY);
  const addMonths = (d, n) => { const x = new Date(d.getTime()); x.setUTCMonth(x.getUTCMonth() + n); return x; };
  const randDate = (r, a, b) => addDays(a, Math.floor(r() * (Math.round((b - a) / DAY) + 1)));
  const round2 = (n) => Math.round(n * 100) / 100;
  const slug = (s) => s.toLowerCase().normalize('NFD').replace(/[^a-z0-9]/g, '');

  const FIRST = ['Emma', 'Noah', 'Olivia', 'Liam', 'Nora', 'Lucas', 'Sofie', 'Oliver', 'Ella', 'William', 'Maja', 'Elias',
    'Ingrid', 'Jakob', 'Sara', 'Filip', 'Ida', 'Henrik', 'Anna', 'Magnus', 'Leah', 'Erik', 'Frida', 'Jonas', 'Thea',
    'Mathias', 'Hanna', 'Kristian', 'Julia', 'Anders', 'Laura', 'Felix', 'Marie', 'Ben', 'Clara', 'Max', 'Lotte', 'Daan', 'Aino', 'Eero'];
  const LAST = ['Hansen', 'Johansen', 'Olsen', 'Larsen', 'Andersen', 'Pedersen', 'Nilsen', 'Kristiansen', 'Jensen', 'Karlsen',
    'Berg', 'Haugen', 'Bakken', 'Svensson', 'Lindberg', 'Eriksson', 'Nielsen', 'Virtanen', 'Korhonen', 'Müller', 'Schmidt',
    'Fischer', 'Smith', 'Brown', 'Taylor', 'Wilson', "O'Brien", 'de Vries', 'Bakker', 'Jansen'];

  // ---------- SHOP ----------
  function genShop() {
    const r = rng(1101); const { int, pick, wpick } = tools(r);
    const countries = [['Norway', 30], ['Sweden', 22], ['Denmark', 14], ['Germany', 12], ['United Kingdom', 9], ['Finland', 8], ['Netherlands', 5]];
    const cities = {
      Norway: ['Oslo', 'Bergen', 'Trondheim', 'Stavanger', 'Tromsø'], Sweden: ['Stockholm', 'Gothenburg', 'Malmö', 'Uppsala'],
      Denmark: ['Copenhagen', 'Aarhus', 'Odense'], Finland: ['Helsinki', 'Espoo', 'Tampere'], Germany: ['Berlin', 'Hamburg', 'Munich', 'Cologne'],
      'United Kingdom': ['London', 'Manchester', 'Edinburgh'], Netherlands: ['Amsterdam', 'Rotterdam', 'Utrecht']
    };
    const domains = [['gmail.com', 40], ['outlook.com', 25], ['yahoo.com', 12], ['proton.me', 10], ['icloud.com', 13]];
    const customers = [];
    for (let id = 1; id <= 200; id++) {
      const fn = pick(FIRST), ln = pick(LAST), country = wpick(countries);
      const email = r() < 0.06 ? null : `${slug(fn)}.${slug(ln)}${id}@${wpick(domains)}`;
      customers.push([id, fn, ln, email, country, pick(cities[country]),
        fmt(randDate(r, D('2022-01-01'), D('2024-10-31'))), wpick([['Consumer', 70], ['Small Business', 20], ['Corporate', 10]])]);
    }
    const categories = [[1, 'Electronics'], [2, 'Home & Kitchen'], [3, 'Books'], [4, 'Sports & Outdoors'], [5, 'Clothing'], [6, 'Toys & Games']];
    const P = [
      [1, 'Wireless Earbuds', 149.99], [1, 'Noise Cancelling Headphones', 349.00], [1, 'Bluetooth Speaker', 89.50], [1, 'Smartwatch Pro', 429.00],
      [1, 'USB-C Charger', 24.99], [1, 'Wireless Mouse', 39.90], [1, '4K Monitor 27 inch', 899.00],
      [2, 'Espresso Machine', 649.00], [2, 'Cast Iron Pan', 59.95], [2, 'Chef Knife', 119.00], [2, 'Electric Kettle', 49.99],
      [2, 'Blender Pro', 189.00], [2, 'Coffee Grinder', 99.00], [2, 'Air Fryer', 159.90],
      [3, 'SQL for Analysts', 39.99], [3, 'The Data Warehouse Toolkit', 54.00], [3, 'Storytelling with Data', 32.50],
      [3, 'Thinking, Fast and Slow', 18.99], [3, 'Business Statistics', 74.90], [3, 'Python for Data Analysis', 45.00], [3, 'Lean Analytics', 27.95],
      [4, 'Yoga Mat', 34.90], [4, 'Running Shoes Pro', 159.00], [4, 'Hiking Backpack 40L', 129.50], [4, 'Adjustable Dumbbells', 299.00],
      [4, 'Cycling Helmet', 79.00], [4, 'Insulated Water Bottle', 29.99], [4, 'Tent 2-Person', 249.00],
      [5, 'Merino Wool Sweater', 119.90], [5, 'Rain Jacket', 179.00], [5, 'Down Jacket', 329.00], [5, 'Organic Cotton T-Shirt', 24.90],
      [5, 'Wool Socks 3-Pack', 19.95], [5, 'Fleece Hoodie', 69.00], [5, 'Chino Trousers', 79.90],
      [6, 'Building Blocks Set', 89.99], [6, 'Strategy Board Game', 49.00], [6, 'Puzzle 1000 Pieces', 22.50], [6, 'Remote Control Car', 69.90],
      [6, 'Wooden Train Set', 59.00], [6, 'Card Game Classic', 14.99], [6, 'Plush Bear', 25.00]
    ];
    const discontinued = new Set([5, 18, 33, 41]);
    const lateLaunch = { 4: '2024-03-01', 12: '2023-09-15', 39: '2024-06-10' };
    const products = P.map((p, i) => {
      const id = i + 1;
      return [id, p[1], p[0], p[2], round2(p[2] * (0.45 + r() * 0.25)), lateLaunch[id] || fmt(randDate(r, D('2019-01-01'), D('2022-11-30'))), discontinued.has(id)];
    });
    // Popularity weights (cheaper = more popular). Products 41 and 42 are never ordered.
    const prodW = products.slice(0, 40).map((p) => [p, 1 / Math.sqrt(p[3])]);
    const raw = [];
    for (let k = 0; k < 1500; k++) {
      const cid = Math.floor(180 * Math.pow(r(), 1.4)) + 1;
      const c = customers[cid - 1];
      const from = Math.max(D(c[6]).getTime(), D('2023-01-01').getTime());
      const od = randDate(r, new Date(from), D('2024-12-31'));
      raw.push({ cid, od });
    }
    raw.sort((a, b) => a.od - b.od || a.cid - b.cid);
    const orders = [], items = [];
    raw.forEach((o, i) => {
      const id = i + 1;
      const recent = o.od >= D('2024-12-20');
      const status = recent && r() < 0.6 ? 'shipped' : wpick([['delivered', 82], ['cancelled', 9], ['returned', 9]]);
      orders.push([id, o.cid, fmt(o.od), status, wpick([['web', 55], ['mobile', 35], ['store', 10]])]);
      const n = wpick([[1, 45], [2, 30], [3, 15], [4, 10]]);
      const used = new Set();
      let guard = 0;
      while (used.size < n && guard++ < 50) {
        const p = wpick(prodW);
        if (used.has(p[0]) || D(p[5]) > o.od) continue;
        used.add(p[0]);
        items.push([id, p[0], wpick([[1, 70], [2, 20], [3, 10]]), p[3], wpick([[0, 75], [0.10, 12], [0.15, 8], [0.20, 5]])]);
      }
    });
    return { customers, categories, products, orders, order_items: items };
  }

  // ---------- HR ----------
  function genHR() {
    const r = rng(2202); const { int, pick, wpick } = tools(r);
    const departments = [[1, 'Executive', 'Oslo', 2000000], [2, 'Engineering', 'Oslo', 9000000], [3, 'Sales', 'Bergen', 4500000],
      [4, 'Marketing', 'Oslo', 3000000], [5, 'Finance', 'Stavanger', 2500000], [6, 'Operations', 'Trondheim', 3500000], [7, 'Legal', 'Oslo', 800000]];
    const emps = [];
    const add = (dept, mgr, title, salary, hire, term) => {
      const id = emps.length + 1, fn = pick(FIRST), ln = pick(LAST);
      emps.push([id, fn, ln, `${slug(fn)}.${slug(ln)}${id}@company.example`, dept, mgr, title, fmt(hire), salary, term ? fmt(term) : null]);
      return id;
    };
    const sal = (a, b) => Math.round(int(a, b) / 500) * 500;
    add(1, null, 'Chief Executive Officer', 320000, D('2012-03-01'));
    const heads = { 2: 'VP Engineering', 3: 'VP Sales', 4: 'VP Marketing', 5: 'Chief Financial Officer', 6: 'VP Operations' };
    for (const d of [2, 3, 4, 5, 6]) add(d, 1, heads[d], sal(180000, 240000), randDate(r, D('2012-06-01'), D('2016-12-31')));
    add(1, 1, 'Executive Assistant', 65000, D('2019-08-12'));
    const spec = {
      2: { size: 45, leads: 4, lead: 'Engineering Manager', ics: [['Software Engineer', 40, 85000, 125000], ['Senior Software Engineer', 25, 110000, 165000], ['Data Engineer', 15, 90000, 135000], ['QA Engineer', 10, 70000, 100000], ['DevOps Engineer', 10, 90000, 130000]] },
      3: { size: 25, leads: 3, lead: 'Sales Manager', ics: [['Account Executive', 45, 65000, 110000], ['Sales Development Rep', 35, 48000, 65000], ['Account Manager', 20, 60000, 95000]] },
      4: { size: 15, leads: 2, lead: 'Marketing Manager', ics: [['Content Specialist', 35, 52000, 72000], ['Marketing Analyst', 40, 60000, 90000], ['Designer', 25, 58000, 85000]] },
      5: { size: 12, leads: 1, lead: 'Finance Manager', ics: [['Accountant', 40, 55000, 80000], ['Financial Analyst', 40, 65000, 100000], ['Controller', 20, 85000, 115000]] },
      6: { size: 20, leads: 2, lead: 'Operations Manager', ics: [['Operations Analyst', 35, 55000, 85000], ['Logistics Coordinator', 35, 48000, 68000], ['Support Specialist', 30, 42000, 58000]] }
    };
    for (const d of [2, 3, 4, 5, 6]) {
      const s = spec[d]; const leads = [];
      for (let i = 0; i < s.leads; i++) leads.push(add(d, d, s.lead, sal(110000, 150000), randDate(r, D('2013-01-01'), D('2020-12-31'))));
      for (let i = 0; i < s.size - s.leads; i++) {
        const t = wpick(s.ics.map((x) => [x, x[1]]));
        const hire = randDate(r, D('2014-01-01'), D('2024-10-31'));
        let term = null;
        if (r() < 0.13) { const from = addDays(hire, 180); if (from < D('2024-12-31')) term = randDate(r, from, D('2024-12-31')); }
        add(d, pick(leads), t[0], sal(t[2], t[3]), hire, term);
      }
    }
    for (let i = 0; i < 3; i++) add(null, 6, 'Consultant', sal(70000, 120000), randDate(r, D('2023-01-01'), D('2024-09-30')));

    const pnames = [['Data Platform Migration', 2], ['Mobile App Redesign', 2], ['API Gateway', 2], ['Security Hardening', 2], ['Customer Portal', 2],
      ['CRM Rollout', 3], ['Q3 Sales Push', 3], ['Market Expansion DACH', 3], ['Brand Refresh', 4], ['Website Relaunch', 4], ['Pricing Review', 4],
      ['Budget Planning 2024', 5], ['Audit Readiness', 5], ['Warehouse Automation', 6], ['Support Chatbot', 6], ['Supply Chain Analytics', 6]];
    const projects = pnames.map((p, i) => {
      const start = randDate(r, D('2022-01-01'), D('2024-09-30'));
      const end = r() < 0.4 ? null : addDays(start, int(60, 400));
      return [i + 1, p[0], p[1], fmt(start), end && end <= D('2024-12-31') ? fmt(end) : null, Math.round(int(80, 900)) * 1000];
    });
    const assignments = [];
    for (const p of projects) {
      const n = int(3, 9), used = new Set();
      const own = emps.filter((e) => e[4] === p[2] && e[0] > 6);
      const other = emps.filter((e) => e[4] !== p[2] && e[4] !== null && e[0] > 6);
      let guard = 0;
      while (used.size < n && guard++ < 100) {
        const e = r() < 0.8 ? pick(own) : pick(other);
        if (used.has(e[0])) continue;
        const role = used.size === 0 ? 'Lead' : wpick([['Member', 85], ['Reviewer', 15]]);
        used.add(e[0]);
        assignments.push([e[0], p[0], role, int(20, 400)]);
      }
    }
    return { departments, employees: emps, projects, project_assignments: assignments };
  }

  // ---------- SAAS ----------
  function genSaaS() {
    const r = rng(3303); const { int, pick, wpick } = tools(r);
    const plans = [[1, 'Free', 0], [2, 'Starter', 29], [3, 'Pro', 99], [4, 'Enterprise', 499]];
    const price = { 1: 0, 2: 29, 3: 99, 4: 499 };
    const pre = ['Blue', 'North', 'Bright', 'Swift', 'Nordic', 'Atlas', 'Pixel', 'Green', 'Iron', 'Silver', 'Clear', 'Peak', 'Cloud', 'Rapid', 'Lumen', 'Polar', 'Vector', 'Harbor', 'Echo', 'Summit'];
    const suf = ['Labs', 'Analytics', 'Systems', 'Retail', 'Logistics', 'Health', 'Media', 'Works', 'Solutions', 'Foods', 'Energy', 'Studio', 'Finance', 'Data', 'Robotics'];
    const names = [];
    for (const a of pre) for (const b of suf) names.push(a + ' ' + b);
    for (let i = names.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [names[i], names[j]] = [names[j], names[i]]; }
    const industries = ['Retail', 'Healthcare', 'Finance', 'Technology', 'Manufacturing', 'Media', 'Education', 'Logistics'];
    const countries = ['Norway', 'Sweden', 'Denmark', 'Finland', 'Germany', 'United Kingdom', 'Netherlands', 'United States'];
    const created = [];
    for (let i = 0; i < 300; i++) created.push(randDate(r, D('2023-01-01'), D('2024-11-30')));
    created.sort((a, b) => a - b);
    const accounts = created.map((c, i) => [i + 1, names[i], pick(industries), pick(countries), fmt(c),
      wpick([['organic', 35], ['paid_search', 25], ['referral', 18], ['partner', 10], ['outbound', 12]])]);
    const END = D('2024-12-31');
    const subs = [], invoices = [], evRaw = [];
    const evRate = { 1: 0.8, 2: 1.8, 3: 3, 4: 5 };
    for (const a of accounts) {
      let cur = D(a[4]);
      let plan = wpick([[1, 40], [2, 30], [3, 22], [4, 8]]);
      for (let k = 0; k < 4; k++) {
        let end = addMonths(cur, int(2, 16));
        let last = false;
        if (end > END) { end = null; last = true; }
        subs.push({ account: a[0], plan, start: cur, end });
        if (last) break;
        if (r() < (plan === 1 ? 0.45 : 0.3)) break; // churn
        const next = plan === 1 ? wpick([[2, 60], [3, 35], [4, 5]]) : plan === 2 ? wpick([[3, 60], [1, 30], [4, 10]]) : plan === 3 ? wpick([[4, 35], [2, 45], [1, 20]]) : 3;
        plan = next; cur = end;
      }
    }
    subs.sort((x, y) => x.start - y.start || x.account - y.account);
    const subscriptions = subs.map((s, i) => [i + 1, s.account, s.plan, fmt(s.start), s.end ? fmt(s.end) : null]);
    for (const s of subs) {
      const stop = s.end || addDays(END, 1);
      if (price[s.plan] > 0) {
        for (let m = 0; ; m++) {
          const d = addMonths(s.start, m);
          if (d >= stop || d > END) break;
          invoices.push([s.account, fmt(d), price[s.plan], wpick([['paid', 92], ['overdue', 5], ['void', 3]])]);
        }
      }
      const days = Math.round((Math.min(stop.getTime(), END.getTime() + DAY) - s.start.getTime()) / DAY);
      const n = Math.round((days / 30) * evRate[s.plan] * (0.5 + r()));
      for (let e = 0; e < n; e++) {
        evRaw.push([s.account, fmt(addDays(s.start, Math.floor(r() * Math.max(days, 1)))),
          wpick([['login', 55], ['report_created', 20], ['export', 12], ['invite_sent', 8], ['api_call', 5]])]);
      }
    }
    invoices.sort((x, y) => (x[1] < y[1] ? -1 : x[1] > y[1] ? 1 : x[0] - y[0]));
    evRaw.sort((x, y) => (x[1] < y[1] ? -1 : x[1] > y[1] ? 1 : x[0] - y[0]));
    return {
      plans, accounts, subscriptions,
      invoices: invoices.map((v, i) => [i + 1, ...v]),
      events: evRaw.map((v, i) => [i + 1, ...v])
    };
  }

  // ---------- RETAIL ----------
  function genRetail() {
    const r = rng(4404);
    const stores = [[1, 'Oslo City', 'Oslo', 'East', '2015-04-01', 1800], [2, 'Bergen Torget', 'Bergen', 'West', '2016-09-01', 1400],
      [3, 'Trondheim Sentrum', 'Trondheim', 'Mid', '2017-03-15', 1200], [4, 'Stavanger Byhaven', 'Stavanger', 'West', '2018-05-01', 1100],
      [5, 'Tromsø Nord', 'Tromsø', 'North', '2019-10-01', 900], [6, 'Drammen Bryggen', 'Drammen', 'East', '2019-02-01', 1000],
      [7, 'Kristiansand Kvadraturen', 'Kristiansand', 'South', '2020-06-01', 950], [8, 'Fredrikstad Gamlebyen', 'Fredrikstad', 'East', '2021-03-01', 800],
      [9, 'Bodø Havn', 'Bodø', 'North', '2022-05-01', 750], [10, 'Ålesund Brosundet', 'Ålesund', 'West', '2024-03-01', 850]];
    const dow = [0.8, 0.85, 0.9, 0.95, 1.05, 1.2, 1.35]; // Sun..Sat
    const season = [0.85, 0.8, 0.9, 0.95, 1.0, 1.05, 0.95, 1.0, 1.0, 1.05, 1.15, 1.45];
    const growth = stores.map(() => 0.96 + r() * 0.16);
    const holidays = new Set(['01-01', '05-17', '12-25', '12-26']);
    const sales = [], monthly = {};
    for (const s of stores) {
      const start = new Date(Math.max(D(s[4]).getTime(), D('2023-01-01').getTime()));
      for (let d = start; d <= D('2024-12-31'); d = addDays(d, 1)) {
        const md = fmt(d).slice(5);
        if (holidays.has(md)) continue;
        if (d.getUTCDay() === 0 && s[0] > 2) continue; // most stores closed Sundays
        const y = d.getUTCFullYear();
        const g = y === 2024 ? growth[s[0] - 1] : 1;
        const rev = round2(s[5] * 12 * dow[d.getUTCDay()] * season[d.getUTCMonth()] * g * (0.85 + r() * 0.3));
        const tx = Math.round(rev / (300 + r() * 120));
        const visitors = Math.round(tx / (0.22 + r() * 0.12));
        sales.push([s[0], fmt(d), rev, tx, visitors]);
        if (y === 2024) { const k = s[0] + '|' + fmt(d).slice(0, 7); monthly[k] = (monthly[k] || 0) + rev; }
      }
    }
    const targets = [];
    for (const k of Object.keys(monthly).sort((a, b) => { const [sa, ma] = a.split('|'); const [sb, mb] = b.split('|'); return sa - sb || (ma < mb ? -1 : 1); })) {
      const [sid, ym] = k.split('|');
      targets.push([+sid, ym + '-01', Math.round(monthly[k] * (0.92 + r() * 0.18) / 1000) * 1000]);
    }
    return { stores, daily_sales: sales, targets };
  }

  // ---------- schema definitions ----------
  const C = (n, t, extra) => Object.assign({ n, t }, extra || {});
  const datasets = [
    {
      key: 'shop', title: 'Shop', desc: 'A Nordic online store: customers, products, orders and order lines.',
      note: 'Line revenue = quantity × unit_price × (1 − discount).',
      gen: genShop,
      tables: [
        { name: 'customers', desc: 'People who signed up.', cols: [C('id', 'integer', { pk: 1 }), C('first_name', 'text'), C('last_name', 'text'), C('email', 'text'), C('country', 'text'), C('city', 'text'), C('signup_date', 'date'), C('segment', 'text')] },
        { name: 'categories', desc: 'Product categories.', cols: [C('id', 'integer', { pk: 1 }), C('name', 'text')] },
        { name: 'products', desc: 'Items for sale.', cols: [C('id', 'integer', { pk: 1 }), C('name', 'text'), C('category_id', 'integer', { fk: 'categories.id' }), C('price', 'numeric(10,2)'), C('cost', 'numeric(10,2)'), C('launched_date', 'date'), C('discontinued', 'boolean')] },
        { name: 'orders', desc: "status: delivered, shipped, cancelled, returned · channel: web, mobile, store", cols: [C('id', 'integer', { pk: 1 }), C('customer_id', 'integer', { fk: 'customers.id' }), C('order_date', 'date'), C('status', 'text'), C('channel', 'text')] },
        { name: 'order_items', desc: 'One row per product in an order. discount is a fraction (0.15 = 15%).', cols: [C('order_id', 'integer', { pk: 1, fk: 'orders.id' }), C('product_id', 'integer', { pk: 1, fk: 'products.id' }), C('quantity', 'integer'), C('unit_price', 'numeric(10,2)'), C('discount', 'numeric(3,2)')] }
      ]
    },
    {
      key: 'hr', title: 'HR', desc: 'A company of ~130 people: departments, employees (with managers) and projects.',
      note: 'termination_date IS NULL means the employee is still active. salary is annual.',
      gen: genHR,
      tables: [
        { name: 'departments', desc: 'Organisational units.', cols: [C('id', 'integer', { pk: 1 }), C('name', 'text'), C('location', 'text'), C('budget', 'integer')] },
        { name: 'employees', desc: 'manager_id points to another employee.', cols: [C('id', 'integer', { pk: 1 }), C('first_name', 'text'), C('last_name', 'text'), C('email', 'text'), C('department_id', 'integer', { fk: 'departments.id' }), C('manager_id', 'integer', { fk: 'employees.id' }), C('job_title', 'text'), C('hire_date', 'date'), C('salary', 'integer'), C('termination_date', 'date')] },
        { name: 'projects', desc: 'end_date IS NULL means ongoing.', cols: [C('id', 'integer', { pk: 1 }), C('name', 'text'), C('department_id', 'integer', { fk: 'departments.id' }), C('start_date', 'date'), C('end_date', 'date'), C('budget', 'integer')] },
        { name: 'project_assignments', desc: 'role: Lead, Member, Reviewer', cols: [C('employee_id', 'integer', { pk: 1, fk: 'employees.id' }), C('project_id', 'integer', { pk: 1, fk: 'projects.id' }), C('role', 'text'), C('hours', 'integer')] }
      ]
    },
    {
      key: 'saas', title: 'SaaS', desc: 'A B2B software company: accounts, subscription history, invoices and product usage events.',
      note: 'A subscription with end_date IS NULL is active today (data ends 2024-12-31). Plan changes create a new subscription row.',
      gen: genSaaS,
      tables: [
        { name: 'plans', desc: 'Price per month.', cols: [C('id', 'integer', { pk: 1 }), C('name', 'text'), C('monthly_price', 'integer')] },
        { name: 'accounts', desc: 'Customer companies.', cols: [C('id', 'integer', { pk: 1 }), C('company_name', 'text'), C('industry', 'text'), C('country', 'text'), C('created_at', 'date'), C('acquisition_channel', 'text')] },
        { name: 'subscriptions', desc: 'One row per plan period.', cols: [C('id', 'integer', { pk: 1 }), C('account_id', 'integer', { fk: 'accounts.id' }), C('plan_id', 'integer', { fk: 'plans.id' }), C('start_date', 'date'), C('end_date', 'date')] },
        { name: 'invoices', desc: 'status: paid, overdue, void', cols: [C('id', 'integer', { pk: 1 }), C('account_id', 'integer', { fk: 'accounts.id' }), C('invoice_date', 'date'), C('amount', 'numeric(10,2)'), C('status', 'text')] },
        { name: 'events', desc: 'event_type: login, report_created, export, invite_sent, api_call', cols: [C('id', 'integer', { pk: 1 }), C('account_id', 'integer', { fk: 'accounts.id' }), C('event_date', 'date'), C('event_type', 'text')] }
      ]
    },
    {
      key: 'retail', title: 'Retail', desc: 'A chain of 10 physical stores with daily sales for 2023–2024 and monthly targets for 2024.',
      note: 'Most stores are closed on Sundays and public holidays — those days have no row in daily_sales.',
      gen: genRetail,
      tables: [
        { name: 'stores', desc: 'Physical stores.', cols: [C('id', 'integer', { pk: 1 }), C('name', 'text'), C('city', 'text'), C('region', 'text'), C('opened_date', 'date'), C('size_sqm', 'integer')] },
        { name: 'daily_sales', desc: 'One row per store per open day.', cols: [C('store_id', 'integer', { pk: 1, fk: 'stores.id' }), C('sale_date', 'date', { pk: 1 }), C('revenue', 'numeric(12,2)'), C('transactions', 'integer'), C('visitors', 'integer')] },
        { name: 'targets', desc: 'month = first day of the month.', cols: [C('store_id', 'integer', { pk: 1, fk: 'stores.id' }), C('month', 'date', { pk: 1 }), C('revenue_target', 'numeric(12,2)')] }
      ]
    }
  ];

  // ---------- SQL builder ----------
  const lit = (v) => v === null || v === undefined ? 'NULL' : typeof v === 'boolean' ? (v ? 'TRUE' : 'FALSE') : typeof v === 'number' ? String(v) : "'" + String(v).replace(/'/g, "''") + "'";
  function buildSQL(ds) {
    if (!ds.rows) ds.rows = ds.gen();
    const out = [`CREATE SCHEMA ${ds.key};`, `SET search_path TO ${ds.key};`];
    for (const t of ds.tables) {
      const defs = t.cols.map((c) => {
        let s = `${c.n} ${c.t}`;
        if (c.fk) { const [ft, fc] = c.fk.split('.'); s += ` REFERENCES ${ft}(${fc})`; }
        return s;
      });
      const pks = t.cols.filter((c) => c.pk).map((c) => c.n);
      if (pks.length) defs.push(`PRIMARY KEY (${pks.join(', ')})`);
      out.push(`CREATE TABLE ${t.name} (\n  ${defs.join(',\n  ')}\n);`);
      const rows = ds.rows[t.name];
      for (let i = 0; i < rows.length; i += 1000) {
        const chunk = rows.slice(i, i + 1000).map((row) => '(' + row.map(lit).join(',') + ')').join(',\n');
        out.push(`INSERT INTO ${t.name} VALUES\n${chunk};`);
      }
    }
    return out.join('\n');
  }

  window.SQLREPS_DATA = { datasets, buildSQL };
})();
