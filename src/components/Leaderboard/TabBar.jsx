const TABS = [
  { id: 'top', label: 'Top Ranked' },
  { id: 'controversial', label: 'Controversial' },
];

export function TabBar({ activeTab, onSelect }) {
  return (
    <div className="tab-bar" role="tablist">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={activeTab === tab.id}
          className={`tab-bar__btn${activeTab === tab.id ? ' tab-bar__btn--active' : ''}`}
          onClick={() => onSelect(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
