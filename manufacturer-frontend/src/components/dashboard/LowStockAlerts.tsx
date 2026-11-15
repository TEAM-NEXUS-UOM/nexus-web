import type { LowStockAlert } from '../../types/dashboard'

interface LowStockAlertsProps {
  alerts: LowStockAlert[]
}

function LowStockAlerts({ alerts }: LowStockAlertsProps) {
  return (
    <section className="panel alerts-panel">
      <div className="panel-heading">
      <div><h2>Low stock alerts</h2></div>
      <span className="panel-count">{alerts.length} alerts</span>
      </div>
      <ul className="alert-list">
        {alerts.map((alert) => (
          <li className="alert-item" key={alert.id}>
            <strong>
              {alert.id} · {alert.product}
            </strong>
            <span className="alert-availability">Available {alert.available}</span>
            <span className="alert-threshold">Threshold {alert.threshold}</span>
            <span className="alert-message">{alert.message}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default LowStockAlerts
