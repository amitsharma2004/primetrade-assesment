import React, { useState } from 'react';
import { TaskFormData } from '../types/task';

interface TaskFormProps {
  onSubmit: (task: TaskFormData) => Promise<void>;
  onCancel?: () => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ onSubmit, onCancel }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'pending' | 'in-progress' | 'completed'>('pending');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    await onSubmit({ title, description, status, priority });
    
    setLoading(false);
    setTitle('');
    setDescription('');
    setStatus('pending');
    setPriority('medium');
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd' }}>
      <h3>Create New Task</h3>
      
      <div style={{ marginBottom: '10px' }}>
        <label>Title:</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          style={{ width: '100%', padding: '8px', marginTop: '5px' }}
        />
      </div>
      
      <div style={{ marginBottom: '10px' }}>
        <label>Description:</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{ width: '100%', padding: '8px', marginTop: '5px', minHeight: '80px' }}
        />
      </div>
      
      <div style={{ marginBottom: '10px' }}>
        <label>Status:</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as any)}
          style={{ width: '100%', padding: '8px', marginTop: '5px' }}
        >
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>
      
      <div style={{ marginBottom: '10px' }}>
        <label>Priority:</label>
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value as any)}
          style={{ width: '100%', padding: '8px', marginTop: '5px' }}
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>
      
      <div style={{ display: 'flex', gap: '10px' }}>
        <button type="submit" disabled={loading} style={{ padding: '8px 16px', cursor: 'pointer' }}>
          {loading ? 'Creating...' : 'Create Task'}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} style={{ padding: '8px 16px', cursor: 'pointer' }}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default TaskForm;
