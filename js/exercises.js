/* SQL Reps — exercises.
   Fields: id, ds (dataset), topic, level (1 Easy, 2 Medium, 3 Hard), title, prompt (HTML), solution,
   hints[], ordered (row order is checked), vars[] (optional variants; {key} is replaced in prompt + solution). */
(function () {
  'use strict';
  const TOPICS = [
    { key: 'basics', name: 'Select & Filter' },
    { key: 'sorting', name: 'Sorting & Limiting' },
    { key: 'nulls', name: 'NULLs & Conditions' },
    { key: 'aggregation', name: 'Aggregation' },
    { key: 'joins', name: 'Joins' },
    { key: 'case', name: 'CASE Logic' },
    { key: 'dates', name: 'Dates & Time' },
    { key: 'functions', name: 'Text & Number Functions' },
    { key: 'subqueries', name: 'Subqueries' },
    { key: 'setops', name: 'Set Operations' },
    { key: 'ctes', name: 'CTEs & Recursion' },
    { key: 'windows', name: 'Window Functions' },
    { key: 'business', name: 'Business Cases' }
  ];

  const REV = 'oi.quantity * oi.unit_price * (1 - oi.discount)';
  const COUNTRIES = [{ country: 'Norway' }, { country: 'Sweden' }, { country: 'Denmark' }, { country: 'Germany' }, { country: 'Finland' }, { country: 'United Kingdom' }, { country: 'Netherlands' }];
  const SHOP_MONTHS = [
    { label: 'December 2024', start: '2024-12-01', end: '2025-01-01' }, { label: 'June 2023', start: '2023-06-01', end: '2023-07-01' },
    { label: 'March 2024', start: '2024-03-01', end: '2024-04-01' }, { label: 'September 2023', start: '2023-09-01', end: '2023-10-01' },
    { label: 'November 2024', start: '2024-11-01', end: '2024-12-01' }];
  const RETAIL_MONTHS = [
    { label: 'March 2024', start: '2024-03-01', end: '2024-04-01' }, { label: 'July 2024', start: '2024-07-01', end: '2024-08-01' },
    { label: 'November 2024', start: '2024-11-01', end: '2024-12-01' }, { label: 'December 2023', start: '2023-12-01', end: '2024-01-01' }];

  const E = [];
  const ex = (o) => E.push(o);

  // ===== Select & Filter =====
  ex({ id: 'basics-1', ds: 'shop', topic: 'basics', level: 1, title: 'Product catalogue',
    prompt: 'Return the <code>name</code> and <code>price</code> of every product.',
    solution: 'SELECT name, price FROM products;',
    hints: ['SELECT lists the columns you want, FROM names the table.', 'Both columns are in the products table.'] });
  ex({ id: 'basics-2', ds: 'shop', topic: 'basics', level: 1, title: 'Customers in one country', vars: COUNTRIES,
    prompt: 'Return <code>first_name</code>, <code>last_name</code> and <code>city</code> for all customers from <b>{country}</b>.',
    solution: "SELECT first_name, last_name, city FROM customers WHERE country = '{country}';",
    hints: ['Filter rows with a WHERE clause.', "Text values go in single quotes: WHERE country = '...'"] });
  ex({ id: 'basics-3', ds: 'shop', topic: 'basics', level: 1, title: 'Pricier than…', vars: [{ price: 100 }, { price: 250 }, { price: 50 }, { price: 500 }],
    prompt: 'Return <code>name</code> and <code>price</code> of products that cost more than <b>{price}</b>.',
    solution: 'SELECT name, price FROM products WHERE price > {price};',
    hints: ['Use a comparison operator in WHERE.', 'Numbers are written without quotes: WHERE price > 100'] });
  ex({ id: 'basics-4', ds: 'hr', topic: 'basics', level: 1, title: 'High earners in a department',
    vars: [{ dept: 2, dname: 'Engineering', sal: 120000 }, { dept: 3, dname: 'Sales', sal: 80000 }, { dept: 5, dname: 'Finance', sal: 90000 }, { dept: 6, dname: 'Operations', sal: 70000 }],
    prompt: 'Return <code>first_name</code>, <code>last_name</code> and <code>salary</code> of employees in <b>{dname}</b> (<code>department_id = {dept}</code>) earning at least <b>{sal}</b>.',
    solution: 'SELECT first_name, last_name, salary FROM employees WHERE department_id = {dept} AND salary >= {sal};',
    hints: ['Combine two conditions with AND.', '"At least" means >=.'] });
  ex({ id: 'basics-5', ds: 'shop', topic: 'basics', level: 1, title: 'Orders by status and channel',
    vars: [{ status: 'cancelled', channel: 'mobile' }, { status: 'returned', channel: 'web' }, { status: 'delivered', channel: 'store' }, { status: 'returned', channel: 'mobile' }],
    prompt: 'Return the <code>id</code> and <code>order_date</code> of all <b>{status}</b> orders placed through the <b>{channel}</b> channel.',
    solution: "SELECT id, order_date FROM orders WHERE status = '{status}' AND channel = '{channel}';",
    hints: ['Two text conditions joined with AND.'] });
  ex({ id: 'basics-6', ds: 'hr', topic: 'basics', level: 1, title: 'Monthly salary',
    prompt: 'For every employee return <code>first_name</code>, <code>last_name</code> and <code>monthly_salary</code>: the annual salary divided by 12, rounded to 2 decimals.',
    solution: 'SELECT first_name, last_name, ROUND(salary / 12.0, 2) AS monthly_salary FROM employees;',
    hints: ['You can do arithmetic directly in SELECT.', 'salary is an integer — in PostgreSQL integer / integer throws away the decimals. Divide by 12.0.', 'ROUND(value, 2) rounds; AS gives the column a name.'] });
  ex({ id: 'basics-7', ds: 'shop', topic: 'basics', level: 1, title: 'Product margin',
    prompt: 'Return <code>name</code>, <code>price</code>, <code>cost</code> and <code>margin</code> (price minus cost) for every product.',
    solution: 'SELECT name, price, cost, price - cost AS margin FROM products;',
    hints: ['A calculated column: price - cost AS margin'] });
  ex({ id: 'basics-8', ds: 'shop', topic: 'basics', level: 2, title: 'Active products in two categories',
    vars: [{ c1: 1, c2: 3 }, { c1: 2, c2: 4 }, { c1: 5, c2: 6 }, { c1: 1, c2: 5 }],
    prompt: 'Return <code>name</code> and <code>price</code> of products in category <b>{c1}</b> or <b>{c2}</b> that are <b>not</b> discontinued.',
    solution: 'SELECT name, price FROM products WHERE category_id IN ({c1}, {c2}) AND NOT discontinued;',
    hints: ['AND binds tighter than OR — use parentheses or IN (...).', 'discontinued is a boolean: WHERE NOT discontinued (or discontinued = false).'] });

  // ===== Sorting & Limiting =====
  ex({ id: 'sorting-1', ds: 'shop', topic: 'sorting', level: 1, ordered: true, title: 'Top 5 most expensive',
    prompt: 'Return <code>name</code> and <code>price</code> of the 5 most expensive products, most expensive first.',
    solution: 'SELECT name, price FROM products ORDER BY price DESC, name LIMIT 5;',
    hints: ['ORDER BY price DESC sorts high to low.', 'LIMIT 5 keeps the first five rows.'] });
  ex({ id: 'sorting-2', ds: 'shop', topic: 'sorting', level: 1, ordered: true, title: 'Countries A–Z',
    prompt: 'Return each distinct <code>country</code> that customers come from, sorted alphabetically.',
    solution: 'SELECT DISTINCT country FROM customers ORDER BY country;',
    hints: ['SELECT DISTINCT removes duplicate rows.'] });
  ex({ id: 'sorting-3', ds: 'hr', topic: 'sorting', level: 1, ordered: true, title: 'Newest hires',
    prompt: 'Return <code>first_name</code>, <code>last_name</code> and <code>hire_date</code> of the 10 most recently hired employees, newest first. Break ties by <code>last_name</code>, then <code>first_name</code>.',
    solution: 'SELECT first_name, last_name, hire_date FROM employees ORDER BY hire_date DESC, last_name, first_name LIMIT 10;',
    hints: ['ORDER BY can take several columns separated by commas.', 'Each column can have its own direction: hire_date DESC, last_name ASC'] });
  ex({ id: 'sorting-4', ds: 'shop', topic: 'sorting', level: 2, ordered: true, title: 'Pagination',
    vars: [{ page: 3, offset: 20 }, { page: 2, offset: 10 }, { page: 4, offset: 30 }],
    prompt: 'A product list shows 10 products per page, sorted by <code>price</code> ascending (ties by <code>id</code>). Return <code>id</code>, <code>name</code> and <code>price</code> for page <b>{page}</b>.',
    solution: 'SELECT id, name, price FROM products ORDER BY price, id LIMIT 10 OFFSET {offset};',
    hints: ['OFFSET n skips the first n rows.', 'Page p starts after (p − 1) × 10 rows.'] });
  ex({ id: 'sorting-5', ds: 'hr', topic: 'sorting', level: 1, ordered: true, title: 'Job titles in Engineering',
    prompt: 'Return the distinct <code>job_title</code>s used in Engineering (<code>department_id = 2</code>), alphabetically.',
    solution: 'SELECT DISTINCT job_title FROM employees WHERE department_id = 2 ORDER BY job_title;',
    hints: ['DISTINCT + WHERE + ORDER BY.'] });
  ex({ id: 'sorting-6', ds: 'shop', topic: 'sorting', level: 2, ordered: true, title: 'Cheapest active products',
    vars: [{ n: 3, c: 1, cname: 'Electronics' }, { n: 5, c: 4, cname: 'Sports & Outdoors' }, { n: 3, c: 5, cname: 'Clothing' }, { n: 4, c: 2, cname: 'Home & Kitchen' }],
    prompt: 'Return <code>name</code> and <code>price</code> of the <b>{n}</b> cheapest products in <b>{cname}</b> (<code>category_id = {c}</code>) that are not discontinued. Cheapest first.',
    solution: 'SELECT name, price FROM products WHERE category_id = {c} AND NOT discontinued ORDER BY price, name LIMIT {n};',
    hints: ['Filter first (WHERE), then sort, then LIMIT.'] });

  // ===== NULLs & Conditions =====
  ex({ id: 'nulls-1', ds: 'shop', topic: 'nulls', level: 1, title: 'Missing emails',
    prompt: 'Return <code>id</code>, <code>first_name</code> and <code>last_name</code> of customers with no email address.',
    solution: 'SELECT id, first_name, last_name FROM customers WHERE email IS NULL;',
    hints: ['= NULL is never true. NULL needs its own operator.', 'Use IS NULL.'] });
  ex({ id: 'nulls-2', ds: 'hr', topic: 'nulls', level: 1, title: 'Top of the org chart',
    prompt: 'Return <code>first_name</code>, <code>last_name</code> and <code>job_title</code> of employees who have no manager.',
    solution: 'SELECT first_name, last_name, job_title FROM employees WHERE manager_id IS NULL;',
    hints: ['No manager means manager_id is NULL.'] });
  ex({ id: 'nulls-3', ds: 'hr', topic: 'nulls', level: 1, title: 'Hired 2020–2021, still here',
    prompt: 'Return <code>first_name</code>, <code>last_name</code> and <code>hire_date</code> of <b>active</b> employees hired between 2020-01-01 and 2021-12-31 (inclusive).',
    solution: "SELECT first_name, last_name, hire_date FROM employees WHERE termination_date IS NULL AND hire_date BETWEEN '2020-01-01' AND '2021-12-31';",
    hints: ['Active = termination_date IS NULL.', "BETWEEN '2020-01-01' AND '2021-12-31' includes both ends."] });
  ex({ id: 'nulls-4', ds: 'shop', topic: 'nulls', level: 1, title: 'Last name starts with…', vars: [{ l: 'S' }, { l: 'B' }, { l: 'K' }, { l: 'J' }, { l: 'H' }],
    prompt: 'Return <code>first_name</code> and <code>last_name</code> of customers whose last name starts with <b>{l}</b>.',
    solution: "SELECT first_name, last_name FROM customers WHERE last_name LIKE '{l}%';",
    hints: ['LIKE does pattern matching.', '% matches any number of characters.'] });
  ex({ id: 'nulls-5', ds: 'shop', topic: 'nulls', level: 2, title: 'Fill the gaps',
    prompt: "Return <code>first_name</code>, <code>last_name</code> and <code>contact</code> for every customer: the email address, or the text <code>'no email'</code> when it is missing.",
    solution: "SELECT first_name, last_name, COALESCE(email, 'no email') AS contact FROM customers;",
    hints: ['COALESCE(a, b) returns the first value that is not NULL.'] });
  ex({ id: 'nulls-6', ds: 'shop', topic: 'nulls', level: 1, title: 'Unhappy orders', vars: [{ year: 2023 }, { year: 2024 }],
    prompt: 'Return <code>id</code>, <code>order_date</code> and <code>status</code> of orders placed in <b>{year}</b> whose status is <i>returned</i> or <i>cancelled</i>.',
    solution: "SELECT id, order_date, status FROM orders WHERE status IN ('returned', 'cancelled') AND order_date BETWEEN '{year}-01-01' AND '{year}-12-31';",
    hints: ["IN ('a', 'b') is shorthand for = 'a' OR = 'b'.", 'Restrict the date range with BETWEEN or >= / <.'] });
  ex({ id: 'nulls-7', ds: 'hr', topic: 'nulls', level: 2, title: 'The NOT IN trap',
    prompt: 'Return <code>first_name</code>, <code>last_name</code> and <code>department_id</code> of employees who do <b>not</b> work in Engineering (2) or Sales (3). Employees with no department <b>must be included</b>.',
    solution: 'SELECT first_name, last_name, department_id FROM employees WHERE department_id NOT IN (2, 3) OR department_id IS NULL;',
    hints: ['NULL NOT IN (2, 3) is not true — it is unknown, so those rows are dropped.', 'Add OR department_id IS NULL.'] });
  ex({ id: 'nulls-8', ds: 'shop', topic: 'nulls', level: 2, title: 'Search product names', vars: [{ word: 'wireless' }, { word: 'pro' }, { word: 'jacket' }, { word: 'set' }],
    prompt: 'Return the <code>name</code> of every product whose name contains <b>"{word}"</b>, ignoring upper/lower case.',
    solution: "SELECT name FROM products WHERE name ILIKE '%{word}%';",
    hints: ['LIKE is case-sensitive in PostgreSQL.', "ILIKE is the case-insensitive version. '%word%' matches anywhere."] });

  // ===== Aggregation =====
  ex({ id: 'agg-1', ds: 'shop', topic: 'aggregation', level: 1, title: 'Count customers',
    prompt: 'How many customers are there? Return a single number.',
    solution: 'SELECT COUNT(*) AS customers FROM customers;',
    hints: ['COUNT(*) counts rows.'] });
  ex({ id: 'agg-2', ds: 'shop', topic: 'aggregation', level: 1, title: 'Price statistics',
    prompt: 'Return <code>avg_price</code> (rounded to 2 decimals), <code>min_price</code> and <code>max_price</code> across all products.',
    solution: 'SELECT ROUND(AVG(price), 2) AS avg_price, MIN(price) AS min_price, MAX(price) AS max_price FROM products;',
    hints: ['AVG, MIN and MAX can be used in the same SELECT.'] });
  ex({ id: 'agg-3', ds: 'shop', topic: 'aggregation', level: 1, title: 'Customers per country',
    prompt: 'Return each <code>country</code> and the number of <code>customers</code> from it.',
    solution: 'SELECT country, COUNT(*) AS customers FROM customers GROUP BY country;',
    hints: ['GROUP BY country makes one row per country.', 'Every non-aggregated column in SELECT must be in GROUP BY.'] });
  ex({ id: 'agg-4', ds: 'shop', topic: 'aggregation', level: 1, title: 'Orders per status',
    prompt: 'Return each order <code>status</code> and the number of <code>orders</code> with that status.',
    solution: 'SELECT status, COUNT(*) AS orders FROM orders GROUP BY status;',
    hints: ['GROUP BY status + COUNT(*).'] });
  ex({ id: 'agg-5', ds: 'hr', topic: 'aggregation', level: 2, title: 'Average salary by department',
    prompt: 'For <b>active</b> employees with a department, return <code>department_id</code> and <code>avg_salary</code> (rounded to 2 decimals).',
    solution: 'SELECT department_id, ROUND(AVG(salary), 2) AS avg_salary FROM employees WHERE termination_date IS NULL AND department_id IS NOT NULL GROUP BY department_id;',
    hints: ['WHERE filters rows before grouping.', 'Exclude NULL departments with IS NOT NULL.'] });
  ex({ id: 'agg-6', ds: 'shop', topic: 'aggregation', level: 2, title: 'Big markets', vars: [{ n: 20 }, { n: 25 }, { n: 15 }, { n: 30 }],
    prompt: 'Return <code>country</code> and number of <code>customers</code> for countries with <b>more than {n}</b> customers.',
    solution: 'SELECT country, COUNT(*) AS customers FROM customers GROUP BY country HAVING COUNT(*) > {n};',
    hints: ['You cannot use aggregates in WHERE.', 'HAVING filters groups after GROUP BY.'] });
  ex({ id: 'agg-7', ds: 'shop', topic: 'aggregation', level: 2, title: 'Order totals',
    prompt: 'For every order, return <code>order_id</code> and its <code>revenue</code>: the sum of quantity × unit_price × (1 − discount) over its items, rounded to 2 decimals.',
    solution: 'SELECT order_id, ROUND(SUM(quantity * unit_price * (1 - discount)), 2) AS revenue FROM order_items GROUP BY order_id;',
    hints: ['Everything you need is in order_items.', 'SUM() of an expression works fine: SUM(a * b).'] });
  ex({ id: 'agg-8', ds: 'shop', topic: 'aggregation', level: 2, title: 'Unique buyers per channel',
    prompt: 'For each <code>channel</code>, return how many <b>different</b> customers have ordered through it (<code>customers</code>).',
    solution: 'SELECT channel, COUNT(DISTINCT customer_id) AS customers FROM orders GROUP BY channel;',
    hints: ['COUNT(DISTINCT col) counts unique values.'] });
  ex({ id: 'agg-9', ds: 'hr', topic: 'aggregation', level: 2, title: 'Headcount and attrition',
    prompt: 'For each <code>department_id</code> (ignore employees without one), return <code>headcount</code> (all employees ever) and <code>terminated</code> (those with a termination date).',
    solution: 'SELECT department_id, COUNT(*) AS headcount, COUNT(termination_date) AS terminated FROM employees WHERE department_id IS NOT NULL GROUP BY department_id;',
    hints: ['COUNT(column) only counts non-NULL values.'] });
  ex({ id: 'agg-10', ds: 'shop', topic: 'aggregation', level: 2, title: 'Loyal customers', vars: [{ n: 15 }, { n: 20 }, { n: 10 }, { n: 25 }],
    prompt: 'Return <code>customer_id</code> and number of <code>orders</code> for customers with at least <b>{n}</b> <i>delivered</i> orders.',
    solution: "SELECT customer_id, COUNT(*) AS orders FROM orders WHERE status = 'delivered' GROUP BY customer_id HAVING COUNT(*) >= {n};",
    hints: ['Filter on status with WHERE, filter on the count with HAVING.'] });
  ex({ id: 'agg-11', ds: 'saas', topic: 'aggregation', level: 1, title: 'Accounts per industry',
    prompt: 'Return each <code>industry</code> and its number of <code>accounts</code>.',
    solution: 'SELECT industry, COUNT(*) AS accounts FROM accounts GROUP BY industry;',
    hints: ['GROUP BY industry.'] });
  ex({ id: 'agg-12', ds: 'retail', topic: 'aggregation', level: 2, title: 'Store totals 2024',
    prompt: 'For each <code>store_id</code>, return <code>total_revenue</code> and <code>avg_daily_transactions</code> for 2024, both rounded to 2 decimals.',
    solution: "SELECT store_id, ROUND(SUM(revenue), 2) AS total_revenue, ROUND(AVG(transactions), 2) AS avg_daily_transactions FROM daily_sales WHERE sale_date >= '2024-01-01' AND sale_date < '2025-01-01' GROUP BY store_id;",
    hints: ["Filter 2024 with sale_date >= '2024-01-01' AND sale_date < '2025-01-01'."] });

  // ===== Joins =====
  ex({ id: 'joins-1', ds: 'shop', topic: 'joins', level: 1, title: 'Who ordered?', vars: SHOP_MONTHS,
    prompt: "Return the order <code>id</code>, <code>order_date</code> and the customer's <code>first_name</code> and <code>last_name</code> for every order placed in <b>{label}</b>.",
    solution: "SELECT o.id, o.order_date, c.first_name, c.last_name FROM orders o JOIN customers c ON c.id = o.customer_id WHERE o.order_date >= '{start}' AND o.order_date < '{end}';",
    hints: ['JOIN customers ON customers.id = orders.customer_id', 'Short table aliases (orders o) keep it readable.'] });
  ex({ id: 'joins-2', ds: 'shop', topic: 'joins', level: 1, title: 'Products with categories',
    prompt: 'Return every product name as <code>product</code> together with its category name as <code>category</code>.',
    solution: 'SELECT p.name AS product, c.name AS category FROM products p JOIN categories c ON c.id = p.category_id;',
    hints: ['Both tables have a column called name — qualify them: p.name, c.name.'] });
  ex({ id: 'joins-3', ds: 'shop', topic: 'joins', level: 2, title: 'Customers who never ordered',
    prompt: 'Return <code>id</code>, <code>first_name</code> and <code>last_name</code> of customers who have never placed an order.',
    solution: 'SELECT c.id, c.first_name, c.last_name FROM customers c LEFT JOIN orders o ON o.customer_id = c.id WHERE o.id IS NULL;',
    hints: ['A LEFT JOIN keeps customers even when no order matches.', 'Unmatched rows have NULL in all order columns.'] });
  ex({ id: 'joins-4', ds: 'shop', topic: 'joins', level: 2, title: 'Products never ordered',
    prompt: 'Return <code>id</code> and <code>name</code> of products that do not appear in any order.',
    solution: 'SELECT p.id, p.name FROM products p LEFT JOIN order_items oi ON oi.product_id = p.id WHERE oi.order_id IS NULL;',
    hints: ['Same anti-join pattern: LEFT JOIN … WHERE right_side IS NULL.'] });
  ex({ id: 'joins-5', ds: 'hr', topic: 'joins', level: 2, title: 'Employee and manager',
    prompt: "For every employee, return <code>employee</code> (first and last name, separated by a space) and <code>manager</code> (the manager's full name, or NULL if none).",
    solution: "SELECT e.first_name || ' ' || e.last_name AS employee, m.first_name || ' ' || m.last_name AS manager FROM employees e LEFT JOIN employees m ON m.id = e.manager_id;",
    hints: ['Join the table to itself with two aliases (a self-join).', "|| concatenates text: first_name || ' ' || last_name", 'Use LEFT JOIN so the person without a manager is kept.'] });
  ex({ id: 'joins-6', ds: 'hr', topic: 'joins', level: 2, title: 'Headcount, including empty departments',
    prompt: 'Return every department <code>name</code> and its number of <code>employees</code>. Departments with no employees must show 0.',
    solution: 'SELECT d.name, COUNT(e.id) AS employees FROM departments d LEFT JOIN employees e ON e.department_id = d.id GROUP BY d.name;',
    hints: ['Start FROM departments and LEFT JOIN employees.', 'COUNT(*) counts the NULL row too — COUNT(e.id) does not.'] });
  ex({ id: 'joins-7', ds: 'shop', topic: 'joins', level: 2, title: 'Revenue by category',
    prompt: 'Return each <code>category</code> name and its <code>revenue</code> from <i>delivered</i> orders, rounded to 2 decimals.',
    solution: `SELECT c.name AS category, ROUND(SUM(${REV}), 2) AS revenue FROM categories c JOIN products p ON p.category_id = c.id JOIN order_items oi ON oi.product_id = p.id JOIN orders o ON o.id = oi.order_id WHERE o.status = 'delivered' GROUP BY c.name;`,
    hints: ['You need four tables: categories → products → order_items → orders.', 'Line revenue = quantity × unit_price × (1 − discount).'] });
  ex({ id: 'joins-8', ds: 'hr', topic: 'joins', level: 2, title: 'Out-earning the boss',
    prompt: "Return <code>first_name</code>, <code>last_name</code>, <code>salary</code> and <code>manager_salary</code> for employees who earn more than their manager.",
    solution: 'SELECT e.first_name, e.last_name, e.salary, m.salary AS manager_salary FROM employees e JOIN employees m ON m.id = e.manager_id WHERE e.salary > m.salary;',
    hints: ['Self-join employees to employees on manager_id.', 'Compare e.salary > m.salary in WHERE.'] });
  ex({ id: 'joins-9', ds: 'shop', topic: 'joins', level: 3, title: 'Spend per customer, zeros included', vars: COUNTRIES,
    prompt: 'For <b>every</b> customer from <b>{country}</b>, return <code>id</code>, <code>first_name</code>, <code>last_name</code> and <code>total_spent</code> on <i>delivered</i> orders (rounded to 2 decimals). Customers with nothing delivered must show 0.',
    solution: `SELECT c.id, c.first_name, c.last_name, COALESCE(ROUND(SUM(${REV}), 2), 0) AS total_spent FROM customers c LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'delivered' LEFT JOIN order_items oi ON oi.order_id = o.id WHERE c.country = '{country}' GROUP BY c.id, c.first_name, c.last_name;`,
    hints: ["Putting o.status = 'delivered' in WHERE turns your LEFT JOIN into an INNER JOIN.", 'Move that condition into the ON clause of the LEFT JOIN.', 'COALESCE(sum, 0) turns NULL into 0.'] });
  ex({ id: 'joins-10', ds: 'saas', topic: 'joins', level: 2, title: 'Current plan',
    prompt: 'Return <code>company_name</code> and current <code>plan</code> name for every account with an active subscription.',
    solution: 'SELECT a.company_name, p.name AS plan FROM accounts a JOIN subscriptions s ON s.account_id = a.id JOIN plans p ON p.id = s.plan_id WHERE s.end_date IS NULL;',
    hints: ['Active subscription = end_date IS NULL.', 'accounts → subscriptions → plans.'] });
  ex({ id: 'joins-11', ds: 'hr', topic: 'joins', level: 2, title: 'Project staffing',
    prompt: 'For every project return <code>project</code> (name), <code>department</code> (name) and the number of assigned <code>employees</code>.',
    solution: 'SELECT p.name AS project, d.name AS department, COUNT(pa.employee_id) AS employees FROM projects p JOIN departments d ON d.id = p.department_id LEFT JOIN project_assignments pa ON pa.project_id = p.id GROUP BY p.name, d.name;',
    hints: ['projects → departments for the name, projects → project_assignments for the count.'] });
  ex({ id: 'joins-12', ds: 'hr', topic: 'joins', level: 3, title: 'Cross-department work',
    prompt: "Return <code>first_name</code>, <code>last_name</code> and <code>project</code> (name) for every assignment where the project belongs to a different department than the employee. Ignore employees without a department.",
    solution: 'SELECT e.first_name, e.last_name, p.name AS project FROM project_assignments pa JOIN employees e ON e.id = pa.employee_id JOIN projects p ON p.id = pa.project_id WHERE e.department_id <> p.department_id;',
    hints: ['Join assignments to both employees and projects.', 'Compare the two department_id columns with <>.'] });
  ex({ id: 'joins-13', ds: 'retail', topic: 'joins', level: 1, title: 'Sales with store names', vars: [{ date: '2024-06-14' }, { date: '2024-02-02' }, { date: '2023-11-24' }, { date: '2024-10-04' }],
    prompt: 'Return store <code>name</code>, <code>sale_date</code> and <code>revenue</code> for all sales on <b>{date}</b>.',
    solution: "SELECT st.name, s.sale_date, s.revenue FROM daily_sales s JOIN stores st ON st.id = s.store_id WHERE s.sale_date = '{date}';",
    hints: ['daily_sales.store_id → stores.id'] });

  // ===== CASE =====
  ex({ id: 'case-1', ds: 'shop', topic: 'case', level: 1, title: 'Price bands',
    prompt: "Return <code>name</code>, <code>price</code> and <code>band</code> for every product: <code>'Budget'</code> under 100, <code>'Mid'</code> from 100 up to (not incl.) 500, <code>'Premium'</code> 500 and above.",
    solution: "SELECT name, price, CASE WHEN price < 100 THEN 'Budget' WHEN price < 500 THEN 'Mid' ELSE 'Premium' END AS band FROM products;",
    hints: ['CASE WHEN … THEN … WHEN … THEN … ELSE … END', 'Conditions are checked top-down; the first match wins.'] });
  ex({ id: 'case-2', ds: 'shop', topic: 'case', level: 2, title: 'Products per band',
    prompt: 'Using the same bands (Budget &lt; 100 ≤ Mid &lt; 500 ≤ Premium), return each <code>band</code> and its number of <code>products</code>.',
    solution: "SELECT CASE WHEN price < 100 THEN 'Budget' WHEN price < 500 THEN 'Mid' ELSE 'Premium' END AS band, COUNT(*) AS products FROM products GROUP BY 1;",
    hints: ['You can GROUP BY a CASE expression.', 'GROUP BY 1 means "the first column in SELECT".'] });
  ex({ id: 'case-3', ds: 'shop', topic: 'case', level: 2, title: 'Pivot by status',
    prompt: 'For each <code>channel</code>, return the number of <code>delivered</code>, <code>cancelled</code> and <code>returned</code> orders as three columns.',
    solution: "SELECT channel, SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) AS delivered, SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled, SUM(CASE WHEN status = 'returned' THEN 1 ELSE 0 END) AS returned FROM orders GROUP BY channel;",
    hints: ['Conditional aggregation: SUM(CASE WHEN … THEN 1 ELSE 0 END).', "PostgreSQL also has COUNT(*) FILTER (WHERE status = 'delivered')."] });
  ex({ id: 'case-4', ds: 'hr', topic: 'case', level: 2, title: 'Veterans vs newcomers',
    prompt: 'For active employees with a department, return <code>department_id</code>, <code>veterans</code> (hired before 2018-01-01) and <code>newcomers</code> (hired 2018-01-01 or later).',
    solution: "SELECT department_id, SUM(CASE WHEN hire_date < '2018-01-01' THEN 1 ELSE 0 END) AS veterans, SUM(CASE WHEN hire_date >= '2018-01-01' THEN 1 ELSE 0 END) AS newcomers FROM employees WHERE termination_date IS NULL AND department_id IS NOT NULL GROUP BY department_id;",
    hints: ['Two conditional counts side by side.'] });
  ex({ id: 'case-5', ds: 'saas', topic: 'case', level: 3, title: 'Invoice status by year',
    prompt: 'For each <code>year</code>, return the total invoice amount per status as columns <code>paid</code>, <code>overdue</code> and <code>void</code>.',
    solution: "SELECT EXTRACT(YEAR FROM invoice_date) AS year, SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) AS paid, SUM(CASE WHEN status = 'overdue' THEN amount ELSE 0 END) AS overdue, SUM(CASE WHEN status = 'void' THEN amount ELSE 0 END) AS void FROM invoices GROUP BY 1;",
    hints: ['EXTRACT(YEAR FROM date) gives the year.', 'SUM(CASE WHEN status = … THEN amount ELSE 0 END)'] });
  ex({ id: 'case-6', ds: 'shop', topic: 'case', level: 2, ordered: true, title: 'Custom sort order',
    prompt: 'Return each <code>status</code> and its number of <code>orders</code>, sorted in this order: shipped, delivered, returned, cancelled.',
    solution: "SELECT status, COUNT(*) AS orders FROM orders GROUP BY status ORDER BY CASE status WHEN 'shipped' THEN 1 WHEN 'delivered' THEN 2 WHEN 'returned' THEN 3 ELSE 4 END;",
    hints: ['ORDER BY accepts a CASE expression that maps values to numbers.'] });

  // ===== Dates =====
  ex({ id: 'dates-1', ds: 'shop', topic: 'dates', level: 1, title: 'Orders in a month', vars: SHOP_MONTHS,
    prompt: 'How many orders were placed in <b>{label}</b>? Return a single number.',
    solution: "SELECT COUNT(*) AS orders FROM orders WHERE order_date >= '{start}' AND order_date < '{end}';",
    hints: ["The safest month filter: >= first day AND < first day of next month."] });
  ex({ id: 'dates-2', ds: 'shop', topic: 'dates', level: 1, title: 'Orders per year',
    prompt: 'Return <code>year</code> and the number of <code>orders</code> placed that year.',
    solution: 'SELECT EXTRACT(YEAR FROM order_date) AS year, COUNT(*) AS orders FROM orders GROUP BY 1;',
    hints: ['EXTRACT(YEAR FROM order_date)'] });
  ex({ id: 'dates-3', ds: 'shop', topic: 'dates', level: 2, ordered: true, title: 'Monthly order volume',
    prompt: 'For 2024, return <code>month</code> (as the first day of the month, e.g. 2024-01-01) and number of <code>orders</code>, in chronological order.',
    solution: "SELECT DATE_TRUNC('month', order_date)::date AS month, COUNT(*) AS orders FROM orders WHERE order_date >= '2024-01-01' AND order_date < '2025-01-01' GROUP BY 1 ORDER BY 1;",
    hints: ["DATE_TRUNC('month', d) rounds a date down to the 1st of its month.", '::date casts the result back to a date.'] });
  ex({ id: 'dates-4', ds: 'hr', topic: 'dates', level: 2, title: 'Tenure',
    prompt: 'For active employees, return <code>first_name</code>, <code>last_name</code> and <code>tenure_years</code>: complete years of service as of 2025-01-01.',
    solution: "SELECT first_name, last_name, EXTRACT(YEAR FROM AGE(DATE '2025-01-01', hire_date)) AS tenure_years FROM employees WHERE termination_date IS NULL;",
    hints: ['AGE(later, earlier) returns an interval like "6 years 3 mons".', 'EXTRACT(YEAR FROM interval) gives the whole years.'] });
  ex({ id: 'dates-5', ds: 'shop', topic: 'dates', level: 3, title: 'Time to first order',
    prompt: 'On average, how many days pass between a customer signing up and their first order? Only consider customers who have ordered. Round to 2 decimals.',
    solution: 'SELECT ROUND(AVG(f.first_order - c.signup_date), 2) AS avg_days FROM (SELECT customer_id, MIN(order_date) AS first_order FROM orders GROUP BY customer_id) f JOIN customers c ON c.id = f.customer_id;',
    hints: ['First find each customer\'s first order date with MIN().', 'Subtracting two dates gives a number of days.'] });
  ex({ id: 'dates-6', ds: 'saas', topic: 'dates', level: 2, title: 'Signups per quarter',
    prompt: 'For accounts created in 2024, return <code>quarter</code> (1–4) and number of <code>accounts</code>.',
    solution: "SELECT EXTRACT(QUARTER FROM created_at) AS quarter, COUNT(*) AS accounts FROM accounts WHERE created_at >= '2024-01-01' AND created_at < '2025-01-01' GROUP BY 1;",
    hints: ['EXTRACT(QUARTER FROM date)'] });
  ex({ id: 'dates-7', ds: 'shop', topic: 'dates', level: 3, ordered: true, title: 'Busiest weekdays',
    prompt: 'Return <code>weekday</code> (full name, e.g. Monday) and number of <code>orders</code>, ordered Monday → Sunday.',
    solution: "SELECT TO_CHAR(order_date, 'FMDay') AS weekday, COUNT(*) AS orders FROM orders GROUP BY TO_CHAR(order_date, 'FMDay'), EXTRACT(ISODOW FROM order_date) ORDER BY EXTRACT(ISODOW FROM order_date);",
    hints: ["TO_CHAR(date, 'FMDay') gives the weekday name (FM removes padding).", 'EXTRACT(ISODOW FROM date) is 1 for Monday … 7 for Sunday — sort by it.'] });
  ex({ id: 'dates-8', ds: 'retail', topic: 'dates', level: 2, title: 'Monthly store revenue', vars: RETAIL_MONTHS,
    prompt: 'Return <code>store_id</code> and <code>revenue</code> (rounded to 2 decimals) for <b>{label}</b>.',
    solution: "SELECT store_id, ROUND(SUM(revenue), 2) AS revenue FROM daily_sales WHERE sale_date >= '{start}' AND sale_date < '{end}' GROUP BY store_id;",
    hints: ['Filter the month, then GROUP BY store_id.'] });
  ex({ id: 'dates-9', ds: 'saas', topic: 'dates', level: 1, title: 'Subscription length',
    prompt: 'For subscriptions that have ended, return <code>id</code>, <code>account_id</code> and <code>days</code> (number of days from start to end).',
    solution: 'SELECT id, account_id, end_date - start_date AS days FROM subscriptions WHERE end_date IS NOT NULL;',
    hints: ['date − date = number of days.'] });

  // ===== Functions =====
  ex({ id: 'func-1', ds: 'hr', topic: 'functions', level: 1, title: 'Shouting names',
    prompt: 'Return <code>full_name</code> for every employee: first and last name separated by a space, in UPPER CASE.',
    solution: "SELECT UPPER(first_name || ' ' || last_name) AS full_name FROM employees;",
    hints: ['UPPER(text)', "Concatenate with ||."] });
  ex({ id: 'func-2', ds: 'shop', topic: 'functions', level: 2, title: 'Email providers',
    prompt: 'Return each email <code>domain</code> (the part after @) and its number of <code>customers</code>. Ignore missing emails.',
    solution: "SELECT SPLIT_PART(email, '@', 2) AS domain, COUNT(*) AS customers FROM customers WHERE email IS NOT NULL GROUP BY 1;",
    hints: ["SPLIT_PART(text, '@', 2) returns the second piece."] });
  ex({ id: 'func-3', ds: 'shop', topic: 'functions', level: 1, title: 'Long product names',
    prompt: 'Return <code>name</code> and <code>name_length</code> for products whose name is longer than 20 characters.',
    solution: 'SELECT name, LENGTH(name) AS name_length FROM products WHERE LENGTH(name) > 20;',
    hints: ['LENGTH(text) counts characters.'] });
  ex({ id: 'func-4', ds: 'shop', topic: 'functions', level: 2, title: 'Initials', vars: COUNTRIES,
    prompt: 'For customers from <b>{country}</b>, return <code>id</code> and <code>initials</code> in the form <code>E.H.</code> (first letter of first name, dot, first letter of last name, dot).',
    solution: "SELECT id, LEFT(first_name, 1) || '.' || LEFT(last_name, 1) || '.' AS initials FROM customers WHERE country = '{country}';",
    hints: ['LEFT(text, 1) returns the first character.'] });
  ex({ id: 'func-5', ds: 'shop', topic: 'functions', level: 1, title: 'Round numbers',
    prompt: 'Return <code>name</code>, <code>price</code> and <code>rounded_price</code>: the price rounded to the nearest 10.',
    solution: 'SELECT name, price, ROUND(price, -1) AS rounded_price FROM products;',
    hints: ['ROUND accepts negative precision: ROUND(x, -1) rounds to tens.'] });
  ex({ id: 'func-6', ds: 'hr', topic: 'functions', level: 2, title: 'Email usernames',
    prompt: 'Return <code>first_name</code>, <code>last_name</code> and <code>username</code>: the part of the email before the @.',
    solution: "SELECT first_name, last_name, SPLIT_PART(email, '@', 1) AS username FROM employees;",
    hints: ["SPLIT_PART(email, '@', 1)"] });

  // ===== Subqueries =====
  ex({ id: 'sub-1', ds: 'shop', topic: 'subqueries', level: 1, title: 'Above-average price',
    prompt: 'Return <code>name</code> and <code>price</code> of products priced above the average product price.',
    solution: 'SELECT name, price FROM products WHERE price > (SELECT AVG(price) FROM products);',
    hints: ['A subquery in parentheses can return a single value to compare with.'] });
  ex({ id: 'sub-2', ds: 'shop', topic: 'subqueries', level: 2, title: 'Customers with returns',
    prompt: 'Return <code>id</code>, <code>first_name</code> and <code>last_name</code> of customers who have at least one <i>returned</i> order.',
    solution: "SELECT id, first_name, last_name FROM customers WHERE id IN (SELECT customer_id FROM orders WHERE status = 'returned');",
    hints: ['WHERE id IN (SELECT customer_id FROM …)', 'A JOIN would duplicate customers with several returns.'] });
  ex({ id: 'sub-3', ds: 'hr', topic: 'subqueries', level: 3, title: 'Above their department average',
    prompt: 'Return <code>first_name</code>, <code>last_name</code>, <code>department_id</code> and <code>salary</code> of employees earning more than the average salary of <b>their own</b> department.',
    solution: 'SELECT e.first_name, e.last_name, e.department_id, e.salary FROM employees e WHERE e.salary > (SELECT AVG(e2.salary) FROM employees e2 WHERE e2.department_id = e.department_id);',
    hints: ['A correlated subquery refers to the outer row.', 'WHERE e2.department_id = e.department_id inside the subquery.'] });
  ex({ id: 'sub-4', ds: 'shop', topic: 'subqueries', level: 2, title: 'The latest order',
    prompt: 'Return <code>id</code>, <code>order_date</code> and <code>customer_id</code> of the order(s) placed on the most recent order date.',
    solution: 'SELECT id, order_date, customer_id FROM orders WHERE order_date = (SELECT MAX(order_date) FROM orders);',
    hints: ['Several orders can share the latest date — LIMIT 1 is not enough.'] });
  ex({ id: 'sub-5', ds: 'shop', topic: 'subqueries', level: 2, title: 'Bought in a country', vars: COUNTRIES,
    prompt: 'Return the <code>name</code> of every product that has been ordered at least once by a customer from <b>{country}</b>.',
    solution: "SELECT p.name FROM products p WHERE EXISTS (SELECT 1 FROM order_items oi JOIN orders o ON o.id = oi.order_id JOIN customers c ON c.id = o.customer_id WHERE oi.product_id = p.id AND c.country = '{country}');",
    hints: ['EXISTS (subquery) is true if the subquery returns any row.', 'Each product should appear only once.'] });
  ex({ id: 'sub-6', ds: 'shop', topic: 'subqueries', level: 3, title: 'Above-average spenders',
    prompt: 'Return <code>customer_id</code> and <code>total</code> (delivered revenue, rounded to 2 decimals) for customers whose total is above the average customer total.',
    solution: `WITH t AS (SELECT o.customer_id, SUM(${REV}) AS total FROM orders o JOIN order_items oi ON oi.order_id = o.id WHERE o.status = 'delivered' GROUP BY o.customer_id) SELECT customer_id, ROUND(total, 2) AS total FROM t WHERE total > (SELECT AVG(total) FROM t);`,
    hints: ['First compute total per customer in a derived table (subquery in FROM).', 'Then compare each total with the AVG over that same derived table.'] });
  ex({ id: 'sub-7', ds: 'hr', topic: 'subqueries', level: 2, title: 'Departments without attrition',
    prompt: 'Return the <code>name</code> of every department where no employee has been terminated.',
    solution: 'SELECT d.name FROM departments d WHERE NOT EXISTS (SELECT 1 FROM employees e WHERE e.department_id = d.id AND e.termination_date IS NOT NULL);',
    hints: ['NOT EXISTS is the cleanest way to say "there is no such row".'] });

  // ===== Set operations =====
  ex({ id: 'set-1', ds: 'shop', topic: 'setops', level: 2, title: 'Omnichannel customers',
    prompt: 'Return the <code>customer_id</code> of customers who have ordered both via <i>web</i> and in <i>store</i>.',
    solution: "SELECT customer_id FROM orders WHERE channel = 'web' INTERSECT SELECT customer_id FROM orders WHERE channel = 'store';",
    hints: ['INTERSECT keeps rows present in both queries.'] });
  ex({ id: 'set-2', ds: 'shop', topic: 'setops', level: 2, title: 'Web, never mobile',
    prompt: 'Return the <code>customer_id</code> of customers who have ordered via <i>web</i> but never via <i>mobile</i>.',
    solution: "SELECT customer_id FROM orders WHERE channel = 'web' EXCEPT SELECT customer_id FROM orders WHERE channel = 'mobile';",
    hints: ['EXCEPT removes rows that appear in the second query.'] });
  ex({ id: 'set-3', ds: 'shop', topic: 'setops', level: 1, title: 'Table sizes',
    prompt: "Return two columns, <code>entity</code> and <code>total</code>, with one row each for 'customers', 'products' and 'orders' and their row counts.",
    solution: "SELECT 'customers' AS entity, COUNT(*) AS total FROM customers UNION ALL SELECT 'products', COUNT(*) FROM products UNION ALL SELECT 'orders', COUNT(*) FROM orders;",
    hints: ['UNION ALL stacks result sets on top of each other.', 'Each part must have the same number of columns.'] });

  // ===== CTEs =====
  ex({ id: 'cte-1', ds: 'shop', topic: 'ctes', level: 2, ordered: true, title: 'Top 10 customers',
    prompt: 'Return <code>customer_id</code> and <code>revenue</code> (delivered orders, rounded to 2 decimals) for the 10 highest-revenue customers, highest first.',
    solution: `WITH rev AS (SELECT o.customer_id, SUM(${REV}) AS revenue FROM orders o JOIN order_items oi ON oi.order_id = o.id WHERE o.status = 'delivered' GROUP BY o.customer_id) SELECT customer_id, ROUND(revenue, 2) AS revenue FROM rev ORDER BY revenue DESC, customer_id LIMIT 10;`,
    hints: ['WITH name AS (query) SELECT … FROM name', 'Compute revenue per customer in the CTE, then sort and limit.'] });
  ex({ id: 'cte-2', ds: 'hr', topic: 'ctes', level: 2, title: 'Above-average departments',
    prompt: 'Return department <code>name</code> and <code>avg_salary</code> (rounded to 2 decimals) for departments whose average salary is higher than the company-wide average salary (all employees).',
    solution: 'WITH d AS (SELECT department_id, AVG(salary) AS avg_salary FROM employees WHERE department_id IS NOT NULL GROUP BY department_id) SELECT dep.name, ROUND(d.avg_salary, 2) AS avg_salary FROM d JOIN departments dep ON dep.id = d.department_id WHERE d.avg_salary > (SELECT AVG(salary) FROM employees);',
    hints: ['CTE 1: average per department.', 'Compare against (SELECT AVG(salary) FROM employees).'] });
  ex({ id: 'cte-3', ds: 'hr', topic: 'ctes', level: 3, title: 'Everyone under a manager',
    vars: [{ id: 2, role: 'VP Engineering' }, { id: 3, role: 'VP Sales' }, { id: 4, role: 'VP Marketing' }, { id: 6, role: 'VP Operations' }],
    prompt: 'Return <code>id</code>, <code>first_name</code> and <code>last_name</code> of everyone who reports to employee <b>{id}</b> (the {role}) — directly or indirectly.',
    solution: 'WITH RECURSIVE sub AS (SELECT id, first_name, last_name FROM employees WHERE manager_id = {id} UNION ALL SELECT e.id, e.first_name, e.last_name FROM employees e JOIN sub s ON e.manager_id = s.id) SELECT id, first_name, last_name FROM sub;',
    hints: ['WITH RECURSIVE: an anchor query UNION ALL a query that joins back to the CTE.', 'Anchor: direct reports (manager_id = …). Recursive part: employees whose manager is in the CTE.'] });
  ex({ id: 'cte-4', ds: 'hr', topic: 'ctes', level: 3, title: 'Org chart depth',
    prompt: 'Return <code>id</code>, <code>first_name</code>, <code>last_name</code> and <code>level</code> for every employee reachable from the top, where the person without a manager is level 1, their reports level 2, and so on.',
    solution: 'WITH RECURSIVE t AS (SELECT id, first_name, last_name, 1 AS level FROM employees WHERE manager_id IS NULL UNION ALL SELECT e.id, e.first_name, e.last_name, t.level + 1 FROM employees e JOIN t ON e.manager_id = t.id) SELECT id, first_name, last_name, level FROM t;',
    hints: ['Anchor: manager_id IS NULL with level 1.', 'Recursive step: t.level + 1.'] });
  ex({ id: 'cte-5', ds: 'shop', topic: 'ctes', level: 3, ordered: true, title: 'Above-average months',
    prompt: 'For 2024, return <code>month</code> (first day of month) and <code>revenue</code> (delivered, rounded to 2 decimals) for months whose revenue is above the 2024 monthly average. Chronological order.',
    solution: `WITH m AS (SELECT DATE_TRUNC('month', o.order_date)::date AS month, SUM(${REV}) AS revenue FROM orders o JOIN order_items oi ON oi.order_id = o.id WHERE o.status = 'delivered' AND o.order_date >= '2024-01-01' AND o.order_date < '2025-01-01' GROUP BY 1) SELECT month, ROUND(revenue, 2) AS revenue FROM m WHERE revenue > (SELECT AVG(revenue) FROM m) ORDER BY month;`,
    hints: ['CTE with monthly revenue, then compare each month with AVG over the CTE.'] });
  ex({ id: 'cte-6', ds: 'retail', topic: 'ctes', level: 3, title: 'Closed days', vars: [{ id: 3 }, { id: 5 }, { id: 8 }, { id: 4 }],
    prompt: 'Return every date in 2024 (column <code>day</code>) on which store <b>{id}</b> has no row in <code>daily_sales</code>.',
    solution: "SELECT d::date AS day FROM generate_series('2024-01-01'::date, '2024-12-31'::date, INTERVAL '1 day') AS d WHERE NOT EXISTS (SELECT 1 FROM daily_sales s WHERE s.store_id = {id} AND s.sale_date = d::date);",
    hints: ["generate_series(start, end, INTERVAL '1 day') creates a row per day.", 'Then keep the days with NOT EXISTS / LEFT JOIN … IS NULL.'] });

  // ===== Window functions =====
  ex({ id: 'win-1', ds: 'shop', topic: 'windows', level: 2, title: 'Price rank in category',
    prompt: 'Return <code>category_id</code>, <code>name</code>, <code>price</code> and <code>price_rank</code>: the product\'s rank by price (highest = 1) within its category. Use RANK semantics.',
    solution: 'SELECT category_id, name, price, RANK() OVER (PARTITION BY category_id ORDER BY price DESC) AS price_rank FROM products;',
    hints: ['RANK() OVER (PARTITION BY … ORDER BY …)', 'PARTITION BY restarts the ranking for each category.'] });
  ex({ id: 'win-2', ds: 'shop', topic: 'windows', level: 2, title: 'Top 3 per category',
    prompt: 'Return <code>category_id</code>, <code>name</code> and <code>price</code> of the 3 most expensive products in each category.',
    solution: 'SELECT category_id, name, price FROM (SELECT category_id, name, price, ROW_NUMBER() OVER (PARTITION BY category_id ORDER BY price DESC, name) AS rn FROM products) t WHERE rn <= 3;',
    hints: ['You cannot filter on a window function in WHERE directly.', 'Compute ROW_NUMBER() in a subquery/CTE, then WHERE rn <= 3 outside.'] });
  ex({ id: 'win-3', ds: 'retail', topic: 'windows', level: 2, ordered: true, title: 'Running total',
    vars: [{ id: 1, label: 'January 2024', start: '2024-01-01', end: '2024-02-01' }, { id: 4, label: 'June 2024', start: '2024-06-01', end: '2024-07-01' }, { id: 7, label: 'October 2024', start: '2024-10-01', end: '2024-11-01' }, { id: 2, label: 'December 2023', start: '2023-12-01', end: '2024-01-01' }],
    prompt: 'For store <b>{id}</b> in <b>{label}</b>, return <code>sale_date</code>, <code>revenue</code> and <code>running_total</code> (cumulative revenue so far that month), by date.',
    solution: "SELECT sale_date, revenue, SUM(revenue) OVER (ORDER BY sale_date) AS running_total FROM daily_sales WHERE store_id = {id} AND sale_date >= '{start}' AND sale_date < '{end}' ORDER BY sale_date;",
    hints: ['SUM(revenue) OVER (ORDER BY sale_date) is a running sum.'] });
  ex({ id: 'win-4', ds: 'hr', topic: 'windows', level: 2, title: 'Salary vs department average',
    prompt: 'For employees with a department, return <code>first_name</code>, <code>last_name</code>, <code>department_id</code>, <code>salary</code> and <code>dept_avg</code> (department average salary, rounded to 2 decimals) on the same row.',
    solution: 'SELECT first_name, last_name, department_id, salary, ROUND(AVG(salary) OVER (PARTITION BY department_id), 2) AS dept_avg FROM employees WHERE department_id IS NOT NULL;',
    hints: ['Unlike GROUP BY, a window function keeps every row.', 'AVG(salary) OVER (PARTITION BY department_id)'] });
  ex({ id: 'win-5', ds: 'retail', topic: 'windows', level: 3, ordered: true, title: '7-day moving average',
    prompt: 'For store 1 in March 2024, return <code>sale_date</code>, <code>revenue</code> and <code>moving_avg</code>: the average of the current and 6 previous rows (within March only), rounded to 2 decimals. By date.',
    solution: "SELECT sale_date, revenue, ROUND(AVG(revenue) OVER (ORDER BY sale_date ROWS BETWEEN 6 PRECEDING AND CURRENT ROW), 2) AS moving_avg FROM daily_sales WHERE store_id = 1 AND sale_date >= '2024-03-01' AND sale_date < '2024-04-01' ORDER BY sale_date;",
    hints: ['A frame clause controls which rows the window sees.', 'ROWS BETWEEN 6 PRECEDING AND CURRENT ROW'] });
  ex({ id: 'win-6', ds: 'shop', topic: 'windows', level: 3, ordered: true, title: 'Days between orders', vars: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 5 }, { id: 8 }],
    prompt: 'For customer <b>{id}</b>, return each order\'s <code>id</code>, <code>order_date</code>, <code>previous_order_date</code> and <code>days_since_previous</code>. Order by order_date, then id.',
    solution: 'SELECT id, order_date, LAG(order_date) OVER (ORDER BY order_date, id) AS previous_order_date, order_date - LAG(order_date) OVER (ORDER BY order_date, id) AS days_since_previous FROM orders WHERE customer_id = {id} ORDER BY order_date, id;',
    hints: ['LAG(col) OVER (ORDER BY …) reads the previous row.', 'date − date = days.'] });
  ex({ id: 'win-7', ds: 'retail', topic: 'windows', level: 3, ordered: true, title: 'Month-over-month growth',
    prompt: 'For the whole chain, return for each month of 2024: <code>month</code> (first day), <code>revenue</code>, <code>prev_revenue</code> and <code>pct_change</code> (% change vs previous month). Round money and % to 2 decimals. January must compare with December 2023.',
    solution: "WITH m AS (SELECT DATE_TRUNC('month', sale_date)::date AS month, SUM(revenue) AS revenue FROM daily_sales GROUP BY 1), g AS (SELECT month, revenue, LAG(revenue) OVER (ORDER BY month) AS prev_revenue FROM m) SELECT month, ROUND(revenue, 2) AS revenue, ROUND(prev_revenue, 2) AS prev_revenue, ROUND(100.0 * (revenue - prev_revenue) / prev_revenue, 2) AS pct_change FROM g WHERE month >= '2024-01-01' ORDER BY month;",
    hints: ['Aggregate to months first.', 'If you filter to 2024 before LAG, January has nothing to look back at — filter afterwards.', 'pct_change = 100 × (revenue − prev) / prev'] });
  ex({ id: 'win-8', ds: 'hr', topic: 'windows', level: 2, title: 'Top 5 salary levels',
    prompt: 'Return <code>first_name</code>, <code>last_name</code>, <code>salary</code> and <code>salary_rank</code> for everyone in the top 5 salary levels (DENSE_RANK, highest = 1).',
    solution: 'SELECT first_name, last_name, salary, salary_rank FROM (SELECT first_name, last_name, salary, DENSE_RANK() OVER (ORDER BY salary DESC) AS salary_rank FROM employees) t WHERE salary_rank <= 5;',
    hints: ['DENSE_RANK gives ties the same rank without gaps.', 'Filter the rank in an outer query.'] });
  ex({ id: 'win-9', ds: 'shop', topic: 'windows', level: 3, title: 'Share of category',
    prompt: 'For each product with delivered sales, return <code>category_id</code>, <code>product</code> (name), <code>revenue</code> and <code>pct_of_category</code> (its % of its category\'s delivered revenue). Round to 2 decimals.',
    solution: `WITH pr AS (SELECT p.category_id, p.name, SUM(${REV}) AS revenue FROM products p JOIN order_items oi ON oi.product_id = p.id JOIN orders o ON o.id = oi.order_id WHERE o.status = 'delivered' GROUP BY p.category_id, p.name) SELECT category_id, name AS product, ROUND(revenue, 2) AS revenue, ROUND(100 * revenue / SUM(revenue) OVER (PARTITION BY category_id), 2) AS pct_of_category FROM pr;`,
    hints: ['First aggregate revenue per product.', 'Then divide by SUM(revenue) OVER (PARTITION BY category_id).'] });
  ex({ id: 'win-10', ds: 'saas', topic: 'windows', level: 3, title: 'Activity quartiles',
    prompt: 'For accounts with at least one event, return <code>account_id</code>, <code>events</code> (count) and <code>quartile</code>: NTILE(4) ordered by events descending, ties broken by account_id.',
    solution: 'WITH c AS (SELECT account_id, COUNT(*) AS events FROM events GROUP BY account_id) SELECT account_id, events, NTILE(4) OVER (ORDER BY events DESC, account_id) AS quartile FROM c;',
    hints: ['Count events per account first.', 'NTILE(4) OVER (ORDER BY …) splits rows into 4 buckets.'] });
  ex({ id: 'win-11', ds: 'shop', topic: 'windows', level: 3, title: 'First order per customer',
    prompt: 'Return <code>customer_id</code>, <code>order_id</code> and <code>order_date</code> of each customer\'s first order (if two on the same day, the lowest id).',
    solution: 'SELECT customer_id, id AS order_id, order_date FROM (SELECT customer_id, id, order_date, ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY order_date, id) AS rn FROM orders) t WHERE rn = 1;',
    hints: ['ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY order_date, id)', 'Keep rn = 1.'] });
  ex({ id: 'win-12', ds: 'retail', topic: 'windows', level: 2, title: 'Best day per store',
    prompt: 'Return <code>store_id</code>, <code>sale_date</code> and <code>revenue</code> of each store\'s highest-revenue day.',
    solution: 'SELECT store_id, sale_date, revenue FROM (SELECT store_id, sale_date, revenue, ROW_NUMBER() OVER (PARTITION BY store_id ORDER BY revenue DESC) AS rn FROM daily_sales) t WHERE rn = 1;',
    hints: ['Rank days within each store, keep the top one.'] });

  // ===== Business cases =====
  ex({ id: 'biz-1', ds: 'saas', topic: 'business', level: 2, title: 'Current MRR',
    prompt: 'What is the current Monthly Recurring Revenue — the sum of <code>monthly_price</code> over all active subscriptions? Return a single number.',
    solution: 'SELECT SUM(p.monthly_price) AS mrr FROM subscriptions s JOIN plans p ON p.id = s.plan_id WHERE s.end_date IS NULL;',
    hints: ['Active = end_date IS NULL.'] });
  ex({ id: 'biz-2', ds: 'saas', topic: 'business', level: 2, title: 'Churned accounts',
    prompt: 'How many accounts have <b>no</b> active subscription today? Return a single number.',
    solution: 'SELECT COUNT(*) AS churned FROM accounts a WHERE NOT EXISTS (SELECT 1 FROM subscriptions s WHERE s.account_id = a.id AND s.end_date IS NULL);',
    hints: ['NOT EXISTS an active subscription for the account.'] });
  ex({ id: 'biz-3', ds: 'saas', topic: 'business', level: 3, ordered: true, title: 'Signup cohorts',
    prompt: 'For accounts created in 2024, return <code>cohort_month</code> (first day of creation month), <code>signups</code> and <code>still_active</code> (accounts with an active subscription today). Chronological.',
    solution: "WITH active AS (SELECT DISTINCT account_id FROM subscriptions WHERE end_date IS NULL) SELECT DATE_TRUNC('month', a.created_at)::date AS cohort_month, COUNT(*) AS signups, COUNT(act.account_id) AS still_active FROM accounts a LEFT JOIN active act ON act.account_id = a.id WHERE a.created_at >= '2024-01-01' AND a.created_at < '2025-01-01' GROUP BY 1 ORDER BY 1;",
    hints: ['Make a set of currently active account ids.', 'LEFT JOIN it and COUNT the matches.'] });
  ex({ id: 'biz-4', ds: 'shop', topic: 'business', level: 3, title: 'Retained customers',
    prompt: 'How many customers placed at least one order (any status) in <b>both</b> 2023 and 2024? Return a single number.',
    solution: 'SELECT COUNT(*) AS retained FROM (SELECT customer_id FROM orders WHERE EXTRACT(YEAR FROM order_date) = 2023 INTERSECT SELECT customer_id FROM orders WHERE EXTRACT(YEAR FROM order_date) = 2024) t;',
    hints: ['INTERSECT the two sets of customer ids, then count.', 'Alternative: GROUP BY customer_id HAVING COUNT(DISTINCT year) = 2.'] });
  ex({ id: 'biz-5', ds: 'retail', topic: 'business', level: 3, title: 'Actual vs target',
    prompt: 'For each store with 2024 targets, return store <code>name</code>, <code>actual</code> (2024 revenue), <code>target</code> (sum of monthly targets) and <code>pct_of_target</code> (actual as % of target). Round to 2 decimals.',
    solution: "WITH a AS (SELECT store_id, SUM(revenue) AS actual FROM daily_sales WHERE sale_date >= '2024-01-01' AND sale_date < '2025-01-01' GROUP BY store_id), t AS (SELECT store_id, SUM(revenue_target) AS target FROM targets GROUP BY store_id) SELECT s.name, ROUND(a.actual, 2) AS actual, t.target, ROUND(100 * a.actual / t.target, 2) AS pct_of_target FROM stores s JOIN a ON a.store_id = s.id JOIN t ON t.store_id = s.id;",
    hints: ['Aggregate actuals and targets separately before joining — joining raw daily rows to monthly targets multiplies sums.'] });
  ex({ id: 'biz-6', ds: 'shop', topic: 'business', level: 3, title: 'Category growth 2023 → 2024',
    prompt: 'For each <code>category</code> (name), return <code>rev_2023</code>, <code>rev_2024</code> and <code>growth_pct</code> (% change), all from delivered orders and rounded to 2 decimals.',
    solution: `WITH r AS (SELECT c.name AS category, EXTRACT(YEAR FROM o.order_date) AS yr, SUM(${REV}) AS revenue FROM categories c JOIN products p ON p.category_id = c.id JOIN order_items oi ON oi.product_id = p.id JOIN orders o ON o.id = oi.order_id WHERE o.status = 'delivered' GROUP BY 1, 2) SELECT category, ROUND(SUM(CASE WHEN yr = 2023 THEN revenue END), 2) AS rev_2023, ROUND(SUM(CASE WHEN yr = 2024 THEN revenue END), 2) AS rev_2024, ROUND(100 * (SUM(CASE WHEN yr = 2024 THEN revenue END) - SUM(CASE WHEN yr = 2023 THEN revenue END)) / SUM(CASE WHEN yr = 2023 THEN revenue END), 2) AS growth_pct FROM r GROUP BY category;`,
    hints: ['Revenue per category and year first.', 'Pivot the years into columns with SUM(CASE WHEN yr = … THEN revenue END).'] });
  ex({ id: 'biz-7', ds: 'saas', topic: 'business', level: 3, title: 'Free-to-paid conversion',
    prompt: "Of the accounts whose <b>first</b> subscription was on the Free plan (plan_id 1), what percentage later had a paid subscription? Return one number rounded to 2 decimals.",
    solution: 'WITH firsts AS (SELECT DISTINCT ON (account_id) account_id, plan_id FROM subscriptions ORDER BY account_id, start_date), free AS (SELECT account_id FROM firsts WHERE plan_id = 1) SELECT ROUND(100.0 * COUNT(DISTINCT s.account_id) / (SELECT COUNT(*) FROM free), 2) AS conversion_pct FROM free f JOIN subscriptions s ON s.account_id = f.account_id AND s.plan_id <> 1;',
    hints: ["Find each account's first subscription (ROW_NUMBER or DISTINCT ON).", 'Among Free starters, count those with any subscription where plan_id <> 1.', 'Use 100.0 to avoid integer division.'] });
  ex({ id: 'biz-8', ds: 'shop', topic: 'business', level: 3, title: 'Pareto check',
    prompt: 'Split customers with delivered revenue into 5 equal buckets with NTILE(5) by revenue (highest first, ties by customer_id). What % of total delivered revenue comes from the top bucket? Round to 2 decimals.',
    solution: `WITH c AS (SELECT o.customer_id, SUM(${REV}) AS revenue FROM orders o JOIN order_items oi ON oi.order_id = o.id WHERE o.status = 'delivered' GROUP BY o.customer_id), b AS (SELECT revenue, NTILE(5) OVER (ORDER BY revenue DESC, customer_id) AS bucket FROM c) SELECT ROUND(100 * SUM(revenue) FILTER (WHERE bucket = 1) / SUM(revenue), 2) AS top20_share FROM b;`,
    hints: ['Revenue per customer → NTILE(5) → share of bucket 1.', 'SUM(x) FILTER (WHERE …) is a handy conditional sum.'] });
  ex({ id: 'biz-9', ds: 'saas', topic: 'business', level: 2, ordered: true, title: 'Monthly active accounts',
    prompt: 'For 2024, return <code>month</code> (first day) and <code>active_accounts</code>: number of distinct accounts with at least one event that month. Chronological.',
    solution: "SELECT DATE_TRUNC('month', event_date)::date AS month, COUNT(DISTINCT account_id) AS active_accounts FROM events WHERE event_date >= '2024-01-01' AND event_date < '2025-01-01' GROUP BY 1 ORDER BY 1;",
    hints: ['COUNT(DISTINCT account_id) per DATE_TRUNC month.'] });
  ex({ id: 'biz-10', ds: 'saas', topic: 'business', level: 2, ordered: true, title: 'Overdue balances',
    prompt: 'Return <code>company_name</code> and <code>overdue_amount</code> (sum of overdue invoices) for the 10 accounts with the highest overdue amount, highest first (ties by company_name).',
    solution: "SELECT a.company_name, SUM(i.amount) AS overdue_amount FROM invoices i JOIN accounts a ON a.id = i.account_id WHERE i.status = 'overdue' GROUP BY a.company_name ORDER BY overdue_amount DESC, a.company_name LIMIT 10;",
    hints: ['Filter overdue, group by company, sort, limit.'] });
  ex({ id: 'biz-11', ds: 'retail', topic: 'business', level: 3, title: 'Growing stores',
    prompt: 'Among stores opened before 2023-01-01, return store <code>name</code> and <code>growth_pct</code> (2024 vs 2023 revenue, rounded to 2 decimals) for stores that grew by more than 5%.',
    solution: "WITH y AS (SELECT store_id, SUM(revenue) FILTER (WHERE sale_date < '2024-01-01') AS r23, SUM(revenue) FILTER (WHERE sale_date >= '2024-01-01') AS r24 FROM daily_sales GROUP BY store_id) SELECT s.name, ROUND(100 * (r24 - r23) / r23, 2) AS growth_pct FROM y JOIN stores s ON s.id = y.store_id WHERE s.opened_date < '2023-01-01' AND r24 > r23 * 1.05;",
    hints: ['Get 2023 and 2024 revenue side by side per store.', 'growth = 100 × (r24 − r23) / r23'] });
  ex({ id: 'biz-12', ds: 'shop', topic: 'business', level: 3, title: 'AOV by channel & year',
    prompt: 'For delivered orders, return <code>channel</code>, <code>year</code> and <code>avg_order_value</code> (average revenue per order, rounded to 2 decimals).',
    solution: `WITH o AS (SELECT o.id, o.channel, EXTRACT(YEAR FROM o.order_date) AS year, SUM(${REV}) AS revenue FROM orders o JOIN order_items oi ON oi.order_id = o.id WHERE o.status = 'delivered' GROUP BY 1, 2, 3) SELECT channel, year, ROUND(AVG(revenue), 2) AS avg_order_value FROM o GROUP BY channel, year;`,
    hints: ['Average of order totals ≠ average of line items. Compute per-order revenue first.'] });

  E.forEach((e, i) => { e._i = i; });
  window.SQLREPS_TOPICS = TOPICS;
  window.SQLREPS_EXERCISES = E;
})();
