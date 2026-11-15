import './Sidebar.css'

export type WorkspacePage =
  | 'dashboard'
  | 'sap'
  | 'sap-detail'
  | 'orders'
  | 'stocks'
  | 'reports'
  | 'adjustment'
  | 'stock-movements'
  | 'production-entry'
  | 'shipment-schedules'
  | 'shipment-create'
  | 'shipment-review'
  | 'shipment-saved'
  | 'shipment-detail'
  | 'agency'
  | 'notifications'
  | 'notification-preferences'
  | 'warehouse-handover'
  | 'reports-orders'
  | 'account-preferences'

interface SidebarProps {
  activePage: WorkspacePage
  onNavigate: (page: WorkspacePage) => void
}

export type NavigationIcon = 'chart' | 'warehouse' | 'document' | 'document-check' | 'cube' | 'grid' | 'bell' | 'settings' | 'clipboard' | 'truck' | 'handover' | 'sliders' | 'bell-alert'

const navGroups = [
  {
    label: 'MAIN',
    items: [
      { label: 'Dashboard', icon: 'grid' as const, page: 'dashboard' as const },
      { label: 'SAP Requirements', icon: 'cube' as const, page: 'sap' as const },
      { label: 'Upcoming Orders', icon: 'clipboard' as const, page: 'orders' as const },
      { label: 'Manufacturing Stocks', icon: 'document-check' as const, page: 'stocks' as const },
    ],
  },
  {
    label: 'OPERATIONS',
    items: [
      { label: 'Shipment Schedules', icon: 'document' as const, page: 'shipment-schedules' as const },
      { label: 'Agency Management', icon: 'warehouse' as const, page: 'agency' as const },
    ],
  },
  {
    label: 'ANALYTICS',
    items: [{ label: 'Reports & History', icon: 'chart' as const, page: 'reports' as const }],
  },
  {
    label: 'SETTINGS',
    items: [
      { label: 'Settings', icon: 'sliders' as const, page: 'account-preferences' as const },
      { label: 'Notifications', icon: 'bell-alert' as const, page: 'notifications' as const },
    ],
  },
]

export function NavigationIconGraphic({ icon }: { icon: NavigationIcon }) {
  const paths = {
    chart: (
      <>
        <path d="M4 20V4M4 20h17" />
        <path d="M8 16v-4m5 4V8m5 8V5" />
      </>
    ),
    warehouse: (
      <>
        <path d="M3 10 12 3l9 7v10H3z" />
        <path d="M7 20v-7h10v7M8 9h8" />
      </>
    ),
    document: (
      <>
        <path d="M6 3h9l5 5v13H6z" />
        <path d="M15 3v5h5M9 12h8m-8 4h8" />
      </>
    ),
    'document-check': (
      <>
        <path d="M6 3h9l5 5v13H6z" />
        <path d="M15 3v5h5M9 12h5m-5 4 2 2 5-5" />
      </>
    ),
    cube: (
      <>
        <path d="m12 3 9 5v9l-9 5-9-5V8z" />
        <path d="m3 8 9 5 9-5m-9 5v9" />
      </>
    ),
    grid: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="0.5" />
        <rect x="14" y="3" width="7" height="7" rx="0.5" />
        <rect x="3" y="14" width="7" height="7" rx="0.5" />
        <rect x="14" y="14" width="7" height="7" rx="0.5" />
      </>
    ),
    bell: (
      <>
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
        <path d="M10 21h4" />
      </>
    ),
    settings: (
      <>
        <path d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z" />
        <path d="m19.4 15 .1.1 1.4 1.1-1.4 2.4-1.7-.7a8 8 0 0 1-1.8 1l-.3 1.8h-2.8l-.3-1.8a8 8 0 0 1-1.8-1l-1.7.7-1.4-2.4 1.4-1.1a7 7 0 0 1 0-2l-1.4-1.1 1.4-2.4 1.7.7a8 8 0 0 1 1.8-1l.3-1.8h2.8l.3 1.8a8 8 0 0 1 1.8 1l1.7-.7 1.4 2.4-1.4 1.1a7 7 0 0 1 0 1.9Z" transform="translate(-1 -1)" />
      </>
    ),
    clipboard: (
      <>
        <rect x="5" y="5" width="14" height="16" rx="2" />
        <path d="M9 5V3h6v2M8 10h8m-8 4h8m-8 4h5" />
      </>
    ),
    truck: (
      <>
        <path d="M3 6h11v11H3zM14 10h4l3 3v4h-7z" />
        <circle cx="7.5" cy="18" r="1.5" />
        <circle cx="17.5" cy="18" r="1.5" />
      </>
    ),
    handover: (
      <>
        <path d="M4 7h6l2 2h8v10H4z" />
        <path d="m8 13 2-2 2 2m4 0-2 2-2-2m-2 0h4" />
      </>
    ),
    sliders: (
      <>
        <path d="M4 6h7m4 0h5M4 12h3m4 0h9M4 18h9m4 0h3" />
        <circle cx="13" cy="6" r="2" />
        <circle cx="9" cy="12" r="2" />
        <circle cx="15" cy="18" r="2" />
      </>
    ),
    'bell-alert': (
      <>
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h12" />
        <path d="M10 21h4" />
        <circle cx="19" cy="17" r="3" />
        <path d="M19 15.7v1.6m0 1.1h.01" />
      </>
    ),
  }

  return (
    <svg className="nav-icon-graphic" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      {paths[icon]}
    </svg>
  )
}

function Sidebar({ activePage, onNavigate }: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="brand-mark" aria-hidden="true">N</span>
        <span className="brand-copy">
          <strong>Nexus</strong>
          <span>Manufacturer Admin</span>
        </span>
      </div>
      <nav className="primary-navigation" aria-label="Main navigation">
        {navGroups.map((group) => (
          <div className="nav-group" key={group.label}>
            <h2>{group.label}</h2>
            {group.items.map((item) => (
              <button
                className={`nav-link${activePage === item.page || (activePage === 'sap-detail' && item.page === 'sap') || (activePage === 'adjustment' && item.page === 'stocks') || (['stock-movements', 'production-entry'].includes(activePage) && item.page === 'stocks') || (['shipment-create', 'shipment-review', 'shipment-saved', 'shipment-detail'].includes(activePage) && item.page === 'shipment-schedules') || (activePage === 'notification-preferences' && item.page === 'notifications') || (activePage === 'account-preferences' && item.page === 'account-preferences') ? ' is-active' : ''}`}
                type="button"
                onClick={() => onNavigate(item.page)}
                aria-current={activePage === item.page ? 'page' : undefined}
                key={item.label}
              >
                <span className="nav-icon"><NavigationIconGraphic icon={item.icon} /></span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        ))}
      </nav>
    </aside>
  )
}

export default Sidebar
