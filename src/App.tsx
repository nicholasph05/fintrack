import { useCallback, useEffect, useState } from 'react'
import './App.css'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import ExpensesPage from './pages/ExpensesPage'
import IncomesPage from './pages/IncomesPage'
import MovementsPage from './pages/MovementsPage'
import AuthPage from './pages/AuthPage'
import BudgetPage from './pages/BudgetPage'
import SavingsGoalsPage from './pages/SavingsGoalsPage'
import type { Budget } from './types/Budget'
import type { SavingsGoal } from './types/SavingsGoal'
import type { GoalContribution, NewGoalContribution } from './types/GoalContribution'
import type { Transaction } from './types/Transaction'

const API_URL = 'http://localhost:8080/api/transactions'
const BUDGET_API_URL = 'http://localhost:8080/api/budgets'
const SAVINGS_GOAL_API_URL = 'http://localhost:8080/api/savings-goals'
type NewTransaction = Omit<Transaction, 'id'>
type NewBudget = Omit<Budget, 'id'>
type NewSavingsGoal = Omit<SavingsGoal, 'id'>
type Notice = { type: 'success' | 'error'; text: string }

function App() {
  const [token, setToken] = useState(() => localStorage.getItem('fintrack_token'))
  const [activePage, setActivePage] = useState('Dashboard')
  const [incomes, setIncomes] = useState<Transaction[]>([])
  const [expenses, setExpenses] = useState<Transaction[]>([])
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([])
  const [goalContributions, setGoalContributions] = useState<Record<number, GoalContribution[]>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isBudgetsLoading, setIsBudgetsLoading] = useState(true)
  const [isSavingsGoalsLoading, setIsSavingsGoalsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [notice, setNotice] = useState<Notice | null>(null)

  const logout = useCallback(() => {
    localStorage.removeItem('fintrack_token')
    setToken(null)
    setIncomes([])
    setExpenses([])
    setBudgets([])
    setSavingsGoals([])
    setGoalContributions({})
  }, [])

  const authenticatedFetch = useCallback((url: string, options: RequestInit = {}) => {
    const headers = new Headers(options.headers)
    headers.set('Authorization', `Bearer ${token}`)
    return fetch(url, { ...options, headers }).then((response) => {
      if (response.status === 401 || response.status === 403) logout()
      return response
    })
  }, [logout, token])

  function handleAuthenticated(authToken: string, isRegistration: boolean) {
    setNotice(isRegistration ? { type: 'success', text: 'Cuenta creada correctamente.' } : null)
    setToken(authToken)
  }

  useEffect(() => {
    if (!token) return

    async function loadTransactions() {
      setIsLoading(true)
      try {
        const response = await authenticatedFetch(API_URL)
        if (!response.ok) throw new Error('No se pudieron cargar las transacciones')
        const transactions: Transaction[] = await response.json()
        setIncomes(transactions.filter((transaction) => transaction.type === 'income'))
        setExpenses(transactions.filter((transaction) => transaction.type === 'expense'))
      } catch (error) {
        console.error(error)
        setNotice({ type: 'error', text: 'No se pudieron cargar las transacciones.' })
      } finally {
        setIsLoading(false)
      }
    }

    loadTransactions()

    async function loadBudgets() {
      setIsBudgetsLoading(true)
      try {
        const response = await authenticatedFetch(BUDGET_API_URL)
        if (!response.ok) throw new Error('No se pudieron cargar los presupuestos')
        setBudgets(await response.json())
      } catch (error) {
        console.error(error)
        setNotice({ type: 'error', text: 'No se pudieron cargar los presupuestos.' })
      } finally {
        setIsBudgetsLoading(false)
      }
    }

    loadBudgets()

    async function loadSavingsGoals() {
      setIsSavingsGoalsLoading(true)
      try {
        const response = await authenticatedFetch(SAVINGS_GOAL_API_URL)
        if (!response.ok) throw new Error('No se pudieron cargar las metas')
        setSavingsGoals(await response.json())
      } catch (error) {
        console.error(error)
        setNotice({ type: 'error', text: 'No se pudieron cargar las metas.' })
      } finally {
        setIsSavingsGoalsLoading(false)
      }
    }

    loadSavingsGoals()
  }, [authenticatedFetch, token])

  async function addTransaction(transaction: NewTransaction) {
    setIsSaving(true)
    setNotice(null)
    try {
      const response = await authenticatedFetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transaction),
      })
      if (!response.ok) throw new Error('No se pudo guardar la transacción')
      const savedTransaction: Transaction = await response.json()
      const update = savedTransaction.type === 'income' ? setIncomes : setExpenses
      update((current) => [savedTransaction, ...current])
      setNotice({ type: 'success', text: 'Transacción creada correctamente.' })
      return true
    } catch (error) {
      console.error(error)
      setNotice({ type: 'error', text: 'No se pudo crear la transacción.' })
      return false
    } finally {
      setIsSaving(false)
    }
  }

  async function updateTransaction(id: number, transaction: NewTransaction) {
    setIsSaving(true)
    setNotice(null)
    try {
      const response = await authenticatedFetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transaction),
      })
      if (!response.ok) throw new Error('No se pudo actualizar la transacción')
      const updatedTransaction: Transaction = await response.json()
      const update = updatedTransaction.type === 'income' ? setIncomes : setExpenses
      update((current) => current.map((item) => item.id === id ? updatedTransaction : item))
      setNotice({ type: 'success', text: 'Transacción actualizada correctamente.' })
      return true
    } catch (error) {
      console.error(error)
      setNotice({ type: 'error', text: 'No se pudo actualizar la transacción.' })
      return false
    } finally {
      setIsSaving(false)
    }
  }

  async function deleteTransaction(transaction: Transaction) {
    setIsSaving(true)
    setNotice(null)
    try {
      const response = await authenticatedFetch(`${API_URL}/${transaction.id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('No se pudo eliminar la transacción')
      const update = transaction.type === 'income' ? setIncomes : setExpenses
      update((current) => current.filter((item) => item.id !== transaction.id))
      setNotice({ type: 'success', text: 'Transacción eliminada correctamente.' })
      return true
    } catch (error) {
      console.error(error)
      setNotice({ type: 'error', text: 'No se pudo eliminar la transacción.' })
      return false
    } finally {
      setIsSaving(false)
    }
  }

  async function saveBudget(budget: NewBudget, id?: number) {
    setIsSaving(true)
    setNotice(null)
    try {
      const response = await authenticatedFetch(id === undefined ? BUDGET_API_URL : `${BUDGET_API_URL}/${id}`, {
        method: id === undefined ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(budget),
      })
      if (!response.ok) throw new Error('No se pudo guardar el presupuesto')
      const savedBudget: Budget = await response.json()
      setBudgets((current) => id === undefined
        ? [savedBudget, ...current]
        : current.map((item) => item.id === id ? savedBudget : item))
      setNotice({ type: 'success', text: id === undefined ? 'Presupuesto creado correctamente.' : 'Presupuesto actualizado correctamente.' })
      return true
    } catch (error) {
      console.error(error)
      setNotice({ type: 'error', text: 'No se pudo guardar el presupuesto.' })
      return false
    } finally {
      setIsSaving(false)
    }
  }

  async function deleteBudget(budget: Budget) {
    setIsSaving(true)
    setNotice(null)
    try {
      const response = await authenticatedFetch(`${BUDGET_API_URL}/${budget.id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('No se pudo eliminar el presupuesto')
      setBudgets((current) => current.filter((item) => item.id !== budget.id))
      setNotice({ type: 'success', text: 'Presupuesto eliminado correctamente.' })
      return true
    } catch (error) {
      console.error(error)
      setNotice({ type: 'error', text: 'No se pudo eliminar el presupuesto.' })
      return false
    } finally {
      setIsSaving(false)
    }
  }

  async function saveSavingsGoal(goal: NewSavingsGoal, id?: number) {
    setIsSaving(true)
    setNotice(null)
    try {
      const response = await authenticatedFetch(id === undefined ? SAVINGS_GOAL_API_URL : `${SAVINGS_GOAL_API_URL}/${id}`, {
        method: id === undefined ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(goal),
      })
      if (!response.ok) throw new Error('No se pudo guardar la meta')
      const savedGoal: SavingsGoal = await response.json()
      setSavingsGoals((current) => id === undefined
        ? [savedGoal, ...current]
        : current.map((item) => item.id === id ? savedGoal : item))
      setNotice({ type: 'success', text: id === undefined ? 'Meta creada correctamente.' : 'Meta actualizada correctamente.' })
      return true
    } catch (error) {
      console.error(error)
      setNotice({ type: 'error', text: 'No se pudo guardar la meta.' })
      return false
    } finally {
      setIsSaving(false)
    }
  }

  async function deleteSavingsGoal(goal: SavingsGoal) {
    setIsSaving(true)
    setNotice(null)
    try {
      const response = await authenticatedFetch(`${SAVINGS_GOAL_API_URL}/${goal.id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('No se pudo eliminar la meta')
      setSavingsGoals((current) => current.filter((item) => item.id !== goal.id))
      setGoalContributions((current) => {
        const updated = { ...current }
        delete updated[goal.id]
        return updated
      })
      setNotice({ type: 'success', text: 'Meta eliminada correctamente.' })
      return true
    } catch (error) {
      console.error(error)
      setNotice({ type: 'error', text: 'No se pudo eliminar la meta.' })
      return false
    } finally {
      setIsSaving(false)
    }
  }

  async function loadGoalContributions(goalId: number) {
    try {
      const response = await authenticatedFetch(`${SAVINGS_GOAL_API_URL}/${goalId}/contributions`)
      if (!response.ok) throw new Error('No se pudieron cargar los aportes')
      const loadedContributions: GoalContribution[] = await response.json()
      setGoalContributions((current) => ({ ...current, [goalId]: loadedContributions }))
      return true
    } catch (error) {
      console.error(error)
      setNotice({ type: 'error', text: 'No se pudieron cargar los aportes.' })
      return false
    }
  }

  async function addGoalContribution(goalId: number, contribution: NewGoalContribution) {
    setIsSaving(true)
    setNotice(null)
    try {
      const response = await authenticatedFetch(`${SAVINGS_GOAL_API_URL}/${goalId}/contributions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contribution),
      })
      if (!response.ok) throw new Error('No se pudo guardar el aporte')
      const savedContribution: GoalContribution = await response.json()
      setGoalContributions((current) => ({
        ...current,
        [goalId]: [savedContribution, ...(current[goalId] ?? [])],
      }))
      setSavingsGoals((current) => current.map((goal) => goal.id === goalId
        ? { ...goal, currentAmount: goal.currentAmount + savedContribution.amount }
        : goal))
      setNotice({ type: 'success', text: 'Aporte creado correctamente.' })
      return true
    } catch (error) {
      console.error(error)
      setNotice({ type: 'error', text: 'No se pudo crear el aporte.' })
      return false
    } finally {
      setIsSaving(false)
    }
  }

  async function deleteGoalContribution(goalId: number, contribution: GoalContribution) {
    setIsSaving(true)
    setNotice(null)
    try {
      const response = await authenticatedFetch(`${SAVINGS_GOAL_API_URL}/${goalId}/contributions/${contribution.id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('No se pudo eliminar el aporte')
      setGoalContributions((current) => ({
        ...current,
        [goalId]: (current[goalId] ?? []).filter((item) => item.id !== contribution.id),
      }))
      setSavingsGoals((current) => current.map((goal) => goal.id === goalId
        ? { ...goal, currentAmount: Math.max(goal.currentAmount - contribution.amount, 0) }
        : goal))
      setNotice({ type: 'success', text: 'Aporte eliminado correctamente.' })
      return true
    } catch (error) {
      console.error(error)
      setNotice({ type: 'error', text: 'No se pudo eliminar el aporte.' })
      return false
    } finally {
      setIsSaving(false)
    }
  }

  if (!token) return <AuthPage onAuthenticated={handleAuthenticated} />

  return <div className="app-shell">
    <Sidebar activePage={activePage} onChangePage={setActivePage} onLogout={logout} />
    <main className="main-content">
      {notice && <div className={`notice ${notice.type}`} role="status">{notice.text}</div>}
      {isLoading ? <section className="loading-state">Cargando transacciones...</section>
        : activePage === 'Dashboard' ? <Dashboard incomes={incomes} expenses={expenses} onChangePage={setActivePage} />
        : activePage === 'Ingresos' ? <IncomesPage transactions={incomes} isSaving={isSaving} onAddTransaction={addTransaction} onUpdateTransaction={updateTransaction} onDeleteTransaction={deleteTransaction} />
        : activePage === 'Gastos' ? <ExpensesPage transactions={expenses} isSaving={isSaving} onAddTransaction={addTransaction} onUpdateTransaction={updateTransaction} onDeleteTransaction={deleteTransaction} />
        : activePage === 'Movimientos' ? <MovementsPage incomes={incomes} expenses={expenses} />
        : activePage === 'Presupuestos' ? <BudgetPage budgets={budgets} expenses={expenses} isLoading={isBudgetsLoading} isSaving={isSaving} onAddBudget={saveBudget} onUpdateBudget={(id, budget) => saveBudget(budget, id)} onDeleteBudget={deleteBudget} />
        : <SavingsGoalsPage savingsGoals={savingsGoals} contributions={goalContributions} isLoading={isSavingsGoalsLoading} isSaving={isSaving} onAddSavingsGoal={saveSavingsGoal} onUpdateSavingsGoal={(id, goal) => saveSavingsGoal(goal, id)} onDeleteSavingsGoal={deleteSavingsGoal} onLoadContributions={loadGoalContributions} onAddContribution={addGoalContribution} onDeleteContribution={deleteGoalContribution} />}
    </main>
  </div>
}
export default App
