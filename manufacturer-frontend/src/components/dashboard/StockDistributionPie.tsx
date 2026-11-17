import type { StockRecord } from '../../types/dashboard'

interface StockDistributionPieProps {
  records: StockRecord[]
}

const colors = ['#496579', '#6c9a7a', '#d39245', '#7b72a6', '#d36b57', '#55a0a5']
const parseNumber = (value: string) => Number(value.replaceAll(',', ''))

function StockDistributionPie({ records }: StockDistributionPieProps) {
  const total = records.reduce((sum, record) => sum + parseNumber(record.onHand), 0)
  const slices = records.reduce<Array<StockRecord & { value: number; share: number; path: string; color: string; endAngle: number }>>((result, record, index) => {
    const value = parseNumber(record.onHand)
    const share = total === 0 ? 0 : value / total
    const startAngle = result.length > 0 ? result[result.length - 1].endAngle : -90
    const endAngle = startAngle + share * 360
    const start = {
      x: 120 + 100 * Math.cos((startAngle * Math.PI) / 180),
      y: 120 + 100 * Math.sin((startAngle * Math.PI) / 180),
    }
    const end = {
      x: 120 + 100 * Math.cos((endAngle * Math.PI) / 180),
      y: 120 + 100 * Math.sin((endAngle * Math.PI) / 180),
    }
    const path = `M 120 120 L ${start.x} ${start.y} A 100 100 0 ${share > 0.5 ? 1 : 0} 1 ${end.x} ${end.y} Z`

    return [...result, { ...record, value, share, path, color: colors[index % colors.length], endAngle }]
  }, [])

  return (
    <section className="screen-panel stock-pie-panel" aria-labelledby="stock-mix-title">
      <h2 className="screen-panel-title" id="stock-mix-title">Warehouse stock mix</h2>
      <div className="screen-panel-content">
        <svg
          className="stock-pie-chart"
          viewBox="0 0 240 240"
          role="img"
          aria-label={`Pie chart of on-hand stock share across ${records.length} products`}
        >
          <title>Warehouse stock mix by on-hand units</title>
          {slices.map((slice) => (
            <path d={slice.path} fill={slice.color} key={slice.id}>
              <title>{`${slice.product}: ${slice.value.toLocaleString('en-US')} units, ${(slice.share * 100).toFixed(1)}%`}</title>
            </path>
          ))}
        </svg>
        <ul className="stock-pie-legend" aria-label="Pie chart key">
          {slices.map((slice) => (
            <li key={slice.id}>
              <i style={{ backgroundColor: slice.color }} aria-hidden="true" />
              <span>{slice.product} · {(slice.share * 100).toFixed(1)}%</span>
            </li>
          ))}
        </ul>
        <p className="stock-pie-footnote">Shows each product’s share of recorded on-hand units, not physical warehouse volume.</p>
      </div>
    </section>
  )
}

export default StockDistributionPie
