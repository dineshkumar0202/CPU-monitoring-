const os = require('os');

let oldCpuTimes = getCpuTimes();
let currentCpuUsage = 0;

function getCpuTimes() {
  const cpus = os.cpus();
  if (!cpus || cpus.length === 0) {
    return { idle: 0, total: 0 };
  }

  let user = 0;
  let nice = 0;
  let sys = 0;
  let idle = 0;
  let irq = 0;

  for (const cpu of cpus) {
    user += cpu.times.user;
    nice += cpu.times.nice;
    sys += cpu.times.sys;
    idle += cpu.times.idle;
    irq += cpu.times.irq;
  }

  const total = user + nice + sys + idle + irq;
  return { idle, total };
}

function calculateCpuUsage() {
  const newCpuTimes = getCpuTimes();
  const idleDiff = newCpuTimes.idle - oldCpuTimes.idle;
  const totalDiff = newCpuTimes.total - oldCpuTimes.total;
  oldCpuTimes = newCpuTimes;

  if (totalDiff === 0) return 0;
  return (1 - idleDiff / totalDiff) * 100;
}

function startCpuMonitor() {
  const THRESHOLD = parseInt(process.env.CPU_THRESHOLD, 10) || 70;
  const INTERVAL = 5000;
  const SPIKE_LIMIT = 3;
  let consecutiveSpikes = 0;

  oldCpuTimes = getCpuTimes();

  setInterval(() => {
    try {
      currentCpuUsage = calculateCpuUsage();

      if (currentCpuUsage >= THRESHOLD) {
        consecutiveSpikes++;

        if (consecutiveSpikes >= SPIKE_LIMIT) {
          console.log('Server restarting...');
          process.exit(1);
        }
      } else {
        consecutiveSpikes = 0;
      }
    } catch (err) {
      console.error(`CPU monitor error: ${err.message}`);
    }
  }, INTERVAL);
}

function getCurrentCpuUsage() {
  return currentCpuUsage;
}

module.exports = { startCpuMonitor, getCurrentCpuUsage };
