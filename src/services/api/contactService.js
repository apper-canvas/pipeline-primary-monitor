import contactsData from "@/services/mockData/contacts.json";
import { toast } from 'react-toastify';

class ContactService {
  constructor() {
    this.contacts = [...contactsData];
  }

  async delay() {
    return new Promise(resolve => setTimeout(resolve, Math.random() * 300 + 200));
  }

  async getAll() {
    await this.delay();
    return [...this.contacts];
  }

  async getById(id) {
    await this.delay();
    const contact = this.contacts.find(c => c.Id === id);
    if (!contact) {
      throw new Error("Contact not found");
    }
    return { ...contact };
  }

async create(contactData) {
    await this.delay();
    const newContact = {
      ...contactData,
      Id: Math.max(...this.contacts.map(c => c.Id)) + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.contacts.push(newContact);
    
// Create Stripe customer after successful local creation
    try {
      // Initialize ApperClient if not already done
      if (typeof window !== 'undefined' && window.ApperSDK) {
        const { ApperClient } = window.ApperSDK;
        const apperClient = new ApperClient({
          apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
          apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
        });

        const createResult = await apperClient.functions.invoke(import.meta.env.VITE_CREATE_STRIPE_CUSTOMER, {
          body: JSON.stringify({ contact: newContact }),
          headers: {
            'Content-Type': 'application/json'
          }
        });

        const createData = await createResult.json();
        
        if (createData.success) {
          toast.success('Contact created and Stripe customer created successfully!');
        } else {
          console.info(`apper_info: An error was received in this function: ${import.meta.env.VITE_CREATE_STRIPE_CUSTOMER}. The response body is: ${JSON.stringify(createData)}.`);
          toast.warning('Contact created locally, but Stripe customer creation failed. Please try again later.');
        }
      }
    } catch (error) {
      console.info(`apper_info: An error was received in this function: ${import.meta.env.VITE_CREATE_STRIPE_CUSTOMER}. The error is: ${error.message}`);
      toast.warning('Contact created locally, but Stripe customer creation is unavailable.');
    }
    
    return { ...newContact };
  }

  async update(id, contactData) {
    await this.delay();
    const index = this.contacts.findIndex(c => c.Id === id);
    if (index === -1) {
      throw new Error("Contact not found");
    }
    
    this.contacts[index] = {
      ...this.contacts[index],
      ...contactData,
      updatedAt: new Date().toISOString()
    };
    return { ...this.contacts[index] };
  }

  async delete(id) {
    await this.delay();
    const index = this.contacts.findIndex(c => c.Id === id);
    if (index === -1) {
      throw new Error("Contact not found");
    }
    
    const deletedContact = this.contacts.splice(index, 1)[0];
    return { ...deletedContact };
  }
}

export const contactService = new ContactService();