import { useState } from 'react'
import type { ReactNode } from 'react'
import type { WorkspacePage } from '../components/layout/Sidebar'
import ReportTabs from '../components/layout/ReportTabs'
import { shipmentSchedules } from '../data/shipmentSchedules'

interface AdminScreensProps {
  page: WorkspacePage
  onNavigate: (page: WorkspacePage) => void
  selectedScheduleId?: string
  scheduleDraft?: {
    productId: string
    pickupDate: string
    quantity: string
    notes: string
  }
}

const alerts = [
  {
    id: 'sap',
    category: 'Requirements',
    title: 'SAP requirement source needs review',
    summary: 'upcoming_orders.xlsx · Received 18 Oct 2026 · Source count 24',
    detail: 'Products, required quantities and destination agencies await verification.',
    destination: 'sap' as const,
    action: 'Review requirements',
    unread: true,
  },
  {
    id: 'lemon',
    category: 'Low stock',
    title: 'Low manufacturing stock · Lemon Puff',
    summary: 'MC-BIS-003 · Available 700 · Threshold 1,000 units',
    detail: 'Threshold gap 300 units · Snapshot 18 Oct 2026',
    destination: 'stocks' as const,
    action: 'View stock',
    unread: true,
  },
  {
    id: 'milk',
    category: 'Low stock',
    title: 'Low manufacturing stock · Milk Marie',
    summary: 'MC-BIS-005 · Available 200 · Threshold 500 units',
    detail: 'Threshold gap 300 units · Snapshot 18 Oct 2026',
    destination: 'stocks' as const,
    action: 'View stock',
    unread: true,
  },
  {
    id: 'tikir',
    category: 'Low stock',
    title: 'Low manufacturing stock · Tikir Marie',
    summary: 'MC-BIS-006 · Available 400 · Threshold 500 units',
    detail: 'Threshold gap 100 units · Snapshot 18 Oct 2026',
    destination: 'stocks' as const,
    action: 'View stock',
    unread: false,
  },
]

function Panel({ title, children, className = '' }: { title: string; children: ReactNode; className?: string }) {
  return (
    <section className={`screen-panel ${className}`}>
      <h2 className="screen-panel-title">{title}</h2>
      <div className="screen-panel-content">{children}</div>
    </section>
  )
}

function ScreenFooter({ note = 'Manufacturer-side administration only' }: { note?: string }) {
  return (
    <div className="screen-footnote">
      <span>{note}</span>
    </div>
  )
}

