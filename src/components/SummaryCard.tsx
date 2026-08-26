type Props = { label: string; amount: string; tone: 'primary' | 'income' | 'expense' }

function SummaryCard({ label, amount, tone }: Props) {
  return <article className={`summary-card ${tone}`}>
    <div className="card-heading"><span>{label}</span><span className="card-icon" aria-hidden="true">{tone === 'income' ? '↗' : tone === 'expense' ? '↘' : '$'}</span></div>
    <strong>{amount}</strong><small>Balance del mes actual</small>
  </article>
}
export default SummaryCard
