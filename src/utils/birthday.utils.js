export const isBirthdayToday = (dateString) => {
    if (!dateString) return false
  
    const today = new Date()
    const birthday = new Date(dateString)
  
    return (
      today.getDate() === birthday.getDate() &&
      today.getMonth() === birthday.getMonth()
    )
  }
  