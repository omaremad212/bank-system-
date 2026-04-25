import axios from 'axios';

const API_URL = '/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const api = {
  login: {
    customer: async (nationalId: string, password: string) => {
      try {
        const response = await axios.post(`${API_URL}/login/customer`, {
          nationalId,
          password,
        });
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return { success: true, user: response.data.user };
      } catch (error: any) {
        return { 
          success: false, 
          error: error.response?.data?.error || 'Login failed' 
        };
      }
    },
    employee: async (employeeId: string, password: string) => {
      try {
        const response = await axios.post(`${API_URL}/login/employee`, {
          employeeId: parseInt(employeeId),
          password,
        });
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return { success: true, user: response.data.user };
      } catch (error: any) {
        return { 
          success: false, 
          error: error.response?.data?.error || 'Login failed' 
        };
      }
    },
  },
  
  customer: {
    getProfile: async () => {
      const response = await axios.get(`${API_URL}/customer/profile`, {
        headers: getAuthHeaders(),
      });
      return response.data;
    },
    getAccounts: async () => {
      const response = await axios.get(`${API_URL}/customer/accounts`, {
        headers: getAuthHeaders(),
      });
      return response.data;
    },
    getTransactions: async (accountId: number) => {
      const response = await axios.get(
        `${API_URL}/customer/accounts/${accountId}/transactions`,
        { headers: getAuthHeaders() }
      );
      return response.data;
    },
    deposit: async (accountId: number, amount: number) => {
      const response = await axios.post(
        `${API_URL}/customer/deposit`,
        { accountId, amount },
        { headers: getAuthHeaders() }
      );
      return response.data;
    },
    withdraw: async (accountId: number, amount: number) => {
      const response = await axios.post(
        `${API_URL}/customer/withdraw`,
        { accountId, amount },
        { headers: getAuthHeaders() }
      );
      return response.data;
    },
    transfer: async (fromAccountId: number, toAccountId: number, amount: number) => {
      const response = await axios.post(
        `${API_URL}/customer/transfer`,
        { fromAccountId, toAccountId, amount },
        { headers: getAuthHeaders() }
      );
      return response.data;
    },
    getLoans: async () => {
      const response = await axios.get(`${API_URL}/customer/loans`, {
        headers: getAuthHeaders(),
      });
      return response.data;
    },
    createLoan: async (amount: number) => {
      const response = await axios.post(
        `${API_URL}/customer/loans`,
        { amount },
        { headers: getAuthHeaders() }
      );
      return response.data;
    },
  },
  
  admin: {
    getCustomers: async () => {
      const response = await axios.get(`${API_URL}/admin/customers`, {
        headers: getAuthHeaders(),
      });
      return response.data;
    },
    getAccounts: async () => {
      const response = await axios.get(`${API_URL}/admin/accounts`, {
        headers: getAuthHeaders(),
      });
      return response.data;
    },
    getEmployees: async () => {
      const response = await axios.get(`${API_URL}/admin/employees`, {
        headers: getAuthHeaders(),
      });
      return response.data;
    },
    getBranches: async () => {
      const response = await axios.get(`${API_URL}/admin/branches`, {
        headers: getAuthHeaders(),
      });
      return response.data;
    },
    getDepartments: async () => {
      const response = await axios.get(`${API_URL}/admin/departments`, {
        headers: getAuthHeaders(),
      });
      return response.data;
    },
    getATMs: async () => {
      const response = await axios.get(`${API_URL}/admin/atms`, {
        headers: getAuthHeaders(),
      });
      return response.data;
    },
    getTransactions: async () => {
      const response = await axios.get(`${API_URL}/admin/transactions`, {
        headers: getAuthHeaders(),
      });
      return response.data;
    },
    getLoans: async () => {
      const response = await axios.get(`${API_URL}/admin/loans`, {
        headers: getAuthHeaders(),
      });
      return response.data;
    },
    createAccount: async (customerId: number, accountType: string, branchId: number) => {
      const response = await axios.post(
        `${API_URL}/admin/accounts`,
        { customerId, accountType, branchId },
        { headers: getAuthHeaders() }
      );
      return response.data;
    },
  },
};