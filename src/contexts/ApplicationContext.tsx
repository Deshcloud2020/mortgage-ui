import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface PersonalInfo {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  ssn?: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface Employment {
  status: 'employed' | 'self-employed' | 'retired' | 'unemployed';
  employer?: string;
  jobTitle?: string;
  yearsEmployed?: number;
  monthlyIncome: number;
  additionalIncome?: number;
}

export interface Assets {
  downPayment: number;
  savingsAccounts: number;
  checkingAccounts: number;
  investments: number;
  retirement: number;
}

export interface Debts {
  creditCards: number;
  carLoans: number;
  studentLoans: number;
  otherDebts: number;
}

export interface ApplicationData {
  personalInfo: PersonalInfo;
  employment: Employment;
  assets: Assets;
  debts: Debts;
  documents?: File[];
}

interface ApplicationContextType {
  applicationData: ApplicationData;
  updatePersonalInfo: (data: Partial<PersonalInfo>) => void;
  updateEmployment: (data: Partial<Employment>) => void;
  updateAssets: (data: Partial<Assets>) => void;
  updateDebts: (data: Partial<Debts>) => void;
  calculateDTI: () => number;
  calculateMaxLoanAmount: () => number;
  saveProgress: () => void;
  clearApplication: () => void;
}

const defaultApplicationData: ApplicationData = {
  personalInfo: {
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
  },
  employment: {
    status: 'employed',
    monthlyIncome: 0,
  },
  assets: {
    downPayment: 0,
    savingsAccounts: 0,
    checkingAccounts: 0,
    investments: 0,
    retirement: 0,
  },
  debts: {
    creditCards: 0,
    carLoans: 0,
    studentLoans: 0,
    otherDebts: 0,
  },
};

const ApplicationContext = createContext<ApplicationContextType | undefined>(undefined);

export const ApplicationProvider = ({ children }: { children: ReactNode }) => {
  const [applicationData, setApplicationData] = useState<ApplicationData>(() => {
    const saved = localStorage.getItem('mortgageApplication');
    return saved ? JSON.parse(saved) : defaultApplicationData;
  });

  useEffect(() => {
    const autoSave = setInterval(() => {
      localStorage.setItem('mortgageApplication', JSON.stringify(applicationData));
    }, 30000);
    return () => clearInterval(autoSave);
  }, [applicationData]);

  const updatePersonalInfo = (data: Partial<PersonalInfo>) => {
    setApplicationData(prev => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, ...data },
    }));
  };

  const updateEmployment = (data: Partial<Employment>) => {
    setApplicationData(prev => ({
      ...prev,
      employment: { ...prev.employment, ...data },
    }));
  };

  const updateAssets = (data: Partial<Assets>) => {
    setApplicationData(prev => ({
      ...prev,
      assets: { ...prev.assets, ...data },
    }));
  };

  const updateDebts = (data: Partial<Debts>) => {
    setApplicationData(prev => ({
      ...prev,
      debts: { ...prev.debts, ...data },
    }));
  };

  const calculateDTI = () => {
    const monthlyIncome = applicationData.employment.monthlyIncome + (applicationData.employment.additionalIncome || 0);
    const totalDebts = Object.values(applicationData.debts).reduce((sum, debt) => sum + debt, 0);
    return monthlyIncome > 0 ? (totalDebts / monthlyIncome) * 100 : 0;
  };

  const calculateMaxLoanAmount = () => {
    const monthlyIncome = applicationData.employment.monthlyIncome + (applicationData.employment.additionalIncome || 0);
    const dti = calculateDTI();
    const availableForMortgage = monthlyIncome * 0.28;
    const maxMonthlyPayment = availableForMortgage - Object.values(applicationData.debts).reduce((sum, debt) => sum + debt, 0);
    return Math.max(0, maxMonthlyPayment * 360);
  };

  const saveProgress = () => {
    localStorage.setItem('mortgageApplication', JSON.stringify(applicationData));
  };

  const clearApplication = () => {
    setApplicationData(defaultApplicationData);
    localStorage.removeItem('mortgageApplication');
  };

  return (
    <ApplicationContext.Provider
      value={{
        applicationData,
        updatePersonalInfo,
        updateEmployment,
        updateAssets,
        updateDebts,
        calculateDTI,
        calculateMaxLoanAmount,
        saveProgress,
        clearApplication,
      }}
    >
      {children}
    </ApplicationContext.Provider>
  );
};

export const useApplication = () => {
  const context = useContext(ApplicationContext);
  if (!context) {
    throw new Error('useApplication must be used within ApplicationProvider');
  }
  return context;
};
