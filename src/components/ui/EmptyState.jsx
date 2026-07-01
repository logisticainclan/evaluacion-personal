import { Inbox } from "lucide-react"

function EmptyState({
  title = "Sin registros",
  description = "No hay información para mostrar."
}) {
  return (
    <div className="empty-state">
      <Inbox size={48} />
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  )
}

export default EmptyState