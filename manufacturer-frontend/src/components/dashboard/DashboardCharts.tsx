import type { Shipment, StockRecord } from '../../types/dashboard'

interface DashboardChartsProps {
  stockRecords: StockRecord[]
  shipments: Shipment[]
}

interface ChartSeries {
  key: string
  label: string
  className: string
  values: number[]
}

interface GroupedBarChartProps {
  categories: string[]
  series: ChartSeries[]
  maxValue: number
  accessibleLabel: string
}

const formatNumber = (value: number) => value.toLocaleString('en-US')
const parseNumber = (value: string) => Number(value.replaceAll(',', ''))

function GroupedBarChart({ categories, series, maxValue, accessibleLabel }: GroupedBarChartProps) {
  const width = 700
  const height = 250
  const left = 48
  const right = 12
  const top = 14
  const bottom = 52
  const plotWidth = width - left - right
  const plotHeight = height - top - bottom
  const baseline = top + plotHeight
  const groupWidth = plotWidth / categories.length
  const barGap = 4
  const barWidth = Math.min(20, (groupWidth * 0.7 - barGap * (series.length - 1)) / series.length)
  const yTicks = Array.from({ length: 5 }, (_, index) => (maxValue / 4) * index)

  return (
    <svg
      className="grouped-bar-chart"
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={accessibleLabel}
    >
      <title>{accessibleLabel}</title>
      {yTicks.map((tick) => {
        const y = baseline - (tick / maxValue) * plotHeight
        return (
          <g key={tick}>
            <line className="chart-gridline" x1={left} x2={width - right} y1={y} y2={y} />
            <text className="chart-axis-label" x={left - 8} y={y + 3} textAnchor="end">
              {formatNumber(tick)}
            </text>
          </g>
        )
      })}
      <line className="chart-axis" x1={left} x2={width - right} y1={baseline} y2={baseline} />
      {categories.map((category, categoryIndex) => {
        const categoryX = left + categoryIndex * groupWidth + groupWidth / 2
        const barsWidth = series.length * barWidth + (series.length - 1) * barGap
        return (
          <g key={category}>
            {series.map((item, seriesIndex) => {
              const value = item.values[categoryIndex]
              const barHeight = (value / maxValue) * plotHeight
              const x = categoryX - barsWidth / 2 + seriesIndex * (barWidth + barGap)
              const y = baseline - barHeight
              return (
                <rect
                  className={item.className}
                  key={item.key}
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  rx={2}
                >
                  <title>{`${category}: ${item.label} ${formatNumber(value)}`}</title>
                </rect>
              )
            })}
            <text className="chart-category-label" x={categoryX} y={baseline + 18} textAnchor="middle">
              {category}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

function ChartLegend({ series }: { series: ChartSeries[] }) {
  return (
    <div className="chart-legend" aria-label="Chart key">
      {series.map((item) => (
        <span key={item.key}><i className={item.className} />{item.label}</span>
      ))}
    </div>
  )
}

function StockThresholdChart({ records }: { records: StockRecord[] }) {
  const maxStock = Math.max(
    ...records.flatMap((record) => [
      parseNumber(record.available),
      parseNumber(record.threshold),
      parseNumber(record.reserved),
    ]),
    1,
  )
  const maxValue = Math.ceil(maxStock / 4) * 4
  const series: ChartSeries[] = [
    { key: 'available', label: 'Available', className: 'chart-bar-available', values: records.map((record) => parseNumber(record.available)) },
    { key: 'threshold', label: 'Threshold', className: 'chart-bar-threshold', values: records.map((record) => parseNumber(record.threshold)) },
    { key: 'reserved', label: 'Order demand', className: 'chart-bar-orders', values: records.map((record) => parseNumber(record.reserved)) },
  ]

  return (
    <section className="panel dashboard-chart-panel" aria-labelledby="stock-chart-title">
      <div className="panel-heading">
        <div>
          <h2 id="stock-chart-title">Stock vs. threshold and order demand</h2>
          <p>Units by product · reserved stock represents scheduled order demand</p>
        </div>
      </div>
      <ChartLegend series={series} />
      <GroupedBarChart
        categories={records.map((record) => record.id)}
        series={series}
        maxValue={maxValue}
        accessibleLabel="Grouped bar chart comparing available stock, threshold, and reserved order demand by product"
      />
    </section>
  )
}

function CompletionChart({ shipments }: { shipments: Shipment[] }) {
  const orderSourceCount = 24
  const series: ChartSeries[] = [
    { key: 'current', label: 'Source / scheduled', className: 'chart-bar-orders', values: [orderSourceCount, shipments.length] },
    { key: 'completed', label: 'Verified complete', className: 'chart-bar-available', values: [0, 0] },
  ]

  return (
    <section className="panel dashboard-chart-panel completion-chart-panel" aria-labelledby="completion-chart-title">
      <div className="panel-heading">
        <div>
          <h2 id="completion-chart-title">Orders and shipment progress</h2>
          <p>Current records compared with verified completions</p>
        </div>
      </div>
      <ChartLegend series={series} />
      <GroupedBarChart
        categories={['Orders', 'Shipments']}
        series={series}
        maxValue={orderSourceCount}
        accessibleLabel="Grouped bar chart comparing current order and shipment counts with verified completions"
      />
      <p className="chart-footnote">The 24 order count is from an unverified SAP source. No verified order or shipment completion records were supplied.</p>
    </section>
  )
}

function DashboardCharts({ stockRecords, shipments }: DashboardChartsProps) {
  return (
    <section className="dashboard-charts" aria-label="Stock and shipment charts">
      <StockThresholdChart records={stockRecords} />
      <CompletionChart shipments={shipments} />
    </section>
  )
}

export default DashboardCharts