function Notifications({ onNavigate }: AdminScreensProps) {
  const [category, setCategory] = useState('All alerts')
  const [readFilter, setReadFilter] = useState('All')
  const [readIds, setReadIds] = useState<string[]>(alerts.filter((alert) => !alert.unread).map((alert) => alert.id))
  const categoryOptions = ['All alerts', 'Requirements', 'Low stock', 'Order deadlines', 'Due / overdue schedules', 'Handover updates']
  const visibleAlerts = alerts.filter((alert) => {
    const categoryMatches = category === 'All alerts' || category === alert.category
    const isRead = readIds.includes(alert.id)
    return categoryMatches && (readFilter === 'All' || (readFilter === 'Unread' ? !isRead : isRead))
  })
  const unreadCount = alerts.filter((alert) => !readIds.includes(alert.id)).length
  const markAllRead = () => setReadIds(alerts.map((alert) => alert.id))
  const markRead = (id: string) => setReadIds((current) => current.includes(id) ? current : [...current, id])

  return (
    <main className="dashboard-content screen-content">
      <div className="alert-category-tabs" role="tablist" aria-label="Notification categories">
        {categoryOptions.map((option) => {
          const count = option === 'All alerts' ? alerts.length : option === 'Requirements' ? 1 : option === 'Low stock' ? 3 : 0
          return (
            <button
              className={category === option ? 'active-tab' : ''}
              type="button"
              role="tab"
              aria-selected={category === option}
              key={option}
              onClick={() => setCategory(option)}
            >
              {option}{count > 0 && ` · ${count}`}
            </button>
          )
        })}
      </div>
      <div className="detail-layout notification-layout">
        <Panel title="Requirement & stock alerts">
          <div className="notification-panel-heading">
            <span>{unreadCount} unread</span>
            <button className="button" type="button" onClick={markAllRead}>Mark all as read</button>
          </div>
          <div className="notification-filters" role="group" aria-label="Read status">
            {['All', 'Unread', 'Read'].map((filter) => (
              <button className={readFilter === filter ? 'active-filter' : ''} key={filter} type="button" onClick={() => setReadFilter(filter)}>{filter}</button>
            ))}
            <span>Read states shown as examples</span>
          </div>
          <div className="alert-cards">
            {visibleAlerts.map((alert) => {
              const isRead = readIds.includes(alert.id)
              return (
                <article className={`notification-card${isRead ? ' is-read' : ''}`} key={alert.id}>
                  <span className="notification-dot" aria-hidden="true" />
                  <div className="notification-card-content">
                    <strong>{alert.title}</strong>
                    <p>{alert.summary}</p>
                    <p>{alert.detail}</p>
                    <div className="notification-card-actions">
                      <button className="text-button" type="button" onClick={() => { markRead(alert.id); onNavigate(alert.destination) }}>{alert.action} →</button>
                      <button className="text-button read-action" type="button" onClick={() => isRead ? setReadIds((current) => current.filter((id) => id !== alert.id)) : markRead(alert.id)}>
                        {isRead ? 'Mark as unread' : 'Mark as read'}
                      </button>
                    </div>
                  </div>
                </article>
              )
            })}
            {visibleAlerts.length === 0 && <p className="empty-inline">No alerts match this filter.</p>}
          </div>
        </Panel>
        <div className="detail-main">
          <Panel title="Awaiting verified data">
            <div className="notice-box"><strong>Upcoming order deadlines</strong><p>Required dates are not verified. No deadline alerts are calculated.</p></div>
            <div className="notice-box"><strong>Due / overdue schedules</strong><p>No due or overdue state is asserted without a verified reference date.</p></div>
            <div className="notice-box"><strong>Relevant handover updates</strong><p>No confirmed handover events have been supplied.</p></div>
          </Panel>
          <Panel title="Alert delivery">
            <p className="body-copy">Choose the manufacturing alerts you want to review.</p>
            <button className="button" type="button" onClick={() => onNavigate('notification-preferences')}>Notification preferences</button>
          </Panel>
        </div>
      </div>
      <ScreenFooter />
    </main>
  )
}

const preferenceCategories = [
  ['New / changed requirements', 'SAP product, quantity or destination-agency changes.'],
  ['Upcoming order deadlines', 'Required dates for verified upcoming orders.'],
  ['Low manufacturing stock', 'Products below the manufacturing stock threshold.'],
  ['Due / overdue shipment schedules', 'Planned schedules requiring timely review.'],
  ['Relevant handover updates', 'Manufacturer-side handover record updates.'],
]

function NotificationPreferences({ onNavigate }: AdminScreensProps) {
  const [inApp, setInApp] = useState([true, true, true, true, false])
  const [message, setMessage] = useState('')
  const toggle = (index: number) => setInApp((current) => current.map((value, itemIndex) => itemIndex === index ? !value : value))
  return (
    <main className="dashboard-content screen-content">
      <Panel title="Alert delivery preferences">
        <span className="draft-badge">Draft values</span>
        <div className="preferences-table">
          <div className="preferences-header"><span>Alert category</span><span>In-app</span><span>Email (optional)</span></div>
          {preferenceCategories.map(([title, description], index) => (
            <div className="preference-row" key={title}>
              <div><strong>{title}</strong><p>{description}</p></div>
              <label className="preference-toggle"><input type="checkbox" checked={inApp[index]} onChange={() => toggle(index)} /><span className="toggle-track" aria-hidden="true" /><span>{inApp[index] ? 'On' : 'Off'}</span></label>
              <span className="email-unavailable"><span aria-hidden="true">○</span> Not configured</span>
            </div>
          ))}
        </div>
        <div className="notice-box"><strong>Email needs a configured account address</strong><p>No confirmed account email is available. Optional email delivery remains unavailable until an account address is configured.</p></div>
        <p className="footnote">These are proposed preference controls and draft examples. No changes have been saved and delivery permissions are not confirmed.</p>
        {message && <p className="inline-notice" role="status">{message}</p>}
      </Panel>
      <div className="screen-actions"><button className="button" type="button" onClick={() => onNavigate('notifications')}>Cancel · Back to notifications</button><button className="button button-primary" type="button" onClick={() => setMessage('Draft values are displayed for review. No account settings were changed.')}>Save preferences</button></div>
      <ScreenFooter />
    </main>
  )
}

