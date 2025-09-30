import React, { useState } from "react";
import { format, isValid } from "date-fns";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import Card from "@/components/atoms/Card";

const ContactTable = ({ contacts, onEdit, onDelete, onView, loading }) => {
  const [sortBy, setSortBy] = useState("firstName");
  const [sortOrder, setSortOrder] = useState("asc");

  const sortedContacts = [...contacts].sort((a, b) => {
if (sortOrder === "asc") {
      return (a[sortBy] || '') > (b[sortBy] || '') ? 1 : -1;
    } else {
      return (a[sortBy] || '') < (b[sortBy] || '') ? 1 : -1;
    }
  });

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const SortButton = ({ field, children }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center space-x-1 text-left font-medium text-slate-600 hover:text-slate-900"
    >
      <span>{children}</span>
      {sortBy === field && (
        <ApperIcon 
          name={sortOrder === "asc" ? "ChevronUp" : "ChevronDown"} 
          className="h-4 w-4" 
        />
      )}
    </button>
  );

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-slate-200 rounded w-1/4"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-slate-100 rounded"></div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
<SortButton field="first_name_c">Contact</SortButton>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
<SortButton field="company_c">Company</SortButton>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Contact Info
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
<SortButton field="CreatedOn">Added</SortButton>
              </th>
              <th className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {sortedContacts.map((contact) => (
              <tr key={contact.Id} className="hover:bg-slate-50 transition-colors duration-200">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
<span className="text-sm font-medium text-primary-600">
{contact.first_name_c?.charAt(0) || '?'}{contact.last_name_c?.charAt(0) || '?'}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
<div className="text-sm font-medium text-slate-900">
                        {contact.first_name_c} {contact.last_name_c}
                      </div>
                      <div className="text-sm text-slate-500">{contact.position}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
<div className="text-sm text-slate-900">{contact.company_c}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
<div className="text-sm text-slate-900">{contact.email_c}</div>
                  <div className="text-sm text-slate-500">{contact.phone_c}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
{contact.CreatedOn && isValid(new Date(contact.CreatedOn)) 
                    ? format(new Date(contact.CreatedOn), "MMM dd, yyyy")
                    : "Invalid date"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onView(contact)}
                    >
                      <ApperIcon name="Eye" className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(contact)}
                    >
                      <ApperIcon name="Edit" className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(contact.Id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
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
    </Card>
  );
};

export default ContactTable;