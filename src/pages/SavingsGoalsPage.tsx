import { useState, type FormEvent } from 'react'
import type { GoalContribution, NewGoalContribution } from '../types/GoalContribution'
import type { SavingsGoal } from '../types/SavingsGoal'

type SavingsGoalData = Omit<SavingsGoal, 'id'>

type Props = {
  savingsGoals: SavingsGoal[]
  contributions: Record<number, GoalContribution[]>
  isLoading: boolean
  isSaving: boolean
  onAddSavingsGoal: (goal: SavingsGoalData) => Promise<boolean>
  onUpdateSavingsGoal: (id: number, goal: SavingsGoalData) => Promise<boolean>
  onDeleteSavingsGoal: (goal: SavingsGoal) => Promise<boolean>
  onLoadContributions: (goalId: number) => Promise<boolean>
  onAddContribution: (goalId: number, contribution: NewGoalContribution) => Promise<boolean>
  onDeleteContribution: (goalId: number, contribution: GoalContribution) => Promise<boolean>
}

const money = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })
const date = new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })
const formatDate = (value: string) => date.format(new Date(`${value}T00:00:00`))

function SavingsGoalsPage({
  savingsGoals, contributions, isLoading, isSaving, onAddSavingsGoal,
  onUpdateSavingsGoal, onDeleteSavingsGoal, onLoadContributions,
  onAddContribution, onDeleteContribution,
}: Props) {
  const [name, setName] = useState('')
  const [targetAmount, setTargetAmount] = useState('')
  const [targetDate, setTargetDate] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [openGoalId, setOpenGoalId] = useState<number | null>(null)
  const [contributionAmount, setContributionAmount] = useState('')
  const [contributionDate, setContributionDate] = useState('')
  const [isContributionsLoading, setIsContributionsLoading] = useState(false)

  function clearForm() {
    setName('')
    setTargetAmount('')
    setTargetDate('')
    setEditingId(null)
  }

  function edit(goal: SavingsGoal) {
    setName(goal.name)
    setTargetAmount(String(goal.targetAmount))
    setTargetDate(goal.targetDate)
    setEditingId(goal.id)
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const currentAmount = editingId === null
      ? 0
      : savingsGoals.find((goal) => goal.id === editingId)?.currentAmount ?? 0
    const goal = { name: name.trim(), targetAmount: Number(targetAmount), currentAmount, targetDate }
    const saved = editingId === null ? await onAddSavingsGoal(goal) : await onUpdateSavingsGoal(editingId, goal)
    if (saved) clearForm()
  }

  async function remove(goal: SavingsGoal) {
    const deleted = await onDeleteSavingsGoal(goal)
    if (deleted && editingId === goal.id) clearForm()
    if (deleted && openGoalId === goal.id) setOpenGoalId(null)
  }

  async function toggleContributions(goalId: number) {
    if (openGoalId === goalId) {
      setOpenGoalId(null)
      return
    }
    setOpenGoalId(goalId)
    if (contributions[goalId] === undefined) {
      setIsContributionsLoading(true)
      await onLoadContributions(goalId)
      setIsContributionsLoading(false)
    }
  }

  async function submitContribution(event: FormEvent<HTMLFormElement>, goalId: number) {
    event.preventDefault()
    const saved = await onAddContribution(goalId, { amount: Number(contributionAmount), date: contributionDate })
    if (saved) {
      setContributionAmount('')
      setContributionDate('')
    }
  }

  return <>
    <header><div><p>Planificación financiera</p><h1>Metas de ahorro</h1></div></header>
    <section className="income-form-section">
      <div className="section-heading"><div><p>{editingId === null ? 'Nueva meta' : 'Editando meta'}</p><h2>{editingId === null ? 'Agregar meta' : 'Editar meta'}</h2></div></div>
      <form className="income-form" onSubmit={submit}>
        <label>Nombre<input value={name} onChange={(event) => setName(event.target.value)} placeholder="Ej. Viaje" required /></label>
        <label>Monto objetivo<input type="number" value={targetAmount} onChange={(event) => setTargetAmount(event.target.value)} min="1" step="1" placeholder="0" required /></label>
        <label>Fecha objetivo<input type="date" value={targetDate} onChange={(event) => setTargetDate(event.target.value)} required /></label>
        <button type="submit" disabled={isSaving}>{isSaving ? 'Guardando...' : editingId === null ? 'Agregar meta' : 'Guardar cambios'}</button>
        {editingId !== null && <button type="button" className="cancel-edit" onClick={clearForm} disabled={isSaving}>Cancelar</button>}
      </form>
    </section>
    <section className="movements-section income-list-section">
      <div className="section-heading"><div><p>Progreso de ahorro</p><h2>Metas registradas</h2></div><span>{savingsGoals.length} registros</span></div>
      {isLoading ? <div className="loading-state">Cargando metas...</div> : <ul>
        {savingsGoals.map((goal) => {
          const remaining = Math.max(goal.targetAmount - goal.currentAmount, 0)
          const percentage = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100)
          const goalContributions = contributions[goal.id] ?? []
          const isOpen = openGoalId === goal.id
          return <li className="budget-row low" key={goal.id}>
            <div className="budget-heading"><div><strong>{goal.name}</strong><span>Fecha objetivo: {formatDate(goal.targetDate)}</span></div></div>
            <div className="budget-values">
              <div><span>Objetivo</span><strong>{money.format(goal.targetAmount)}</strong></div>
              <div><span>Actual</span><strong>{money.format(goal.currentAmount)}</strong></div>
              <div><span>Faltante</span><strong>{money.format(remaining)}</strong></div>
              <div><span>Alcanzado</span><strong>{percentage.toFixed(0)}%</strong></div>
            </div>
            <div className="budget-progress" role="progressbar" aria-label={`Progreso de ${goal.name}`} aria-valuenow={percentage} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${percentage}%` }} /></div>
            <div className="budget-footer"><span>{money.format(remaining)} por ahorrar</span><div className="movement-actions">
              <button type="button" onClick={() => toggleContributions(goal.id)} disabled={isSaving}>{isOpen ? 'Ocultar aportes' : 'Ver aportes'}</button>
              <button type="button" onClick={() => edit(goal)} disabled={isSaving}>Editar</button>
              <button type="button" className="delete-action" onClick={() => remove(goal)} disabled={isSaving}>Eliminar</button>
            </div></div>
            {isOpen && <div className="contributions-panel">
              <form className="contribution-form" onSubmit={(event) => submitContribution(event, goal.id)}>
                <label>Monto<input type="number" value={contributionAmount} onChange={(event) => setContributionAmount(event.target.value)} min="1" step="1" placeholder="0" required /></label>
                <label>Fecha<input type="date" value={contributionDate} onChange={(event) => setContributionDate(event.target.value)} required /></label>
                <button type="submit" disabled={isSaving}>{isSaving ? 'Guardando...' : 'Agregar aporte'}</button>
              </form>
              {isContributionsLoading ? <div className="loading-state">Cargando aportes...</div> : goalContributions.length === 0 ? <p className="empty-contributions">No hay aportes registrados.</p> : <ul className="contribution-list">
                {goalContributions.map((contribution) => <li key={contribution.id}><div><strong>{money.format(contribution.amount)}</strong><span>{formatDate(contribution.date)}</span></div><div className="movement-actions"><button type="button" className="delete-action" onClick={() => onDeleteContribution(goal.id, contribution)} disabled={isSaving}>Eliminar</button></div></li>)}
              </ul>}
            </div>}
          </li>
        })}
      </ul>}
    </section>
  </>
}

export default SavingsGoalsPage
