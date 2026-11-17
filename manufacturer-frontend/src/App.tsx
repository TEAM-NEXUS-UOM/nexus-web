import { useEffect, useMemo, useState } from 'react'
import './App.css'

type Role = 'manufacturing-admin' | 'super-admin'
type WorkspacePage =
  | 'dashboard'
  | 'agencies'
  | 'sap-reports'
  | 'stock-allocation'
  | 'inventory'
  | 'stock-movements'
  | 'handover'
  | 'reports'
  | 'notifications'
  | 'settings'
  | 'super-admin'

type AgencyStatus = 'Active' | 'Inactive' | 'Pending'
type SapStatus = 'PENDING' | 'IN_PROGRESS' | 'ACCEPTED' | 'PARTIALLY_ACCEPTED' | 'REJECTED'
type ItemDecision = 'PENDING' | 'ACCEPTED' | 'REJECTED'
type AllocationStatus = 'Draft' | 'Ready for Handover' | 'Completed'

interface DecisionHistoryEntry {
  id: string
  subject: string
  action: string
  reason?: string
  decisionMaker: string
  decidedAt: string
}

interface AppNotification {
  id: string
  title: string
  detail: string
  time: string
  unread: boolean
}

interface Agency {
  id: string
  name: string
  contact: string
  email: string
  phone: string
  region: string
  status: AgencyStatus
  createdAt: string
}

interface SapReportItem {
  id: string
  agencyId: string
  agencyName: string
  productId: string
  productName: string
  quantity: number
  contact: string
  duePayment: number
  decision: ItemDecision
  allocatedQuantity?: number
  rejectionReason?: string
}

interface SapReport {
  id: string
  fileName: string
  uploadedAt: string
  status: SapStatus
  adminName: string
  items: SapReportItem[]
  reviewStarted: boolean
  decisionHistory: DecisionHistoryEntry[]
}

interface InventoryItem {
  productId: string
  productName: string
  category: string
  onHand: number
  reserved: number
  available: number
  threshold: number
  lastUpdated: string
}

interface StockMovement {
  id: string
  productId: string
  productName: string
  admin: string
  type: 'Production' | 'Adjustment' | 'Allocation' | 'Handover'
  quantity: number
  movementDate: string
  reference: string
}

interface AllocationRecord {
  id: string
  agencyId: string
  agencyName: string
  reportId: string
  reportName: string
  createdAt: string
  status: AllocationStatus
  lines: {
    itemId: string
    agencyId: string
    agencyName: string
    productId: string
    productName: string
    requested: number
    allocated: number
  }[]
}

interface ManufacturingAdminAccount {
  id: string
  name: string
  email: string
  status: 'Assigned' | 'Pending' | 'Inactive'
}

const getSapStatus = (items: SapReportItem[], reviewStarted: boolean): SapStatus => {
  if (items.length > 0 && items.every((item) => item.decision === 'ACCEPTED')) return 'ACCEPTED'
  if (items.length > 0 && items.every((item) => item.decision === 'REJECTED')) return 'REJECTED'
  if (items.length > 0 && items.every((item) => item.decision !== 'PENDING')) return 'PARTIALLY_ACCEPTED'
  return reviewStarted || items.some((item) => item.decision !== 'PENDING') ? 'IN_PROGRESS' : 'PENDING'
}

const getSapStatusLabel = (status: SapStatus) =>
  status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase())

const loadLocalState = <T,>(key: string, initialValue: T): T => {
  try {
    const saved = window.localStorage.getItem(key)
    if (!saved) return initialValue
    return JSON.parse(saved) as T
  } catch (error) {
    console.error(`Could not read local demo data for ${key}.`, error)
    return initialValue
  }
}

const formatNumber = (value: number) => new Intl.NumberFormat('en-US').format(value)

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)

const initialAgencies: Agency[] = [
  { id: 'AG-102', name: 'Western Retail Group', contact: 'Asha Perera', email: 'asha@westernretail.lk', phone: '+94 77 120 4491', region: 'Western Province', status: 'Active', createdAt: '2026-09-18' },
  { id: 'AG-203', name: 'Central Trading Hub', contact: 'Nimal Senanayake', email: 'nimal@centralhub.lk', phone: '+94 71 223 9044', region: 'Central Province', status: 'Active', createdAt: '2026-09-25' },
  { id: 'AG-304', name: 'Southern Distribution Co.', contact: 'Dilhani Fernando', email: 'dilhani@southerndist.lk', phone: '+94 76 452 6630', region: 'Southern Province', status: 'Pending', createdAt: '2026-10-03' },
]

const initialInventory: InventoryItem[] = [
  { productId: 'P-101', productName: 'Cream Cracker', category: 'Biscuits', onHand: 12400, reserved: 2400, available: 10000, threshold: 8000, lastUpdated: '2026-10-20' },
  { productId: 'P-102', productName: 'Chocolate Cream', category: 'Biscuits', onHand: 6800, reserved: 1200, available: 5600, threshold: 3000, lastUpdated: '2026-10-20' },
  { productId: 'P-103', productName: 'Lemon Puff', category: 'Biscuits', onHand: 5200, reserved: 4500, available: 700, threshold: 1500, lastUpdated: '2026-10-18' },
  { productId: 'P-104', productName: 'Nice', category: 'Biscuits', onHand: 5400, reserved: 800, available: 4600, threshold: 2800, lastUpdated: '2026-10-19' },
]

const initialReports: SapReport[] = [
  {
    id: 'SR-901',
    fileName: 'sap_report_batch_18.xlsx',
    uploadedAt: '2026-10-18',
    status: 'IN_PROGRESS',
    adminName: 'Ayesha M.',
    reviewStarted: true,
    decisionHistory: [],
    items: [
      { id: 'RI-101', agencyId: 'AG-102', agencyName: 'Western Retail Group', productId: 'P-101', productName: 'Cream Cracker', quantity: 1800, contact: 'Asha Perera', duePayment: 4200, decision: 'PENDING' },
      { id: 'RI-102', agencyId: 'AG-203', agencyName: 'Central Trading Hub', productId: 'P-102', productName: 'Chocolate Cream', quantity: 1200, contact: 'Nimal Senanayake', duePayment: 3100, decision: 'PENDING' },
      { id: 'RI-103', agencyId: 'AG-102', agencyName: 'Western Retail Group', productId: 'P-104', productName: 'Nice', quantity: 900, contact: 'Asha Perera', duePayment: 2000, decision: 'PENDING' },
    ],
  },
  {
    id: 'SR-902',
    fileName: 'upcoming_orders.xlsx',
    uploadedAt: '2026-10-20',
    status: 'PENDING',
    adminName: 'Ayesha M.',
    reviewStarted: false,
    decisionHistory: [],
    items: [{ id: 'RI-201', agencyId: 'AG-304', agencyName: 'Southern Distribution Co.', productId: 'P-103', productName: 'Lemon Puff', quantity: 1400, contact: 'Dilhani Fernando', duePayment: 4200, decision: 'PENDING' }],
  },
]

const initialMovements: StockMovement[] = [
  { id: 'MV-110', productId: 'P-101', productName: 'Cream Cracker', admin: 'Ayesha M.', type: 'Production', quantity: 600, movementDate: '2026-10-20', reference: 'Batch B-20261020-CC01' },
  { id: 'MV-111', productId: 'P-103', productName: 'Lemon Puff', admin: 'Ayesha M.', type: 'Adjustment', quantity: -100, movementDate: '2026-10-19', reference: 'Damaged stock count' },
  { id: 'MV-112', productId: 'P-102', productName: 'Chocolate Cream', admin: 'Ayesha M.', type: 'Allocation', quantity: -1200, movementDate: '2026-10-18', reference: 'Agency allocation AO-1002' },
]

const initialAllocations: AllocationRecord[] = [
  { id: 'AO-1001', agencyId: 'AG-102', agencyName: 'Western Retail Group', reportId: 'SR-901', reportName: 'sap_report_batch_18.xlsx', createdAt: '2026-10-20', status: 'Draft', lines: [{ itemId: 'RI-101', agencyId: 'AG-102', agencyName: 'Western Retail Group', productId: 'P-101', productName: 'Cream Cracker', requested: 1800, allocated: 1600 }, { itemId: 'RI-103', agencyId: 'AG-102', agencyName: 'Western Retail Group', productId: 'P-104', productName: 'Nice', requested: 900, allocated: 900 }] },
  { id: 'AO-1002', agencyId: 'AG-203', agencyName: 'Central Trading Hub', reportId: 'SR-901', reportName: 'sap_report_batch_18.xlsx', createdAt: '2026-10-20', status: 'Draft', lines: [{ itemId: 'RI-102', agencyId: 'AG-203', agencyName: 'Central Trading Hub', productId: 'P-102', productName: 'Chocolate Cream', requested: 1200, allocated: 1100 }] },
]

