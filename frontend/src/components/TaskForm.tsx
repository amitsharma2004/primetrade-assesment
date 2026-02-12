import React, { useState } from 'react';
import type { TaskFormData } from '../types/task';

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
    <div className="card">
      <h3 style={{ marginBottom: '20px', fontSize: '20px' }}>Create New Task</h3>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="Enter task title"
          />
        </div>
        
        <div className="form-group">
          <label>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter task description (optional)"
            style={{ minHeight: '100px', resize: 'vertical' }}
          />
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="form-group">
            <label>Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
            >
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as any)}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
          <button 
            type="submit" 
            disabled={loading}
            className={loading ? 'loading' : ''}
            style={{ flex: 1 }}
          >
            {loading ? 'Creating...' : 'Create Task'}
          </button>
          {onCancel && (
            <button 
              type="button" 
              onClick={onCancel}
              style={{ 
                flex: 1,
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-primary)'
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default TaskForm;
