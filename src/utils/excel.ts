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
        
        // Add date format options
        const options = {
          raw: false,
          dateNF: 'yyyy-mm-dd',
          defval: ''
        };
        
        const jsonData = XLSX.utils.sheet_to_json(worksheet, options);

        const entries: Entry[] = jsonData.map((row: any, index: number) => {
          // Handle date format
          let dateValue = row.Date || row.date || '';
          if (dateValue instanceof Date) {
            dateValue = dateValue.toISOString().split('T')[0];
          } else if (typeof dateValue === 'number') {
            // Convert Excel date number to YYYY-MM-DD
            const date = new Date((dateValue - 25569) * 86400 * 1000);
            dateValue = date.toISOString().split('T')[0];
          }

          // Calculate payable and P&L
          const earnings = parseFloat(row.Earnings || row.earnings || 0);
          const cashCollection = parseFloat(row['Cash Collection'] || row.cashCollection || 0);
          const offlineEarnings = parseFloat(row['Offline Earnings'] || row.offlineEarnings || 0);
          const offlineCash = parseFloat(row['Offline Cash'] || row.offlineCash || 0);
          const toll = parseFloat(row.Toll || row.toll || 0);
          const cng = parseFloat(row.CNG || row.cng || 0);
          const petrol = parseFloat(row.Petrol || row.petrol || 0);
          const otherExpenses = parseFloat(row['Other Expenses'] || row.otherExpenses || 0);
          const roomRent = parseFloat(row['Room Rent'] || row.roomRent || 0);
          const openingBalance = parseFloat(row['Opening Balance'] || row.openingBalance || 0);
          
          // Calculate total earnings
          const totalEarnings = earnings + offlineEarnings;
          
          // Calculate total expenses
          const totalExpenses = toll + cng + petrol + otherExpenses + roomRent;
          
          // Calculate payable (assuming 80% of earnings goes to driver)
          const payable = totalEarnings * 0.8 - totalExpenses;
          
          // Calculate P&L
          const pl = totalEarnings - totalExpenses - payable;

          return {
            id: `imported_${Date.now()}_${index}`,
            date: dateValue,
            driver: row.Driver || row.driver || '',
            vehicle: row.Vehicle || row.vehicle || '',
            earnings: totalEarnings,
            cashCollection: cashCollection,
            offlineEarnings: offlineEarnings,
            offlineCash: offlineCash,
            trips: parseInt(row.Trips || row.trips || 0),
            toll: toll,
            cng: cng,
            petrol: petrol,
            otherExpenses: otherExpenses,
            loginHours: parseFloat(row['Login Hrs'] || row.loginHours || 0),
            openingBalance: openingBalance,
            roomRent: roomRent,
            payPercent: 80, // Default pay percentage
            salary: parseFloat(row.Salary || row.salary || 0),
            payable: payable,
            commission: totalEarnings * 0.2, // 20% commission
            pl: pl
          };
        });

        resolve(entries);
      } catch (error) {
        reject(error);
      }
    };
    reader.readAsBinaryString(file);
  });
};