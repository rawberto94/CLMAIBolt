import React, { useState } from 'react';
import { Home, FileText, Shield, Users, Settings, ChevronDown, ChevronUp, MessageSquare, Building2, Plus, X, BarChart2 } from 'lucide-react';
import { useLocation } from '../../contexts/LocationContext';

interface ChatModalProps {
  onClose: () => void;
}

const ChatModal: React.FC<ChatModalProps> = ({ onClose }) => {
  const [selectedContract, setSelectedContract] = useState('');
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Start New Discussion</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Contract
            </label>
            <select
              className="w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
              value={selectedContract}
              onChange={(e) => setSelectedContract(e.target.value)}
            >
              <option value="">Select a contract...</option>
              <option value="1">Master Service Agreement - Acme Corp</option>
              <option value="2">Software License Agreement - Tech Systems</option>
              <option value="3">Supply Agreement - Global Supplies Inc.</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Discussion Title
            </label>
            <input
              type="text"
              className="w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
              placeholder="Enter discussion title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Participants
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                <span className="ml-2 text-sm text-gray-700">Legal Team</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                <span className="ml-2 text-sm text-gray-700">Supplier Representatives</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                <span className="ml-2 text-sm text-gray-700">Compliance Officers</span>
              </label>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3 p-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Start Discussion
          </button>
        </div>
      </div>
    </div>
  );
};

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  active?: boolean;
  hasSubmenu?: boolean;
  isExpanded?: boolean;
  toggleExpand?: () => void;
  children?: React.ReactNode;
  isCollapsed?: boolean;
  badge?: number;
}