function OrdersReport({ page, onNavigate }: AdminScreensProps) {
  return (
    <main className="dashboard-content screen-content">
      <ReportTabs page={page} onNavigate={onNavigate} />
      <Panel title="Order report filters">
        <div className="report-filter-grid">
          <label className="form-field">Required date range<select><option>All dates</option><option>18 Oct 2026</option></select></label>
          <label className="form-field">Status<select><option>All statuses</option><option>Needs review</option></select></label>
          <label className="form-field">Destination agency<select><option>All confirmed agencies</option></select></label>
          <label className="form-field">Product<select><option>All products</option></select></label>
        </div>
        <div className="report-actions"><button className="button button-primary" type="button">Apply filters</button><button className="button" type="button">Reset</button><button className="button export-disabled" type="button" disabled>Export orders</button></div>
      </Panel>
      <Panel title="Order requirements report">
        <span className="status-chip attention-chip">Awaiting verification</span>
        <div className="responsive-table"><table className="screen-table"><thead><tr><th>Order</th><th>Product / SKU</th><th>Required quantity</th><th>Destination agency</th><th>Required date</th><th>Attention</th></tr></thead></table></div>
        <div className="empty-state report-empty"><strong>No verified order records to report</strong><p>upcoming_orders.xlsx was received 18 Oct 2026 and needs review. Products, quantities, required dates and agency relationships remain unverified.</p></div>
        <p className="footnote">24 is the source count only, not a verified order count. Export is unavailable until verified order records are available.</p>
        <div className="report-bottom"><span className="footnote">No verified records displayed</span><button className="button button-primary" type="button" onClick={() => onNavigate('sap')}>Review requirements</button></div>
      </Panel>
      <div className="screen-actions"><button className="button" type="button" onClick={() => onNavigate('reports')}>Back to reports overview</button></div>
      <ScreenFooter />
    </main>
  )
}

