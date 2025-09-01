import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { toast } from "react-toastify";
import { format } from "date-fns";
import Header from "@/components/organisms/Header";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import TableHeader from "@/components/molecules/TableHeader";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import ActivityModal from "@/components/organisms/ActivityModal";
import LogActivityModal from "@/components/organisms/LogActivityModal";
import { activitiesService } from "@/services/api/activitiesService";
const ActivitiesPage = () => {
  const { toggleSidebar } = useOutletContext();
  
  // State management
  const [activeTab, setActiveTab] = useState('tasks');
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortField, setSortField] = useState('dueDate');
  const [sortDirection, setSortDirection] = useState('asc');
  const [filters, setFilters] = useState({
    type: 'all',
    dateRange: 'all'
  });
  
  // Modal states
  const [activityModalOpen, setActivityModalOpen] = useState(false);
  const [logActivityModalOpen, setLogActivityModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await activitiesService.getAll();
      setActivities(data);
    } catch (error) {
      console.error('Failed to load activities:', error);
      setError('Failed to load activities. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateActivity = async (activityData) => {
    try {
      await activitiesService.create(activityData);
      await loadActivities();
      setActivityModalOpen(false);
    } catch (error) {
      throw error;
    }
  };

  const handleUpdateActivity = async (activityData) => {
    try {
      await activitiesService.update(editingActivity.Id, activityData);
      await loadActivities();
      setActivityModalOpen(false);
      setEditingActivity(null);
    } catch (error) {
      throw error;
    }
  };

  const handleLogActivity = async (activityData) => {
    try {
      await activitiesService.create(activityData);
      await loadActivities();
      setLogActivityModalOpen(false);
    } catch (error) {
      throw error;
    }
  };

  const handleCompleteTask = async (activityId) => {
    try {
      await activitiesService.complete(activityId, 'Task completed successfully');
      await loadActivities();
      toast.success('Task marked as completed!');
    } catch (error) {
      console.error('Failed to complete task:', error);
      toast.error('Failed to complete task. Please try again.');
    }
  };

  const handleDeleteActivity = async (activityId) => {
    if (!confirm('Are you sure you want to delete this activity?')) return;
    
    try {
      await activitiesService.delete(activityId);
      await loadActivities();
      toast.success('Activity deleted successfully!');
    } catch (error) {
      console.error('Failed to delete activity:', error);
      toast.error('Failed to delete activity. Please try again.');
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleEditActivity = (activity) => {
    setEditingActivity(activity);
    setActivityModalOpen(true);
  };

  const getFilteredAndSortedActivities = () => {
    let filtered = activities;

    // Filter by tab
    if (activeTab === 'tasks') {
      filtered = filtered.filter(activity => activity.status !== 'completed');
    } else if (activeTab === 'history') {
      filtered = filtered.filter(activity => activity.status === 'completed');
    }

    // Filter by type
    if (filters.type !== 'all') {
      filtered = filtered.filter(activity => activity.type === filters.type);
    }

    // Filter by date range
    if (filters.dateRange !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (filters.dateRange) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
filtered = filtered.filter(activity => {
            const activityDate = new Date(activity.dueDate || activity.completedAt);
            return activityDate >= filterDate && activityDate < new Date(filterDate.getTime() + 24 * 60 * 60 * 1000);
          });
          break;
        case 'week':
          filterDate.setDate(filterDate.getDate() - 7);
          filtered = filtered.filter(activity => {
            const activityDate = new Date(activity.dueDate || activity.completedAt);
            return activityDate >= filterDate;
          });
          break;
        case 'overdue':
          filtered = filtered.filter(activity => {
            if (activity.status === 'completed') return false;
            return activity.dueDate && new Date(activity.dueDate) < now;
          });
          break;
      }
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue, bValue;
switch (sortField) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'type':
          aValue = a.type;
          bValue = b.type;
          break;
        case 'dueDate':
          aValue = new Date(a.dueDate || a.completedAt || '1970-01-01');
          bValue = new Date(b.dueDate || b.completedAt || '1970-01-01');
          break;
        case 'priority':
          const priorityOrder = { urgent: 4, high: 3, normal: 2, low: 1 };
          aValue = priorityOrder[a.priority] || 1;
          bValue = priorityOrder[b.priority] || 1;
          break;
        default:
          aValue = a[sortField];
          bValue = b[sortField];
      }
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  };

  const getActivityTypeIcon = (type) => {
    const iconMap = {
      call: 'Phone',
      email: 'Mail',
      meeting: 'Users',
      task: 'CheckSquare',
      'follow-up': 'Clock'
    };
    return iconMap[type] || 'Activity';
  };

  const getPriorityColor = (priority) => {
    const colorMap = {
      urgent: 'bg-red-100 text-red-800',
      high: 'bg-orange-100 text-orange-800',
      normal: 'bg-blue-100 text-blue-800',
      low: 'bg-slate-100 text-slate-800'
    };
    return colorMap[priority] || 'bg-slate-100 text-slate-800';
  };

  const isOverdue = (dueDate, status) => {
    if (status === 'completed') return false;
    return dueDate && new Date(dueDate) < new Date();
  };

  const displayedActivities = getFilteredAndSortedActivities();

  if (loading) return <Loading type="table" />;
  if (error) return <Error message={error} onRetry={loadActivities} />;

  return (
    <div className="flex-1 overflow-hidden">
      <Header
        title="Activities"
        onMenuClick={toggleSidebar}
        onAddClick={() => setActivityModalOpen(true)}
        buttonText="Create Task"
        additionalActions={
          <Button 
            onClick={() => setLogActivityModalOpen(true)}
            variant="secondary"
            className="mr-3"
          >
            <ApperIcon name="Plus" className="h-4 w-4 mr-2" />
            Log Activity
          </Button>
        }
      />

      <div className="p-6">
        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="border-b border-slate-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('tasks')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'tasks'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                <ApperIcon name="CheckSquare" className="h-4 w-4 mr-2 inline" />
                Tasks ({activities.filter(a => a.status !== 'completed').length})
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'history'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                <ApperIcon name="Clock" className="h-4 w-4 mr-2 inline" />
                History ({activities.filter(a => a.status === 'completed').length})
              </button>
            </nav>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-4">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-slate-600">Type:</label>
            <select
              value={filters.type}
              onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
              className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:border-primary"
            >
              <option value="all">All Types</option>
              <option value="call">Call</option>
              <option value="email">Email</option>
              <option value="meeting">Meeting</option>
              <option value="task">Task</option>
              <option value="follow-up">Follow-up</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-slate-600">Date:</label>
            <select
              value={filters.dateRange}
              onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
              className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:border-primary"
            >
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              {activeTab === 'tasks' && <option value="overdue">Overdue</option>}
            </select>
          </div>
        </div>

        {/* Activities Table */}
        <Card>
          {displayedActivities.length === 0 ? (
            <Empty
              title={`No ${activeTab} found`}
              description={`${activeTab === 'tasks' ? 'Create your first task to get started.' : 'No completed activities yet.'}`}
              actionLabel="Create Task"
              onAction={() => setActivityModalOpen(true)}
              icon={activeTab === 'tasks' ? 'CheckSquare' : 'Clock'}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <TableHeader
                      label="Activity"
                      sortable
                      sortDirection={sortField === 'title' ? sortDirection : null}
                      onSort={() => handleSort('title')}
                    />
                    <TableHeader
                      label="Type"
                      sortable
                      sortDirection={sortField === 'type' ? sortDirection : null}
                      onSort={() => handleSort('type')}
                    />
                    <TableHeader
                      label={activeTab === 'tasks' ? 'Due Date' : 'Completed'}
                      sortable
                      sortDirection={sortField === 'dueDate' ? sortDirection : null}
                      onSort={() => handleSort('dueDate')}
                    />
                    <TableHeader label="Contact/Deal" />
                    {activeTab === 'tasks' && (
                      <TableHeader
                        label="Priority"
                        sortable
                        sortDirection={sortField === 'priority' ? sortDirection : null}
                        onSort={() => handleSort('priority')}
                      />
                    )}
                    {activeTab === 'history' && <TableHeader label="Outcome" />}
                    <TableHeader label="Actions" />
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {displayedActivities.map((activity) => (
                    <tr key={activity.Id} className="table-row-hover">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
                            isOverdue(activity.dueDate, activity.status) 
                              ? 'bg-red-100' 
                              : 'bg-slate-100'
                          }`}>
                            <ApperIcon 
                              name={getActivityTypeIcon(activity.type)} 
                              className={`h-4 w-4 ${
                                isOverdue(activity.dueDate, activity.status) 
                                  ? 'text-red-600' 
                                  : 'text-slate-600'
                              }`} 
                            />
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-slate-900">
                              {activity.title}
                              {isOverdue(activity.dueDate, activity.status) && (
                                <Badge className="ml-2 bg-red-100 text-red-800">
                                  Overdue
                                </Badge>
                              )}
                            </div>
                            {activity.description && (
                              <div className="text-sm text-slate-500 truncate max-w-xs">
                                {activity.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className="capitalize">
                          {activity.type}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                        {activeTab === 'tasks' ? (
                          activity.dueDate ? format(new Date(activity.dueDate), 'MMM dd, yyyy') : 'No due date'
                        ) : (
                          activity.completedAt ? format(new Date(activity.completedAt), 'MMM dd, yyyy HH:mm') : 'Unknown'
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="space-y-1">
                          {activity.contactName && (
                            <div className="text-slate-900">{activity.contactName}</div>
                          )}
                          {activity.dealTitle && (
                            <div className="text-slate-500">{activity.dealTitle}</div>
                          )}
                          {!activity.contactName && !activity.dealTitle && (
                            <span className="text-slate-400">No association</span>
                          )}
                        </div>
                      </td>
                      {activeTab === 'tasks' && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge className={getPriorityColor(activity.priority)}>
                            {activity.priority}
                          </Badge>
                        </td>
                      )}
                      {activeTab === 'history' && (
                        <td className="px-6 py-4">
                          <div className="text-sm text-slate-900 max-w-xs truncate">
                            {activity.outcome || 'No outcome recorded'}
                          </div>
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        <div className="flex items-center space-x-2">
                          {activeTab === 'tasks' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleCompleteTask(activity.Id)}
                              className="text-success hover:bg-success/10"
                            >
                              <ApperIcon name="Check" className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditActivity(activity)}
                            className="text-primary hover:bg-primary/10"
                          >
                            <ApperIcon name="Edit" className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteActivity(activity.Id)}
                            className="text-error hover:bg-error/10"
                          >
                            <ApperIcon name="Trash2" className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {/* Modals */}
      <ActivityModal
        isOpen={activityModalOpen}
        onClose={() => {
          setActivityModalOpen(false);
          setEditingActivity(null);
        }}
        onSave={editingActivity ? handleUpdateActivity : handleCreateActivity}
        activity={editingActivity}
      />

      <LogActivityModal
        isOpen={logActivityModalOpen}
        onClose={() => setLogActivityModalOpen(false)}
        onSave={handleLogActivity}
      />
    </div>
  );
};

export default ActivitiesPage;