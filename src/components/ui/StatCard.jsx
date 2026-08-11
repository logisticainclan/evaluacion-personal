function StatCard({
  title,
  value,
  description,
  icon: Icon,
  tone = "blue",
}) {
  return (
    <article className={`stat-card stat-card-${tone}`}>
      <div className="stat-card-top">
        <div>
          <span className="stat-card-label">{title}</span>
          <strong className="stat-card-value">{value}</strong>
        </div>

        {Icon && (
          <div className="stat-card-icon" aria-hidden="true">
            <Icon size={22} strokeWidth={2} />
          </div>
        )}
      </div>

      {description && (
        <p className="stat-card-description">
          {description}
        </p>
      )}
    </article>
  );
}

export default StatCard;