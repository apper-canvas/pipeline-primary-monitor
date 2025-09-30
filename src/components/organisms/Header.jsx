import { useState, useContext } from "react";
import { useSelector } from 'react-redux';
import ApperIcon from "@/components/ApperIcon";
import SearchBar from "@/components/molecules/SearchBar";
import Button from "@/components/atoms/Button";
import { AuthContext } from "@/App";

const Header = ({ title, onSearch, actions }) => {
  const { logout } = useContext(AuthContext);
  const { user, isAuthenticated } = useSelector((state) => state.user);

  const handleLogout = async () => {
    if (logout) {
      await logout();
    }
  };

  return (
    <div className="bg-white border-b border-slate-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          {onSearch && (
            <div className="w-64">
              <SearchBar
                placeholder="Search..."
                onSearch={onSearch}
              />
            </div>
          )}
          
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm">
              <ApperIcon name="Bell" className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <ApperIcon name="Settings" className="h-4 w-4" />
            </Button>
            {isAuthenticated && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleLogout}
                title="Logout"
              >
                <ApperIcon name="LogOut" className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          {actions && (
            <div className="flex items-center space-x-2">
              {actions}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;