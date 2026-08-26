type Props = { activePage: string; onChangePage: (page: string) => void; onLogout: () => void }
const navigation = ['Dashboard', 'Ingresos', 'Gastos', 'Movimientos', 'Presupuestos', 'Metas']

function Sidebar({ activePage, onChangePage, onLogout }: Props) {
  return <aside className="sidebar">
    <div className="brand"><span>F</span> FinTrack</div>
    <nav aria-label="Navegación principal">{navigation.map((item) =>
      <div className={`nav-item ${activePage === item ? 'active' : ''}`} key={item} onClick={() => onChangePage(item)}>
        <span className="nav-icon" aria-hidden="true" />{item}
      </div>
    )}</nav>
    <button className="logout-button" type="button" onClick={onLogout}>Cerrar sesión</button>
  </aside>
}
export default Sidebar
