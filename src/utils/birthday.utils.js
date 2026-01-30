export const isBirthdayToday = (birthday) => {
  if (!birthday) return false

  const today = new Date()
  const bday = new Date(birthday)

  return (
    today.getDate() === bday.getDate() &&
    today.getMonth() === bday.getMonth()
  )
}
