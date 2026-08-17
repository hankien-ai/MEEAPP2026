import { demoCatalog, demoCustomers, demoExpenses, demoPackages, demoStaff } from '@/data/demo';

const pause = (ms = 220) => new Promise((resolve) => window.setTimeout(resolve, ms));

export const demoService = {
  async getCustomers() { await pause(); return demoCustomers; },
  async getCatalog() { await pause(120); return demoCatalog; },
  async getPackages() { await pause(160); return demoPackages; },
  async getStaff() { await pause(180); return demoStaff; },
  async getExpenses() { await pause(180); return demoExpenses; },
};