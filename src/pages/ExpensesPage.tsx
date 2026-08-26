import { useState, type FormEvent } from 'react'
import type { Transaction } from '../types/Transaction'

type Props = {
  transactions: Transaction[]
  isSaving: boolean
  onAddTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<boolean>
  onUpdateTransaction: (id: number, transaction: Omit<Transaction, 'id'>) => Promise<boolean>
  onDeleteTransaction: (transaction: Transaction) => Promise<boolean>
}
const categories = ['Vivienda', 'Alimentación', 'Transporte', 'Entretenimiento', 'Servicios', 'Otro']
const money = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })
const formatDate = new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })

function ExpensesPage({ transactions, isSaving, onAddTransaction, onUpdateTransaction, onDeleteTransaction }: Props) {
  const [description, setDescription] = useState(''); const [amount, setAmount] = useState(''); const [category, setCategory] = useState(categories[0]); const [date, setDate] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  function clearForm() { setDescription(''); setAmount(''); setCategory(categories[0]); setDate(''); setEditingId(null) }
  function edit(transaction: Transaction) { setDescription(transaction.description); setAmount(String(transaction.amount)); setCategory(transaction.category); setDate(transaction.date); setEditingId(transaction.id) }
  async function remove(transaction: Transaction) { const deleted = await onDeleteTransaction(transaction); if (deleted && editingId === transaction.id) clearForm() }
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const transaction = { description: description.trim(), amount: Number(amount), category, date, type: 'expense' as const }; const saved = editingId === null ? await onAddTransaction(transaction) : await onUpdateTransaction(editingId, transaction); if (saved) clearForm() }
  return <><header><div><p>Control de gastos</p><h1>Gastos</h1></div></header>
    <section className="income-form-section"><div className="section-heading"><div><p>{editingId === null ? 'Nuevo registro' : 'Editando registro'}</p><h2>{editingId === null ? 'Agregar gasto' : 'Editar gasto'}</h2></div></div><form className="income-form" onSubmit={submit}>
      <label>Descripción<input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Ej. Mercado semanal" required /></label><label>Valor<input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" min="1" step="1" required /></label><label>Categoría<select value={category} onChange={(e) => setCategory(e.target.value)}>{categories.map((item) => <option key={item}>{item}</option>)}</select></label><label>Fecha<input type="date" value={date} onChange={(e) => setDate(e.target.value)} required /></label><button type="submit" disabled={isSaving}>{isSaving ? 'Guardando...' : editingId === null ? 'Agregar gasto' : 'Guardar cambios'}</button>{editingId !== null && <button type="button" className="cancel-edit" onClick={clearForm} disabled={isSaving}>Cancelar</button>}
    </form></section>
    <section className="movements-section income-list-section"><div className="section-heading"><div><p>Historial</p><h2>Gastos registrados</h2></div><span>{transactions.length} registros</span></div><ul>{transactions.map((item) => <li className="movement-row" key={item.id}><div className="movement-icon expense" aria-hidden="true">↘</div><div className="movement-info"><strong>{item.description}</strong><span>{item.category} · {formatDate.format(new Date(item.date))}</span></div><strong className="movement-amount expense">- {money.format(item.amount)}</strong><div className="movement-actions"><button type="button" onClick={() => edit(item)} disabled={isSaving}>Editar</button><button type="button" className="delete-action" onClick={() => remove(item)} disabled={isSaving}>Eliminar</button></div></li>)}</ul></section>
  </>
}
export default ExpensesPage
