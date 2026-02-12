import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from '../utils/axios';
import TaskList from '../components/TaskList';
import TaskForm from '../components/TaskForm';
import type { Task, TaskFormData } from '../types/task';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/tasks');
      setTasks(response.data.tasks);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (taskData: TaskFormData) => {
    try {
      const response = await axios.post('/tasks', taskData);
      setTasks([response.data.task, ...tasks]);
      setSuccess('Task created successfully!');
      setShowForm(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create task');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return;
    }

    try {
      await axios.delete(`/tasks/${taskId}`);
      setTasks(tasks.filter(task => task._id !== taskId));
      setSuccess('Task deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete task');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="page-container" style={{ minHeight: '100vh', padding: '20px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div className="card" style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '24px' 
        }}>
          <div>
            <h1 style={{ marginBottom: '8px', fontSize: '32px' }}>Dashboard</h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              Welcome, <strong>{user?.name}</strong> ({user?.role})
            </p>
          </div>
          <button onClick={handleLogout} style={{ 
            backgroundColor: 'var(--error)',
            padding: '10px 20px'
          }}>
            Logout
          </button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <div style={{ marginBottom: '24px' }}>
          <button
            onClick={() => setShowForm(!showForm)}
            style={{ 
              backgroundColor: showForm ? 'var(--text-secondary)' : 'var(--accent)',
              padding: '12px 24px'
            }}
          >
            {showForm ? '✕ Cancel' : '+ Create New Task'}
          </button>
        </div>

        {showForm && (
          <div style={{ marginBottom: '24px' }}>
            <TaskForm onSubmit={handleCreateTask} onCancel={() => setShowForm(false)} />
          </div>
        )}

        <TaskList tasks={tasks} onDelete={handleDeleteTask} loading={loading} />
      </div>
    </div>
  );
};

export default Dashboard;
