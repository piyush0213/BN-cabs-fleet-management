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

const calculatePayPercent = (totalEarnings: number, loginHours: number) => {
  let payPercent = 0;

  if (totalEarnings < 1800) {
    payPercent = 0;
  } else if (totalEarnings < 2500) {
    payPercent = 25;
  } else if (totalEarnings < 4000) {
    payPercent = 30;
  } else if (totalEarnings < 5000) {
    payPercent = 32;
  } else if (totalEarnings < 6000) {
    payPercent = 34;
  } else if (totalEarnings < 7000) {
    payPercent = 38;
  } else {
    payPercent = 38;
  }

  // Reduce pay% based on login hours
  if (loginHours < 9) {
    payPercent -= 10;
  } else if (loginHours < 11) {
    payPercent -= 5;
  }

  return payPercent;
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
        
        const options = {
          raw: true,
          dateNF: 'yyyy-mm-dd',
          defval: 0
        };
        
        const jsonData = XLSX.utils.sheet_to_json(worksheet, options);

        const entries: Entry[] = jsonData.map((row: any, index: number) => {
          // Handle date format
          let dateValue = row.Date || row.date || '';
          if (dateValue instanceof Date) {
            dateValue = dateValue.toISOString().split('T')[0];
          } else if (typeof dateValue === 'number') {
            const date = new Date((dateValue - 25569) * 86400 * 1000);
            dateValue = date.toISOString().split('T')[0];
          }

          // Parse all numeric values
          const earnings = Number(row.Earnings || row.earnings || 0);
          const cashCollection = Number(row['Cash Collection'] || row.cashCollection || 0);
          const offlineEarnings = Number(row['Offline Earnings'] || row.offlineEarnings || 0);
          const offlineCash = Number(row['Offline Cash'] || row.offlineCash || 0);
          const toll = Number(row.Toll || row.toll || 0);
          const cng = Number(row.CNG || row.cng || 0);
          const petrol = Number(row.Petrol || row.petrol || 0);
          const otherExpenses = Number(row['Other Expenses'] || row.otherExpenses || 0);
          const roomRent = Number(row['Room Rent'] || row.roomRent || 0);
          const openingBalance = Number(row['Opening Balance'] || row.openingBalance || 0);
          const loginHours = Number(row['Login Hrs'] || row.loginHours || 0);
          
          // Calculate total earnings
          const totalEarnings = earnings + offlineEarnings;
          
          // Calculate pay percent based on earnings and login hours
          const payPercent = calculatePayPercent(totalEarnings, loginHours);
          
          // Calculate salary based on pay percent
          const salary = (totalEarnings * payPercent) / 100;
          
          // Calculate payable: Cash Collection - Salary - CNG - Petrol - Other Expenses + Opening Balance + Room Rent
          const payable = cashCollection - salary - cng - petrol - otherExpenses + openingBalance + roomRent;
          
          // Calculate P&L: totalEarnings - Salary - CNG - Toll - Petrol - Other Expenses - 1080
          const pl = totalEarnings - salary - cng - toll - petrol - otherExpenses - 1080;

          return {
            id: `imported_${Date.now()}_${index}`,
            date: dateValue,
            driver: String(row.Driver || row.driver || ''),
            vehicle: String(row.Vehicle || row.vehicle || ''),
            earnings: totalEarnings,
            cashCollection: cashCollection,
            offlineEarnings: offlineEarnings,
            offlineCash: offlineCash,
            trips: Number(row.Trips || row.trips || 0),
            toll: toll,
            cng: cng,
            petrol: petrol,
            otherExpenses: otherExpenses,
            loginHours: loginHours,
            openingBalance: openingBalance,
            roomRent: roomRent,
            payPercent: payPercent,
            salary: salary,
            payable: payable,
            commission: totalEarnings * (100 - payPercent) / 100,
            pl: pl
          };
        });

        resolve(entries);
      } catch (error) {
        console.error('Import error details:', error);
        reject(error);
      }
    };
    reader.readAsBinaryString(file);
  });
};