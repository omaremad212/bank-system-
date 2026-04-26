import axios from 'axios';

const API_BASE = '/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const login = {
  customer: async (nationalId: string, password: string) => {
    const response = await axios.post(`${API_BASE}/login/customer`, {
      nationalId,
      password,
    }, {
      headers: { 'Content-Type': 'application/json' }
    });
    return response.data;
  },
  
  employee: async (employeeId: string, password: string) => {
    const response = await axios.post(`${API_BASE}/login/employee`, {
      employeeId: parseInt(employeeId),
      password,
    }, {
      headers: { 'Content-Type': 'application/json' }
    });
    return response.data;
  },
};

export const customer = {
  getProfile: async () => {
    const response = await axios.get(`${API_BASE}/customer/data?action=profile`, { headers: getAuthHeaders() });
    return response.data;
  },
  
  getAccounts: async () => {
    const response = await axios.get(`${API_BASE}/customer/data?action=accounts`, { headers: getAuthHeaders() });
    return response.data;
  },
  
  getTransactions: async (accountId: number) => {
    const response = await axios.get(`${API_BASE}/customer/data?action=transactions&accountId=${accountId}`, { headers: getAuthHeaders() });
    return response.data;
  },
  
  deposit: async (accountId: number, amount: number) => {
    const response = await axios.post(`${API_BASE}/customer/data?action=deposit`, {
      accountId,
      amount,
    }, { headers: getAuthHeaders() });
    return response.data;
  },
  
  withdraw: async (accountId: number, amount: number) => {
    const response = await axios.post(`${API_BASE}/customer/data?action=withdraw`, {
      accountId,
      amount,
    }, { headers: getAuthHeaders() });
    return response.data;
  },
  
  transfer: async (fromAccountId: number, toAccountId: number, amount: number) => {
    const response = await axios.post(`${API_BASE}/customer/data?action=transfer`, {
      fromAccountId,
      toAccountId,
      amount,
    }, { headers: getAuthHeaders() });
    return response.data;
  },
  
  getLoans: async () => {
    const response = await axios.get(`${API_BASE}/customer/data?action=loans`, { headers: getAuthHeaders() });
    return response.data;
  },
  
  createLoan: async (approvedAmt: number) => {
    const response = await axios.post(`${API_BASE}/customer/data?action=loans`, {
      amount: approvedAmt,
    }, { headers: getAuthHeaders() });
    return response.data;
  },
};

export const admin = {
  getCustomers: async () => {
    const response = await axios.get(`${API_BASE}/users?action=customers`, { headers: getAuthHeaders() });
    return response.data;
  },
  
  createCustomer: async (data: any) => {
    const response = await axios.post(`${API_BASE}/users?action=customers`, data, { headers: getAuthHeaders() });
    return response.data;
  },
  
  updateCustomer: async (id: number, data: any) => {
    const response = await axios.put(`${API_BASE}/users?action=customers&id=${id}`, data, { headers: getAuthHeaders() });
    return response.data;
  },
  
  deleteCustomer: async (id: number) => {
    const response = await axios.delete(`${API_BASE}/users?action=customers&id=${id}`, { headers: getAuthHeaders() });
    return response.data;
  },
  
  getAccounts: async () => {
    const response = await axios.get(`${API_BASE}/users?action=accounts`, { headers: getAuthHeaders() });
    return response.data;
  },
  
  createAccount: async (data: any) => {
    const response = await axios.post(`${API_BASE}/users?action=accounts`, data, { headers: getAuthHeaders() });
    return response.data;
  },
  
  deleteAccount: async (id: number) => {
    const response = await axios.delete(`${API_BASE}/users?action=accounts&id=${id}`, { headers: getAuthHeaders() });
    return response.data;
  },
  
  getEmployees: async () => {
    const response = await axios.get(`${API_BASE}/users?action=employees`, { headers: getAuthHeaders() });
    return response.data;
  },
  
  createEmployee: async (data: any) => {
    const response = await axios.post(`${API_BASE}/users?action=employees`, data, { headers: getAuthHeaders() });
    return response.data;
  },
  
  updateEmployee: async (id: number, data: any) => {
    const response = await axios.put(`${API_BASE}/users?action=employees&id=${id}`, data, { headers: getAuthHeaders() });
    return response.data;
  },
  
  deleteEmployee: async (id: number) => {
    const response = await axios.delete(`${API_BASE}/users?action=employees&id=${id}`, { headers: getAuthHeaders() });
    return response.data;
  },
  
  getBranches: async () => {
    const response = await axios.get(`${API_BASE}/admin/data?action=branches`, { headers: getAuthHeaders() });
    return response.data;
  },
  
  createBranch: async (data: any) => {
    const response = await axios.post(`${API_BASE}/admin/data?action=branches`, data, { headers: getAuthHeaders() });
    return response.data;
  },
  
  updateBranch: async (id: number, data: any) => {
    const response = await axios.put(`${API_BASE}/admin/data?action=branches&id=${id}`, data, { headers: getAuthHeaders() });
    return response.data;
  },
  
  deleteBranch: async (id: number) => {
    const response = await axios.delete(`${API_BASE}/admin/data?action=branches&id=${id}`, { headers: getAuthHeaders() });
    return response.data;
  },
  
  getDepartments: async () => {
    const response = await axios.get(`${API_BASE}/admin/data?action=departments`, { headers: getAuthHeaders() });
    return response.data;
  },
  
  createDepartment: async (data: any) => {
    const response = await axios.post(`${API_BASE}/admin/data?action=departments`, data, { headers: getAuthHeaders() });
    return response.data;
  },
  
  getATMs: async () => {
    const response = await axios.get(`${API_BASE}/admin/data?action=atms`, { headers: getAuthHeaders() });
    return response.data;
  },
  
  createATM: async (data: any) => {
    const response = await axios.post(`${API_BASE}/admin/data?action=atms`, data, { headers: getAuthHeaders() });
    return response.data;
  },
  
  getTransactions: async () => {
    const response = await axios.get(`${API_BASE}/admin/data?action=transactions`, { headers: getAuthHeaders() });
    return response.data;
  },
  
  createTransaction: async (data: any) => {
    const response = await axios.post(`${API_BASE}/admin/data?action=transactions`, data, { headers: getAuthHeaders() });
    return response.data;
  },
  
  getLoans: async () => {
    const response = await axios.get(`${API_BASE}/admin/data?action=loans`, { headers: getAuthHeaders() });
    return response.data;
  },
  
  updateLoan: async (id: number, data: any) => {
    const response = await axios.put(`${API_BASE}/admin/data?action=loans&id=${id}`, data, { headers: getAuthHeaders() });
    return response.data;
  },
  
  createLoan: async (data: any) => {
    const response = await axios.post(`${API_BASE}/admin/data?action=loans`, data, { headers: getAuthHeaders() });
    return response.data;
  },
};

export default { login, customer, admin };