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
type SapStatus = 'Pending Review' | 'In Progress' | 'Approved' | 'Rejected'

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
}

interface SapReport {
  id: string
  fileName: string
  uploadedAt: string
  status: SapStatus
  adminName: string
  items: SapReportItem[]
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
  status: 'Draft' | 'Allocated' | 'Ready for Handover' | 'Completed'
  lines: {
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
    status: 'Pending Review',
    adminName: 'Ayesha M.',
    items: [
      { id: 'RI-101', agencyId: 'AG-102', agencyName: 'Western Retail Group', productId: 'P-101', productName: 'Cream Cracker', quantity: 1800, contact: 'Asha Perera', duePayment: 4200 },
      { id: 'RI-102', agencyId: 'AG-203', agencyName: 'Central Trading Hub', productId: 'P-102', productName: 'Chocolate Cream', quantity: 1200, contact: 'Nimal Senanayake', duePayment: 3100 },
      { id: 'RI-103', agencyId: 'AG-102', agencyName: 'Western Retail Group', productId: 'P-104', productName: 'Nice', quantity: 900, contact: 'Asha Perera', duePayment: 2000 },
    ],
  },
  {
    id: 'SR-902',
    fileName: 'upcoming_orders.xlsx',
    uploadedAt: '2026-10-20',
    status: 'Approved',
    adminName: 'Ayesha M.',
    items: [{ id: 'RI-201', agencyId: 'AG-304', agencyName: 'Southern Distribution Co.', productId: 'P-103', productName: 'Lemon Puff', quantity: 1400, contact: 'Dilhani Fernando', duePayment: 4200 }],
  },
]

const initialMovements: StockMovement[] = [
  { id: 'MV-110', productId: 'P-101', productName: 'Cream Cracker', admin: 'Ayesha M.', type: 'Production', quantity: 600, movementDate: '2026-10-20', reference: 'Batch B-20261020-CC01' },
  { id: 'MV-111', productId: 'P-103', productName: 'Lemon Puff', admin: 'Ayesha M.', type: 'Adjustment', quantity: -100, movementDate: '2026-10-19', reference: 'Damaged stock count' },
  { id: 'MV-112', productId: 'P-102', productName: 'Chocolate Cream', admin: 'Ayesha M.', type: 'Allocation', quantity: -1200, movementDate: '2026-10-18', reference: 'Agency allocation AO-1002' },
]

