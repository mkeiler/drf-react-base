import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import TaskCard from './TaskCard';
import './TaskColumn.css';

const TaskColumn = ({ id, title, tasks, onAddTask, onTaskClick }) => {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div className={`task-column ${isOver ? 'drag-over' : ''}`}>
      <div className="column-header">
        <h3>{title}</h3>
        <span className="task-count">{tasks.length}</span>
      </div>

      <div ref={setNodeRef} className="column-content">
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map(task => (
            <TaskCard key={task.id} task={task} onClick={onTaskClick} />
          ))}
        </SortableContext>

        {tasks.length === 0 && (
          <div className="empty-column">No tasks</div>
        )}
      </div>

      <button onClick={onAddTask} className="add-task-btn">
        + Add Task
      </button>
    </div>
  );
};

export default TaskColumn;
