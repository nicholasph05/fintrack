import { useState } from 'react'
import type { Transaction } from '../types/Transaction'

type Props = { incomes: Transaction[]; expenses: Transaction[] }
function MovementsPage({ incomes, expenses }: Props) {
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all')
  const movements = [...incomes, ...expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  const visible = filter === 'all' ? movements : movements.filter((item) => item.type === filter)
  return <><header><div><p>Historial financiero</p><h1>Movimientos</h1></div></header><section className="movements-section">
    <div className="section-heading"><div><p>Transacciones</p><h2>Todos los movimientos</h2></div></div><div className="movement-filters">
      <button type="button" className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>Todos</button><button type="button" className={filter === 'income' ? 'active' : ''} onClick={() => setFilter('income')}>Ingresos</button><button type="button" className={filter === 'expense' ? 'active' : ''} onClick={() => setFilter('expense')}>Gastos</button>
    </div><ul>{visible.map((item) => <li className="movement-row" key={`${item.type}-${item.id}`}><div className={`movement-icon ${item.type}`} aria-hidden="true">{item.type === 'income' ? '↗' : '↘'}</div><div className="movement-info"><strong>{item.description}</strong><span>{item.category} · {item.date}</span></div><strong className={`movement-amount ${item.type}`}>{item.type === 'income' ? '+' : '-'} ${item.amount.toLocaleString('es-CO')}</strong></li>)}</ul>
  </section></>
}
export default MovementsPage
