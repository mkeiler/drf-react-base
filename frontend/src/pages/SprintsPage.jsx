import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { sprintsAPI } from '../services/projectsAPI';
import './SprintsPage.css';

const SprintsPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [sprints, setSprints] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newSprint, setNewSprint] = useState({
    name: '',
    start_date: '',
    end_date: '',
    goal: '',
    status: 'planning',
  });

  useEffect(() => {
    fetchSprints();
  }, [projectId]);

  const fetchSprints = async () => {
    try {
      const data = await sprintsAPI.list(projectId);
      setSprints(data);
    } catch (error) {
      console.error('Failed to fetch sprints:', error);
      alert('Failed to load sprints');
    }
  };

  const handleCreateSprint = async (e) => {
    e.preventDefault();
    try {
      await sprintsAPI.create({ ...newSprint, project: projectId });
      setNewSprint({ name: '', start_date: '', end_date: '', goal: '', status: 'planning' });
      setShowCreateModal(false);
      fetchSprints();
    } catch (error) {
      console.error('Failed to create sprint:', error);
      alert(error.response?.data?.detail || 'Failed to create sprint');
    }
  };

  const handleSetActive = async (sprintId) => {
    try {
      await sprintsAPI.setActive(sprintId);
      fetchSprints();
    } catch (error) {
      console.error('Failed to set sprint active:', error);
      alert('Failed to activate sprint');
    }
  };

  const handleCompleteSprint = async (sprintId) => {
    if (!confirm('Complete this sprint? Unfinished tasks will be moved to backlog.')) return;

    try {
      await sprintsAPI.complete(sprintId);
      fetchSprints();
    } catch (error) {
      console.error('Failed to complete sprint:', error);
      alert('Failed to complete sprint');
    }
  };

  return (
    <div className="sprints-page">
      <header className="page-header">
        <button onClick={() => navigate(`/projects/${projectId}`)} className="btn-back">
          ← Back to Board
        </button>
        <h1>Sprint Management</h1>
        <button onClick={() => setShowCreateModal(true)} className="btn-primary">
          + New Sprint
        </button>
      </header>

      <div className="sprints-list">
        {sprints.map(sprint => (
          <div key={sprint.id} className={`sprint-card sprint-${sprint.status}`}>
            <div className="sprint-header">
              <div>
                <h3>{sprint.name}</h3>
                <span className={`status-badge status-${sprint.status}`}>{sprint.status}</span>
              </div>
              <div className="sprint-dates">
                {new Date(sprint.start_date).toLocaleDateString()} - {new Date(sprint.end_date).toLocaleDateString()}
              </div>
            </div>

            {sprint.goal && (
              <div className="sprint-goal">
                <strong>Goal:</strong> {sprint.goal}
              </div>
            )}

            <div className="sprint-stats">
              <div className="stat">
                <span className="stat-label">Tasks:</span>
                <span className="stat-value">{sprint.tasks_count}</span>
              </div>
              <div className="stat">
                <span className="stat-label">Completed:</span>
                <span className="stat-value">{sprint.completed_tasks}</span>
              </div>
              <div className="stat">
                <span className="stat-label">Progress:</span>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${sprint.completion_percentage}%` }}
                  />
                </div>
                <span className="stat-value">{sprint.completion_percentage}%</span>
              </div>
            </div>

            <div className="sprint-actions">
              {sprint.status === 'planning' && (
                <button onClick={() => handleSetActive(sprint.id)} className="btn-secondary">
                  Set Active
                </button>
              )}
              {sprint.status === 'active' && (
                <button onClick={() => handleCompleteSprint(sprint.id)} className="btn-primary">
                  Complete Sprint
                </button>
              )}
            </div>
          </div>
        ))}

        {sprints.length === 0 && (
          <div className="empty-state">
            <p>No sprints yet. Create your first sprint to get started!</p>
          </div>
        )}
      </div>

      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Create New Sprint</h2>
            <form onSubmit={handleCreateSprint}>
              <div className="form-group">
                <label>Sprint Name *</label>
                <input
                  type="text"
                  value={newSprint.name}
                  onChange={(e) => setNewSprint({ ...newSprint, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Start Date *</label>
                  <input
                    type="date"
                    value={newSprint.start_date}
                    onChange={(e) => setNewSprint({ ...newSprint, start_date: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>End Date *</label>
                  <input
                    type="date"
                    value={newSprint.end_date}
                    onChange={(e) => setNewSprint({ ...newSprint, end_date: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Goal</label>
                <textarea
                  value={newSprint.goal}
                  onChange={(e) => setNewSprint({ ...newSprint, goal: e.target.value })}
                  rows={3}
                  placeholder="Sprint goal or objective..."
                />
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowCreateModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Create Sprint
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SprintsPage;
