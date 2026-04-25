import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const api = {
  login: {
    customer: async (nationalId: string, password: string) => {
      const response = await axios.post(`${API_URL}/login/customer`, { nationalId, password });
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    },
    employee: async (employeeId: string, password: string) => {
      const response = await axios.post(`${API_URL}/login/employee`, { employeeId, password });
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    },
  },
  
  customer: {
    getProfile: async () => {
      const response = await axios.get(`${API_URL}/customer/profile`, { headers: getAuthHeaders() });
      return response.data;
    },
    getAccounts: async () => {
      const response = await axios.get(`${API_URL}/customer/accounts`, { headers: getAuthHeaders() });
      return response.data;
    },
    getTransactions: async (accountId: number) => {
      const response = await axios.get(`${API_URL}/customer/accounts/${accountId}/transactions`, { headers: getAuthHeaders() });
      return response.data;
    },
    deposit: async (accountId: number, amount: number, atmId?: number) => {
      const response = await axios.post(`${API_URL}/customer/deposit`, { accountId, amount, atmId }, { headers: getAuthHeaders() });
      return response.data;
    },
    withdraw: async (accountId: number, amount: number, atmId?: number) => {
      const response = await axios.post(`${API_URL}/customer/withdraw`, { accountId, amount, atmId }, { headers: getAuthHeaders() });
      return response.data;
    },
    transfer: async (fromAccountId: number, toAccountId: number, amount: number) => {
      const response = await axios.post(`${API_URL}/customer/transfer`, { fromAccountId, toAccountId, amount }, { headers: getAuthHeaders() });
      return response.data;
    },
    getLoans: async () => {
      const response = await axios.get(`${API_URL}/customer/loans`, { headers: getAuthHeaders() });
      return response.data;
    },
    createLoan: async (amount: number) => {
      const response = await axios.post(`${API_URL}/customer/loans`, { amount }, { headers: getAuthHeaders() });
      return response.data;
    },
  },
  
  admin: {
    getCustomers: async () => {
      const response = await axios.get(`${API_URL}/admin/customers`, { headers: getAuthHeaders() });
      return response.data;
    },
    createCustomer: async (data: any) => {
      const response = await axios.post(`${API_URL}/admin/customers`, data, { headers: getAuthHeaders() });
      return response.data;
    },
    updateCustomer: async (id: number, data: any) => {
      const response = await axios.put(`${API_URL}/admin/customers/${id}`, data, { headers: getAuthHeaders() });
      return response.data;
    },
    deleteCustomer: async (id: number) => {
      const response = await axios.delete(`${API_URL}/admin/customers/${id}`, { headers: getAuthHeaders() });
      return response.data;
    },
    getAccounts: async () => {
      const response = await axios.get(`${API_URL}/admin/accounts`, { headers: getAuthHeaders() });
      return response.data;
    },
    createAccount: async (data: any) => {
      const response = await axios.post(`${API_URL}/admin/accounts`, data, { headers: getAuthHeaders() });
      return response.data;
    },
    deleteAccount: async (id: number) => {
      const response = await axios.delete(`${API_URL}/admin/accounts/${id}`, { headers: getAuthHeaders() });
      return response.data;
    },
    getEmployees: async () => {
      const response = await axios.get(`${API_URL}/admin/employees`, { headers: getAuthHeaders() });
      return response.data;
    },
    createEmployee: async (data: any) => {
      const response = await axios.post(`${API_URL}/admin/employees`, data, { headers: getAuthHeaders() });
      return response.data;
    },
    updateEmployee: async (id: number, data: any) => {
      const response = await axios.put(`${API_URL}/admin/employees/${id}`, data, { headers: getAuthHeaders() });
      return response.data;
    },
    deleteEmployee: async (id: number) => {
      const response = await axios.delete(`${API_URL}/admin/employees/${id}`, { headers: getAuthHeaders() });
      return response.data;
    },
    getBranches: async () => {
      const response = await axios.get(`${API_URL}/admin/branches`, { headers: getAuthHeaders() });
      return response.data;
    },
    createBranch: async (data: any) => {
      const response = await axios.post(`${API_URL}/admin/branches`, data, { headers: getAuthHeaders() });
      return response.data;
    },
    updateBranch: async (id: number, data: any) => {
      const response = await axios.put(`${API_URL}/admin/branches/${id}`, data, { headers: getAuthHeaders() });
      return response.data;
    },
    deleteBranch: async (id: number) => {
      const response = await axios.delete(`${API_URL}/admin/branches/${id}`, { headers: getAuthHeaders() });
      return response.data;
    },
    getDepartments: async () => {
      const response = await axios.get(`${API_URL}/admin/departments`, { headers: getAuthHeaders() });
      return response.data;
    },
    createDepartment: async (data: any) => {
      const response = await axios.post(`${API_URL}/admin/departments`, data, { headers: getAuthHeaders() });
      return response.data;
    },
    updateDepartment: async (id: number, data: any) => {
      const response = await axios.put(`${API_URL}/admin/departments/${id}`, data, { headers: getAuthHeaders() });
      return response.data;
    },
    deleteDepartment: async (id: number) => {
      const response = await axios.delete(`${API_URL}/admin/departments/${id}`, { headers: getAuthHeaders() });
      return response.data;
    },
    getATMs: async () => {
      const response = await axios.get(`${API_URL}/admin/atms`, { headers: getAuthHeaders() });
      return response.data;
    },
    createATM: async (data: any) => {
      const response = await axios.post(`${API_URL}/admin/atms`, data, { headers: getAuthHeaders() });
      return response.data;
    },
    updateATM: async (id: number, data: any) => {
      const response = await axios.put(`${API_URL}/admin/atms/${id}`, data, { headers: getAuthHeaders() });
      return response.data;
    },
    deleteATM: async (id: number) => {
      const response = await axios.delete(`${API_URL}/admin/atms/${id}`, { headers: getAuthHeaders() });
      return response.data;
    },
    getTransactions: async () => {
      const response = await axios.get(`${API_URL}/admin/transactions`, { headers: getAuthHeaders() });
      return response.data;
    },
    getLoans: async () => {
      const response = await axios.get(`${API_URL}/admin/loans`, { headers: getAuthHeaders() });
      return response.data;
    },
    updateLoan: async (id: number, data: any) => {
      const response = await axios.put(`${API_URL}/admin/loans/${id}`, data, { headers: getAuthHeaders() });
      return response.data;
    },
  },
};

export { api };
export default api;