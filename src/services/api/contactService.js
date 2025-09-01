class ContactService {
  constructor() {
    // Initialize ApperClient for database operations
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    this.tableName = 'contact_c';
  }

  async getAll() {
    try {
      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "Tags"}},
          {"field": {"Name": "company_c"}},
          {"field": {"Name": "created_at_c"}},
          {"field": {"Name": "email_c"}},
          {"field": {"Name": "last_contact_date_c"}},
          {"field": {"Name": "notes_c"}},
          {"field": {"Name": "phone_c"}},
          {"field": {"Name": "updated_at_c"}},
          {"field": {"Name": "company_id_c"}}
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

      return response.data.map(contact => ({
        Id: contact.Id,
        name: contact.Name || '',
        email: contact.email_c || '',
        phone: contact.phone_c || '',
        company: contact.company_c || contact.company_id_c?.Name || '',
        companyId: contact.company_id_c?.Id || contact.company_id_c,
        lastContactDate: contact.last_contact_date_c,
        notes: contact.notes_c || '',
        createdAt: contact.created_at_c || contact.CreatedOn,
        updatedAt: contact.updated_at_c || contact.ModifiedOn
      }));
    } catch (error) {
      console.error('Error fetching contacts:', error?.response?.data?.message || error);
      return [];
    }
  }

  async getById(id) {
    try {
      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "Tags"}},
          {"field": {"Name": "company_c"}},
          {"field": {"Name": "created_at_c"}},
          {"field": {"Name": "email_c"}},
          {"field": {"Name": "last_contact_date_c"}},
          {"field": {"Name": "notes_c"}},
          {"field": {"Name": "phone_c"}},
          {"field": {"Name": "updated_at_c"}},
          {"field": {"Name": "company_id_c"}}
        ]
      };

      const response = await this.apperClient.getRecordById(this.tableName, parseInt(id), params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error("Contact not found");
      }

      if (!response.data) {
        throw new Error("Contact not found");
      }

      const contact = response.data;
      return {
        Id: contact.Id,
        name: contact.Name || '',
        email: contact.email_c || '',
        phone: contact.phone_c || '',
        company: contact.company_c || contact.company_id_c?.Name || '',
        companyId: contact.company_id_c?.Id || contact.company_id_c,
        lastContactDate: contact.last_contact_date_c,
        notes: contact.notes_c || '',
        createdAt: contact.created_at_c || contact.CreatedOn,
        updatedAt: contact.updated_at_c || contact.ModifiedOn
      };
    } catch (error) {
      console.error(`Error fetching contact ${id}:`, error?.response?.data?.message || error);
      throw error;
    }
  }

  async create(contactData) {
    try {
      const params = {
        records: [{
          Name: contactData.name?.trim() || 'Unnamed Contact',
          email_c: contactData.email?.trim() || '',
          phone_c: contactData.phone?.trim() || '',
          company_c: contactData.company?.trim() || '',
          company_id_c: contactData.companyId ? parseInt(contactData.companyId) : null,
          notes_c: contactData.notes?.trim() || '',
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
          console.error(`Failed to create ${failed.length} contacts:`, failed);
          failed.forEach(record => {
            if (record.errors) {
              record.errors.forEach(error => console.error(`${error.fieldLabel || 'Field'}: ${error.message || error}`));
            }
            if (record.message) console.error(record.message);
          });
        }

        if (successful.length > 0) {
          const created = successful[0].data;
          
          // Update company metrics if company is specified
          if (created.company_id_c) {
            try {
              const companiesService = (await import('./companiesService')).default;
              await companiesService.updateCompanyMetrics(created.company_id_c?.Id || created.company_id_c);
            } catch (error) {
              console.error('Failed to update company metrics:', error);
            }
          }
          
          return {
            Id: created.Id,
            name: created.Name || '',
            email: created.email_c || '',
            phone: created.phone_c || '',
            company: created.company_c || created.company_id_c?.Name || '',
            companyId: created.company_id_c?.Id || created.company_id_c,
            lastContactDate: created.last_contact_date_c,
            notes: created.notes_c || '',
            createdAt: created.created_at_c || created.CreatedOn,
            updatedAt: created.updated_at_c || created.ModifiedOn
          };
        }
      }

      throw new Error('Failed to create contact');
    } catch (error) {
      console.error('Error creating contact:', error?.response?.data?.message || error);
      throw error;
    }
  }

  async update(id, contactData) {
    try {
      const updateFields = {};
      
      if (contactData.name) {
        updateFields.Name = contactData.name.trim();
      }
      if (contactData.email !== undefined) updateFields.email_c = contactData.email?.trim() || '';
      if (contactData.phone !== undefined) updateFields.phone_c = contactData.phone?.trim() || '';
      if (contactData.company !== undefined) updateFields.company_c = contactData.company?.trim() || '';
      if (contactData.companyId !== undefined) updateFields.company_id_c = contactData.companyId ? parseInt(contactData.companyId) : null;
      if (contactData.notes !== undefined) updateFields.notes_c = contactData.notes?.trim() || '';
      if (contactData.lastContactDate !== undefined) updateFields.last_contact_date_c = contactData.lastContactDate;
      
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
          console.error(`Failed to update contact ${id}:`, failed);
          throw new Error('Failed to update contact');
        }

        if (successful.length > 0) {
          const updated = successful[0].data;
          return {
            Id: updated.Id,
            name: updated.Name || '',
            email: updated.email_c || '',
            phone: updated.phone_c || '',
            company: updated.company_c || updated.company_id_c?.Name || '',
            companyId: updated.company_id_c?.Id || updated.company_id_c,
            lastContactDate: updated.last_contact_date_c,
            notes: updated.notes_c || '',
            createdAt: updated.created_at_c || updated.CreatedOn,
            updatedAt: updated.updated_at_c || updated.ModifiedOn
          };
        }
      }

      throw new Error('Failed to update contact');
    } catch (error) {
      console.error('Error updating contact:', error?.response?.data?.message || error);
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
          console.error(`Failed to delete contact ${id}:`, failed);
          throw new Error('Failed to delete contact');
        }

        return successful.length > 0;
      }

      return true;
    } catch (error) {
      console.error('Error deleting contact:', error?.response?.data?.message || error);
      throw error;
    }
  }
}

export const contactService = new ContactService();