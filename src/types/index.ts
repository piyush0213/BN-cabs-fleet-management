export interface User {
  id: string;
  username: string;
  pin: string;
  role: 'admin' | 'driver';
  name: string;
}

export interface Driver {
  id: string;
  name: string;
  fatherName: string;
  dob: string;
  mobile: string;
  mobile2: string;
  email: string;
  dlNumber: string;
  dlStatus: string;
  aadharNumber: string;
  aadharStatus: string;
  panNumber: string;
  passportNumber: string;
  passportStatus: string;
  permanentAddress: string;
  presentAddress: string;
  photoStatus: string;
  reference1Name: string;
  reference1Relationship: string;
  reference1Mobile: string;
  reference2Name: string;
  reference2Relationship: string;
  reference2Mobile: string;
  pin?: string;
  roomRent: boolean;
}

export interface Vehicle {
  id: string;
  number: string;
  type: string;
  assignedDriver?: string;
}

export interface Entry {
  id: string;
  date: string;
  driver: string;
  vehicle: string;
  earnings: number;
  cashCollection: number;
  offlineEarnings: number;
  offlineCash: number;
  trips: number;
  toll: number;
  cng: number;
  petrol: number;
  otherExpenses: number;
  loginHours: number;
  openingBalance: number;
  roomRent: number;
  payPercent: number;
  salary: number;
  payable: number;
  commission: number;
  pl: number;
}

export interface WeeklySummary {
  weekStart: string;
  weekEnd: string;
  vehicle: string;
  earnings: number;
  cash: number;
  uberCommission: number;
  toll: number;
  trips: number;
  rent: number;
  days: number;
  insurance: number;
  tds: number;
  payable: number;
}