const NavItem: React.FC<NavItemProps> = ({
  icon,
  label,
  href,
  active = false,
  hasSubmenu = false,
  isExpanded = false,
  toggleExpand,
  children,
  isCollapsed = false,
  badge,
}) => {
  return (
    <>
      <li className="mb-0.5">
        <a
          href={href}
          className={`flex items-center py-2.5 px-4 rounded-lg transition-all duration-200 ${
            active 
              ? 'bg-primary-50 text-primary-800 font-medium'
              : 'text-gray-600 hover:bg-gray-50 hover:text-primary-700'
          }`}
          onClick={(e) => {
            if (hasSubmenu && toggleExpand) {
              e.preventDefault();
              toggleExpand();
            }
          }}
        >
          <span className="mr-3">{icon}</span>
          <span className={`flex-grow transition-opacity duration-300 ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>
            {label}
          </span>
          {badge !== undefined && badge > 0 && (
            <span className={`ml-2 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 ${isCollapsed ? 'hidden' : ''}`}>
              {badge}
            </span>
          )}
          {hasSubmenu && (
            <span className={`ml-auto ${isCollapsed ? 'hidden' : ''}`}>
              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </span>
          )}
        </a>
      </li>
      {hasSubmenu && isExpanded && !isCollapsed && (
        <div className="ml-6 mt-1 space-y-0.5 border-l border-gray-200 pl-2">
          {children}
        </div>
      )}
    </>
  );
};

const Sidebar: React.FC = () => {
  const { currentLocation } = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedMenus, setExpandedMenus] = React.useState<Record<string, boolean>>({
    documents: false,
    compliance: false,
  });

  const [showChatModal, setShowChatModal] = useState(false);

  const toggleMenu = (menu: string) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [menu]: !prev[menu],
    }));
  };
  
  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const unreadChats = 3;

  return (
    <aside 
      className={`fixed inset-y-0 left-0 bg-white/95 shadow-glass hidden md:block pt-20 z-40 transition-all duration-300 ease-in-out backdrop-blur-glass ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div className={`h-full overflow-y-auto pb-4 ${isCollapsed ? 'overflow-hidden' : ''}`}>
        <button
          onClick={toggleSidebar}
          className="absolute -right-3 top-28 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-glass hover:shadow-glass-hover focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-300 transform hover:scale-105"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <ChevronDown className="h-4 w-4 text-gray-500" />
          ) : (
            <ChevronUp className="h-4 w-4 text-gray-500" />
          )}
        </button>
        <div className="px-4 py-5">
          <div className={`flex items-center mb-6 transition-opacity duration-300 ${
            isCollapsed ? 'opacity-0' : 'opacity-100'
          }`}>
            <span className="text-lg font-semibold">CHAIN</span>
            <span className="text-red-600 text-lg font-semibold mx-0.5">|</span>
            <span className="text-lg font-semibold">Q</span>
            <span className="text-xs text-gray-500 ml-2 tracking-wider">SIMPLY SMART</span>
          </div>
          <nav>
            <ul>
              <NavItem
                icon={<Home size={20} />}
                label="Dashboard"
                href="#dashboard"
                isCollapsed={isCollapsed}
                active={currentLocation === 'dashboard'}
              />

              <NavItem
                icon={<FileText size={20} />}
                label="Contracts"
                href="#contracts"
                isCollapsed={isCollapsed}
                active={currentLocation.startsWith('contracts')}
                hasSubmenu={true}
                isExpanded={expandedMenus.documents}
                toggleExpand={() => toggleMenu('documents')}
              >
                <ul>
                  <NavItem
                    icon={<span className="w-2 h-2 rounded-full bg-gray-400 inline-block" />}
                    label="All Documents"
                    href="#contracts/all"
                    active={currentLocation === 'contracts/all'}
                  />
                  <NavItem
                    icon={<span className="w-2 h-2 rounded-full bg-gray-400 inline-block" />}
                    label="Recent"
                    href="#contracts/recent"
                    active={currentLocation === 'contracts/recent'}
                  />
                  <NavItem
                    icon={<span className="w-2 h-2 rounded-full bg-gray-400 inline-block" />}
                    label="Flagged"
                    href="#contracts/flagged"
                    active={currentLocation === 'contracts/flagged'}
                  />
                </ul>
              </NavItem>

              <NavItem
                icon={<Building2 size={20} />}
                label="Suppliers"
                href="#suppliers"
                isCollapsed={isCollapsed}
                active={currentLocation === 'suppliers'}
                hasSubmenu={true}
                isExpanded={expandedMenus.suppliers}
                toggleExpand={() => toggleMenu('suppliers')}
              >
                <ul>
                  <NavItem
                    icon={<span className="w-2 h-2 rounded-full bg-gray-400 inline-block" />}
                    label="Directory"
                    href="#suppliers/directory"
                    active={currentLocation === 'suppliers/directory'}
                  />
                  <NavItem
                    icon={<span className="w-2 h-2 rounded-full bg-gray-400 inline-block" />}
                    label="Evaluations"
                    href="#suppliers/evaluations"
                    active={currentLocation === 'suppliers/evaluations'}
                  />
                  <NavItem
                    icon={<span className="w-2 h-2 rounded-full bg-gray-400 inline-block" />}
                    label="Project Evaluation"
                    href="#suppliers/project-evaluation"
                    active={currentLocation === 'suppliers/project-evaluation'}
                  />
                </ul>
              </NavItem>

              <NavItem
                icon={<Shield size={20} />}
                label="Compliance"
                href="#compliance"
                isCollapsed={isCollapsed}
                active={currentLocation === 'compliance'}
                hasSubmenu={true}
                isExpanded={expandedMenus.compliance}
                toggleExpand={() => toggleMenu('compliance')}
              >
                <ul>
                  <NavItem
                    icon={<span className="w-2 h-2 rounded-full bg-gray-400 inline-block" />}
                    label="Rules"
                    href="#compliance/rules"
                    active={currentLocation === 'compliance/rules'}
                  />
                  <NavItem
                    icon={<span className="w-2 h-2 rounded-full bg-gray-400 inline-block" />}
                    label="Validation"
                    href="#compliance/validation"
                    active={currentLocation === 'compliance/validation'}
                  />
                  <NavItem
                    icon={<span className="w-2 h-2 rounded-full bg-gray-400 inline-block" />}
                    label="Reports"
                    href="#compliance/reports"
                    active={currentLocation === 'compliance/reports'}
                  />
                </ul>
              </NavItem>

              <NavItem
                icon={<MessageSquare size={20} />}
                label="Collaboration"
                href="#collaboration"
                isCollapsed={isCollapsed}
                active={currentLocation === 'collaboration'}
                badge={unreadChats}
                hasSubmenu={true}
                isExpanded={expandedMenus.collaboration}
                toggleExpand={() => toggleMenu('collaboration')}
              >
                <ul>
                  <div className="px-4 py-2">
                    <button
                      onClick={() => setShowChatModal(true)}
                      className="w-full flex items-center justify-center px-3 py-2.5 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200 shadow-sm"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      New Discussion
                    </button>
                  </div>
                  <NavItem
                    icon={<span className="w-2 h-2 rounded-full bg-gray-400 inline-block" />}
                    label="Active Discussions"
                    href="#collaboration/discussions"
                    active={currentLocation === 'collaboration/discussions'}
                    badge={2}
                  />
                  <NavItem
                    icon={<span className="w-2 h-2 rounded-full bg-gray-400 inline-block" />}
                    label="Team Members"
                    href="#collaboration/members"
                    active={currentLocation === 'collaboration/members'}
                  />
                </ul>
              </NavItem>

              <NavItem 
                icon={<BarChart2 size={20} />}
                label="Tools"
                href="#tools"
                isCollapsed={isCollapsed}
                active={currentLocation === 'tools'}
                hasSubmenu={true}
                isExpanded={expandedMenus.tools}
                toggleExpand={() => toggleMenu('tools')}
              >
                <ul>
                  <NavItem
                    icon={<span className="w-2 h-2 rounded-full bg-gray-400 inline-block" />}
                    label="Contract Analyzer"
                    href="#tools/analyzer"
                    active={currentLocation === 'tools/analyzer'}
                  />
                  <NavItem
                    icon={<span className="w-2 h-2 rounded-full bg-gray-400 inline-block" />}
                    label="Project Evaluation"
                    href="#tools/evaluation"
                    active={currentLocation === 'tools/evaluation'}
                  />
                </ul>
              </NavItem>

              <li className="border-t border-gray-200 my-4"></li>

              <NavItem
                icon={<Settings size={20} />}
                label="Settings"
                href="#settings"
                isCollapsed={isCollapsed}
                active={currentLocation === 'settings'}
              />
            </ul>
          </nav>
        </div>
      </div>
      {showChatModal && <ChatModal onClose={() => setShowChatModal(false)} />}
    </aside>
  );
};

export default Sidebar;