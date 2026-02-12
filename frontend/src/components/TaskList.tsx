import React from 'react';
import type { Task } from '../types/task';

interface TaskListProps {
  tasks: Task[];
  onDelete: (taskId: string) => void;
  loading?: boolean;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, onDelete, loading }) => {
  if (loading) {
    return (
      <div className="card loading" style={{ textAlign: 'center', padding: '40px' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Loading tasks...</p>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: '16px' }}>
          No tasks found. Create your first task!
        </p>
      </div>
    );
  }

  return (
    <div>
      <h3 style={{ marginBottom: '16px', fontSize: '24px' }}>Your Tasks</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {tasks.map((task, index) => (
          <div
            key={task._id}
            className="card"
            style={{
              animation: `fadeIn 0.5s ease ${index * 0.1}s both`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'start',
              gap: '20px'
            }}
          >
            <div style={{ flex: 1 }}>
              <h4 style={{ margin: '0 0 12px 0', fontSize: '18px' }}>{task.title}</h4>
              {task.description && (
                <p style={{ 
                  margin: '0 0 16px 0', 
                  color: 'var(--text-secondary)',
                  lineHeight: '1.5'
                }}>
                  {task.description}
                </p>
              )}
              
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
                <span className={`badge status-${task.status}`}>
                  {task.status.replace('-', ' ')}
                </span>
                <span className={`badge priority-${task.priority}`}>
                  {task.priority} priority
                </span>
              </div>
              
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Created by <strong>{task.createdBy.name}</strong> • {new Date(task.createdAt).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </div>
            </div>
            
            <button
              onClick={() => onDelete(task._id)}
              style={{
                padding: '10px 20px',
                backgroundColor: 'var(--error)',
                flexShrink: 0
              }}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskList;
