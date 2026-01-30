export const isBirthdayToday = (date) => {
  if (!date) return false

  const today = new Date()
  const bday = new Date(date)

  return (
    today.getDate() === bday.getDate() &&
    today.getMonth() === bday.getMonth()
  )
}
