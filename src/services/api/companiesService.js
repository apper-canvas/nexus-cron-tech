class CompaniesService {
  constructor() {
    // Initialize ApperClient for database operations
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    this.tableName = 'company_c';
  }

  async getAll() {
    try {
      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "Tags"}},
          {"field": {"Name": "address_c"}},
          {"field": {"Name": "contact_count_c"}},
          {"field": {"Name": "created_at_c"}},
          {"field": {"Name": "industry_c"}},
          {"field": {"Name": "last_activity_date_c"}},
          {"field": {"Name": "notes_c"}},
          {"field": {"Name": "total_deal_value_c"}},
          {"field": {"Name": "updated_at_c"}}
        ],
        orderBy: [{"fieldName": "updated_at_c", "sorttype": "DESC"}]
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        return [];
      }

      if (!response.data || response.data.length === 0) {
        return [];
      }

      return response.data.map(company => ({
        Id: company.Id,
        name: company.Name || '',
        industry: company.industry_c || '',
        address: company.address_c || '',
        notes: company.notes_c || '',
        contactCount: company.contact_count_c || 0,
        totalDealValue: company.total_deal_value_c || 0,
        lastActivityDate: company.last_activity_date_c,
        createdAt: company.created_at_c || company.CreatedOn,
        updatedAt: company.updated_at_c || company.ModifiedOn
      }));
    } catch (error) {
      console.error('Error fetching companies:', error?.response?.data?.message || error);
      return [];
    }
  }

  async getById(id) {
    try {
      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "Tags"}},
          {"field": {"Name": "address_c"}},
          {"field": {"Name": "contact_count_c"}},
          {"field": {"Name": "created_at_c"}},
          {"field": {"Name": "industry_c"}},
          {"field": {"Name": "last_activity_date_c"}},
          {"field": {"Name": "notes_c"}},
          {"field": {"Name": "total_deal_value_c"}},
          {"field": {"Name": "updated_at_c"}}
        ]
      };

      const response = await this.apperClient.getRecordById(this.tableName, parseInt(id), params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error("Company not found");
      }

      if (!response.data) {
        throw new Error("Company not found");
      }

      const company = response.data;
      return {
        Id: company.Id,
        name: company.Name || '',
        industry: company.industry_c || '',
        address: company.address_c || '',
        notes: company.notes_c || '',
        contactCount: company.contact_count_c || 0,
        totalDealValue: company.total_deal_value_c || 0,
        lastActivityDate: company.last_activity_date_c,
        createdAt: company.created_at_c || company.CreatedOn,
        updatedAt: company.updated_at_c || company.ModifiedOn
      };
    } catch (error) {
      console.error(`Error fetching company ${id}:`, error?.response?.data?.message || error);
      throw error;
    }
  }

  async create(companyData) {
    try {
      const params = {
        records: [{
          Name: companyData.name?.trim() || 'Unnamed Company',
          industry_c: companyData.industry?.trim() || '',
          address_c: companyData.address?.trim() || '',
          notes_c: companyData.notes?.trim() || '',
          contact_count_c: 0,
          total_deal_value_c: 0,
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
          console.error(`Failed to create ${failed.length} companies:`, failed);
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
            industry: created.industry_c || '',
            address: created.address_c || '',
            notes: created.notes_c || '',
            contactCount: created.contact_count_c || 0,
            totalDealValue: created.total_deal_value_c || 0,
            lastActivityDate: created.last_activity_date_c,
            createdAt: created.created_at_c || created.CreatedOn,
            updatedAt: created.updated_at_c || created.ModifiedOn
          };
        }
      }

      throw new Error('Failed to create company');
    } catch (error) {
      console.error('Error creating company:', error?.response?.data?.message || error);
      throw error;
    }
  }

  async update(id, companyData) {
    try {
      const updateFields = {};
      
      if (companyData.name) updateFields.Name = companyData.name.trim();
      if (companyData.industry !== undefined) updateFields.industry_c = companyData.industry?.trim() || '';
      if (companyData.address !== undefined) updateFields.address_c = companyData.address?.trim() || '';
      if (companyData.notes !== undefined) updateFields.notes_c = companyData.notes?.trim() || '';
      if (companyData.contactCount !== undefined) updateFields.contact_count_c = companyData.contactCount || 0;
      if (companyData.totalDealValue !== undefined) updateFields.total_deal_value_c = companyData.totalDealValue || 0;
      if (companyData.lastActivityDate !== undefined) updateFields.last_activity_date_c = companyData.lastActivityDate;
      
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
          console.error(`Failed to update company ${id}:`, failed);
          throw new Error('Failed to update company');
        }

        if (successful.length > 0) {
          const updated = successful[0].data;
          return {
            Id: updated.Id,
            name: updated.Name || '',
            industry: updated.industry_c || '',
            address: updated.address_c || '',
            notes: updated.notes_c || '',
            contactCount: updated.contact_count_c || 0,
            totalDealValue: updated.total_deal_value_c || 0,
            lastActivityDate: updated.last_activity_date_c,
            createdAt: updated.created_at_c || updated.CreatedOn,
            updatedAt: updated.updated_at_c || updated.ModifiedOn
          };
        }
      }

      throw new Error('Failed to update company');
    } catch (error) {
      console.error('Error updating company:', error?.response?.data?.message || error);
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
          console.error(`Failed to delete company ${id}:`, failed);
          throw new Error('Failed to delete company');
        }

        return successful.length > 0;
      }

      return true;
    } catch (error) {
      console.error('Error deleting company:', error?.response?.data?.message || error);
      throw error;
    }
  }

  // Get companies with updated relationship counts
  async updateCompanyMetrics(companyId) {
    try {
      const company = await this.getById(companyId);
      if (!company) return;

      // Update contact count
      const { contactService } = await import('./contactService');
      const contacts = await contactService.getAll();
      const companyContacts = contacts.filter(c => 
        c.company === company.name || c.companyId === company.Id
      );
      
      // Update deal value
      const { dealsService } = await import('./dealsService');
      const deals = await dealsService.getAll();
      const companyDeals = deals.filter(d => d.company === company.name);
      const totalDealValue = companyDeals.reduce((sum, deal) => sum + (deal.value || 0), 0);
      
      // Update last activity date from latest deal or contact
      const lastContactDate = companyContacts.length > 0 ? 
        Math.max(...companyContacts.map(c => new Date(c.updatedAt || c.createdAt).getTime())) : 0;
      const lastDealDate = companyDeals.length > 0 ?
        Math.max(...companyDeals.map(d => new Date(d.updatedAt || d.createdAt).getTime())) : 0;
      
      const lastActivityDate = (lastContactDate > 0 || lastDealDate > 0) 
        ? new Date(Math.max(lastContactDate, lastDealDate)).toISOString()
        : null;
      
      // Update metrics in database
      await this.update(companyId, {
        contactCount: companyContacts.length,
        totalDealValue: totalDealValue,
        lastActivityDate: lastActivityDate
      });
    } catch (error) {
      console.error('Failed to update company metrics:', error);
    }
  }
}

const companiesService = new CompaniesService();
export default companiesService;