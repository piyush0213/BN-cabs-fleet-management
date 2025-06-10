import { User, Driver, Vehicle, Entry } from '../types';

const STORAGE_KEYS = {
  USERS: 'bn_cabs_users',
  DRIVERS: 'bn_cabs_drivers',
  VEHICLES: 'bn_cabs_vehicles',
  ENTRIES: 'bn_cabs_entries',
  CURRENT_USER: 'bn_cabs_current_user'
};

// Initialize default data
const initializeDefaultData = () => {
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    const defaultUsers: User[] = [
      {
        id: '1',
        username: 'admin',
        pin: '1234',
        role: 'admin',
        name: 'Administrator'
      }
    ];
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(defaultUsers));
  }

  if (!localStorage.getItem(STORAGE_KEYS.DRIVERS)) {
    localStorage.setItem(STORAGE_KEYS.DRIVERS, JSON.stringify([]));
  }

  if (!localStorage.getItem(STORAGE_KEYS.VEHICLES)) {
    localStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify([]));
  }

  if (!localStorage.getItem(STORAGE_KEYS.ENTRIES)) {
    localStorage.setItem(STORAGE_KEYS.ENTRIES, JSON.stringify([]));
  }
};

// Users
export const getUsers = (): User[] => {
  initializeDefaultData();
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
};

export const saveUsers = (users: User[]) => {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
};

export const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  return userStr ? JSON.parse(userStr) : null;
};

export const setCurrentUser = (user: User | null) => {
  if (user) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }
};

// Drivers
export const getDrivers = (): Driver[] => {
  initializeDefaultData();
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.DRIVERS) || '[]');
};

export const saveDrivers = (drivers: Driver[]) => {
  localStorage.setItem(STORAGE_KEYS.DRIVERS, JSON.stringify(drivers));
};

// Vehicles
export const getVehicles = (): Vehicle[] => {
  initializeDefaultData();
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.VEHICLES) || '[]');
};

export const saveVehicles = (vehicles: Vehicle[]) => {
  localStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(vehicles));
};

// Entries
export const getEntries = (): Entry[] => {
  initializeDefaultData();
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.ENTRIES) || '[]');
};

export const saveEntries = (entries: Entry[]) => {
  localStorage.setItem(STORAGE_KEYS.ENTRIES, JSON.stringify(entries));
};