const initialAdminAccounts: ManufacturingAdminAccount[] = [
  { id: 'MA-01', name: 'Ayesha M.', email: 'ayesha@manufacturer.lk', status: 'Assigned' },
  { id: 'MA-02', name: 'Harith Silva', email: 'harith@manufacturer.lk', status: 'Assigned' },
  { id: 'MA-03', name: 'Madhuri Liyanage', email: 'madhuri@manufacturer.lk', status: 'Pending' },
]

function App() {
  const [role, setRole] = useState<Role>('manufacturing-admin')
  const [currentPage, setCurrentPage] = useState<WorkspacePage>('dashboard')
  const [agencies, setAgencies] = useState<Agency[]>(initialAgencies)
  const [reports, setReports] = useState<SapReport[]>(() => loadLocalState('nexus-demo-sap-reports-v1', initialReports))
  const [inventory, setInventory] = useState<InventoryItem[]>(initialInventory)
  const [movements, setMovements] = useState<StockMovement[]>(initialMovements)
  const [allocations, setAllocations] = useState<AllocationRecord[]>(() => loadLocalState('nexus-demo-allocations-v1', initialAllocations))
  const [adminAccounts, setAdminAccounts] = useState<ManufacturingAdminAccount[]>(initialAdminAccounts)
  const [toast, setToast] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [notifications, setNotifications] = useState<AppNotification[]>(() => loadLocalState('nexus-demo-notifications-v1', [
    { id: 'n1', title: 'SAP report review pending', detail: '1 report needs approval before agency allocation.', time: '5 min ago', unread: true },
    { id: 'n2', title: 'Low stock alert', detail: 'Lemon Puff is below the safety threshold.', time: '35 min ago', unread: true },
    { id: 'n3', title: 'Allocation updated', detail: 'Western Retail Group allocation was saved successfully.', time: '2 hrs ago', unread: false },
  ]))
  const [settings, setSettings] = useState({ emailAlerts: true, desktopNotifications: true, autoSync: false })
  const [profileForm, setProfileForm] = useState({ name: 'Ayesha M.', email: 'ayesha@manufacturer.lk', role: 'Manufacturing Admin' })
  const [loginForm, setLoginForm] = useState({ email: '', password: '' })

  const pageList = useMemo(
    () =>
      role === 'super-admin'
        ? ['dashboard', 'super-admin']
        : ['dashboard', 'agencies', 'sap-reports', 'stock-allocation', 'inventory', 'stock-movements', 'handover', 'reports', 'notifications', 'settings'],
    [role],
  ) as WorkspacePage[]

  useEffect(() => {
    if (!pageList.includes(currentPage)) {
      setCurrentPage(pageList[0])
    }
  }, [currentPage, pageList])

  useEffect(() => {
    if (!toast) return
    const timeoutId = window.setTimeout(() => setToast(null), 2800)
    return () => window.clearTimeout(timeoutId)
  }, [toast])

  useEffect(() => {
    try {
      window.localStorage.setItem('nexus-demo-sap-reports-v1', JSON.stringify(reports))
    } catch (error) {
      console.error('Could not persist local demo SAP decisions.', error)
      setToast('Could not save your report decisions in this browser.')
    }
  }, [reports])

  useEffect(() => {
    try {
      window.localStorage.setItem('nexus-demo-allocations-v1', JSON.stringify(allocations))
    } catch (error) {
      console.error('Could not persist the local demo allocation cart.', error)
      setToast('Could not save the allocation cart in this browser.')
    }
  }, [allocations])

  useEffect(() => {
    try {
      window.localStorage.setItem('nexus-demo-notifications-v1', JSON.stringify(notifications))
    } catch (error) {
      console.error('Could not persist local demo notifications.', error)
      setToast('Could not save notifications in this browser.')
    }
  }, [notifications])

  const pageTitleMap: Record<WorkspacePage, string> = {
    dashboard: 'Dashboard',
    agencies: 'Agency Management',
    'sap-reports': 'SAP Reports',
    'stock-allocation': 'Stock Allocation',
    inventory: 'Manufacturing Inventory',
    'stock-movements': 'Stock Movements',
    handover: 'Warehouse Handover',
    reports: 'Reports & History',
    notifications: 'Notifications',
    settings: 'Settings',
    'super-admin': 'Manufacturing Admin Accounts',
  }

  const handleLogin = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!loginForm.email.trim() || !loginForm.password.trim()) {
      setToast('Please enter your email and password to sign in.')
      return
    }
    setIsAuthenticated(true)
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage agencies={agencies} inventory={inventory} reports={reports} allocations={allocations} movements={movements} onNavigate={setCurrentPage} />
      case 'agencies':
        return <AgenciesPage agencies={agencies} setAgencies={setAgencies} allocations={allocations} setToast={setToast} />
      case 'sap-reports':
        return <SapReportsPage reports={reports} setReports={setReports} setToast={setToast} onNavigate={setCurrentPage} />
      case 'stock-allocation':
        return <StockAllocationPage reports={reports} inventory={inventory} allocations={allocations} setReports={setReports} setAllocations={setAllocations} setNotifications={setNotifications} profileName={profileForm.name} setToast={setToast} onNavigate={setCurrentPage} />
      case 'inventory':
        return <InventoryPage inventory={inventory} setInventory={setInventory} setMovements={setMovements} setToast={setToast} />
      case 'stock-movements':
        return <StockMovementPage movements={movements} />
      case 'handover':
        return <HandoverPage allocations={allocations} setAllocations={setAllocations} setToast={setToast} onNavigate={setCurrentPage} />
      case 'reports':
        return <ReportsPage reports={reports} allocations={allocations} inventory={inventory} movements={movements} />
      case 'notifications':
        return <NotificationsPage notifications={notifications} setNotifications={setNotifications} />
      case 'settings':
        return <SettingsPage profileForm={profileForm} setProfileForm={setProfileForm} settings={settings} setSettings={setSettings} setToast={setToast} />
      case 'super-admin':
        return <SuperAdminPage adminAccounts={adminAccounts} setAdminAccounts={setAdminAccounts} setToast={setToast} />
      default:
        return null
    }
  }

  const navGroups = role === 'super-admin'
    ? [
        { label: 'OVERVIEW', items: [{ id: 'dashboard', label: 'Dashboard' }] },
        { label: 'ACCOUNT', items: [{ id: 'super-admin', label: 'Manufacturing Admin Accounts' }] },
      ]
    : [
        { label: 'OVERVIEW', items: [{ id: 'dashboard', label: 'Dashboard' }] },
        { label: 'OPERATIONS', items: [
            { id: 'agencies', label: 'Agency Management' },
            { id: 'sap-reports', label: 'SAP Reports' },
            { id: 'stock-allocation', label: 'Stock Allocation' },
            { id: 'handover', label: 'Warehouse Handover' },
          ] },
        { label: 'INVENTORY', items: [
            { id: 'inventory', label: 'Manufacturing Inventory' },
            { id: 'stock-movements', label: 'Stock Movements' },
          ] },
        { label: 'ANALYTICS', items: [{ id: 'reports', label: 'Reports & History' }] },
        { label: 'ACCOUNT', items: [
            { id: 'notifications', label: 'Notifications' },
            { id: 'settings', label: 'Settings' },
          ] },
      ]

  if (!isAuthenticated) {
    return (
      <div className="login-shell">
        <div className="login-card">
          <div className="login-brand">
            <div className="brand-mark">N</div>
            <div>
              <div className="brand-name">Nexus</div>
              <div className="brand-subtitle">Manufacturer Admin</div>
            </div>
          </div>
          <div className="login-copy">
            <p className="eyebrow">Sign in</p>
            <h2>Manufacturing Admin Portal</h2>
          </div>
          <form className="login-form" onSubmit={handleLogin}>
            <label>
              Email
              <input type="email" value={loginForm.email} onChange={(event) => setLoginForm({ ...loginForm, email: event.target.value })} placeholder="name@manufacturer.lk" />
            </label>
            <label>
              Password
              <input type="password" value={loginForm.password} onChange={(event) => setLoginForm({ ...loginForm, password: event.target.value })} placeholder="Enter password" />
            </label>
            <button type="submit" className="primary-button login-button">Sign in</button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <div className="brand-mark">N</div>
          <div>
            <div className="brand-name">Nexus</div>
            <div className="brand-subtitle">Manufacturer Admin</div>
          </div>
        </div>

        <nav className="nav-list" aria-label="Primary navigation">
          {navGroups.map((group) => (
            <div className="nav-group" key={group.label}>
              <div className="nav-group-label">{group.label}</div>
              {group.items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`nav-item ${currentPage === item.id ? 'selected' : ''}`}
                  onClick={() => setCurrentPage(item.id as WorkspacePage)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          ))}
        </nav>

        <div className="role-switcher-block">
          <div className="nav-group-label">Switch Role</div>
          <div className="role-switcher">
            <button type="button" className={role === 'manufacturing-admin' ? 'selected-role' : ''} onClick={() => setRole('manufacturing-admin')}>
              Manufacturing Admin
            </button>
            <button type="button" className={role === 'super-admin' ? 'selected-role' : ''} onClick={() => setRole('super-admin')}>
              Super Admin
            </button>
          </div>
        </div>
      </aside>

      <main className="main-panel">
        <header className="topbar">
          <h1>{pageTitleMap[currentPage]}</h1>
          <div className="mini-user">
            <span>AM</span>
            <small>Ayesha M.</small>
          </div>
        </header>

        {toast ? <div className="toast">{toast}</div> : null}
        <div className="page-body">{renderPage()}</div>
      </main>
    </div>
  )
}

function NotificationsPage({ notifications, setNotifications }: { notifications: AppNotification[]; setNotifications: React.Dispatch<React.SetStateAction<AppNotification[]>> }) {
  return (
    <div className="page-stack">
      <section className="panel">
        <div className="panel-heading split">
          <h2>Notifications</h2>
          <button type="button" className="secondary-button" onClick={() => setNotifications((current) => current.map((item) => ({ ...item, unread: false })))}>
            Mark all as read
          </button>
        </div>

        <div className="notification-list-page">
          {notifications.length ? notifications.map((item) => (
            <div key={item.id} className={`notification-page-item ${item.unread ? 'unread' : ''}`}>
              <div>
                <strong>{item.title}</strong>
                <p>{item.detail}</p>
              </div>
              <div className="notification-meta">
                <span>{item.time}</span>
                <small>{item.unread ? 'Unread' : 'Read'}</small>
              </div>
            </div>
          )) : <p className="empty-text">No notifications available.</p>}
        </div>
      </section>
    </div>
  )
}

function SettingsPage({ profileForm, setProfileForm, settings, setSettings, setToast }: { profileForm: { name: string; email: string; role: string }; setProfileForm: React.Dispatch<React.SetStateAction<{ name: string; email: string; role: string }>>; settings: { emailAlerts: boolean; desktopNotifications: boolean; autoSync: boolean }; setSettings: React.Dispatch<React.SetStateAction<{ emailAlerts: boolean; desktopNotifications: boolean; autoSync: boolean }>>; setToast: (message: string) => void }) {
  return (
    <div className="page-stack">
      <section className="panel">
        <div className="panel-heading">
          <h2>Profile Management</h2>
        </div>
        <div className="settings-form-grid">
          <label>
            Name
            <input value={profileForm.name} onChange={(event) => setProfileForm((current) => ({ ...current, name: event.target.value }))} />
          </label>
          <label>
            Email
            <input value={profileForm.email} onChange={(event) => setProfileForm((current) => ({ ...current, email: event.target.value }))} />
          </label>
          <label>
            Assigned role
            <input value={profileForm.role} onChange={(event) => setProfileForm((current) => ({ ...current, role: event.target.value }))} />
          </label>
          <label>
            Change password
            <input type="password" placeholder="Enter new password" />
          </label>
        </div>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <h2>Account Settings</h2>
        </div>
        <div className="settings-toggle-list">
          <label className="toggle-row"><span>Email alerts</span><input type="checkbox" checked={settings.emailAlerts} onChange={(event) => setSettings((current) => ({ ...current, emailAlerts: event.target.checked }))} /></label>
          <label className="toggle-row"><span>Desktop notifications</span><input type="checkbox" checked={settings.desktopNotifications} onChange={(event) => setSettings((current) => ({ ...current, desktopNotifications: event.target.checked }))} /></label>
          <label className="toggle-row"><span>Auto sync</span><input type="checkbox" checked={settings.autoSync} onChange={(event) => setSettings((current) => ({ ...current, autoSync: event.target.checked }))} /></label>
        </div>
        <div className="form-actions-right">
          <button type="button" className="primary-button" onClick={() => setToast('Settings saved successfully.')}>Save settings</button>
        </div>
      </section>
    </div>
  )
}

function DashboardPage({ agencies, inventory, reports, allocations, movements, onNavigate }: { agencies: Agency[]; inventory: InventoryItem[]; reports: SapReport[]; allocations: AllocationRecord[]; movements: StockMovement[]; onNavigate: (page: WorkspacePage) => void }) {
  const totalAvailable = inventory.reduce((sum, item) => sum + item.available, 0)
  const totalReserved = inventory.reduce((sum, item) => sum + item.reserved, 0)
  const pendingReports = reports.filter((report) => report.status === 'PENDING').length
  const lowStockAlerts = inventory.filter((item) => item.available <= item.threshold).length
  const recentActivities = movements.slice(0, 4)

  const cards = [
    { label: 'Total Agencies', value: agencies.length.toString(), description: 'Active and pending agencies' },
    { label: 'Total Products', value: inventory.length.toString(), description: 'Manufacturing product catalogue' },
    { label: 'Available Stock', value: formatNumber(totalAvailable), description: 'Current available units' },
    { label: 'Reserved Stock', value: formatNumber(totalReserved), description: 'Allocated but not released' },
    { label: 'Pending SAP Reports', value: pendingReports.toString(), description: 'Awaiting review' },
    { label: 'Agency Stock Allocations', value: allocations.length.toString(), description: 'Open and completed allocations' },
    { label: 'Low Stock Alerts', value: lowStockAlerts.toString(), description: 'Below threshold or critical' },
  ]

  return (
    <div className="page-stack">
      <section className="summary-grid" aria-label="Operational metrics">
        {cards.map((card) => (
          <article key={card.label} className="metric-card">
            <span>{card.label}</span>
            <strong>{card.value}</strong>
            <small>{card.description}</small>
          </article>
        ))}
      </section>

      <div className="panel-grid two-column">
        <section className="panel">
          <div className="panel-heading">
            <h2>Recent activities</h2>
            <button type="button" className="link-button" onClick={() => onNavigate('stock-movements')}>View all</button>
          </div>
          <div className="stack-list">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="list-row">
                <div>
                  <strong>{activity.productName}</strong>
                  <small>{activity.type} · {activity.admin}</small>
                </div>
                <span className={`status-badge ${activity.type.toLowerCase()}`}>{activity.quantity > 0 ? '+' : ''}{formatNumber(activity.quantity)}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="panel">
          <div className="panel-heading">
            <h2>Operational actions</h2>
          </div>
          <div className="action-list">
            <button type="button" className="action-button" onClick={() => onNavigate('agencies')}>Agency management</button>
            <button type="button" className="action-button" onClick={() => onNavigate('sap-reports')}>SAP report review</button>
            <button type="button" className="action-button" onClick={() => onNavigate('stock-allocation')}>Agency stock allocation</button>
            <button type="button" className="action-button" onClick={() => onNavigate('inventory')}>Inventory management</button>
          </div>
        </section>
      </div>
    </div>
  )
}

function AgenciesPage({ agencies, setAgencies, allocations, setToast }: { agencies: Agency[]; setAgencies: React.Dispatch<React.SetStateAction<Agency[]>>; allocations: AllocationRecord[]; setToast: (message: string) => void }) {
  const [query, setQuery] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [selectedAgencyId, setSelectedAgencyId] = useState<string>(agencies[0]?.id ?? '')
  const [form, setForm] = useState({ name: '', contact: '', email: '', phone: '', region: '', status: 'Active' as AgencyStatus })

  const filteredAgencies = agencies.filter((agency) => `${agency.name} ${agency.contact} ${agency.email} ${agency.region}`.toLowerCase().includes(query.toLowerCase()))
  const selectedAgency = agencies.find((agency) => agency.id === selectedAgencyId) ?? agencies[0]

  const handleSaveAgency = () => {
    if (!form.name.trim() || !form.contact.trim() || !form.email.trim()) {
      setToast('Agency details are incomplete. Please complete all required fields.')
      return
    }

    const newAgency: Agency = {
      id: `AG-${Math.floor(Math.random() * 900 + 100)}`,
      name: form.name.trim(),
      contact: form.contact.trim(),
      email: form.email.trim(),
      phone: form.phone.trim() || 'Not provided',
      region: form.region.trim() || 'Unassigned',
      status: form.status,
      createdAt: new Date().toISOString().slice(0, 10),
    }

    setAgencies((current) => [newAgency, ...current])
    setSelectedAgencyId(newAgency.id)
    setForm({ name: '', contact: '', email: '', phone: '', region: '', status: 'Active' })
    setShowForm(false)
    setToast('Agency created successfully.')
  }

  const handleDeleteAgency = (agencyId: string) => {
    const agency = agencies.find((entry) => entry.id === agencyId)
    const confirmed = window.confirm(agency ? `Delete ${agency.name}? This action cannot be undone.` : 'Delete this agency?')
    if (!confirmed) return
    setAgencies((current) => current.filter((entry) => entry.id !== agencyId))
    setSelectedAgencyId((current) => (current === agencyId ? '' : current))
    setToast('Agency deleted successfully.')
  }

  return (
    <div className="page-stack">
      <section className="panel">
        <div className="panel-heading split">
          <h2>Agency management</h2>
          <button type="button" className="primary-button" onClick={() => setShowForm((current) => !current)}>{showForm ? 'Close form' : 'Add new agency'}</button>
        </div>

        {showForm ? (
          <div className="form-grid">
            <label>Agency name<input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label>
            <label>Contact person<input value={form.contact} onChange={(event) => setForm({ ...form, contact: event.target.value })} /></label>
            <label>Email<input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></label>
            <label>Phone<input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} /></label>
            <label>Region<input value={form.region} onChange={(event) => setForm({ ...form, region: event.target.value })} /></label>
            <label>Status<select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as AgencyStatus })}><option value="Active">Active</option><option value="Inactive">Inactive</option><option value="Pending">Pending</option></select></label>
            <div className="inline-actions agency-form-actions">
              <button type="button" className="secondary-button" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="button" className="primary-button" onClick={handleSaveAgency}>Save agency</button>
            </div>
          </div>
        ) : null}
      </section>

      <div className="panel-grid two-column">
        <section className="panel">
          <div className="panel-heading split">
            <h2>Agency list</h2>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search agencies" className="search-input agency-list-search" />
          </div>
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Agency</th><th>Region</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>
                {filteredAgencies.map((agency) => (
                  <tr key={agency.id} className={selectedAgency?.id === agency.id ? 'selected-row' : ''} onClick={() => setSelectedAgencyId(agency.id)}>
                    <td className="agency-name-cell"><strong title={agency.name}>{agency.name}</strong><small>{agency.contact}</small></td>
                    <td>{agency.region}</td>
                    <td><span className={`status-badge ${agency.status.toLowerCase()}`}>{agency.status}</span></td>
                    <td><div className="table-actions"><button type="button" className="link-button" onClick={() => setSelectedAgencyId(agency.id)}>View</button><button type="button" className="link-button danger" onClick={() => handleDeleteAgency(agency.id)}>Delete</button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="panel">
          {selectedAgency ? (
            <>
              <div className="panel-heading"><h2>{selectedAgency.name}</h2><span className={`status-badge ${selectedAgency.status.toLowerCase()}`}>{selectedAgency.status}</span></div>
              <dl className="detail-list">
                <div><dt>Contact</dt><dd>{selectedAgency.contact}</dd></div>
                <div><dt>Email</dt><dd>{selectedAgency.email}</dd></div>
                <div><dt>Phone</dt><dd>{selectedAgency.phone}</dd></div>
                <div><dt>Region</dt><dd>{selectedAgency.region}</dd></div>
                <div><dt>Created</dt><dd>{selectedAgency.createdAt}</dd></div>
              </dl>

              <div className="section-title">Agency allocation history</div>
              {allocations.filter((allocation) => allocation.agencyId === selectedAgency.id).length ? (
                <div className="stack-list compact">{allocations.filter((allocation) => allocation.agencyId === selectedAgency.id).map((allocation) => <div key={allocation.id} className="list-row"><div><strong>{allocation.reportName}</strong><small>{allocation.status}</small></div><span>{allocation.lines.length} items</span></div>)}</div>
              ) : <p className="empty-text">No allocation history for this agency yet.</p>}
            </>
          ) : <p className="empty-text">No agency selected.</p>}
        </section>
      </div>
    </div>
  )
}

function SapReportsPage({ reports, setReports, setToast, onNavigate }: { reports: SapReport[]; setReports: React.Dispatch<React.SetStateAction<SapReport[]>>; setToast: (message: string) => void; onNavigate: (page: WorkspacePage) => void }) {
  const [selectedReportId, setSelectedReportId] = useState<string>(reports[0]?.id ?? '')
  const selectedReport = reports.find((report) => report.id === selectedReportId) ?? reports[0]

  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    const newReport: SapReport = { id: `SR-${Date.now()}`, fileName: file.name, uploadedAt: new Date().toISOString().slice(0, 10), status: 'PENDING', adminName: 'Ayesha M.', items: [], reviewStarted: false, decisionHistory: [] }
    setReports((current) => [newReport, ...current])
    setSelectedReportId(newReport.id)
    setToast(`Uploaded ${file.name} and saved it for review.`)
    event.target.value = ''
  }

  return (
    <div className="page-stack">
      <section className="panel">
        <div className="panel-heading split">
          <h2>SAP report management</h2>
          <label className="upload-button"><input type="file" accept=".xlsx,.xls,.csv" onChange={handleUpload} />Upload SAP report</label>
        </div>
        <div className="table-wrapper"><table><thead><tr><th>File</th><th>Upload date</th><th>Admin</th><th>Status</th><th>Items</th></tr></thead><tbody>{reports.map((report) => (
          <tr key={report.id} className={selectedReport?.id === report.id ? 'selected-row' : ''} onClick={() => setSelectedReportId(report.id)}>
            <td onClick={() => setSelectedReportId(report.id)}>{report.fileName}</td>
            <td onClick={() => setSelectedReportId(report.id)}>{report.uploadedAt}</td>
            <td onClick={() => setSelectedReportId(report.id)}>{report.adminName}</td>
            <td><span className={`status-badge ${report.status.toLowerCase().replace(/_/g, '-')}`}>{getSapStatusLabel(report.status)}</span></td>
            <td onClick={() => setSelectedReportId(report.id)}>{report.items.length}</td>
          </tr>))}</tbody></table></div>
      </section>

      {selectedReport ? (
        <section className="panel sap-status-panel">
          <div className="panel-heading split"><h2>{selectedReport.fileName}</h2><span className={`status-badge ${selectedReport.status.toLowerCase().replace(/_/g, '-')}`}>{getSapStatusLabel(selectedReport.status)}</span></div>
          <dl className="detail-list"><div><dt>Uploaded</dt><dd>{selectedReport.uploadedAt}</dd></div><div><dt>Reviewer</dt><dd>{selectedReport.adminName}</dd></div><div><dt>Report status</dt><dd>{getSapStatusLabel(selectedReport.status)}</dd></div></dl>
          <div className="section-title">Report items</div>
          <div className="table-wrapper"><table><thead><tr><th>Agency</th><th>Product</th><th>Requested</th><th>Decision</th><th>Allocated / reason</th><th>Contact</th><th>Due payment</th></tr></thead><tbody>{selectedReport.items.length ? selectedReport.items.map((item) => <tr key={item.id}><td>{item.agencyName}</td><td>{item.productName}</td><td>{formatNumber(item.quantity)}</td><td>{getSapStatusLabel(item.decision)}</td><td>{item.decision === 'REJECTED' ? item.rejectionReason : item.allocatedQuantity === undefined ? '—' : formatNumber(item.allocatedQuantity)}</td><td>{item.contact}</td><td>{formatCurrency(item.duePayment)}</td></tr>) : <tr><td colSpan={7}>No items uploaded for this report yet.</td></tr>}</tbody></table></div>
          <div className="decision-history">
            <h3>Decision history</h3>
            {selectedReport.decisionHistory.length ? selectedReport.decisionHistory.slice().reverse().map((entry) => (
              <div className="decision-history-row" key={entry.id}>
                <div><strong>{entry.action}</strong><span>{entry.subject}{entry.reason ? ` · ${entry.reason}` : ''}</span></div>
                <small>{entry.decisionMaker} · {new Date(entry.decidedAt).toLocaleString()}</small>
              </div>
            )) : <p className="empty-text">No decisions recorded for this report.</p>}
          </div>
          <div className="report-navigation-actions">
            <button type="button" className="secondary-button" onClick={() => onNavigate('stock-allocation')}>Go to Stock Allocation</button>
          </div>
        </section>
      ) : null}
    </div>
  )
}

