// src/config/bank.ts

// Danh sách ngân hàng Việt Nam
export const vietnamBanks = [
  { code: 'VCB', name: 'Vietcombank' },
  { code: 'BIDV', name: 'BIDV' },
  { code: 'CTG', name: 'VietinBank' },
  { code: 'VAB', name: 'Agribank' },
  { code: 'TPB', name: 'TPBank' },
  { code: 'MB', name: 'MBBank' },
  { code: 'STB', name: 'Sacombank' },
  { code: 'ACB', name: 'ACB' },
  { code: 'VIB', name: 'VIB' },
  { code: 'VPB', name: 'VPBank' },
  { code: 'TCB', name: 'Techcombank' },
  { code: 'OCB', name: 'OCB' },
  { code: 'HDB', name: 'HDBank' },
  { code: 'MSB', name: 'MSB' },
  { code: 'NAB', name: 'NamABank' },
  { code: 'ABB', name: 'ABBank' },
  { code: 'EIB', name: 'Eximbank' },
  { code: 'SGB', name: 'SaigonBank' },
  { code: 'PGB', name: 'PGBank' },
  { code: 'BAB', name: 'BacABank' },
  { code: 'BVB', name: 'BaoVietBank' },
  { code: 'KLB', name: 'KienLongBank' },
  { code: 'LVP', name: 'LienVietPostBank' },
  { code: 'NVB', name: 'NaviBank' },
  { code: 'SBB', name: 'SeABank' },
  { code: 'SCB', name: 'SCB' },
  { code: 'SHB', name: 'SHB' },
  { code: 'SSB', name: 'SSB' },
  { code: 'TGB', name: 'TienPhongBank' },
  { code: 'VNCB', name: 'VietCapitalBank' },
  { code: 'VNM', name: 'VietNamBank' },
];

export interface BankConfig {
  bankCode: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
}

export const defaultBankConfig: BankConfig = {
  bankCode: 'VCB',
  bankName: 'Vietcombank',
  accountNumber: '1234567890',
  accountName: 'MEE BEAUTY SPA',
};

export const getBankConfig = (): BankConfig => {
  try {
    const saved = localStorage.getItem('mee_bank_config');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Validate có đủ fields
      if (parsed.bankCode && parsed.bankName && parsed.accountNumber && parsed.accountName) {
        return parsed;
      }
    }
  } catch (e) {
    // ignore
  }
  // Nếu chưa có hoặc lỗi, lưu default vào localStorage
  localStorage.setItem('mee_bank_config', JSON.stringify(defaultBankConfig));
  return defaultBankConfig;
};

export const saveBankConfig = (config: BankConfig): void => {
  localStorage.setItem('mee_bank_config', JSON.stringify(config));
};