const initialAllocations: AllocationRecord[] = [
  { id: 'AO-1001', agencyId: 'AG-102', agencyName: 'Western Retail Group', reportId: 'SR-901', reportName: 'sap_report_batch_18.xlsx', createdAt: '2026-10-20', status: 'Ready for Handover', lines: [{ productId: 'P-101', productName: 'Cream Cracker', requested: 1800, allocated: 1600 }, { productId: 'P-104', productName: 'Nice', requested: 900, allocated: 900 }] },
  { id: 'AO-1002', agencyId: 'AG-203', agencyName: 'Central Trading Hub', reportId: 'SR-901', reportName: 'sap_report_batch_18.xlsx', createdAt: '2026-10-20', status: 'Allocated', lines: [{ productId: 'P-102', productName: 'Chocolate Cream', requested: 1200, allocated: 1100 }] },
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
  const [reports, setReports] = useState<SapReport[]>(initialReports)
  const [inventory, setInventory] = useState<InventoryItem[]>(initialInventory)
  const [movements, setMovements] = useState<StockMovement[]>(initialMovements)
  const [allocations, setAllocations] = useState<AllocationRecord[]>(initialAllocations)
  const [adminAccounts, setAdminAccounts] = useState<ManufacturingAdminAccount[]>(initialAdminAccounts)
  const [toast, setToast] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [notifications, setNotifications] = useState([
    { id: 'n1', title: 'SAP report review pending', detail: '1 report needs approval before agency allocation.', time: '5 min ago', unread: true },
    { id: 'n2', title: 'Low stock alert', detail: 'Lemon Puff is below the safety threshold.', time: '35 min ago', unread: true },
    { id: 'n3', title: 'Allocation updated', detail: 'Western Retail Group allocation was saved successfully.', time: '2 hrs ago', unread: false },
  ])
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
        return <StockAllocationPage reports={reports} inventory={inventory} allocations={allocations} setAllocations={setAllocations} setToast={setToast} onNavigate={setCurrentPage} />
      case 'inventory':
        return <InventoryPage inventory={inventory} setInventory={setInventory} setMovements={setMovements} setToast={setToast} />
      case 'stock-movements':
        return <StockMovementPage movements={movements} />
      case 'handover':
        return <HandoverPage allocations={allocations} setToast={setToast} onNavigate={setCurrentPage} />
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

function NotificationsPage({ notifications, setNotifications }: { notifications: { id: string; title: string; detail: string; time: string; unread: boolean }[]; setNotifications: React.Dispatch<React.SetStateAction<{ id: string; title: string; detail: string; time: string; unread: boolean }[]>> }) {
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
  const pendingReports = reports.filter((report) => report.status === 'Pending Review').length
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
    const newReport: SapReport = { id: `SR-${Date.now()}`, fileName: file.name, uploadedAt: new Date().toISOString().slice(0, 10), status: 'Pending Review', adminName: 'Ayesha M.', items: [] }
    setReports((current) => [newReport, ...current])
    setSelectedReportId(newReport.id)
    setToast(`Uploaded ${file.name} and saved it for review.`)
    event.target.value = ''
  }

  const handleStatusUpdate = (reportId: string, status: SapStatus) => {
    setReports((current) => current.map((report) => (report.id === reportId ? { ...report, status } : report)))
    setToast(`Updated report status to ${status}.`)
  }

  return (
    <div className="page-stack">
      <section className="panel">
        <div className="panel-heading split">
          <h2>SAP report management</h2>
          <label className="upload-button"><input type="file" accept=".xlsx,.xls,.csv" onChange={handleUpload} />Upload SAP report</label>
        </div>
        <div className="table-wrapper"><table><thead><tr><th>File</th><th>Upload date</th><th>Admin</th><th>Status</th><th>Items</th></tr></thead><tbody>{reports.map((report) => (
          <tr key={report.id} className={selectedReport?.id === report.id ? 'selected-row' : ''}>
            <td onClick={() => setSelectedReportId(report.id)}>{report.fileName}</td>
            <td onClick={() => setSelectedReportId(report.id)}>{report.uploadedAt}</td>
            <td onClick={() => setSelectedReportId(report.id)}>{report.adminName}</td>
            <td><select value={report.status} onChange={(event) => handleStatusUpdate(report.id, event.target.value as SapStatus)}><option value="Pending Review">Pending Review</option><option value="In Progress">In Progress</option><option value="Approved">Approved</option><option value="Rejected">Rejected</option></select></td>
            <td onClick={() => setSelectedReportId(report.id)}>{report.items.length}</td>
          </tr>))}</tbody></table></div>
      </section>

      {selectedReport ? (
        <section className="panel sap-status-panel">
          <div className="panel-heading split"><h2>{selectedReport.fileName}</h2><span className={`status-badge ${selectedReport.status.toLowerCase().replace(/\s+/g, '-')}`}>{selectedReport.status}</span></div>
          <dl className="detail-list"><div><dt>Uploaded</dt><dd>{selectedReport.uploadedAt}</dd></div><div><dt>Reviewer</dt><dd>{selectedReport.adminName}</dd></div><div><dt>Report status</dt><dd>{selectedReport.status}</dd></div></dl>
          <div className="section-title">Report items</div>
          <div className="table-wrapper"><table><thead><tr><th>Agency</th><th>Product</th><th>Quantity</th><th>Contact</th><th>Due payment</th></tr></thead><tbody>{selectedReport.items.length ? selectedReport.items.map((item) => <tr key={item.id}><td>{item.agencyName}</td><td>{item.productName}</td><td>{formatNumber(item.quantity)}</td><td>{item.contact}</td><td>{formatCurrency(item.duePayment)}</td></tr>) : <tr><td colSpan={5}>No items uploaded for this report yet.</td></tr>}</tbody></table></div>
          <div className="report-navigation-actions">
            <button type="button" className="secondary-button" onClick={() => onNavigate('stock-allocation')}>Go to Stock Allocation</button>
          </div>
        </section>
      ) : null}
    </div>
  )
}

