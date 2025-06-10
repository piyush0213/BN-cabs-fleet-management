import * as XLSX from 'xlsx';
import { Entry, WeeklySummary } from '../types';

export const exportToExcel = (data: Entry[], filename: string = 'database.xlsx') => {
  const worksheet = XLSX.utils.json_to_sheet(data.map(entry => ({
    Date: entry.date,
    Driver: entry.driver,
    Vehicle: entry.vehicle,
    Earnings: entry.earnings,
    'Cash Collection': entry.cashCollection,
    'Offline Earnings': entry.offlineEarnings,
    'Offline Cash': entry.offlineCash,
    Trips: entry.trips,
    Toll: entry.toll,
    'Login Hrs': entry.loginHours,
    Salary: entry.salary,
    CNG: entry.cng,
    Petrol: entry.petrol,
    'Other Expenses': entry.otherExpenses,
    'Opening Balance': entry.openingBalance,
    'Room Rent': entry.roomRent,
    Payable: entry.payable,
    'P&L': entry.pl
  })));

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Database');
  XLSX.writeFile(workbook, filename);
};

export const exportWeeklySummaryToExcel = (data: WeeklySummary[], filename: string = 'weekly_summary.xlsx') => {
  const worksheet = XLSX.utils.json_to_sheet(data.map(summary => ({
    'Week Start': summary.weekStart,
    'Week End': summary.weekEnd,
    Vehicle: summary.vehicle,
    Earnings: summary.earnings,
    Cash: summary.cash,
    'Uber Commission': summary.uberCommission,
    Toll: summary.toll,
    Trips: summary.trips,
    Rent: summary.rent,
    Days: summary.days,
    Insurance: summary.insurance,
    TDS: summary.tds,
    Payable: summary.payable
  })));

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Weekly Summary');
  XLSX.writeFile(workbook, filename);
};

export const importFromExcel = (file: File): Promise<Entry[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        const entries: Entry[] = jsonData.map((row: any, index: number) => ({
          id: `imported_${Date.now()}_${index}`,
          date: row.Date || row.date || '',
          driver: row.Driver || row.driver || '',
          vehicle: row.Vehicle || row.vehicle || '',
          earnings: parseFloat(row.Earnings || row.earnings || 0),
          cashCollection: parseFloat(row['Cash Collection'] || row.cashCollection || 0),
          offlineEarnings: parseFloat(row['Offline Earnings'] || row.offlineEarnings || 0),
          offlineCash: parseFloat(row['Offline Cash'] || row.offlineCash || 0),
          trips: parseInt(row.Trips || row.trips || 0),
          toll: parseFloat(row.Toll || row.toll || 0),
          cng: parseFloat(row.CNG || row.cng || 0),
          petrol: parseFloat(row.Petrol || row.petrol || 0),
          otherExpenses: parseFloat(row['Other Expenses'] || row.otherExpenses || 0),
          loginHours: parseFloat(row['Login Hrs'] || row.loginHours || 0),
          openingBalance: parseFloat(row['Opening Balance'] || row.openingBalance || 0),
          roomRent: parseFloat(row['Room Rent'] || row.roomRent || 0),
          payPercent: 0,
          salary: 0,
          payable: 0,
          commission: 0,
          pl: 0
        }));

        resolve(entries);
      } catch (error) {
        reject(error);
      }
    };
    reader.readAsBinaryString(file);
  });
};