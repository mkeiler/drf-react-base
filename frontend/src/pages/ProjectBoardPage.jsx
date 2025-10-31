import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DndContext, DragOverlay, closestCorners } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { projectsAPI, tasksAPI, sprintsAPI } from '../services/projectsAPI';
import TaskCard from '../components/TaskCard';
import TaskColumn from '../components/TaskColumn';
import TaskDetailModal from '../components/TaskDetailModal';
import CreateTaskModal from '../components/CreateTaskModal';
import './ProjectBoardPage.css';

const STATUSES = [
  { id: 'backlog', label: 'Backlog' },
  { id: 'implementing', label: 'Implementing' },
  { id: 'testing', label: 'Testing' },
  { id: 'deployed', label: 'Deployed' },
];

const ProjectBoardPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [sprints, setSprints] = useState([]);
  const [selectedSprint, setSelectedSprint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTask, setActiveTask] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [createTaskStatus, setCreateTaskStatus] = useState('backlog');

  useEffect(() => {
    fetchProjectData();
  }, [projectId]);

  useEffect(() => {
    if (selectedSprint !== null) {
      fetchTasks();
    }
  }, [selectedSprint]);

  const fetchProjectData = async () => {
    try {
      setLoading(true);
      const [projectData, sprintsData] = await Promise.all([
        projectsAPI.get(projectId),
        sprintsAPI.list(projectId),
      ]);
      setProject(projectData);
      setSprints(sprintsData);

      // Select active sprint or first sprint
      const activeSprint = sprintsData.find(s => s.status === 'active');
      setSelectedSprint(activeSprint?.id || sprintsData[0]?.id || null);
    } catch (error) {
      console.error('Failed to fetch project:', error);
      alert('Failed to load project');
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async () => {
    try {
      const filters = { project_id: projectId };
      if (selectedSprint) {
        filters.sprint_id = selectedSprint;
      }
      const data = await tasksAPI.list(filters);
      setTasks(data);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    }
  };

  const handleDragStart = (event) => {
    const task = tasks.find(t => t.id === event.active.id);
    setActiveTask(task);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskId = active.id;
    const newStatus = over.id;
    const task = tasks.find(t => t.id === taskId);

    if (task && task.status !== newStatus) {
      // Optimistic update
      setTasks(tasks.map(t =>
        t.id === taskId ? { ...t, status: newStatus } : t
      ));

      try {
        await tasksAPI.move(taskId, { status: newStatus });
      } catch (error) {
        console.error('Failed to move task:', error);
        // Revert on error
        fetchTasks();
        alert('Failed to move task');
      }
    }
  };

  const handleCreateTask = async (taskData) => {
    try {
      await tasksAPI.create({
        ...taskData,
        project: projectId,
        sprint: selectedSprint || null,
      });
      setShowCreateTask(false);
      fetchTasks();
    } catch (error) {
      console.error('Failed to create task:', error);
      alert('Failed to create task');
    }
  };

  const getTasksByStatus = (status) => {
    return tasks.filter(task => task.status === status);
  };

  if (loading) {
    return <div className="loading">Loading project...</div>;
  }

  return (
    <div className="project-board-page">
      <header className="board-header">
        <div className="header-left">
          <button onClick={() => navigate('/dashboard')} className="btn-back">
            ← Back to Projects
          </button>
          <h1>{project?.name}</h1>
        </div>
        <div className="header-right">
          <select
            value={selectedSprint || ''}
            onChange={(e) => setSelectedSprint(e.target.value || null)}
            className="sprint-selector"
          >
            <option value="">All Tasks</option>
            {sprints.map(sprint => (
              <option key={sprint.id} value={sprint.id}>
                {sprint.name} ({sprint.status})
              </option>
            ))}
          </select>
          <button onClick={() => navigate(`/projects/${projectId}/sprints`)} className="btn-secondary">
            Manage Sprints
          </button>
        </div>
      </header>

      <DndContext
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="kanban-board">
          {STATUSES.map(status => (
            <TaskColumn
              key={status.id}
              id={status.id}
              title={status.label}
              tasks={getTasksByStatus(status.id)}
              onAddTask={() => {
                setCreateTaskStatus(status.id);
                setShowCreateTask(true);
              }}
              onTaskClick={setSelectedTask}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask && <TaskCard task={activeTask} isDragging />}
        </DragOverlay>
      </DndContext>

      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdate={fetchTasks}
        />
      )}

      {showCreateTask && (
        <CreateTaskModal
          initialStatus={createTaskStatus}
          projectId={projectId}
          sprintId={selectedSprint}
          onClose={() => setShowCreateTask(false)}
          onCreate={handleCreateTask}
        />
      )}
    </div>
  );
};

export default ProjectBoardPage;
