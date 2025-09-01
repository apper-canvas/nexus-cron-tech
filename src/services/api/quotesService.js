class QuotesService {
  constructor() {
    // Initialize ApperClient for database operations
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    this.tableName = 'quote_c';
  }

  async getAll() {
    try {
      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "Tags"}},
          {"field": {"Name": "quote_number_c"}},
          {"field": {"Name": "deal_c_id_c"}},
          {"field": {"Name": "quote_date_c"}},
          {"field": {"Name": "valid_until_date_c"}},
          {"field": {"Name": "quote_amount_c"}},
          {"field": {"Name": "notes_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "ModifiedOn"}}
        ],
        orderBy: [{"fieldName": "CreatedOn", "sorttype": "DESC"}]
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        return [];
      }

      if (!response.data || response.data.length === 0) {
        return [];
      }

      return response.data.map(quote => ({
        Id: quote.Id,
        name: quote.Name || '',
        quoteNumber: quote.quote_number_c || '',
        dealId: quote.deal_c_id_c?.Id || quote.deal_c_id_c,
        dealName: quote.deal_c_id_c?.Name || 'No Deal',
        quoteDate: quote.quote_date_c,
        validUntilDate: quote.valid_until_date_c,
        amount: quote.quote_amount_c || 0,
        notes: quote.notes_c || '',
        status: quote.status_c || 'Draft',
        tags: quote.Tags || '',
        createdAt: quote.CreatedOn,
        updatedAt: quote.ModifiedOn
      }));
    } catch (error) {
      console.error('Error fetching quotes:', error?.response?.data?.message || error);
      return [];
    }
  }

  async getById(id) {
    try {
      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "Tags"}},
          {"field": {"Name": "quote_number_c"}},
          {"field": {"Name": "deal_c_id_c"}},
          {"field": {"Name": "quote_date_c"}},
          {"field": {"Name": "valid_until_date_c"}},
          {"field": {"Name": "quote_amount_c"}},
          {"field": {"Name": "notes_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "ModifiedOn"}}
        ]
      };

      const response = await this.apperClient.getRecordById(this.tableName, parseInt(id), params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error("Quote not found");
      }

      if (!response.data) {
        throw new Error("Quote not found");
      }

      const quote = response.data;
      return {
        Id: quote.Id,
        name: quote.Name || '',
        quoteNumber: quote.quote_number_c || '',
        dealId: quote.deal_c_id_c?.Id || quote.deal_c_id_c,
        dealName: quote.deal_c_id_c?.Name || 'No Deal',
        quoteDate: quote.quote_date_c,
        validUntilDate: quote.valid_until_date_c,
        amount: quote.quote_amount_c || 0,
        notes: quote.notes_c || '',
        status: quote.status_c || 'Draft',
        tags: quote.Tags || '',
        createdAt: quote.CreatedOn,
        updatedAt: quote.ModifiedOn
      };
    } catch (error) {
      console.error(`Error fetching quote ${id}:`, error?.response?.data?.message || error);
      throw error;
    }
  }

  async create(quoteData) {
    try {
      const params = {
        records: [{
          Name: quoteData.name?.trim() || 'Untitled Quote',
          quote_number_c: quoteData.quoteNumber?.trim() || '',
          deal_c_id_c: quoteData.dealId ? parseInt(quoteData.dealId) : null,
          quote_date_c: quoteData.quoteDate || null,
          valid_until_date_c: quoteData.validUntilDate || null,
          quote_amount_c: quoteData.amount || 0,
          notes_c: quoteData.notes?.trim() || '',
          status_c: quoteData.status || 'Draft',
          Tags: quoteData.tags?.trim() || ''
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
          console.error(`Failed to create ${failed.length} quotes:`, failed);
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
            name: created.Name || '',
            quoteNumber: created.quote_number_c || '',
            dealId: created.deal_c_id_c?.Id || created.deal_c_id_c,
            dealName: created.deal_c_id_c?.Name || 'No Deal',
            quoteDate: created.quote_date_c,
            validUntilDate: created.valid_until_date_c,
            amount: created.quote_amount_c || 0,
            notes: created.notes_c || '',
            status: created.status_c || 'Draft',
            tags: created.Tags || '',
            createdAt: created.CreatedOn,
            updatedAt: created.ModifiedOn
          };
        }
      }

      throw new Error('Failed to create quote');
    } catch (error) {
      console.error('Error creating quote:', error?.response?.data?.message || error);
      throw error;
    }
  }

  async update(id, quoteData) {
    try {
      const updateFields = {};
      
      if (quoteData.name !== undefined) updateFields.Name = quoteData.name?.trim() || '';
      if (quoteData.quoteNumber !== undefined) updateFields.quote_number_c = quoteData.quoteNumber?.trim() || '';
      if (quoteData.dealId !== undefined) updateFields.deal_c_id_c = quoteData.dealId ? parseInt(quoteData.dealId) : null;
      if (quoteData.quoteDate !== undefined) updateFields.quote_date_c = quoteData.quoteDate;
      if (quoteData.validUntilDate !== undefined) updateFields.valid_until_date_c = quoteData.validUntilDate;
      if (quoteData.amount !== undefined) updateFields.quote_amount_c = quoteData.amount || 0;
      if (quoteData.notes !== undefined) updateFields.notes_c = quoteData.notes?.trim() || '';
      if (quoteData.status !== undefined) updateFields.status_c = quoteData.status;
      if (quoteData.tags !== undefined) updateFields.Tags = quoteData.tags?.trim() || '';

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
          console.error(`Failed to update quote ${id}:`, failed);
          throw new Error('Failed to update quote');
        }

        if (successful.length > 0) {
          const updated = successful[0].data;
          return {
            Id: updated.Id,
            name: updated.Name || '',
            quoteNumber: updated.quote_number_c || '',
            dealId: updated.deal_c_id_c?.Id || updated.deal_c_id_c,
            dealName: updated.deal_c_id_c?.Name || 'No Deal',
            quoteDate: updated.quote_date_c,
            validUntilDate: updated.valid_until_date_c,
            amount: updated.quote_amount_c || 0,
            notes: updated.notes_c || '',
            status: updated.status_c || 'Draft',
            tags: updated.Tags || '',
            createdAt: updated.CreatedOn,
            updatedAt: updated.ModifiedOn
          };
        }
      }

      throw new Error('Failed to update quote');
    } catch (error) {
      console.error('Error updating quote:', error?.response?.data?.message || error);
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
          console.error(`Failed to delete quote ${id}:`, failed);
          throw new Error('Failed to delete quote');
        }

        return successful.length > 0;
      }

      return true;
    } catch (error) {
      console.error('Error deleting quote:', error?.response?.data?.message || error);
      throw error;
    }
  }

  formatCurrency(value) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  }

  getStatusBadgeClass(status) {
    const statusClasses = {
      'Draft': 'bg-slate-100 text-slate-800',
      'Sent': 'bg-blue-100 text-blue-800',
      'Accepted': 'bg-green-100 text-green-800',
      'Rejected': 'bg-red-100 text-red-800',
      'Expired': 'bg-orange-100 text-orange-800'
    };
    return statusClasses[status] || statusClasses['Draft'];
  }
}

const quotesService = new QuotesService();
export default quotesService;