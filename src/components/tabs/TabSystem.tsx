import { ReactNode } from 'react';
import { useUIStore } from '@/stores/ui-store';
import './TabSystem.css';

export interface TabDefinition {
  id: string;
  label: string;
  icon?: ReactNode;
  content: ReactNode;
}

interface TabSystemProps {
  tabs: TabDefinition[];
}

export function TabSystem({ tabs }: TabSystemProps) {
  const { activeTab, setActiveTab } = useUIStore();

  // Default to first tab if activeTab not set or invalid
  const currentTabId = tabs.find(t => t.id === activeTab)?.id || tabs[0]?.id;
  const currentTab = tabs.find(t => t.id === currentTabId);

  return (
    <div className="tab-system">
      <div className="tab-system__bar" role="tablist">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-system__tab ${tab.id === currentTabId ? 'tab-system__tab--active' : ''}`}
            role="tab"
            aria-selected={tab.id === currentTabId}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon && <span className="tab-system__icon">{tab.icon}</span>}
            {tab.label}
          </button>
        ))}
      </div>
      <div className="tab-system__content">
        {currentTab?.content}
      </div>
    </div>
  );
}
