import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { projectsAPI } from '../services/projectsAPI';
import './ProjectsPage.css';

const ProjectsPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '' });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const data = await projectsAPI.list();
      setProjects(data);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      alert('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      await projectsAPI.create(newProject);
      setNewProject({ name: '', description: '' });
      setShowCreateModal(false);
      fetchProjects();
    } catch (error) {
      console.error('Failed to create project:', error);
      alert('Failed to create project');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="projects-page">
      <header className="projects-header">
        <h1>My Projects</h1>
        <div className="header-actions">
          <span className="user-email">{user?.email}</span>
          <button onClick={handleLogout} className="btn-secondary">
            Logout
          </button>
        </div>
      </header>

      <div className="projects-content">
        <div className="projects-toolbar">
          <h2>All Projects</h2>
          <button onClick={() => setShowCreateModal(true)} className="btn-primary">
            + New Project
          </button>
        </div>

        {loading ? (
          <div className="loading">Loading projects...</div>
        ) : projects.length === 0 ? (
          <div className="empty-state">
            <p>No projects yet. Create your first project to get started!</p>
          </button>
          </div>
        ) : (
          <div className="projects-grid">
            {projects.map((project) => (
              <div
                key={project.id}
                className="project-card"
                onClick={() => navigate(`/projects/${project.id}`)}
              >
                <h3>{project.name}</h3>
                <p className="project-description">
                  {project.description || 'No description'}
                </p>
                <div className="project-stats">
                  <div className="stat">
                    <span className="stat-label">Members:</span>
                    <span className="stat-value">{project.members_count}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Sprints:</span>
                    <span className="stat-value">{project.sprints_count}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Tasks:</span>
                    <span className="stat-value">{project.tasks_count}</span>
                  </div>
                </div>
                {project.active_sprint && (
                  <div className="active-sprint">
                    Active: {project.active_sprint.name}
                  </div>
                )}
                <div className="task-status-bar">
                  {Object.entries(project.tasks_by_status || {}).map(([status, count]) => (
                    <div
                      key={status}
                      className={`status-segment status-${status}`}
                      title={`${status}: ${count}`}
                      style={{
                        flex: count || 0,
                      }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Create New Project</h2>
            <form onSubmit={handleCreateProject}>
              <div className="form-group">
                <label htmlFor="name">Project Name *</label>
                <input
                  type="text"
                  id="name"
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  value={newProject.description}
                  onChange={(e) =>
                    setNewProject({ ...newProject, description: e.target.value })
                  }
                  rows={4}
                />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowCreateModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsPage;
