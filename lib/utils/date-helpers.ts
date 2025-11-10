// Helper functions for date formatting

export function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr)
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

  if (date.toDateString() === today.toDateString()) {
    return `Today, ${dayNames[date.getDay()]}`
  } else if (date.toDateString() === tomorrow.toDateString()) {
    return `Tomorrow, ${dayNames[date.getDay()]}`
  } else {
    return `${dayNames[date.getDay()]} ${date.getDate()} ${date.toLocaleDateString("en-GB", { month: "long", year: "numeric" })}`
  }
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
}

export function formatShortDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" })
}
