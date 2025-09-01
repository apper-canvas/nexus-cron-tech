class ActivitiesService {
  constructor() {
    // Initialize ApperClient for database operations
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    this.tableName = 'activity_c';
  }

  async getAll() {
    try {
      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "Tags"}},
          {"field": {"Name": "assigned_to_c"}},
          {"field": {"Name": "completed_at_c"}},
          {"field": {"Name": "contact_name_c"}},
          {"field": {"Name": "created_at_c"}},
          {"field": {"Name": "deal_title_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "due_date_c"}},
          {"field": {"Name": "outcome_c"}},
          {"field": {"Name": "priority_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "type_c"}},
          {"field": {"Name": "updated_at_c"}},
          {"field": {"Name": "contact_id_c"}},
          {"field": {"Name": "deal_id_c"}}
        ],
        orderBy: [{"fieldName": "created_at_c", "sorttype": "DESC"}]
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        return [];
      }

      if (!response.data || response.data.length === 0) {
        return [];
      }

      return response.data.map(activity => ({
        Id: activity.Id,
        type: activity.type_c || '',
        title: activity.title_c || activity.Name || '',
        description: activity.description_c || '',
        status: activity.status_c || 'pending',
        priority: activity.priority_c || 'normal',
        dueDate: activity.due_date_c,
        completedAt: activity.completed_at_c,
        contactId: activity.contact_id_c?.Id || activity.contact_id_c,
        contactName: activity.contact_name_c || activity.contact_id_c?.Name || '',
        dealId: activity.deal_id_c?.Id || activity.deal_id_c,
        dealTitle: activity.deal_title_c || activity.deal_id_c?.Name || '',
        assignedTo: activity.assigned_to_c || 'Current User',
        createdAt: activity.created_at_c || activity.CreatedOn,
        updatedAt: activity.updated_at_c || activity.ModifiedOn,
        outcome: activity.outcome_c
      }));
    } catch (error) {
      console.error('Error fetching activities:', error?.response?.data?.message || error);
      return [];
    }
  }

  async getById(id) {
    try {
      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "Tags"}},
          {"field": {"Name": "assigned_to_c"}},
          {"field": {"Name": "completed_at_c"}},
          {"field": {"Name": "contact_name_c"}},
          {"field": {"Name": "created_at_c"}},
          {"field": {"Name": "deal_title_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "due_date_c"}},
          {"field": {"Name": "outcome_c"}},
          {"field": {"Name": "priority_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "type_c"}},
          {"field": {"Name": "updated_at_c"}},
          {"field": {"Name": "contact_id_c"}},
          {"field": {"Name": "deal_id_c"}}
        ]
      };

      const response = await this.apperClient.getRecordById(this.tableName, parseInt(id), params);
      
      if (!response.success) {
        console.error(response.message);
        return null;
      }

      if (!response.data) {
        return null;
      }

      const activity = response.data;
      return {
        Id: activity.Id,
        type: activity.type_c || '',
        title: activity.title_c || activity.Name || '',
        description: activity.description_c || '',
        status: activity.status_c || 'pending',
        priority: activity.priority_c || 'normal',
        dueDate: activity.due_date_c,
        completedAt: activity.completed_at_c,
        contactId: activity.contact_id_c?.Id || activity.contact_id_c,
        contactName: activity.contact_name_c || activity.contact_id_c?.Name || '',
        dealId: activity.deal_id_c?.Id || activity.deal_id_c,
        dealTitle: activity.deal_title_c || activity.deal_id_c?.Name || '',
        assignedTo: activity.assigned_to_c || 'Current User',
        createdAt: activity.created_at_c || activity.CreatedOn,
        updatedAt: activity.updated_at_c || activity.ModifiedOn,
        outcome: activity.outcome_c
      };
    } catch (error) {
      console.error(`Error fetching activity ${id}:`, error?.response?.data?.message || error);
      return null;
    }
  }

  async create(activityData) {
    try {
      const params = {
        records: [{
          Name: activityData.title?.trim() || 'Untitled Activity',
          type_c: activityData.type || 'call',
          title_c: activityData.title?.trim() || '',
          description_c: activityData.description?.trim() || '',
          status_c: activityData.status || 'pending',
          priority_c: activityData.priority || 'normal',
          due_date_c: activityData.dueDate || null,
          contact_id_c: activityData.contactId ? parseInt(activityData.contactId) : null,
          contact_name_c: activityData.contactName || null,
          deal_id_c: activityData.dealId ? parseInt(activityData.dealId) : null,
          deal_title_c: activityData.dealTitle || null,
          assigned_to_c: activityData.assignedTo || 'Current User',
          created_at_c: new Date().toISOString(),
          updated_at_c: new Date().toISOString()
        }]
      };

      const response = await this.apperClient.createRecord(this.tableName, params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to create ${failed.length} activities:`, failed);
          failed.forEach(record => {
            if (record.errors) {
              record.errors.forEach(error => console.error(`${error.fieldLabel || 'Field'}: ${error.message || error}`));
            }
            if (record.message) console.error(record.message);
          });
        }

        if (successful.length > 0) {
          const created = successful[0].data;
          return {
            Id: created.Id,
            type: created.type_c || '',
            title: created.title_c || created.Name || '',
            description: created.description_c || '',
            status: created.status_c || 'pending',
            priority: created.priority_c || 'normal',
            dueDate: created.due_date_c,
            completedAt: created.completed_at_c,
            contactId: created.contact_id_c?.Id || created.contact_id_c,
            contactName: created.contact_name_c || created.contact_id_c?.Name || '',
            dealId: created.deal_id_c?.Id || created.deal_id_c,
            dealTitle: created.deal_title_c || created.deal_id_c?.Name || '',
            assignedTo: created.assigned_to_c || 'Current User',
            createdAt: created.created_at_c || created.CreatedOn,
            updatedAt: created.updated_at_c || created.ModifiedOn,
            outcome: created.outcome_c
          };
        }
      }

      throw new Error('Failed to create activity');
    } catch (error) {
      console.error('Error creating activity:', error?.response?.data?.message || error);
      throw error;
    }
  }

  async update(id, activityData) {
    try {
      const updateFields = {};
      
      if (activityData.type) updateFields.type_c = activityData.type;
      if (activityData.title) {
        updateFields.title_c = activityData.title.trim();
        updateFields.Name = activityData.title.trim();
      }
      if (activityData.description !== undefined) updateFields.description_c = activityData.description?.trim() || '';
      if (activityData.priority) updateFields.priority_c = activityData.priority;
      if (activityData.dueDate) updateFields.due_date_c = activityData.dueDate;
      if (activityData.contactId !== undefined) updateFields.contact_id_c = activityData.contactId ? parseInt(activityData.contactId) : null;
      if (activityData.contactName !== undefined) updateFields.contact_name_c = activityData.contactName;
      if (activityData.dealId !== undefined) updateFields.deal_id_c = activityData.dealId ? parseInt(activityData.dealId) : null;
      if (activityData.dealTitle !== undefined) updateFields.deal_title_c = activityData.dealTitle;
      if (activityData.assignedTo) updateFields.assigned_to_c = activityData.assignedTo;
      
      updateFields.updated_at_c = new Date().toISOString();

      const params = {
        records: [{
          Id: parseInt(id),
          ...updateFields
        }]
      };

      const response = await this.apperClient.updateRecord(this.tableName, params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to update activity ${id}:`, failed);
          failed.forEach(record => {
            if (record.errors) {
              record.errors.forEach(error => console.error(`${error.fieldLabel || 'Field'}: ${error.message || error}`));
            }
            if (record.message) console.error(record.message);
          });
        }

        if (successful.length > 0) {
          const updated = successful[0].data;
          return {
            Id: updated.Id,
            type: updated.type_c || '',
            title: updated.title_c || updated.Name || '',
            description: updated.description_c || '',
            status: updated.status_c || 'pending',
            priority: updated.priority_c || 'normal',
            dueDate: updated.due_date_c,
            completedAt: updated.completed_at_c,
            contactId: updated.contact_id_c?.Id || updated.contact_id_c,
            contactName: updated.contact_name_c || updated.contact_id_c?.Name || '',
            dealId: updated.deal_id_c?.Id || updated.deal_id_c,
            dealTitle: updated.deal_title_c || updated.deal_id_c?.Name || '',
            assignedTo: updated.assigned_to_c || 'Current User',
            createdAt: updated.created_at_c || updated.CreatedOn,
            updatedAt: updated.updated_at_c || updated.ModifiedOn,
            outcome: updated.outcome_c
          };
        }
      }

      throw new Error('Failed to update activity');
    } catch (error) {
      console.error('Error updating activity:', error?.response?.data?.message || error);
      throw error;
    }
  }

  async complete(id, outcome = '') {
    try {
      const params = {
        records: [{
          Id: parseInt(id),
          status_c: 'completed',
          completed_at_c: new Date().toISOString(),
          outcome_c: outcome.trim() || 'Task completed successfully',
          updated_at_c: new Date().toISOString()
        }]
      };

      const response = await this.apperClient.updateRecord(this.tableName, params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to complete activity ${id}:`, failed);
          throw new Error('Failed to complete activity');
        }

        if (successful.length > 0) {
          const updated = successful[0].data;
          return {
            Id: updated.Id,
            type: updated.type_c || '',
            title: updated.title_c || updated.Name || '',
            description: updated.description_c || '',
            status: updated.status_c || 'pending',
            priority: updated.priority_c || 'normal',
            dueDate: updated.due_date_c,
            completedAt: updated.completed_at_c,
            contactId: updated.contact_id_c?.Id || updated.contact_id_c,
            contactName: updated.contact_name_c || updated.contact_id_c?.Name || '',
            dealId: updated.deal_id_c?.Id || updated.deal_id_c,
            dealTitle: updated.deal_title_c || updated.deal_id_c?.Name || '',
            assignedTo: updated.assigned_to_c || 'Current User',
            createdAt: updated.created_at_c || updated.CreatedOn,
            updatedAt: updated.updated_at_c || updated.ModifiedOn,
            outcome: updated.outcome_c
          };
        }
      }

      throw new Error('Failed to complete activity');
    } catch (error) {
      console.error('Error completing activity:', error?.response?.data?.message || error);
      throw error;
    }
  }

  async delete(id) {
    try {
      const params = { 
        RecordIds: [parseInt(id)]
      };

      const response = await this.apperClient.deleteRecord(this.tableName, params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to delete activity ${id}:`, failed);
          throw new Error('Failed to delete activity');
        }

        return successful.length > 0;
      }

      return true;
    } catch (error) {
      console.error('Error deleting activity:', error?.response?.data?.message || error);
      throw error;
    }
  }

  async getTasks() {
    const all = await this.getAll();
    return all.filter(activity => activity.status !== 'completed');
  }

  async getHistory() {
    const all = await this.getAll();
    return all
      .filter(activity => activity.status === 'completed')
      .sort((a, b) => new Date(b.completedAt || 0) - new Date(a.completedAt || 0));
  }

  async getByContact(contactId) {
    const all = await this.getAll();
    return all.filter(activity => activity.contactId === parseInt(contactId));
  }

  async getByDeal(dealId) {
    const all = await this.getAll();
    return all.filter(activity => activity.dealId === parseInt(dealId));
  }

  async getOverdue() {
    const tasks = await this.getTasks();
    const now = new Date();
    return tasks.filter(task => task.dueDate && new Date(task.dueDate) < now);
  }
}

// Export singleton instance
export const activitiesService = new ActivitiesService();