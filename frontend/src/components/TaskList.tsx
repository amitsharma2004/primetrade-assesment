import React from 'react';
import { Task } from '../types/task';

interface TaskListProps {
  tasks: Task[];
  onDelete: (taskId: string) => void;
  loading?: boolean;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, onDelete, loading }) => {
  if (loading) {
    return <div>Loading tasks...</div>;
  }

  if (tasks.length === 0) {
    return <div>No tasks found. Create your first task!</div>;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#4caf50';
      case 'in-progress': return '#ff9800';
      case 'pending': return '#2196f3';
      default: return '#666';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#f44336';
      case 'medium': return '#ff9800';
      case 'low': return '#4caf50';
      default: return '#666';
    }
  };

  return (
    <div>
      <h3>Tasks</h3>
      {tasks.map((task) => (
        <div
          key={task._id}
          style={{
            border: '1px solid #ddd',
            padding: '15px',
            marginBottom: '10px',
            borderRadius: '4px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <div style={{ flex: 1 }}>
              <h4 style={{ margin: '0 0 10px 0' }}>{task.title}</h4>
              {task.description && <p style={{ margin: '0 0 10px 0' }}>{task.description}</p>}
              
              <div style={{ display: 'flex', gap: '10px', fontSize: '14px' }}>
                <span style={{ 
                  padding: '4px 8px', 
                  borderRadius: '4px', 
                  backgroundColor: getStatusColor(task.status),
                  color: 'white'
                }}>
                  {task.status}
                </span>
                <span style={{ 
                  padding: '4px 8px', 
                  borderRadius: '4px', 
                  backgroundColor: getPriorityColor(task.priority),
                  color: 'white'
                }}>
                  {task.priority}
                </span>
              </div>
              
              <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
                Created by: {task.createdBy.name} | {new Date(task.createdAt).toLocaleDateString()}
              </div>
            </div>
            
            <button
              onClick={() => onDelete(task._id)}
              style={{
                padding: '8px 16px',
                backgroundColor: '#f44336',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TaskList;
