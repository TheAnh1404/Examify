import fs from 'fs';
import path from 'path';
import http from 'http';

// Paths to configuration files
const DB_PATH = path.resolve('backend/src/config/db.js');

// Helper to check if a port is listening
const checkServer = (port) => {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:${port}/`, { timeout: 1000 }, (res) => {
      resolve(true);
    });
    req.on('error', () => {
      resolve(false);
    });
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
  });
};

// Colors for terminal formatting
const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  dim: '\x1b[2m'
};

const printBanner = () => {
  console.log(`\n${colors.bold}${colors.blue}===========================================${colors.reset}`);
  console.log(`${colors.bold}${colors.blue}      EXAMIFY DEVELOPER CLI UTILITY        ${colors.reset}`);
  console.log(`${colors.bold}${colors.blue}===========================================${colors.reset}\n`);
};

const printHelp = () => {
  printBanner();
  console.log(`${colors.bold}Usage:${colors.reset} npm run cli <command> [args]  OR  node cli.js <command> [args]\n`);
  console.log(`${colors.bold}Available Commands:${colors.reset}`);
  
  console.log(`  ${colors.green}status${colors.reset}                                Check server health & active ports`);
  console.log(`  ${colors.green}users${colors.reset}                                 List all seeded mock users`);
  console.log(`  ${colors.green}exams${colors.reset}                                 List all configured exams`);
  console.log(`  ${colors.green}submissions${colors.reset}                           List all exam attempts & scores`);
  console.log(`  ${colors.green}add-user <name> <email> <pass> <role>${colors.reset}   Add & persist a new user account`);
  console.log(`                                        (roles: admin, teacher, student)`);
  console.log(`  ${colors.green}help${colors.reset}                                  Show this instruction manual\n`);
};

// Check Server Status
const handleStatus = async () => {
  printBanner();
  console.log(`${colors.bold}Checking application services...${colors.reset}\n`);
  
  const backendLive = await checkServer(5000);
  const frontendLive = await checkServer(5173);
  
  console.log(`  Backend REST API (Port 5000):  ${backendLive ? `${colors.green}${colors.bold}RUNNING (Online)${colors.reset}` : `${colors.red}STOPPED (Offline)${colors.reset}`}`);
  console.log(`  Frontend Vite App (Port 5173):  ${frontendLive ? `${colors.green}${colors.bold}RUNNING (Online)${colors.reset}` : `${colors.red}STOPPED (Offline)${colors.reset}`}\n`);
  
  console.log(`${colors.bold}Demo Access Credentials:${colors.reset}`);
  console.log(`  - Admin:   ${colors.cyan}admin@examify.com${colors.reset}  /  ${colors.dim}admin123${colors.reset}`);
  console.log(`  - Teacher: ${colors.cyan}teacher@examify.com${colors.reset} /  ${colors.dim}teacher123${colors.reset}`);
  console.log(`  - Student: ${colors.cyan}student@examify.com${colors.reset} /  ${colors.dim}student123${colors.reset}\n`);
};

// Dynamic imports of the DB to print contents
const loadDb = async () => {
  if (!fs.existsSync(DB_PATH)) {
    console.error(`${colors.red}Error: DB config file not found at ${DB_PATH}${colors.reset}`);
    process.exit(1);
  }
  
  try {
    const module = await import(`./backend/src/config/db.js`);
    return module.db;
  } catch (error) {
    console.error(`${colors.red}Failed to load DB config: ${error.message}${colors.reset}`);
    process.exit(1);
  }
};

const handleUsers = async () => {
  const db = await loadDb();
  printBanner();
  console.log(`${colors.bold}Registered Mock Users (${db.users.length}):${colors.reset}\n`);
  
  // Format table header
  console.log(`  ${colors.bold}${'ID'.padEnd(16)} | ${'ROLE'.padEnd(8)} | ${'NAME'.padEnd(22)} | ${'EMAIL'}${colors.reset}`);
  console.log(`  ${'-'.repeat(16)}-+-${'-'.repeat(8)}-+-${'-'.repeat(22)}-+-${'-'.repeat(30)}`);
  
  db.users.forEach(u => {
    const roleColor = u.role === 'admin' ? colors.magenta : u.role === 'teacher' ? colors.blue : colors.green;
    console.log(`  ${u.id.padEnd(16)} | ${roleColor}${u.role.toUpperCase().padEnd(8)}${colors.reset} | ${u.name.padEnd(22)} | ${u.email}`);
  });
  console.log('\n');
};

const handleExams = async () => {
  const db = await loadDb();
  printBanner();
  console.log(`${colors.bold}Available Exams (${db.exams.length}):${colors.reset}\n`);
  
  console.log(`  ${colors.bold}${'ID'.padEnd(8)} | ${'DURATION'.padEnd(10)} | ${'QUESTIONS'.padEnd(10)} | ${'TITLE'}${colors.reset}`);
  console.log(`  ${'-'.repeat(8)}-+-${'-'.repeat(10)}-+-${'-'.repeat(10)}-+-${'-'.repeat(40)}`);
  
  db.exams.forEach(e => {
    console.log(`  ${e.id.padEnd(8)} | ${(e.duration + ' mins').padEnd(10)} | ${(e.questions.length + ' Qs').padEnd(10)} | ${e.title}`);
  });
  console.log('\n');
};

const handleSubmissions = async () => {
  const db = await loadDb();
  printBanner();
  console.log(`${colors.bold}Student Exam Submissions (${db.submissions.length}):${colors.reset}\n`);
  
  console.log(`  ${colors.bold}${'ID'.padEnd(8)} | ${'EXAM ID'.padEnd(8)} | ${'STUDENT ID'.padEnd(14)} | ${'SCORE'.padEnd(6)} | ${'STATUS'}${colors.reset}`);
  console.log(`  ${'-'.repeat(8)}-+-${'-'.repeat(8)}-+-${'-'.repeat(14)}-+-${'-'.repeat(6)}-+-${'-'.repeat(10)}`);
  
  db.submissions.forEach(s => {
    const statusColor = s.status === 'pass' ? colors.green : colors.red;
    console.log(`  ${s.id.padEnd(8)} | ${s.examId.padEnd(8)} | ${s.studentId.padEnd(14)} | ${(s.score + ' pts').padEnd(6)} | ${statusColor}${s.status.toUpperCase()}${colors.reset}`);
  });
  console.log('\n');
};

const handleAddUser = (args) => {
  if (args.length < 4) {
    console.error(`${colors.red}Error: Missing arguments for add-user.${colors.reset}`);
    console.log(`Usage: node cli.js add-user <name> <email> <password> <role>`);
    process.exit(1);
  }
  
  const [name, email, password, role] = args;
  const validRoles = ['admin', 'teacher', 'student'];
  
  if (!validRoles.includes(role.toLowerCase())) {
    console.error(`${colors.red}Error: Invalid role "${role}". Must be one of: admin, teacher, student.${colors.reset}`);
    process.exit(1);
  }
  
  printBanner();
  console.log(`${colors.bold}Adding new user account to database file...${colors.reset}`);
  
  if (!fs.existsSync(DB_PATH)) {
    console.error(`${colors.red}Error: DB config file not found at ${DB_PATH}${colors.reset}`);
    process.exit(1);
  }
  
  try {
    const dbContent = fs.readFileSync(DB_PATH, 'utf8');
    const userInsertIndex = dbContent.indexOf('users: [') + 8;
    
    if (userInsertIndex < 8) {
      console.error(`${colors.red}Error: Could not locate users array in database configuration file.${colors.reset}`);
      process.exit(1);
    }
    
    const id = `usr-${role.toLowerCase()}-${Date.now().toString().slice(-6)}`;
    const userString = `\n    {
      id: "${id}",
      name: "${name}",
      email: "${email}",
      password: hashPassword("${password}"),
      role: "${role.toLowerCase()}",
      createdAt: new Date("${new Date().toISOString()}")
    },`;
    
    const updatedDbContent = dbContent.slice(0, userInsertIndex) + userString + dbContent.slice(userInsertIndex);
    fs.writeFileSync(DB_PATH, updatedDbContent, 'utf8');
    
    console.log(`\n  ${colors.green}${colors.bold}✔ User added successfully!${colors.reset}`);
    console.log(`  - ID:       ${colors.cyan}${id}${colors.reset}`);
    console.log(`  - Name:     ${name}`);
    console.log(`  - Email:    ${email}`);
    console.log(`  - Role:     ${role.toUpperCase()}`);
    console.log(`  - Password: ${password}`);
    console.log(`\n${colors.dim}Note: Nodemon will automatically reload the server with the new account.${colors.reset}\n`);
    
  } catch (error) {
    console.error(`${colors.red}Failed to write user to database file: ${error.message}${colors.reset}`);
    process.exit(1);
  }
};

// Main Router
const main = async () => {
  const [, , command, ...args] = process.argv;
  
  if (!command) {
    printHelp();
    process.exit(0);
  }
  
  switch (command.toLowerCase()) {
    case 'help':
    case '--help':
    case '-h':
      printHelp();
      break;
    case 'status':
      await handleStatus();
      break;
    case 'users':
      await handleUsers();
      break;
    case 'exams':
      await handleExams();
      break;
    case 'submissions':
      await handleSubmissions();
      break;
    case 'add-user':
      handleAddUser(args);
      break;
    default:
      console.error(`${colors.red}Unknown command: "${command}"${colors.reset}`);
      printHelp();
      process.exit(1);
  }
};

main();