function WarehouseHandover({ onNavigate }: AdminScreensProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [selectedId, setSelectedId] = useState('')
  const [submitError, setSubmitError] = useState('')
  const [today] = useState(() => {
    const date = new Date()
    date.setHours(0, 0, 0, 0)
    return date
  })
  const eligibleSchedules = shipmentSchedules.filter((schedule) =>
    schedule.status === 'Scheduled'
    && schedule.approvalStatus === 'Approved'
    && schedule.id.trim() !== ''
    && schedule.productName.trim() !== ''
    && schedule.productCode.trim() !== ''
    && Number.isSafeInteger(schedule.quantity)
    && schedule.quantity > 0
    && !Number.isNaN(Date.parse(`${schedule.plannedDate}T00:00:00`))
    && new Date(`${schedule.plannedDate}T00:00:00`) >= today,
  )
  const selectedSchedule = eligibleSchedules.find((schedule) => schedule.id === selectedId)
  const closeDialog = () => {
    setDialogOpen(false)
    setConfirming(false)
    setSelectedId('')
    setSubmitError('')
  }
  const confirmAndSend = () => {
    setSubmitError('')
    const schedule = shipmentSchedules.find((item) => item.id === selectedId)
    if (!schedule
      || schedule.status !== 'Scheduled'
      || schedule.approvalStatus !== 'Approved'
      || !Number.isSafeInteger(schedule.quantity)
      || schedule.quantity <= 0
      || new Date(`${schedule.plannedDate}T00:00:00`) < today) {
      setSubmitError('This shipment schedule is missing or is not approved and current. It cannot be sent.')
      setConfirming(false)
      return
    }
    setSubmitError('Shipment submission is unavailable: no Warehouse Admin handover API is configured. No record was sent or saved.')
  }
  return (
    <main className="dashboard-content screen-content handover-page">
      <header className="handover-page-header">
        <div>
          <h1>Warehouse Handover</h1>
          <p>Send shipment records to Warehouse Admin.</p>
        </div>
      </header>
      <Panel title="Manufacturer Handover Records">
        <div className="responsive-table">
          <table className="screen-table">
            <thead><tr><th>Schedule ID</th><th>Product</th><th>Quantity</th><th>Planned Date</th><th>Sent Date</th><th>Status</th></tr></thead>
          </table>
        </div>
        <div className="empty-state handover-empty"><strong>No shipment records have been sent.</strong></div>
        <div className="handover-container-actions">
          <button className="button" type="button" onClick={() => onNavigate('shipment-schedules')}>Create Shipment Report</button>
          <button className="button button-primary handover-send-button" type="button" onClick={() => { setDialogOpen(true); setConfirming(false); setSubmitError('') }}>
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M21 3 10.5 13.5M21 3l-6.5 18-4-7.5L3 9.5 21 3Z" /></svg>
            Send to Warehouse Admin
          </button>
        </div>
      </Panel>
      <div className="screen-actions">
        <button className="button" type="button" onClick={() => onNavigate('shipment-schedules')}>Back to Shipment Schedules</button>
      </div>
      {dialogOpen && (
        <div className="handover-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) closeDialog() }}>
          <section className="handover-modal" role="dialog" aria-modal="true" aria-labelledby="handover-modal-title">
            <h2 id="handover-modal-title">{confirming ? 'Confirm Shipment Handover' : 'Select Shipment Schedule'}</h2>
            {confirming && selectedSchedule ? (
              <>
                <p className="handover-modal-description">You are about to send the following shipment record to the Warehouse Admin.</p>
                <dl className="detail-rows">
                  <div className="detail-row"><dt>Shipment Schedule ID</dt><dd>{selectedSchedule.id}</dd></div>
                  <div className="detail-row"><dt>Product</dt><dd>{selectedSchedule.productName} · {selectedSchedule.productCode}</dd></div>
                  <div className="detail-row"><dt>Shipment Quantity</dt><dd>{selectedSchedule.quantity.toLocaleString('en-US')}</dd></div>
                  <div className="detail-row"><dt>Planned Shipment Date</dt><dd>{new Date(`${selectedSchedule.plannedDate}T00:00:00`).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</dd></div>
                </dl>
                {submitError && <p className="inline-error" role="alert">{submitError}</p>}
                <div className="handover-modal-actions">
                  <button className="button" type="button" onClick={() => { setConfirming(false); setSubmitError('') }}>Cancel</button>
                  <button className="button button-primary" type="button" onClick={confirmAndSend}>Confirm &amp; Send</button>
                </div>
              </>
            ) : (
              <>
                <p className="handover-api-status" role="status">Warehouse Admin submission is unavailable because no handover API is configured. No record will be sent.</p>
                {eligibleSchedules.length > 0 ? (
                  <div className="responsive-table">
                    <table className="screen-table">
                      <thead><tr><th>Schedule ID</th><th>Product</th><th>Code</th><th>Quantity</th><th>Planned Date</th><th>Report / Order</th><th>Destination / Shop</th><th></th></tr></thead>
                      <tbody>{eligibleSchedules.map((schedule) => (
                        <tr key={schedule.id}>
                          <td>{schedule.id}</td><td>{schedule.productName}</td><td>{schedule.productCode}</td><td>{schedule.quantity.toLocaleString('en-US')}</td>
                          <td>{new Date(`${schedule.plannedDate}T00:00:00`).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                          <td>{schedule.reportReference || 'Not linked'}</td><td>{schedule.destination || 'Not provided'}</td>
                          <td><button className="text-button" type="button" onClick={() => { setSelectedId(schedule.id); setSubmitError('') }}>{selectedId === schedule.id ? 'Selected' : 'Select'}</button></td>
                        </tr>
                      ))}</tbody>
                    </table>
                  </div>
                ) : (
                  <div className="empty-state handover-empty">
                    <strong>No eligible shipment schedules are available.</strong>
                    <p>Schedules must be approved and have a future planned date. Current schedules are unverified and past-dated.</p>
                  </div>
                )}
                {submitError && <p className="inline-error" role="alert">{submitError}</p>}
                <div className="handover-modal-actions">
                  <button className="button" type="button" onClick={closeDialog}>Cancel</button>
                  <button className="button button-primary" type="button" disabled={!selectedSchedule} onClick={() => { setConfirming(true); setSubmitError('') }}>Continue</button>
                </div>
              </>
            )}
          </section>
        </div>
      )}
    </main>
  )
}

function AccountPreferences({ onNavigate }: AdminScreensProps) {
  const [language, setLanguage] = useState('English')
  const [timeZone, setTimeZone] = useState('SLST · UTC+05:30')
  const [dateFormat, setDateFormat] = useState('DD MMM YYYY')
  const [density, setDensity] = useState('Compact')
  const [message, setMessage] = useState('')
  return (
    <main className="dashboard-content screen-content">
      <div className="detail-layout account-layout">
        <div className="detail-main">
          <Panel title="Interface preferences">
            <span className="draft-badge">Draft values</span>
            <div className="account-preference-grid">
              <label className="form-field">Language<select value={language} onChange={(event) => setLanguage(event.target.value)}><option>English</option></select><small>Proposed interface language.</small></label>
              <label className="form-field">Time zone<select value={timeZone} onChange={(event) => setTimeZone(event.target.value)}><option>SLST · UTC+05:30</option></select><small>Sri Lanka Standard Time.</small></label>
              <label className="form-field">Date format<select value={dateFormat} onChange={(event) => setDateFormat(event.target.value)}><option>DD MMM YYYY</option><option>YYYY-MM-DD</option></select><small>Example: 18 Oct 2026</small></label>
              <label className="form-field">Table density<select value={density} onChange={(event) => setDensity(event.target.value)}><option>Compact</option><option>Comfortable</option></select><small>Compact rows for operational review.</small></label>
            </div>
            <div className="notice-box"><strong>Proposed preference controls</strong><p>Values are draft examples, not live changed account settings. No account preferences have been saved.</p></div>
            {message && <p className="inline-notice" role="status">{message}</p>}
          </Panel>
          <Panel title="Compact table preview">
            <div className="preview-table"><div><strong>REFERENCE DATE</strong><strong>DISPLAY</strong></div><div><span>18 Oct 2026</span><span>{density} · Draft preview</span></div></div>
          </Panel>
        </div>
        <div className="detail-main">
          <Panel title="Profile summary">
            <div className="profile-summary"><span className="avatar">AM</span><div><strong>Ayesha M.</strong><span>Manufacturing Admin</span></div></div>
            <button className="button" type="button" onClick={() => setMessage('Admin profile details are not available in this preview.')}>View admin profile</button>
          </Panel>
          <Panel title="Notification preferences">
            <p className="body-copy">Manage in-app alerts and optional email delivery for manufacturer-side requirements, stock, schedules and handover updates.</p>
            <button className="button" type="button" onClick={() => onNavigate('notification-preferences')}>Notification preferences</button>
          </Panel>
        </div>
      </div>
      <div className="screen-actions"><button className="button" type="button" onClick={() => onNavigate('dashboard')}>Cancel · Back to settings</button><button className="button button-primary" type="button" onClick={() => setMessage('Draft values are displayed for review. No account settings were changed.')}>Save preferences</button></div>
      <ScreenFooter />
    </main>
  )
}

function AdminScreens({ page, onNavigate }: AdminScreensProps) {
  switch (page) {
    case 'notifications': return <Notifications page={page} onNavigate={onNavigate} />
    case 'notification-preferences': return <NotificationPreferences page={page} onNavigate={onNavigate} />
    case 'warehouse-handover': return <WarehouseHandover page={page} onNavigate={onNavigate} />
    case 'reports-orders': return <OrdersReport page={page} onNavigate={onNavigate} />
    case 'account-preferences': return <AccountPreferences page={page} onNavigate={onNavigate} />
    default: return null
  }
}

export default AdminScreens
