import { useState } from "react";
import { Outlet, NavLink } from "react-router-dom";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";

const Layout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

const navigation = [
    { name: "Dashboard", href: "", icon: "LayoutDashboard" },
    { name: "Transactions", href: "transactions", icon: "Receipt" },
    { name: "Budgets", href: "budgets", icon: "PieChart" },
    { name: "Accounts", href: "accounts", icon: "CreditCard" },
    { name: "Goals", href: "goals", icon: "Target" },
    { name: "Reports", href: "reports", icon: "BarChart3" },
    { name: "Settings", href: "settings", icon: "Settings" },
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-primary-50">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <div className="flex flex-col flex-grow pt-5 bg-white border-r border-gray-200 shadow-lg">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0 px-6 py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg">
                <ApperIcon name="DollarSign" size={24} className="text-white" />
              </div>
              <h1 className="text-xl font-bold gradient-text">Balance Sheet</h1>
            </div>
          </div>

          {/* Navigation */}
          <div className="mt-8 flex-grow flex flex-col">
            <nav className="flex-1 px-4 space-y-2">
              {navigation.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={({ isActive }) =>
                    cn(
                      "group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200",
                      isActive
                        ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg"
                        : "text-gray-700 hover:text-primary-600 hover:bg-primary-50"
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <ApperIcon
                        name={item.icon}
                        size={20}
                        className={cn(
                          "mr-3 transition-colors",
                          isActive ? "text-white" : "text-gray-500 group-hover:text-primary-600"
                        )}
                      />
                      {item.name}
                    </>
                  )}
                </NavLink>
              ))}
            </nav>
          </div>

          {/* User Section */}
          <div className="flex-shrink-0 p-4 border-t border-gray-200">
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-gradient-to-r from-primary-50 to-teal-50">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                <ApperIcon name="User" size={16} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Personal Finance</p>
                <p className="text-xs text-gray-600">Manage your money</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden">
        <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
              <ApperIcon name="DollarSign" size={18} className="text-white" />
            </div>
            <h1 className="text-lg font-bold gradient-text">Balance Sheet</h1>
          </div>
          <button
            onClick={toggleMobileMenu}
            className="p-2 rounded-lg text-gray-600 hover:text-primary-600 hover:bg-primary-50 transition-colors"
          >
            <ApperIcon name={isMobileMenuOpen ? "X" : "Menu"} size={24} />
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <>
            <div
              className="fixed inset-0 z-20 bg-gray-600 bg-opacity-75 transition-opacity lg:hidden"
              onClick={toggleMobileMenu}
            />
            <div className="fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-xl transform transition-transform lg:hidden">
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                      <ApperIcon name="DollarSign" size={18} className="text-white" />
                    </div>
                    <h1 className="text-lg font-bold gradient-text">Balance Sheet</h1>
                  </div>
                  <button
                    onClick={toggleMobileMenu}
                    className="p-2 rounded-lg text-gray-600 hover:text-primary-600"
                  >
                    <ApperIcon name="X" size={20} />
                  </button>
                </div>
                <nav className="flex-1 px-4 py-4 space-y-2">
                  {navigation.map((item) => (
                    <NavLink
                      key={item.name}
                      to={item.href}
                      onClick={toggleMobileMenu}
                      className={({ isActive }) =>
                        cn(
                          "group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200",
                          isActive
                            ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg"
                            : "text-gray-700 hover:text-primary-600 hover:bg-primary-50"
                        )
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <ApperIcon
                            name={item.icon}
                            size={20}
                            className={cn(
                              "mr-3 transition-colors",
                              isActive ? "text-white" : "text-gray-500 group-hover:text-primary-600"
                            )}
                          />
                          {item.name}
                        </>
                      )}
                    </NavLink>
                  ))}
                </nav>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Main Content */}
      <div className="lg:pl-64">
        <main className="min-h-screen">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;