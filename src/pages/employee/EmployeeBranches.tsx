import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Branch } from '../../types';

const EmployeeBranches = () => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const data = await api.branches.getAll();
        setBranches(data);
      } catch (error) {
        console.error('Error fetching branches:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBranches();
  }, []);

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Branches</h1>
          <p>Manage bank branches</p>
        </div>
      </div>

      <div className="grid grid-3">
        {branches.map((branch) => (
          <div key={branch.BranchID} className="card">
            <h3 className="card-title mb-2">{branch.BranchName}</h3>
            <p className="text-muted text-sm mb-1">{branch.Location}</p>
            <p className="text-muted text-sm mb-1">{branch.Email}</p>
            <p className="text-sm">
              Established: {branch.EstablishedYear}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EmployeeBranches;