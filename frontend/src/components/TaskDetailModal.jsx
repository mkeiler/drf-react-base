import { useState, useEffect } from 'react';
import { tasksAPI, commentsAPI } from '../services/projectsAPI';
import './Modal.css';

const TaskDetailModal = ({ task, sprints = [], onClose, onUpdate }) => {
  const [taskData, setTaskData] = useState(task);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [task.id]);

  const fetchComments = async () => {
    try {
      const data = await commentsAPI.list(task.id);
      setComments(data);
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    }
  };

  const handleSave = async () => {
    try {
      // Prepare data with proper types
      const updateData = {
        title: taskData.title,
        description: taskData.description,
        status: taskData.status,
        priority: taskData.priority,
        project: task.project, // Include project ID
      };

      // Handle story_points - convert to integer or null
      if (taskData.story_points && taskData.story_points !== '') {
        updateData.story_points = parseInt(taskData.story_points, 10);
      } else {
        updateData.story_points = null;
      }

      // Handle sprint - ensure it's a valid UUID string or null
      if (taskData.sprint && taskData.sprint !== '') {
        updateData.sprint = taskData.sprint;
      } else {
        updateData.sprint = null;
      }

      await tasksAPI.update(task.id, updateData);
      setIsEditing(false);
      onUpdate();
    } catch (error) {
      console.error('Failed to update task:', error);
      console.error('Error details:', error.response?.data);
      alert('Failed to update task: ' + (error.response?.data?.detail || error.message));
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      await commentsAPI.create({
        task: task.id,
        text: newComment,
      });
      setNewComment('');
      fetchComments();
    } catch (error) {
      console.error('Failed to add comment:', error);
      alert('Failed to add comment');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      await tasksAPI.delete(task.id);
      onClose();
      onUpdate();
    } catch (error) {
      console.error('Failed to delete task:', error);
      alert('Failed to delete task');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEditing ? 'Edit Task' : taskData.title}</h2>
          <button onClick={onClose} className="close-btn">×</button>
        </div>

        <div className="modal-body">
          {isEditing ? (
            <div className="edit-form">
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  value={taskData.title}
                  onChange={(e) => setTaskData({ ...taskData, title: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={taskData.description}
                  onChange={(e) => setTaskData({ ...taskData, description: e.target.value })}
                  rows={5}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={taskData.status}
                    onChange={(e) => setTaskData({ ...taskData, status: e.target.value })}
                  >
                    <option value="backlog">Backlog</option>
                    <option value="implementing">Implementing</option>
                    <option value="testing">Testing</option>
                    <option value="deployed">Deployed</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Priority</label>
                  <select
                    value={taskData.priority}
                    onChange={(e) => setTaskData({ ...taskData, priority: e.target.value })}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Story Points</label>
                  <input
                    type="number"
                    value={taskData.story_points || ''}
                    onChange={(e) => setTaskData({ ...taskData, story_points: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Sprint</label>
                <select
                  value={taskData.sprint || ''}
                  onChange={(e) => setTaskData({ ...taskData, sprint: e.target.value || null })}
                >
                  <option value="">No Sprint (Backlog)</option>
                  {sprints.map(sprint => (
                    <option key={sprint.id} value={sprint.id}>
                      {sprint.name} ({sprint.status})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <div className="task-details">
              <div className="detail-row">
                <strong>Status:</strong> <span className={`badge status-${taskData.status}`}>{taskData.status}</span>
              </div>
              <div className="detail-row">
                <strong>Priority:</strong> <span className={`badge priority-${taskData.priority}`}>{taskData.priority}</span>
              </div>
              {taskData.story_points && (
                <div className="detail-row">
                  <strong>Story Points:</strong> {taskData.story_points}
                </div>
              )}
              <div className="detail-row">
                <strong>Sprint:</strong> {taskData.sprint ?
                  sprints.find(s => s.id === taskData.sprint)?.name || 'Unknown Sprint' :
                  'No Sprint (Backlog)'
                }
              </div>
              {taskData.description && (
                <div className="detail-row">
                  <strong>Description:</strong>
                  <p>{taskData.description}</p>
                </div>
              )}
            </div>
          )}

          <div className="comments-section">
            <h3>Comments</h3>
            <div className="comments-list">
              {comments.map(comment => (
                <div key={comment.id} className="comment">
                  <div className="comment-header">
                    <strong>{comment.user.email}</strong>
                    <span className="comment-date">
                      {new Date(comment.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="comment-text">{comment.text}</p>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddComment} className="add-comment-form">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                rows={2}
              />
              <button type="submit" className="btn-primary">Add Comment</button>
            </form>
          </div>
        </div>

        <div className="modal-footer">
          <button onClick={handleDelete} className="btn-danger">Delete Task</button>
          <div>
            {isEditing ? (
              <>
                <button onClick={() => setIsEditing(false)} className="btn-secondary">Cancel</button>
                <button onClick={handleSave} className="btn-primary">Save Changes</button>
              </>
            ) : (
              <button onClick={() => setIsEditing(true)} className="btn-primary">Edit Task</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailModal;
