import { useState, type FormEvent } from 'react'
import type { Budget } from '../types/Budget'
import type { Transaction } from '../types/Transaction'

type NewBudget = Omit<Budget, 'id'>

type Props = {
  budgets: Budget[]
  expenses: Transaction[]
  isLoading: boolean
  isSaving: boolean
  onAddBudget: (budget: NewBudget) => Promise<boolean>
  onUpdateBudget: (id: number, budget: NewBudget) => Promise<boolean>
  onDeleteBudget: (budget: Budget) => Promise<boolean>
}

const months = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
]

const money = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
})

function BudgetPage({
  budgets,
  expenses,
  isLoading,
  isSaving,
  onAddBudget,
  onUpdateBudget,
  onDeleteBudget,
}: Props) {
  const today = new Date()

  const [category, setCategory] = useState('')
  const [limitAmount, setLimitAmount] = useState('')
  const [month, setMonth] = useState(today.getMonth() + 1)
  const [year, setYear] = useState(today.getFullYear())
  const [editingId, setEditingId] = useState<number | null>(null)

  function clearForm() {
    setCategory('')
    setLimitAmount('')
    setMonth(today.getMonth() + 1)
    setYear(today.getFullYear())
    setEditingId(null)
  }

  function edit(budget: Budget) {
    setCategory(budget.category)
    setLimitAmount(String(budget.limitAmount))
    setMonth(budget.month)
    setYear(budget.year)
    setEditingId(budget.id)
  }

  async function remove(budget: Budget) {
    const deleted = await onDeleteBudget(budget)

    if (deleted && editingId === budget.id) {
      clearForm()
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const budget = {
      category: category.trim(),
      limitAmount: Number(limitAmount),
      month,
      year,
    }

    const saved =
      editingId === null
        ? await onAddBudget(budget)
        : await onUpdateBudget(editingId, budget)

    if (saved) {
      clearForm()
    }
  }

  function calculateSpent(budget: Budget) {
    return expenses
      .filter((expense) => {
        const [expenseYear, expenseMonth] = expense.date
          .split('-')
          .map(Number)

        const sameCategory =
          expense.category.trim().toLowerCase() ===
          budget.category.trim().toLowerCase()

        const sameMonth = expenseMonth === budget.month
        const sameYear = expenseYear === budget.year

        return sameCategory && sameMonth && sameYear
      })
      .reduce((total, expense) => total + expense.amount, 0)
  }

  return (
    <>
      <header>
        <div>
          <p>Planeación mensual</p>
          <h1>Presupuestos</h1>
        </div>
      </header>

      <section className="income-form-section">
        <div className="section-heading">
          <div>
            <p>
              {editingId === null
                ? 'Nuevo presupuesto'
                : 'Editando presupuesto'}
            </p>

            <h2>
              {editingId === null
                ? 'Agregar presupuesto'
                : 'Editar presupuesto'}
            </h2>
          </div>
        </div>

        <form className="income-form" onSubmit={submit}>
          <label>
            Categoría
            <input
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              placeholder="Ej. Alimentación"
              required
            />
          </label>

          <label>
            Límite
            <input
              type="number"
              value={limitAmount}
              onChange={(event) => setLimitAmount(event.target.value)}
              min="1"
              step="1"
              placeholder="0"
              required
            />
          </label>

          <label>
            Mes
            <select
              value={month}
              onChange={(event) => setMonth(Number(event.target.value))}
            >
              {months.map((item, index) => (
                <option value={index + 1} key={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label>
            Año
            <input
              type="number"
              value={year}
              onChange={(event) => setYear(Number(event.target.value))}
              min="1"
              required
            />
          </label>

          <button type="submit" disabled={isSaving}>
            {isSaving
              ? 'Guardando...'
              : editingId === null
                ? 'Agregar presupuesto'
                : 'Guardar cambios'}
          </button>

          {editingId !== null && (
            <button
              type="button"
              className="cancel-edit"
              onClick={clearForm}
              disabled={isSaving}
            >
              Cancelar
            </button>
          )}
        </form>
      </section>

      <section className="movements-section income-list-section">
        <div className="section-heading">
          <div>
            <p>Presupuestos mensuales</p>
            <h2>Presupuestos registrados</h2>
          </div>

          <span>{budgets.length} registros</span>
        </div>

        {isLoading ? (
          <div className="loading-state">
            Cargando presupuestos...
          </div>
        ) : (
          <ul>
            {budgets.map((budget) => {
              const spent = calculateSpent(budget)
              const available = budget.limitAmount - spent

              const percentage = Math.min(
                (spent / budget.limitAmount) * 100,
                100
              )
              const isExceeded = spent > budget.limitAmount
              const status = isExceeded || percentage >= 90
                ? 'high'
                : percentage >= 70
                  ? 'medium'
                  : 'low'

              return (
                <li className={`budget-row ${status}`} key={budget.id}>
                  <div className="budget-heading">
                    <div>
                      <strong>{budget.category}</strong>
                      <span>{months[budget.month - 1]} de {budget.year}</span>
                    </div>
                    {isExceeded && <span className="budget-exceeded">Presupuesto excedido</span>}
                  </div>

                  <div className="budget-values">
                    <div><span>Límite</span><strong>{money.format(budget.limitAmount)}</strong></div>
                    <div><span>Gastado</span><strong>{money.format(spent)}</strong></div>
                    <div><span>Disponible</span><strong>{money.format(available)}</strong></div>
                    <div><span>Utilizado</span><strong>{percentage.toFixed(0)}%</strong></div>
                  </div>

                  <div className="budget-progress" role="progressbar" aria-label={`Presupuesto utilizado en ${budget.category}`} aria-valuenow={percentage} aria-valuemin={0} aria-valuemax={100}>
                    <span style={{ width: `${percentage}%` }} />
                  </div>

                  <div className="budget-footer">
                    <span>{isExceeded ? `Excedido por ${money.format(Math.abs(available))}` : `${money.format(available)} disponibles`}</span>
                    <div className="movement-actions">
                      <button type="button" onClick={() => edit(budget)} disabled={isSaving}>Editar</button>
                      <button type="button" className="delete-action" onClick={() => remove(budget)} disabled={isSaving}>Eliminar</button>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </>
  )
}

export default BudgetPage
