import SummaryCard from '../components/SummaryCard'
import type { Transaction } from '../types/Transaction'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

type Props = {
  incomes: Transaction[]
  expenses: Transaction[]
  onChangePage: (page: string) => void
}

const monthNames = [
  'Ene',
  'Feb',
  'Mar',
  'Abr',
  'May',
  'Jun',
  'Jul',
  'Ago',
  'Sep',
  'Oct',
  'Nov',
  'Dic',
]

function Dashboard({ incomes, expenses, onChangePage }: Props) {
  const totalIncomes = incomes.reduce(
    (total, item) => total + item.amount,
    0
  )

  const totalExpenses = expenses.reduce(
    (total, item) => total + item.amount,
    0
  )

  const balance = totalIncomes - totalExpenses

  const recentMovements = [...incomes, ...expenses]
    .sort(
      (a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    )
    .slice(0, 3)

  const expensesByCategory = expenses.reduce<Record<string, number>>(
    (accumulator, expense) => {
      accumulator[expense.category] =
        (accumulator[expense.category] ?? 0) + expense.amount

      return accumulator
    },
    {}
  )

  const categorySummary = Object.entries(expensesByCategory)
    .map(([category, amount]) => ({
      category,
      amount,
      percentage:
        totalExpenses > 0
          ? (amount / totalExpenses) * 100
          : 0,
    }))
    .sort((a, b) => b.amount - a.amount)

  const monthlySummary = monthNames.map((month, index) => {
    const monthNumber = index + 1

    const monthlyIncomes = incomes
      .filter((income) => {
        const [, transactionMonth] = income.date
          .split('-')
          .map(Number)

        return transactionMonth === monthNumber
      })
      .reduce((total, income) => total + income.amount, 0)

    const monthlyExpenses = expenses
      .filter((expense) => {
        const [, transactionMonth] = expense.date
          .split('-')
          .map(Number)

        return transactionMonth === monthNumber
      })
      .reduce((total, expense) => total + expense.amount, 0)

    return {
      month,
      incomes: monthlyIncomes,
      expenses: monthlyExpenses,
    }
  })

  return (
    <>
      <header>
        <div>
          <p>Resumen financiero</p>
          <h1>Dashboard</h1>
        </div>

        <div className="month">Agosto 2026</div>
      </header>

      <section
        className="summary-grid"
        aria-label="Resumen mensual"
      >
        <SummaryCard
          label="Balance"
          amount={`$${balance.toLocaleString('es-CO')}`}
          tone="primary"
        />

        <SummaryCard
          label="Ingresos"
          amount={`$${totalIncomes.toLocaleString('es-CO')}`}
          tone="income"
        />

        <SummaryCard
          label="Gastos"
          amount={`$${totalExpenses.toLocaleString('es-CO')}`}
          tone="expense"
        />
      </section>

      <section className="movements-section">
        <div className="section-heading">
          <div>
            <p>Análisis mensual</p>
            <h2>Ingresos vs gastos</h2>
          </div>
        </div>

        <div className="monthly-chart">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={monthlySummary}
              margin={{ top: 24, right: 8, left: 8, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" tickLine={false} axisLine={false} />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) =>
                  `$${Number(value).toLocaleString('es-CO', {
                    notation: 'compact',
                  })}`
                }
              />
              <Tooltip
                formatter={(value, name) => [
                  `$${Number(value).toLocaleString('es-CO')}`,
                  name === 'incomes' ? 'Ingresos' : 'Gastos',
                ]}
              />
              <Legend
                formatter={(value) =>
                  value === 'incomes' ? 'Ingresos' : 'Gastos'
                }
              />
              <Bar
                dataKey="incomes"
                fill="#25a57a"
                radius={[5, 5, 0, 0]}
              />
              <Bar
                dataKey="expenses"
                fill="#dc5865"
                radius={[5, 5, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="movements-section">
        <div className="section-heading">
          <div>
            <p>Análisis de gastos</p>
            <h2>Gastos por categoría</h2>
          </div>
        </div>

        <ul className="category-summary">
          {categorySummary.map((item) => (
            <li
              className="category-row"
              key={item.category}
            >
              <div className="category-heading">
                <strong>{item.category}</strong>
                <span>{item.percentage.toFixed(1)}%</span>
              </div>

              <div
                className="category-progress"
                role="progressbar"
                aria-label={`${item.category}: ${item.percentage.toFixed(1)}% de los gastos`}
                aria-valuenow={item.percentage}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <span style={{ width: `${item.percentage}%` }} />
              </div>

              <span className="category-value">
                ${item.amount.toLocaleString('es-CO')}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="movements-section">
        <div className="section-heading">
          <div>
            <p>Actividad reciente</p>
            <h2>Últimos movimientos</h2>
          </div>

          <button
            type="button"
            className="view-all"
            onClick={() => onChangePage('Movimientos')}
          >
            Ver todos
          </button>
        </div>

        <ul>
          {recentMovements.map((item) => (
            <li
              className="movement-row"
              key={`${item.type}-${item.id}`}
            >
              <div
                className={`movement-icon ${item.type}`}
                aria-hidden="true"
              >
                {item.type === 'income' ? '↗' : '↘'}
              </div>

              <div className="movement-info">
                <strong>{item.description}</strong>
                <span>{item.date}</span>
              </div>

              <strong className={`movement-amount ${item.type}`}>
                {item.type === 'income' ? '+' : '-'} $
                {item.amount.toLocaleString('es-CO')}
              </strong>
            </li>
          ))}
        </ul>
      </section>
    </>
  )
}

export default Dashboard
