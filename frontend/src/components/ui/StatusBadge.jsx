const styles = {
  pending: 'bg-gray-100 text-gray-700',
  in_transit: 'bg-blue-100 text-blue-700',
  customs: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  delayed: 'bg-red-100 text-red-700',
}

export default function StatusBadge({ status }) {
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${styles[status] || styles.pending}`}>
      {status?.replace('_', ' ')}
    </span>
  )
}