function StockAllocationPage({ reports, inventory, allocations, setAllocations, setToast, onNavigate }: { reports: SapReport[]; inventory: InventoryItem[]; allocations: AllocationRecord[]; setAllocations: React.Dispatch<React.SetStateAction<AllocationRecord[]>>; setToast: (message: string) => void; onNavigate: (page: WorkspacePage) => void }) {
  const [selectedReportId, setSelectedReportId] = useState<string>(reports[0]?.id ?? '')
  const [draftValues, setDraftValues] = useState<Record<string, Record<string, number>>>({})
  const selectedReport = reports.find((report) => report.id === selectedReportId) ?? reports[0]

  const groups = useMemo(() => {
    const result: Record<string, SapReportItem[]> = {}
    if (!selectedReport) return result
    selectedReport.items.forEach((item) => {
      if (!result[item.agencyId]) result[item.agencyId] = []
      result[item.agencyId].push(item)
    })
    return result
  }, [selectedReport])

  const getSavedAllocation = (agencyId: string) =>
    allocations.find((allocation) => allocation.reportId === selectedReport?.id && allocation.agencyId === agencyId)

  const savedTotalsByProduct = new Map<string, number>()
  if (selectedReport) {
    allocations
      .filter((allocation) => allocation.reportId === selectedReport.id)
      .forEach((allocation) => allocation.lines.forEach((line) => {
        savedTotalsByProduct.set(line.productId, (savedTotalsByProduct.get(line.productId) ?? 0) + line.allocated)
      }))
  }
  const savedTotalsFitStock = Array.from(savedTotalsByProduct.entries()).every(([productId, allocated]) => {
    const available = inventory.find((stock) => stock.productId === productId)?.available
    return available !== undefined && allocated <= available
  })

  const isAllocationReady = Boolean(selectedReport && selectedReport.items.length > 0 && Object.entries(groups).length > 0
    && savedTotalsFitStock
    && Object.entries(groups).every(([agencyId, items]) => {
      const saved = getSavedAllocation(agencyId)
      if (!saved || saved.lines.length !== items.length) return false

      const requestedByProduct = new Map<string, number>()
      const allocatedByProduct = new Map<string, number>()
      const invalidRequest = items.some((item) => !Number.isSafeInteger(item.quantity) || item.quantity <= 0)
      if (invalidRequest) return false
      items.forEach((item) => requestedByProduct.set(item.productId, (requestedByProduct.get(item.productId) ?? 0) + item.quantity))
      for (const [index, item] of items.entries()) {
        const line = saved.lines[index]
        const draft = draftValues[agencyId]?.[item.id]
        if (line.productId !== item.productId || (draft !== undefined && draft !== line.allocated) || !Number.isSafeInteger(line.allocated) || line.allocated < 0) {
          return false
        }
        allocatedByProduct.set(line.productId, (allocatedByProduct.get(line.productId) ?? 0) + line.allocated)
      }

      let totalAllocated = 0
      for (const [productId, requested] of requestedByProduct) {
        const allocated = allocatedByProduct.get(productId)
        const available = inventory.find((stock) => stock.productId === productId)?.available
        if (allocated === undefined || !Number.isSafeInteger(allocated) || allocated < 0 || allocated > requested || available === undefined || allocated > available) {
          return false
        }
        totalAllocated += allocated
      }

      return totalAllocated > 0
    }))

  const updateDraft = (agencyId: string, itemId: string, value: string) => {
    const num = Number(value)
    setDraftValues((current) => ({ ...current, [agencyId]: { ...(current[agencyId] ?? {}), [itemId]: Number.isFinite(num) ? num : 0 } }))
  }

  const saveForAgency = (agencyId: string) => {
    const agencyItems = groups[agencyId] ?? []
    const agencyName = agencyItems[0]?.agencyName ?? 'Agency'
    const allocationsByProduct = new Map<string, { allocated: number; available: number }>()
    const allocatedElsewhereByProduct = new Map<string, number>()
    allocations
      .filter((allocation) => allocation.reportId === selectedReport?.id && allocation.agencyId !== agencyId)
      .forEach((allocation) => allocation.lines.forEach((line) => {
        allocatedElsewhereByProduct.set(line.productId, (allocatedElsewhereByProduct.get(line.productId) ?? 0) + line.allocated)
      }))
    const invalid = agencyItems.some((item) => {
      const allocated = draftValues[agencyId]?.[item.id] ?? item.quantity
      const available = inventory.find((stock) => stock.productId === item.productId)?.available ?? 0
      const current = allocationsByProduct.get(item.productId) ?? { allocated: 0, available }
      current.allocated += allocated
      allocationsByProduct.set(item.productId, current)
      return !Number.isSafeInteger(item.quantity) || item.quantity <= 0 || !Number.isSafeInteger(available) || !Number.isSafeInteger(allocated) || allocated < 0 || allocated > item.quantity || current.allocated + (allocatedElsewhereByProduct.get(item.productId) ?? 0) > available
    })

    if (invalid) {
      setToast('Allocation exceeds request or available stock. Please review the values.')
      return
    }

    const record: AllocationRecord = {
      id: `AO-${Math.floor(Math.random() * 900 + 100)}`,
      agencyId,
      agencyName,
      reportId: selectedReport.id,
      reportName: selectedReport.fileName,
      createdAt: new Date().toISOString().slice(0, 10),
      status: 'Allocated',
      lines: agencyItems.map((item) => ({ productId: item.productId, productName: item.productName, requested: item.quantity, allocated: Math.max(0, Number(draftValues[agencyId]?.[item.id] ?? item.quantity)) })),
    }

    setAllocations((current) => [record, ...current.filter((allocation) => allocation.reportId !== record.reportId || allocation.agencyId !== record.agencyId)])
    setToast(`Saved allocation for ${agencyName}.`)
  }

  return (
    <div className="page-stack">
      <section className="panel">
        <div className="panel-heading split"><h2>Agency stock allocation</h2><select value={selectedReportId} onChange={(event) => setSelectedReportId(event.target.value)}>{reports.map((report) => <option value={report.id} key={report.id}>{report.fileName}</option>)}</select></div>
      </section>

      {selectedReport && Object.entries(groups).length ? Object.entries(groups).map(([agencyId, items]) => {
        const agencyName = items[0].agencyName
        return (
          <section className="panel" key={agencyId}>
            <div className="panel-heading split"><h2>{agencyName}</h2><button type="button" className="primary-button" onClick={() => saveForAgency(agencyId)}>Save allocation</button></div>
            <div className="allocation-grid">
              {items.map((item, itemIndex) => {
                const stock = inventory.find((entry) => entry.productId === item.productId)
                const savedLine = getSavedAllocation(agencyId)?.lines[itemIndex]
                const savedValue = savedLine?.productId === item.productId ? savedLine.allocated : item.quantity
                const allocated = Number(draftValues[agencyId]?.[item.id] ?? savedValue)
                const invalid = !Number.isSafeInteger(allocated) || allocated < 0 || allocated > item.quantity || allocated > (stock?.available ?? 0)
                return (
                  <div key={item.id} className={`allocation-card ${invalid ? 'invalid' : ''}`}>
                    <div className="allocation-head"><strong>{item.productName}</strong><span>{stock ? `${formatNumber(stock.available)} available` : 'No stock'}</span></div>
                    <small>Requested {formatNumber(item.quantity)} · Contact {item.contact}</small>
                    <label>Allocated quantity<input type="number" value={allocated} min={0} max={item.quantity} onChange={(event) => updateDraft(agencyId, item.id, event.target.value)} /></label>
                  </div>
                )
              })}
            </div>
          </section>
        )
      }) : <section className="panel"><p className="empty-text">No agency allocation groups are available for the selected SAP report.</p></section>}

      <div className="allocation-navigation">
        <button type="button" className="secondary-button" onClick={() => onNavigate('sap-reports')}>Back to SAP Reports</button>
        <div>
          {!isAllocationReady && <span className="allocation-navigation-hint">Save valid allocations for each agency to continue.</span>}
          <button type="button" className="primary-button allocation-proceed-button" disabled={!isAllocationReady} onClick={() => onNavigate('handover')}>Proceed to Warehouse Handover</button>
        </div>
      </div>
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

function HandoverPage({ allocations, setToast, onNavigate }: { allocations: AllocationRecord[]; setToast: (message: string) => void; onNavigate: (page: WorkspacePage) => void }) {
  const pendingAllocations = allocations.filter((allocation) => allocation.status !== 'Completed')
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
    if (!window.confirm(`Confirm sending the consolidated handover report containing ${reportLines.length} products (${formatNumber(totalAllocated)} units) to Warehouse Admin?`)) {
      return
    }
    setToast('Handover was not sent: no Warehouse Admin handover API is configured. The report status remains Not sent.')
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
          <div><dt>Current Handover Status</dt><dd>Not sent</dd></div>
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
        <p className="handover-api-notice">Warehouse submission is unavailable because no handover API is configured. Confirming will not send or change any records.</p>
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
  const pendingReports = reports.filter((report) => report.status === 'Pending Review').length

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
