function StatCard({ title, value, description }) {
  return (
    <div className="stat-card">
      <h3>{title}</h3>
      <strong>{value}</strong>
      {description && <p>{description}</p>}
    </div>
  )
}

export default StatCard