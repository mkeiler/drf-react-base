import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import './TaskCard.css';

const PRIORITY_COLORS = {
  low: '#10b981',
  medium: '#f59e0b',
  high: '#ef4444',
};

const TaskCard = ({ task, isDragging, onClick }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleClick = (e) => {
    // Prevent click if clicking on drag handle
    if (e.target.closest('.drag-handle')) {
      return;
    }
    if (onClick && !isDragging) {
      onClick(task);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`task-card ${isDragging ? 'dragging' : ''}`}
      onClick={handleClick}
    >
      <div className="task-header">
        <div className="drag-handle" {...listeners} title="Drag to move">
          ⋮⋮
        </div>
        <h4 className="task-title">{task.title}</h4>
        <span
          className="priority-badge"
          style={{ backgroundColor: PRIORITY_COLORS[task.priority] }}
        >
          {task.priority}
        </span>
      </div>

      {task.description && (
        <p className="task-description">
          {task.description.substring(0, 100)}
          {task.description.length > 100 ? '...' : ''}
        </p>
      )}

      <div className="task-footer">
        {task.story_points && (
          <span className="story-points">{task.story_points} pts</span>
        )}
        {task.assigned_to_details && (
          <div className="assignee-avatar" title={task.assigned_to_details.email}>
            {task.assigned_to_details.first_name?.[0] || task.assigned_to_details.email[0]}
          </div>
        )}
        {task.comments_count > 0 && (
          <span className="comments-count">💬 {task.comments_count}</span>
        )}
      </div>
    </div>
  );
};

export default TaskCard;