type RejectionTarget = { scope: 'item'; itemId: string } | { scope: 'report' }

function StockAllocationPage({ reports, inventory, allocations, setReports, setAllocations, setNotifications, profileName, setToast, onNavigate }: {
  reports: SapReport[]
  inventory: InventoryItem[]
  allocations: AllocationRecord[]
  setReports: React.Dispatch<React.SetStateAction<SapReport[]>>
  setAllocations: React.Dispatch<React.SetStateAction<AllocationRecord[]>>
  setNotifications: React.Dispatch<React.SetStateAction<AppNotification[]>>
  profileName: string
  setToast: (message: string) => void
  onNavigate: (page: WorkspacePage) => void
}) {
  const [selectedReportId, setSelectedReportId] = useState<string>(reports[0]?.id ?? '')
  const [draftValues, setDraftValues] = useState<Record<string, string>>({})
  const [rejectionTarget, setRejectionTarget] = useState<RejectionTarget | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [customReason, setCustomReason] = useState('')
  const selectedReport = reports.find((report) => report.id === selectedReportId) ?? reports[0]

  const reportAllocations = allocations.filter((allocation) => allocation.reportId === selectedReport?.id)
  const reportLines = reportAllocations.flatMap((allocation) => allocation.lines)
  const savedLineForItem = (itemId: string) => reportLines.find((line) => line.itemId === itemId)
  const reportIsFinalized = reportAllocations.some((allocation) => allocation.status !== 'Draft')

  useEffect(() => {
    if (!selectedReport || selectedReport.reviewStarted) return
    setReports((current) => current.map((report) => report.id === selectedReport.id
      ? { ...report, reviewStarted: true, status: getSapStatus(report.items, true) }
      : report))
  }, [selectedReport?.id, selectedReport?.reviewStarted, setReports])

  const availableForItem = (item: SapReportItem) => {
    const stock = inventory.find((entry) => entry.productId === item.productId)
    if (!stock) return 0
    const allocatedElsewhere = allocations.flatMap((allocation) => allocation.lines)
      .filter((line) => line.productId === item.productId && line.itemId !== item.id)
      .reduce((total, line) => total + line.allocated, 0)
    return Math.max(0, stock.available - allocatedElsewhere)
  }

  const getQuantity = (item: SapReportItem) => {
    const saved = savedLineForItem(item.id)
    return Number(draftValues[item.id] ?? saved?.allocated ?? item.allocatedQuantity ?? item.quantity)
  }

  const isValidQuantity = (item: SapReportItem, quantity: number) =>
    Number.isSafeInteger(item.quantity) && item.quantity > 0
    && Number.isSafeInteger(quantity) && quantity > 0
    && quantity <= item.quantity && quantity <= availableForItem(item)

  const upsertLine = (current: AllocationRecord[], item: SapReportItem, allocated: number) => {
    const matching = current.find((allocation) => allocation.reportId === selectedReport?.id && allocation.agencyId === item.agencyId)
    if (matching && matching.status !== 'Draft') return current
    const line = { itemId: item.id, agencyId: item.agencyId, agencyName: item.agencyName, productId: item.productId, productName: item.productName, requested: item.quantity, allocated }
    if (!matching || !selectedReport) {
      if (!selectedReport) return current
      return [...current, {
        id: `AO-${selectedReport.id}-${item.agencyId}`,
        agencyId: item.agencyId,
        agencyName: item.agencyName,
        reportId: selectedReport.id,
        reportName: selectedReport.fileName,
        createdAt: new Date().toISOString().slice(0, 10),
        status: 'Draft',
        lines: [line],
      }]
    }
    return current.map((allocation) => allocation.id === matching.id
      ? { ...allocation, lines: [...allocation.lines.filter((entry) => entry.itemId !== item.id), line] }
      : allocation)
  }

  const saveDraft = (item: SapReportItem) => {
    if (!selectedReport || reportIsFinalized) return
    const quantity = getQuantity(item)
    if (!isValidQuantity(item, quantity)) {
      setToast('Enter a whole-number allocation within the requested quantity and remaining stock.')
      return
    }
    if (item.decision === 'REJECTED') {
      setToast('A rejected item cannot be added to the draft cart.')
      return
    }
    setAllocations((current) => upsertLine(current, item, quantity))
    setToast(`Saved ${item.productName} to the local draft cart.`)
  }

  const acceptItem = (item: SapReportItem) => {
    if (!selectedReport || reportIsFinalized || item.decision === 'REJECTED') return
    const quantity = getQuantity(item)
    if (!isValidQuantity(item, quantity)) {
      setToast('Enter a whole-number allocation within the requested quantity and remaining stock.')
      return
    }
    const decidedAt = new Date().toISOString()
    setAllocations((current) => upsertLine(current, item, quantity))
    setReports((current) => current.map((report) => {
      if (report.id !== selectedReport.id) return report
      const items = report.items.map((entry) => entry.id === item.id
        ? { ...entry, decision: 'ACCEPTED' as const, allocatedQuantity: quantity, rejectionReason: undefined }
        : entry)
      const decisionHistory = [...report.decisionHistory, {
        id: `${Date.now()}-${item.id}`,
        subject: `${item.productName} (${item.agencyName})`,
        action: 'Item accepted',
        decisionMaker: profileName,
        decidedAt,
      }]
      return { ...report, items, decisionHistory, status: getSapStatus(items, true), reviewStarted: true }
    }))
    setToast(`${item.productName} accepted.`)
  }

  const removeDraftItem = (item: SapReportItem) => {
    if (!selectedReport || reportIsFinalized) return
    const decidedAt = new Date().toISOString()
    setAllocations((current) => current.map((allocation) => allocation.reportId === selectedReport.id
      ? { ...allocation, lines: allocation.lines.filter((line) => line.itemId !== item.id) }
      : allocation).filter((allocation) => allocation.reportId !== selectedReport.id || allocation.lines.length > 0))
    setReports((current) => current.map((report) => {
      if (report.id !== selectedReport.id) return report
      const items = report.items.map((entry) => entry.id === item.id && entry.decision === 'ACCEPTED'
        ? { ...entry, decision: 'PENDING' as const, allocatedQuantity: undefined }
        : entry)
      const decisionHistory = [...report.decisionHistory, {
        id: `${Date.now()}-${item.id}`,
        subject: `${item.productName} (${item.agencyName})`,
        action: 'Draft allocation removed; no rejection recorded',
        decisionMaker: profileName,
        decidedAt,
      }]
      return { ...report, items, decisionHistory, status: getSapStatus(items, true), reviewStarted: true }
    }))
    setToast('Removed the draft allocation. No rejection was recorded.')
  }

  const clearDraft = () => {
    if (!selectedReport || reportIsFinalized) return
    if (!window.confirm('Remove all draft allocations for this SAP report? Accepted draft items will return to pending review; rejected decisions will remain recorded.')) return
    const decidedAt = new Date().toISOString()
    setAllocations((current) => current.filter((allocation) => allocation.reportId !== selectedReport.id || allocation.status !== 'Draft'))
    setReports((current) => current.map((report) => {
      if (report.id !== selectedReport.id) return report
      const items = report.items.map((item) => item.decision === 'ACCEPTED'
        ? { ...item, decision: 'PENDING' as const, allocatedQuantity: undefined }
        : item)
      const decisionHistory = [...report.decisionHistory, {
        id: `${Date.now()}-clear`,
        subject: report.fileName,
        action: 'Draft report allocation cleared; no rejection recorded',
        decisionMaker: profileName,
        decidedAt,
      }]
      return { ...report, items, decisionHistory, status: getSapStatus(items, true), reviewStarted: true }
    }))
    setToast('Cleared the report draft cart. Rejections were preserved.')
  }

  const acceptAllEligible = () => {
    if (!selectedReport || reportIsFinalized) return
    const remaining = new Map(inventory.map((stock) => [
      stock.productId,
      stock.available - allocations.flatMap((allocation) => allocation.reportId === selectedReport.id ? [] : allocation.lines)
        .filter((line) => line.productId === stock.productId)
        .reduce((total, line) => total + line.allocated, 0),
    ]))
    const acceptedItems: { item: SapReportItem; quantity: number }[] = []
    selectedReport.items.forEach((item) => {
      if (item.decision === 'REJECTED') return
      const left = remaining.get(item.productId) ?? 0
      const saved = savedLineForItem(item.id)
      const quantity = item.decision === 'ACCEPTED'
        ? (item.allocatedQuantity ?? saved?.allocated ?? 0)
        : (saved?.allocated ?? Math.min(item.quantity, left))
      if (!isValidQuantity(item, quantity) || quantity > left) return
      acceptedItems.push({ item, quantity })
      remaining.set(item.productId, left - quantity)
    })
    if (!acceptedItems.length) {
      setToast('No eligible items have valid quantities within available stock.')
      return
    }
    const decidedAt = new Date().toISOString()
    setAllocations((current) => acceptedItems.reduce((next, entry) => upsertLine(next, entry.item, entry.quantity), current))
    setReports((current) => current.map((report) => {
      if (report.id !== selectedReport.id) return report
      const acceptedIds = new Set(acceptedItems.map(({ item }) => item.id))
      const items = report.items.map((item) => acceptedIds.has(item.id)
        ? { ...item, decision: 'ACCEPTED' as const, allocatedQuantity: acceptedItems.find((entry) => entry.item.id === item.id)?.quantity, rejectionReason: undefined }
        : item)
      const history = acceptedItems.map(({ item }) => ({
        id: `${Date.now()}-${item.id}`,
        subject: `${item.productName} (${item.agencyName})`,
        action: 'Item accepted by report-level review',
        decisionMaker: profileName,
        decidedAt,
      }))
      return { ...report, items, decisionHistory: [...report.decisionHistory, ...history], status: getSapStatus(items, true), reviewStarted: true }
    }))
    setToast(`Accepted ${acceptedItems.length} eligible item${acceptedItems.length === 1 ? '' : 's'}.`)
  }

  const openRejection = (target: RejectionTarget) => {
    setRejectionTarget(target)
    setRejectionReason('')
    setCustomReason('')
  }

  const confirmRejection = () => {
    if (!selectedReport || !rejectionTarget || reportIsFinalized) return
    const reason = rejectionReason === 'Other' ? customReason.trim() : rejectionReason
    if (!reason) {
      setToast('Select a rejection reason and provide a custom reason when needed.')
      return
    }
    const decidedAt = new Date().toISOString()
    const isReportRejection = rejectionTarget.scope === 'report'
    const item = isReportRejection ? undefined : selectedReport.items.find((entry) => entry.id === rejectionTarget.itemId)
    const subject = isReportRejection ? selectedReport.fileName : `${item?.productName ?? 'Requested item'} (${item?.agencyName ?? 'Agency'})`
    setAllocations((current) => current.map((allocation) => allocation.reportId === selectedReport.id
      ? { ...allocation, lines: allocation.lines.filter((line) => isReportRejection || line.itemId !== item?.id) }
      : allocation).filter((allocation) => allocation.reportId !== selectedReport.id || allocation.lines.length > 0))
    setReports((current) => current.map((report) => {
      if (report.id !== selectedReport.id) return report
      const items = report.items.map((entry) => {
        const affected = isReportRejection || entry.id === item?.id
        return affected
          ? { ...entry, decision: 'REJECTED' as const, allocatedQuantity: undefined, rejectionReason: reason }
          : entry
      })
      const decisionHistory = [...report.decisionHistory, {
        id: `${Date.now()}-reject`,
        subject,
        action: isReportRejection ? 'Entire report rejected' : 'Item rejected',
        reason,
        decisionMaker: profileName,
        decidedAt,
      }]
      return { ...report, items, decisionHistory, status: getSapStatus(items, true), reviewStarted: true }
    }))
    setNotifications((current) => [{
      id: `notification-${Date.now()}`,
      title: isReportRejection ? 'SAP report rejected' : 'SAP request item rejected',
      detail: `${subject} was rejected. Reason: ${reason}. No message was sent to the agency.`,
      time: new Date().toLocaleString(),
      unread: true,
    }, ...current])
    setRejectionTarget(null)
    setRejectionReason('')
    setCustomReason('')
    setToast('Rejection recorded. No message was sent to the agency.')
  }

  const cartTotal = reportLines.reduce((total, line) => total + line.allocated, 0)
  const acceptedItems = selectedReport?.items.filter((item) => item.decision === 'ACCEPTED') ?? []
  const allocationsFitStock = selectedReport?.items.every((item) => {
    if (item.decision !== 'ACCEPTED') return true
    const line = savedLineForItem(item.id)
    return Boolean(line && line.allocated === item.allocatedQuantity && isValidQuantity(item, line.allocated))
  }) ?? false
  const isAllocationReady = Boolean(selectedReport && selectedReport.items.length > 0 && acceptedItems.length > 0
    && selectedReport.items.every((item) => item.decision !== 'PENDING')
    && allocationsFitStock && !reportIsFinalized)

  const finalizeAllocation = () => {
    if (!selectedReport || !isAllocationReady) return
    if (!window.confirm('Finalize this reviewed allocation and open the Warehouse Handover report? No warehouse message will be sent.')) return
    setAllocations((current) => current.map((allocation) => allocation.reportId === selectedReport.id && allocation.status === 'Draft'
      ? { ...allocation, status: 'Ready for Handover' }
      : allocation))
    setToast('Allocation finalized. No warehouse message was sent.')
    onNavigate('handover')
  }

  return (
    <div className="page-stack">
      <section className="panel">
        <div className="panel-heading split">
          <h2>Review SAP report items</h2>
          <select value={selectedReportId} onChange={(event) => setSelectedReportId(event.target.value)}>{reports.map((report) => <option value={report.id} key={report.id}>{report.fileName}</option>)}</select>
        </div>
        {selectedReport ? (
          <>
            <div className="allocation-report-summary">
              <span><strong>Report status</strong> {getSapStatusLabel(selectedReport.status)}</span>
              <span><strong>Saved draft items</strong> {reportLines.length}</span>
              <span><strong>Draft quantity</strong> {formatNumber(cartTotal)}</span>
            </div>
            <div className="allocation-report-actions">
              <button type="button" className="secondary-button" onClick={acceptAllEligible} disabled={reportIsFinalized || !selectedReport.items.some((item) => item.decision !== 'REJECTED')}>Accept all eligible</button>
              <button type="button" className="secondary-button" onClick={() => openRejection({ scope: 'report' })} disabled={reportIsFinalized || selectedReport.items.length === 0}>Reject entire report</button>
            </div>
          </>
        ) : null}
      </section>

      {selectedReport?.items.length ? (
        <section className="panel">
          <div className="panel-heading"><h2>Requested items and decisions</h2></div>
          <div className="table-wrapper">
            <table className="allocation-decision-table">
              <thead><tr><th>Agency / product</th><th>Requested</th><th>Available</th><th>Allocate</th><th>Decision</th><th>Actions</th></tr></thead>
              <tbody>{selectedReport.items.map((item) => {
                const saved = savedLineForItem(item.id)
                const quantity = getQuantity(item)
                const valid = isValidQuantity(item, quantity)
                const locked = reportIsFinalized || item.decision === 'REJECTED'
                return (
                  <tr key={item.id}>
                    <td><strong>{item.productName}</strong><small>{item.agencyName} · {item.productId}</small>{item.rejectionReason ? <small className="rejection-reason">{item.rejectionReason}</small> : null}</td>
                    <td>{formatNumber(item.quantity)}</td>
                    <td>{formatNumber(availableForItem(item))}</td>
                    <td><input aria-label={`Allocated quantity for ${item.productName}`} className="allocation-quantity-input" type="number" min={1} max={Math.min(item.quantity, availableForItem(item))} step={1} value={draftValues[item.id] ?? saved?.allocated ?? item.allocatedQuantity ?? item.quantity} disabled={locked || item.decision === 'ACCEPTED'} onChange={(event) => setDraftValues((current) => ({ ...current, [item.id]: event.target.value }))} /></td>
                    <td>{getSapStatusLabel(item.decision)}{saved ? <small className="saved-draft-label">In draft cart</small> : null}</td>
                    <td>
                      <div className="table-actions allocation-item-actions">
                        {item.decision === 'PENDING' ? <button type="button" className="secondary-button" disabled={locked || !valid} onClick={() => saveDraft(item)}>Save draft</button> : null}
                        {item.decision === 'PENDING' ? <button type="button" className="primary-button" disabled={locked || !valid} onClick={() => acceptItem(item)}>Accept</button> : null}
                        {item.decision !== 'REJECTED' ? <button type="button" className="secondary-button" disabled={locked} onClick={() => openRejection({ scope: 'item', itemId: item.id })}>Reject</button> : null}
                        {saved && !reportIsFinalized ? <button type="button" className="link-button danger" onClick={() => removeDraftItem(item)}>Remove draft</button> : null}
                      </div>
                    </td>
                  </tr>
                )
              })}</tbody>
            </table>
          </div>
        </section>
      ) : <section className="panel"><p className="empty-text">No requested items are available for the selected SAP report.</p></section>}

      <section className="panel">
        <div className="panel-heading split">
          <h2>Saved allocation cart</h2>
          <button type="button" className="secondary-button" onClick={clearDraft} disabled={!reportLines.length || reportIsFinalized}>Clear report draft</button>
        </div>
        {reportLines.length ? (
          <div className="table-wrapper"><table><thead><tr><th>Agency</th><th>Product</th><th>Requested</th><th>Allocated</th><th>Action</th></tr></thead><tbody>{reportLines.map((line) => {
            const item = selectedReport?.items.find((entry) => entry.id === line.itemId)
            return <tr key={line.itemId}><td>{line.agencyName}</td><td>{line.productName}<small>{line.productId}</small></td><td>{formatNumber(line.requested)}</td><td>{formatNumber(line.allocated)}</td><td>{item && !reportIsFinalized ? <button type="button" className="link-button danger" onClick={() => removeDraftItem(item)}>Remove item</button> : <span>{reportAllocations.find((allocation) => allocation.status !== 'Draft')?.status ?? ''}</span>}</td></tr>
          })}</tbody></table></div>
        ) : <p className="empty-text">No saved draft items. Save an allocation quantity to add it to the cart.</p>}
      </section>

      <div className="allocation-navigation">
        <button type="button" className="secondary-button" onClick={() => onNavigate('sap-reports')}>Back to SAP Reports</button>
        <div>
          {!isAllocationReady && <span className="allocation-navigation-hint">Resolve every requested item and save valid accepted quantities before finalizing.</span>}
          <button type="button" className="primary-button allocation-proceed-button" disabled={!isAllocationReady} onClick={finalizeAllocation}>Finalize &amp; Proceed to Warehouse Handover</button>
        </div>
      </div>

      {rejectionTarget ? (
        <div className="modal-backdrop" role="presentation">
          <section className="decision-modal" role="dialog" aria-modal="true" aria-labelledby="rejection-modal-title">
            <div className="panel-heading"><h2 id="rejection-modal-title">Confirm rejection</h2></div>
            <p><strong>Scope:</strong> {rejectionTarget.scope === 'report' ? `Entire SAP report — ${selectedReport?.fileName ?? ''}` : 'Individual requested item'}</p>
            {rejectionTarget.scope === 'item' ? (() => {
              const item = selectedReport?.items.find((entry) => entry.id === rejectionTarget.itemId)
              return item ? <p><strong>Product:</strong> {item.productName} · <strong>Requested:</strong> {formatNumber(item.quantity)}</p> : null
            })() : null}
            <label>Rejection reason
              <select value={rejectionReason} onChange={(event) => setRejectionReason(event.target.value)}>
                <option value="">Select a reason</option>
                <option>Insufficient available stock</option>
                <option>Requested quantity exceeds available stock</option>
                <option>Invalid product request</option>
                <option>Stock allocation not possible</option>
                <option value="Other">Other (custom reason)</option>
              </select>
            </label>
            {rejectionReason === 'Other' ? <label>Custom reason<textarea rows={3} value={customReason} onChange={(event) => setCustomReason(event.target.value)} placeholder="Enter the reason for rejection" /></label> : null}
            <p className="decision-modal-note">A notification record will be added here; no message will be sent to the Agency.</p>
            <div className="decision-modal-actions">
              <button type="button" className="secondary-button" onClick={() => setRejectionTarget(null)}>Cancel</button>
              <button type="button" className="primary-button" onClick={confirmRejection}>Confirm rejection</button>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  )
}

function InventoryPage({ inventory, setInventory, setMovements, setToast }: { inventory: InventoryItem[]; setInventory: React.Dispatch<React.SetStateAction<InventoryItem[]>>; setMovements: React.Dispatch<React.SetStateAction<StockMovement[]>>; setToast: (message: string) => void }) {
  const [query, setQuery] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [adjustItem, setAdjustItem] = useState<InventoryItem | null>(null)
  const [adjustQuantity, setAdjustQuantity] = useState('0')
  const [form, setForm] = useState({ productId: '', productName: '', category: 'Biscuits', onHand: '0', reserved: '0', available: '0', threshold: '1500' })

  const filteredInventory = inventory.filter((item) => `${item.productId} ${item.productName} ${item.category}`.toLowerCase().includes(query.toLowerCase()))

  const handleSaveInventory = () => {
    const parsedOnHand = Number(form.onHand)
    const parsedReserved = Number(form.reserved)
    const parsedAvailable = Number(form.available)
    if (!form.productId.trim() || !form.productName.trim() || !Number.isFinite(parsedOnHand)) {
      setToast('Please complete the required inventory details.')
      return
    }

    const nextItem: InventoryItem = {
      productId: form.productId,
      productName: form.productName,
      category: form.category,
      onHand: parsedOnHand,
      reserved: parsedReserved,
      available: parsedAvailable || Math.max(0, parsedOnHand - parsedReserved),
      threshold: Number(form.threshold) || 1500,
      lastUpdated: new Date().toISOString().slice(0, 10),
    }

    setInventory((current) => [nextItem, ...current])
    setForm({ productId: '', productName: '', category: 'Biscuits', onHand: '0', reserved: '0', available: '0', threshold: '1500' })
    setShowForm(false)
    setToast('Inventory record added successfully.')
  }

  const handleAdjustment = () => {
    if (!adjustItem) return
    const delta = Number(adjustQuantity)
    if (!Number.isFinite(delta)) {
      setToast('Adjustment quantity must be a valid number.')
      return
    }

    const nextInventory = inventory.map((item) => {
      if (item.productId !== adjustItem.productId) return item
      const updatedOnHand = Math.max(0, item.onHand + delta)
      const updatedAvailable = Math.max(0, item.available + delta)
      return { ...item, onHand: updatedOnHand, available: updatedAvailable, lastUpdated: new Date().toISOString().slice(0, 10) }
    })

    setInventory(nextInventory)
    setMovements((current) => [{ id: `MV-${Date.now()}`, productId: adjustItem.productId, productName: adjustItem.productName, admin: 'Ayesha M.', type: 'Adjustment', quantity: delta, movementDate: new Date().toISOString().slice(0, 10), reference: `Manual adjustment ${delta > 0 ? 'increase' : 'reduction'}` }, ...current])
    setAdjustItem(null)
    setAdjustQuantity('0')
    setToast('Stock adjustment applied and recorded.')
  }

  return (
    <div className="page-stack">
      <section className="panel">
        <div className="panel-heading split"><h2>Manufacturing inventory</h2><button type="button" className="primary-button" onClick={() => setShowForm((current) => !current)}>{showForm ? 'Close form' : 'Add inventory record'}</button></div>
        {showForm ? (
          <div className="form-grid">
            <label>Product ID<input value={form.productId} onChange={(event) => setForm({ ...form, productId: event.target.value })} /></label>
            <label>Product name<input value={form.productName} onChange={(event) => setForm({ ...form, productName: event.target.value })} /></label>
            <label>Category<input value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} /></label>
            <label>On-hand quantity<input type="number" value={form.onHand} onChange={(event) => setForm({ ...form, onHand: event.target.value })} /></label>
            <label>Reserved quantity<input type="number" value={form.reserved} onChange={(event) => setForm({ ...form, reserved: event.target.value })} /></label>
            <label>Available quantity<input type="number" value={form.available} onChange={(event) => setForm({ ...form, available: event.target.value })} /></label>
            <label>Low stock threshold<input type="number" value={form.threshold} onChange={(event) => setForm({ ...form, threshold: event.target.value })} /></label>
            <div className="inline-actions"><button type="button" className="secondary-button" onClick={() => setShowForm(false)}>Cancel</button><button type="button" className="primary-button" onClick={handleSaveInventory}>Save inventory</button></div>
          </div>
        ) : null}
      </section>

      <section className="panel">
        <div className="panel-heading split"><h2>Inventory items</h2><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search products" className="search-input" /></div>
        <div className="table-wrapper"><table><thead><tr><th>Product</th><th>On-hand</th><th>Available</th><th>Reserved</th><th>Last updated</th><th>Action</th></tr></thead><tbody>{filteredInventory.map((item) => <tr key={item.productId}><td><strong>{item.productName}</strong><small>{item.productId}</small></td><td>{formatNumber(item.onHand)}</td><td>{formatNumber(item.available)}</td><td>{formatNumber(item.reserved)}</td><td>{item.lastUpdated}</td><td><button type="button" className="link-button" onClick={() => { setAdjustItem(item); setAdjustQuantity('0') }}>Adjust</button></td></tr>)}</tbody></table></div>
      </section>

      {adjustItem ? (
        <section className="panel">
          <div className="panel-heading"><h2>Adjust stock for {adjustItem.productName}</h2></div>
          <div className="form-grid small"><label>Quantity delta<input type="number" value={adjustQuantity} onChange={(event) => setAdjustQuantity(event.target.value)} /></label><div className="inline-actions"><button type="button" className="secondary-button" onClick={() => setAdjustItem(null)}>Cancel</button><button type="button" className="primary-button" onClick={handleAdjustment}>Confirm adjustment</button></div></div>
        </section>
      ) : null}
    </div>
  )
}

function StockMovementPage({ movements }: { movements: StockMovement[] }) {
  const [query, setQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('All')
  const filteredMovements = movements.filter((movement) => `${movement.productName} ${movement.admin} ${movement.reference}`.toLowerCase().includes(query.toLowerCase()) && (typeFilter === 'All' || movement.type === typeFilter))

  return (
    <div className="page-stack">
      <section className="panel">
        <div className="panel-heading split"><h2>Stock movement history</h2><div className="toolbar-inline"><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search movements" className="search-input" /><select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}><option value="All">All types</option><option value="Production">Production</option><option value="Adjustment">Adjustment</option><option value="Allocation">Allocation</option><option value="Handover">Handover</option></select></div></div>
        <div className="table-wrapper"><table><thead><tr><th>Movement ID</th><th>Product</th><th>Admin</th><th>Movement type</th><th>Quantity</th><th>Movement date</th><th>Reference</th></tr></thead><tbody>{filteredMovements.map((movement) => <tr key={movement.id}><td>{movement.id}</td><td>{movement.productName}</td><td>{movement.admin}</td><td>{movement.type}</td><td>{movement.quantity}</td><td>{movement.movementDate}</td><td>{movement.reference}</td></tr>)}</tbody></table></div>
      </section>
    </div>
  )
}

function HandoverPage({ allocations, setAllocations, setToast, onNavigate }: { allocations: AllocationRecord[]; setAllocations: React.Dispatch<React.SetStateAction<AllocationRecord[]>>; setToast: (message: string) => void; onNavigate: (page: WorkspacePage) => void }) {
  const pendingAllocations = allocations.filter((allocation) => allocation.status === 'Ready for Handover')
  const consolidatedProducts = new Map<string, { productId: string; productName: string; allocated: number; references: Set<string> }>()
  pendingAllocations.forEach((allocation) => {
    allocation.lines.forEach((line) => {
      if (!Number.isSafeInteger(line.allocated) || line.allocated <= 0) return
      const product = consolidatedProducts.get(line.productId) ?? {
        productId: line.productId,
        productName: line.productName,
        allocated: 0,
        references: new Set<string>(),
      }
      product.allocated += line.allocated
      product.references.add(`${allocation.reportName} / ${allocation.id}`)
      consolidatedProducts.set(line.productId, product)
    })
  })
  const reportLines = Array.from(consolidatedProducts.values())
  const totalAllocated = reportLines.reduce((sum, line) => sum + line.allocated, 0)
  const reportDate = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date())

  const handleSendToWarehouse = () => {
    if (reportLines.length === 0 || totalAllocated <= 0) {
      setToast('There are no valid allocated products to hand over.')
      return
    }
    if (!window.confirm(`Mark the consolidated handover report containing ${reportLines.length} products (${formatNumber(totalAllocated)} units) as complete? No warehouse message will be sent.`)) {
      return
    }
    const reportIds = new Set(pendingAllocations.map((allocation) => allocation.id))
    setAllocations((current) => current.map((allocation) => reportIds.has(allocation.id)
      ? { ...allocation, status: 'Completed' }
      : allocation))
    setToast('Demo handover marked complete locally. Nothing was sent to a warehouse.')
  }

  return (
    <div className="page-stack">
      <section className="panel">
        <div className="panel-heading"><h2>Consolidated Warehouse Handover Report</h2></div>
        <dl className="detail-list handover-report-summary">
          <div><dt>Handover Report ID</dt><dd>Not assigned by server</dd></div>
          <div><dt>Report Date</dt><dd>{reportDate}</dd></div>
          <div><dt>Related SAP / Allocation References</dt><dd>{pendingAllocations.length ? pendingAllocations.map((allocation) => `${allocation.reportName} / ${allocation.id}`).join('; ') : 'None'}</dd></div>
          <div><dt>Total Allocated Items</dt><dd>{reportLines.length} products · {formatNumber(totalAllocated)} units</dd></div>
          <div><dt>Current Handover Status</dt><dd>{pendingAllocations.length ? 'Ready for Handover' : 'No finalized allocation'}</dd></div>
        </dl>
        <div className="table-wrapper">
          <table>
            <thead><tr><th>Product Name</th><th>Product Code</th><th>Allocated Quantity</th><th>SAP / Allocation Reference</th></tr></thead>
            <tbody>
              {reportLines.map((line) => (
                <tr key={line.productId}>
                  <td>{line.productName}</td>
                  <td>{line.productId}</td>
                  <td>{formatNumber(line.allocated)}</td>
                  <td>{Array.from(line.references).join('; ')}</td>
                </tr>
              ))}
              {reportLines.length === 0 && <tr><td colSpan={4}>No valid allocated products are available for handover.</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="handover-report-actions">
          <button type="button" className="secondary-button" onClick={() => onNavigate('stock-allocation')}>Back to Stock Allocation</button>
          <button type="button" className="primary-button" disabled={reportLines.length === 0} onClick={handleSendToWarehouse}>Send to Warehouse</button>
        </div>
      </section>
    </div>
  )
}

function ReportsPage({ reports, allocations, inventory, movements }: { reports: SapReport[]; allocations: AllocationRecord[]; inventory: InventoryItem[]; movements: StockMovement[] }) {
  const totalAvailable = inventory.reduce((sum, item) => sum + item.available, 0)
  const pendingReports = reports.filter((report) => report.status === 'PENDING').length

  return (
    <div className="page-stack">
      <section className="summary-grid" aria-label="Report overview">
        <article className="metric-card"><span>SAP report history</span><strong>{reports.length}</strong><small>Reports received in system</small></article>
        <article className="metric-card"><span>Allocation history</span><strong>{allocations.length}</strong><small>Agency product allocations saved</small></article>
        <article className="metric-card"><span>Inventory adjustment history</span><strong>{movements.filter((entry) => entry.type === 'Adjustment').length}</strong><small>Adjustment events tracked</small></article>
        <article className="metric-card"><span>Available stock</span><strong>{formatNumber(totalAvailable)}</strong><small>Current available units</small></article>
      </section>

      <div className="panel-grid two-column">
        <section className="panel"><div className="panel-heading"><h2>Operational summary</h2></div><div className="stack-list"><div className="list-row"><div><strong>Pending SAP review</strong><small>Reports awaiting review before allocation</small></div><span>{pendingReports}</span></div><div className="list-row"><div><strong>Open allocations</strong><small>Allocations awaiting warehouse handover</small></div><span>{allocations.filter((allocation) => allocation.status !== 'Completed').length}</span></div><div className="list-row"><div><strong>Low stock items</strong><small>Inventory below threshold</small></div><span>{inventory.filter((item) => item.available <= item.threshold).length}</span></div></div></section>
        <section className="panel"><div className="panel-heading"><h2>Recent movement reports</h2></div><div className="stack-list">{movements.slice(0, 4).map((movement) => <div key={movement.id} className="list-row"><div><strong>{movement.productName}</strong><small>{movement.reference}</small></div><span>{movement.type}</span></div>)}</div></section>
      </div>
    </div>
  )
}

function SuperAdminPage({ adminAccounts, setAdminAccounts, setToast }: { adminAccounts: ManufacturingAdminAccount[]; setAdminAccounts: React.Dispatch<React.SetStateAction<ManufacturingAdminAccount[]>>; setToast: (message: string) => void }) {
  const toggleAssignment = (accountId: string) => {
    setAdminAccounts((current) => current.map((account) => account.id === accountId ? { ...account, status: account.status === 'Assigned' ? 'Inactive' : 'Assigned' } : account))
    setToast('Manufacturing admin assignment updated successfully.')
  }

  return (
    <div className="page-stack">
      <section className="panel">
        <div className="panel-heading"><h2>Manufacturing Admin assignment</h2></div>
        <div className="table-wrapper"><table><thead><tr><th>Name</th><th>Email</th><th>Status</th><th>Action</th></tr></thead><tbody>{adminAccounts.map((account) => <tr key={account.id}><td>{account.name}</td><td>{account.email}</td><td><span className={`status-badge ${account.status.toLowerCase()}`}>{account.status}</span></td><td><button type="button" className="primary-button" onClick={() => toggleAssignment(account.id)}>{account.status === 'Assigned' ? 'Remove access' : 'Assign account'}</button></td></tr>)}</tbody></table></div>
      </section>
    </div>
  )
}

export default App
