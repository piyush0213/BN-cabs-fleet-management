import { Entry, Driver } from '../types';

export const calculatePayPercent = (earnings: number, offlineEarnings: number, loginHours: number): number => {
  const totalEarnings = earnings + offlineEarnings;
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

  return Math.max(payPercent, 0);
};

export const calculateSalary = (earnings: number, offlineEarnings: number, payPercent: number): number => {
  const totalEarnings = earnings + offlineEarnings;
  return Math.round((totalEarnings * payPercent / 100) * 100) / 100;
};

export const calculatePayable = (
  earnings: number,
  offlineEarnings: number,
  cashCollection: number,
  salary: number,
  cng: number,
  petrol: number,
  otherExpenses: number,
  openingBalance: number,
  roomRent: number
): number => {
  const payable = cashCollection - salary - cng - petrol - otherExpenses + openingBalance - roomRent;
  return Math.round(payable * 100) / 100;
};

export const calculateCommission = (cashCollection: number, earnings: number): number => {
  return Math.round((cashCollection - earnings) * 100) / 100;
};

export const calculatePL = (
  earnings: number,
  offlineEarnings: number,
  salary: number,
  cng: number,
  petrol: number,
  otherExpenses: number
): number => {
  const totalEarnings = earnings + offlineEarnings;
  const pl = totalEarnings - salary - cng - petrol - otherExpenses - 1080;
  return Math.round(pl * 100) / 100;
};

export const getRoomRent = (driver: string, drivers: Driver[]): number => {
  const driverData = drivers.find(d => d.name === driver);
  return driverData?.roomRent ? 50 : 0;
};

export const calculateWeeklyRent = (trips: number): number => {
  if (trips >= 120) return 750;
  if (trips >= 90) return 850;
  if (trips >= 60) return 950;
  return 1050;
};

export const formatCurrency = (amount: number): string => {
  return `₹${amount.toFixed(2)}`;
};

export const roundToTwo = (num: number): number => {
  return Math.round(num * 100) / 100;
};