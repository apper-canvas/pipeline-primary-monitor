import { useState } from "react";
import { NavLink } from "react-router-dom";
import ApperIcon from "@/components/ApperIcon";
import { cn } from "@/utils/cn";

const Sidebar = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navigation = [
    { name: "Dashboard", to: "/", icon: "LayoutDashboard" },
    { name: "Contacts", to: "/contacts", icon: "Users" },
    { name: "Pipeline", to: "/pipeline", icon: "GitBranch" },
    { name: "Activities", to: "/activities", icon: "Activity" },
    { name: "Reports", to: "/reports", icon: "BarChart3" }
  ];

  const NavItem = ({ item }) => (
    <NavLink
      to={item.to}
      className={({ isActive }) =>
        cn(
          "nav-link",
          isActive && "active"
        )
      }
      onClick={() => setIsMobileOpen(false)}
    >
      <ApperIcon name={item.icon} className="h-5 w-5 mr-3" />
      {item.name}
    </NavLink>
  );

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="bg-white p-2 rounded-md shadow-md border border-slate-200"
        >
          <ApperIcon name="Menu" className="h-5 w-5 text-slate-600" />
        </button>
      </div>

      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <div
        className={cn(
          "lg:hidden fixed inset-y-0 left-0 w-64 bg-white shadow-xl z-50 transition-transform duration-300",
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                <ApperIcon name="Zap" className="h-5 w-5 text-white" />
              </div>
              <span className="ml-3 text-xl font-bold gradient-text">Pipeline Pro</span>
            </div>
            <button
              onClick={() => setIsMobileOpen(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              <ApperIcon name="X" className="h-5 w-5" />
            </button>
          </div>
          <nav className="space-y-1">
            {navigation.map((item) => (
              <NavItem key={item.name} item={item} />
            ))}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:block w-64 bg-white shadow-sm border-r border-slate-200 h-full">
        <div className="p-6">
          <div className="flex items-center mb-8">
            <div className="h-10 w-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
              <ApperIcon name="Zap" className="h-6 w-6 text-white" />
            </div>
            <span className="ml-3 text-xl font-bold gradient-text">Pipeline Pro</span>
          </div>
          <nav className="space-y-1">
            {navigation.map((item) => (
              <NavItem key={item.name} item={item} />
            ))}
          </nav>
        </div>
      </div>
    </>
  );
};

export default Sidebar;