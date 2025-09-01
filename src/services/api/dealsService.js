class DealsService {
  constructor() {
    // Initialize ApperClient for database operations
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    this.tableName = 'deal_c';
  }

  async getAll() {
    try {
      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "Tags"}},
          {"field": {"Name": "assigned_to_c"}},
          {"field": {"Name": "company_c"}},
          {"field": {"Name": "contact_name_c"}},
          {"field": {"Name": "created_at_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "expected_close_date_c"}},
          {"field": {"Name": "notes_c"}},
          {"field": {"Name": "probability_c"}},
          {"field": {"Name": "source_c"}},
          {"field": {"Name": "stage_c"}},
          {"field": {"Name": "stage_changed_at_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "updated_at_c"}},
          {"field": {"Name": "value_c"}},
          {"field": {"Name": "contact_id_c"}}
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

      return response.data.map(deal => ({
        Id: deal.Id,
        title: deal.title_c || deal.Name || '',
        contactId: deal.contact_id_c?.Id || deal.contact_id_c,
        contactName: deal.contact_name_c || deal.contact_id_c?.Name || 'Unknown Contact',
        company: deal.company_c || 'No Company',
        value: deal.value_c || 0,
        probability: deal.probability_c || 50,
        expectedCloseDate: deal.expected_close_date_c,
        notes: deal.notes_c || '',
        assignedTo: deal.assigned_to_c || null,
        status: deal.status_c || 'active',
        stage: deal.stage_c || 'Lead',
        source: deal.source_c || '',
        description: deal.description_c || '',
        stageChangedAt: deal.stage_changed_at_c,
        createdAt: deal.created_at_c || deal.CreatedOn,
        updatedAt: deal.updated_at_c || deal.ModifiedOn,
        activities: []
      }));
    } catch (error) {
      console.error('Error fetching deals:', error?.response?.data?.message || error);
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
          {"field": {"Name": "company_c"}},
          {"field": {"Name": "contact_name_c"}},
          {"field": {"Name": "created_at_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "expected_close_date_c"}},
          {"field": {"Name": "notes_c"}},
          {"field": {"Name": "probability_c"}},
          {"field": {"Name": "source_c"}},
          {"field": {"Name": "stage_c"}},
          {"field": {"Name": "stage_changed_at_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "updated_at_c"}},
          {"field": {"Name": "value_c"}},
          {"field": {"Name": "contact_id_c"}}
        ]
      };

      const response = await this.apperClient.getRecordById(this.tableName, parseInt(id), params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error("Deal not found");
      }

      if (!response.data) {
        throw new Error("Deal not found");
      }

      const deal = response.data;
      return {
        Id: deal.Id,
        title: deal.title_c || deal.Name || '',
        contactId: deal.contact_id_c?.Id || deal.contact_id_c,
        contactName: deal.contact_name_c || deal.contact_id_c?.Name || 'Unknown Contact',
        company: deal.company_c || 'No Company',
        value: deal.value_c || 0,
        probability: deal.probability_c || 50,
        expectedCloseDate: deal.expected_close_date_c,
        notes: deal.notes_c || '',
        assignedTo: deal.assigned_to_c || null,
        status: deal.status_c || 'active',
        stage: deal.stage_c || 'Lead',
        source: deal.source_c || '',
        description: deal.description_c || '',
        stageChangedAt: deal.stage_changed_at_c,
        createdAt: deal.created_at_c || deal.CreatedOn,
        updatedAt: deal.updated_at_c || deal.ModifiedOn,
        activities: []
      };
    } catch (error) {
      console.error(`Error fetching deal ${id}:`, error?.response?.data?.message || error);
      throw error;
    }
  }

  async create(dealData) {
    try {
      const params = {
        records: [{
          Name: dealData.title?.trim() || 'Untitled Deal',
          title_c: dealData.title?.trim() || '',
          contact_id_c: dealData.contactId ? parseInt(dealData.contactId) : null,
          contact_name_c: dealData.contactName || 'Unknown Contact',
          company_c: dealData.company || 'No Company',
          value_c: dealData.value || 0,
          probability_c: dealData.probability || 50,
          expected_close_date_c: dealData.expectedCloseDate || null,
          notes_c: dealData.notes?.trim() || '',
          assigned_to_c: dealData.assignedTo || null,
          status_c: dealData.status || 'active',
          stage_c: dealData.stage || 'Lead',
          source_c: dealData.source || '',
          description_c: dealData.description?.trim() || '',
          created_at_c: new Date().toISOString(),
          updated_at_c: new Date().toISOString(),
          stage_changed_at_c: new Date().toISOString()
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
          console.error(`Failed to create ${failed.length} deals:`, failed);
          failed.forEach(record => {
            if (record.errors) {
              record.errors.forEach(error => console.error(`${error.fieldLabel || 'Field'}: ${error.message || error}`));
            }
            if (record.message) console.error(record.message);
          });
        }

        if (successful.length > 0) {
          const created = successful[0].data;
          
          // Update company metrics for the associated company
          if (created.company_c && created.company_c !== 'No Company') {
            try {
              const companiesService = (await import('./companiesService')).default;
              const allCompanies = await companiesService.getAll();
              const company = allCompanies.find(c => c.name === created.company_c);
              if (company) {
                await companiesService.updateCompanyMetrics(company.Id);
              }
            } catch (error) {
              console.error('Failed to update company metrics:', error);
            }
          }
          
          return {
            Id: created.Id,
            title: created.title_c || created.Name || '',
            contactId: created.contact_id_c?.Id || created.contact_id_c,
            contactName: created.contact_name_c || created.contact_id_c?.Name || 'Unknown Contact',
            company: created.company_c || 'No Company',
            value: created.value_c || 0,
            probability: created.probability_c || 50,
            expectedCloseDate: created.expected_close_date_c,
            notes: created.notes_c || '',
            assignedTo: created.assigned_to_c || null,
            status: created.status_c || 'active',
            stage: created.stage_c || 'Lead',
            source: created.source_c || '',
            description: created.description_c || '',
            stageChangedAt: created.stage_changed_at_c,
            createdAt: created.created_at_c || created.CreatedOn,
            updatedAt: created.updated_at_c || created.ModifiedOn,
            activities: []
          };
        }
      }

      throw new Error('Failed to create deal');
    } catch (error) {
      console.error('Error creating deal:', error?.response?.data?.message || error);
      throw error;
    }
  }

  async update(id, dealData) {
    try {
      const updateFields = {};
      
      if (dealData.title) {
        updateFields.title_c = dealData.title.trim();
        updateFields.Name = dealData.title.trim();
      }
      if (dealData.contactId !== undefined) updateFields.contact_id_c = dealData.contactId ? parseInt(dealData.contactId) : null;
      if (dealData.contactName !== undefined) updateFields.contact_name_c = dealData.contactName;
      if (dealData.company !== undefined) updateFields.company_c = dealData.company;
      if (dealData.value !== undefined) updateFields.value_c = dealData.value || 0;
      if (dealData.probability !== undefined) updateFields.probability_c = dealData.probability || 0;
      if (dealData.expectedCloseDate !== undefined) updateFields.expected_close_date_c = dealData.expectedCloseDate;
      if (dealData.notes !== undefined) updateFields.notes_c = dealData.notes?.trim() || '';
      if (dealData.assignedTo !== undefined) updateFields.assigned_to_c = dealData.assignedTo;
      if (dealData.status !== undefined) updateFields.status_c = dealData.status;
      if (dealData.stage !== undefined) updateFields.stage_c = dealData.stage;
      if (dealData.source !== undefined) updateFields.source_c = dealData.source;
      if (dealData.description !== undefined) updateFields.description_c = dealData.description?.trim() || '';
      
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
          console.error(`Failed to update deal ${id}:`, failed);
          throw new Error('Failed to update deal');
        }

        if (successful.length > 0) {
          const updated = successful[0].data;
          return {
            Id: updated.Id,
            title: updated.title_c || updated.Name || '',
            contactId: updated.contact_id_c?.Id || updated.contact_id_c,
            contactName: updated.contact_name_c || updated.contact_id_c?.Name || 'Unknown Contact',
            company: updated.company_c || 'No Company',
            value: updated.value_c || 0,
            probability: updated.probability_c || 50,
            expectedCloseDate: updated.expected_close_date_c,
            notes: updated.notes_c || '',
            assignedTo: updated.assigned_to_c || null,
            status: updated.status_c || 'active',
            stage: updated.stage_c || 'Lead',
            source: updated.source_c || '',
            description: updated.description_c || '',
            stageChangedAt: updated.stage_changed_at_c,
            createdAt: updated.created_at_c || updated.CreatedOn,
            updatedAt: updated.updated_at_c || updated.ModifiedOn,
            activities: []
          };
        }
      }

      throw new Error('Failed to update deal');
    } catch (error) {
      console.error('Error updating deal:', error?.response?.data?.message || error);
      throw error;
    }
  }

  async updateStatus(id, status, stage) {
    try {
      const params = {
        records: [{
          Id: parseInt(id),
          status_c: status,
          stage_c: stage,
          stage_changed_at_c: new Date().toISOString(),
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
          console.error(`Failed to update deal status ${id}:`, failed);
          throw new Error('Failed to update deal status');
        }

        if (successful.length > 0) {
          const updated = successful[0].data;
          return {
            Id: updated.Id,
            title: updated.title_c || updated.Name || '',
            contactId: updated.contact_id_c?.Id || updated.contact_id_c,
            contactName: updated.contact_name_c || updated.contact_id_c?.Name || 'Unknown Contact',
            company: updated.company_c || 'No Company',
            value: updated.value_c || 0,
            probability: updated.probability_c || 50,
            expectedCloseDate: updated.expected_close_date_c,
            notes: updated.notes_c || '',
            assignedTo: updated.assigned_to_c || null,
            status: updated.status_c || 'active',
            stage: updated.stage_c || 'Lead',
            source: updated.source_c || '',
            description: updated.description_c || '',
            stageChangedAt: updated.stage_changed_at_c,
            createdAt: updated.created_at_c || updated.CreatedOn,
            updatedAt: updated.updated_at_c || updated.ModifiedOn,
            activities: []
          };
        }
      }

      throw new Error('Failed to update deal status');
    } catch (error) {
      console.error('Error updating deal status:', error?.response?.data?.message || error);
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
          console.error(`Failed to delete deal ${id}:`, failed);
          throw new Error('Failed to delete deal');
        }

        return successful.length > 0;
      }

      return true;
    } catch (error) {
      console.error('Error deleting deal:', error?.response?.data?.message || error);
      throw error;
    }
  }

  async getByStage(stage) {
    const all = await this.getAll();
    return all.filter(deal => deal.stage === stage);
  }

  async getPipelineStats() {
    try {
      const all = await this.getAll();
      
      const stats = {
        Lead: { count: 0, value: 0 },
        Qualified: { count: 0, value: 0 },
        Proposal: { count: 0, value: 0 },
        Negotiation: { count: 0, value: 0 },
        Closed: { count: 0, value: 0 }
      };

      all.forEach(deal => {
        if (stats[deal.stage]) {
          stats[deal.stage].count++;
          stats[deal.stage].value += deal.value || 0;
        }
      });

      return stats;
    } catch (error) {
      console.error('Error fetching pipeline stats:', error?.response?.data?.message || error);
      return {};
    }
  }
}

export const dealsService = new DealsService();