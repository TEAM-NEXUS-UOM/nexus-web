import type { WorkspacePage } from './Sidebar'

interface ReportTabsProps {
  page: WorkspacePage
  onNavigate: (page: WorkspacePage) => void
}

const reportTabs: { label: string; page: WorkspacePage }[] = [
  { label: 'Orders', page: 'reports-orders' },
  { label: 'Stock', page: 'reports' },
  { label: 'Schedules & Handover', page: 'shipment-schedules' },
]

function ReportTabs({ page, onNavigate }: ReportTabsProps) {
  return (
    <div className="tab-list reports-tabs" role="tablist" aria-label="Report type">
      {reportTabs.map((tab) => (
        <button
          className={page === tab.page ? 'active-tab' : ''}
          type="button"
          role="tab"
          aria-selected={page === tab.page}
          key={tab.label}
          onClick={() => onNavigate(tab.page)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}

export default ReportTabs
