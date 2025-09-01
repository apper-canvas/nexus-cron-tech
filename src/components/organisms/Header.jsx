import React, { useContext, useState } from "react";
import { toast } from "react-toastify";
import { AuthContext } from "@/App";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";
import SearchBar from "@/components/molecules/SearchBar";
import Button from "@/components/atoms/Button";

const Header = ({ title, onMenuClick, searchValue, onSearchChange, onAddClick, buttonText = "Add", additionalActions }) => {
  const { logout } = useContext(AuthContext) || {};

  const handleLogout = async () => {
    try {
      if (logout) {
        await logout();
        toast.success('Logged out successfully');
      }
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout');
    }
  };
  return (
    <header className="bg-white shadow-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left section */}
          <div className="flex items-center">
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onMenuClick}
              className="lg:hidden mr-2"
            >
              <ApperIcon name="Menu" className="h-5 w-5" />
            </Button>
            
            <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
          </div>

{/* Center section - Search */}
          <div className="flex-1 max-w-md mx-8 hidden sm:block">
            {onSearchChange && (
              <SearchBar
                value={searchValue || ""}
                onChange={onSearchChange}
                placeholder={`Search ${title.toLowerCase()}...`}
              />
            )}
          </div>

          {/* Right section */}
          <div className="flex items-center space-x-4">
            {onAddClick && (
              <Button onClick={onAddClick} className="btn-primary">
                <ApperIcon name="Plus" className="h-4 w-4 mr-2" />
                {buttonText}
              </Button>
            )}
            
            {additionalActions && additionalActions}
            
            <Button 
              variant="ghost" 
              onClick={handleLogout}
              className="flex items-center space-x-2"
            >
              <ApperIcon name="LogOut" className="h-4 w-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>

{/* Mobile search */}
        {onSearchChange && (
          <div className="pb-4 sm:hidden">
            <SearchBar
              value={searchValue || ""}
              onChange={onSearchChange}
              placeholder={`Search ${title.toLowerCase()}...`}
            />
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;