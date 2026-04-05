import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceArea, Area, ReferenceLine
} from 'recharts'

const COLORS = ['#f0c38e', '#6c7bd1', '#f1aa9b', '#8fd3b6']
const AXIS_COLOR = '#c7bfdc'
const GRID_COLOR = '#5a547d'
const TOOLTIP_STYLE = {
  background: '#3b355f',
  border: '1px solid #5a547d',
  borderRadius: 16,
  boxShadow: '0 20px 40px rgba(8, 6, 22, 0.35)',
  color: '#f6efe8',
}

function ProductivityDot(props) {
  const { cx, cy, payload } = props
  if (cx == null || cy == null) return null

  return (
    <g>
      <circle cx={cx} cy={cy} r={16} fill="rgba(240, 195, 142, 0.12)" />
      <circle cx={cx} cy={cy} r={8} fill="#f0c38e" stroke="#fff5e8" strokeWidth={3} />
      <text
        x={cx}
        y={cy - 24}
        textAnchor="middle"
        fill="#f6efe8"
        fontSize="12"
        fontWeight="700"
      >
        {`${payload?.score ?? 0}%`}
      </text>
    </g>
  )
}

export function TaskCompletionChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
        <XAxis dataKey="date" stroke={AXIS_COLOR} tick={{ fontSize: 11, fill: AXIS_COLOR }} />
        <YAxis stroke={AXIS_COLOR} tick={{ fontSize: 11, fill: AXIS_COLOR }} />
        <Tooltip contentStyle={TOOLTIP_STYLE} />
        <Line type="monotone" dataKey="completed" stroke="#f0c38e" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="created" stroke="#f1aa9b" strokeWidth={1.5} dot={false} strokeDasharray="4 4" />
      </LineChart>
    </ResponsiveContainer>
  )
}

export function RiskDistributionChart({ data }) {
  const hasData = data.some(item => Number(item.value) > 0)

  if (!hasData) {
    return (
      <div className="flex h-[220px] items-center justify-center text-sm text-[#c6bfdc]">
        No risk predictions available yet.
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value">
          {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
        </Pie>
        <Tooltip contentStyle={TOOLTIP_STYLE} />
        <Legend iconType="circle" wrapperStyle={{ fontSize: 12, color: AXIS_COLOR }} />
      </PieChart>
    </ResponsiveContainer>
  )
}

export function WorkloadChart({ data }) {
  const todayEntry = data.find(item => item.isToday)

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 8, right: 12, left: 24, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
        {todayEntry && (
          <ReferenceArea
            x1={todayEntry.day}
            x2={todayEntry.day}
            strokeOpacity={0}
            fill="#f0c38e"
            fillOpacity={0.08}
          />
        )}
        <XAxis dataKey="day" stroke={AXIS_COLOR} tick={{ fontSize: 11, fill: AXIS_COLOR }} />
        <YAxis stroke={AXIS_COLOR} tick={{ fontSize: 11, fill: AXIS_COLOR }} />
        <Tooltip contentStyle={TOOLTIP_STYLE} />
        <Legend iconType="circle" wrapperStyle={{ fontSize: 12, color: AXIS_COLOR }} />
        <Bar dataKey="tasks" name="Tasks" fill="#f0c38e" radius={[4, 4, 0, 0]} />
        <Bar dataKey="hours" name="Estimated Hours" fill="#6c7bd1" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export function ProductivityChart({ data }) {
  if (!data?.length) {
    return (
      <div className="flex h-[220px] items-center justify-center rounded-[24px] border border-dashed border-[#6a638f] bg-[#3f3964]/35 text-sm text-[#d8d1e6]">
        Productivity trend will appear as task history builds up.
      </div>
    )
  }

  const latestPoint = data[data.length - 1]

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 18, right: 16, left: 6, bottom: 8 }}>
        <defs>
          <linearGradient id="productivityGlow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f0c38e" stopOpacity={0.3} />
            <stop offset="100%" stopColor="#f0c38e" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
        <ReferenceLine y={75} stroke="#8fd3b6" strokeOpacity={0.18} strokeDasharray="6 6" />
        <XAxis dataKey="week" stroke={AXIS_COLOR} tick={{ fontSize: 11, fill: AXIS_COLOR }} />
        <YAxis stroke={AXIS_COLOR} tick={{ fontSize: 11, fill: AXIS_COLOR }} domain={[0, 100]} />
        <Tooltip contentStyle={TOOLTIP_STYLE} />
        <Area type="monotone" dataKey="score" stroke="none" fill="url(#productivityGlow)" />
        <Line
          type="monotone"
          dataKey="score"
          stroke="#f0c38e"
          strokeWidth={3}
          dot={<ProductivityDot />}
          activeDot={{ r: 9, fill: '#f0c38e', stroke: '#fff5e8', strokeWidth: 3 }}
        />
        {latestPoint && (
          <ReferenceArea
            x1={latestPoint.week}
            x2={latestPoint.week}
            strokeOpacity={0}
            fill="#f0c38e"
            fillOpacity={0.06}
          />
        )}
      </LineChart>
    </ResponsiveContainer>
  )
}
