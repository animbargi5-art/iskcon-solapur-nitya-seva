export const birthdayMessage = (name) =>
    encodeURIComponent(
      `🌸 Hare Krishna ${name} 🙏
  
  ISKCON Solapur wishes you a very happy birthday 🎂
  
  May Lord Krishna bless you with health, devotion, and peace.
  
  Your humble servants,
  ISKCON Solapur`
    )
  
  export const paymentMessage = (name, amount) => {
      return encodeURIComponent(
        `🙏 Hare Krishna ${name}
    
  Thank you for your generous Seva of ₹${amount}.
    
  Your contribution helps in spreading Krishna consciousness and temple services.
    
  May Sri Radha Krishna bless you abundantly 🌸
    
  — ISKCON Solapur`
      )
  }
  
  export const sevaReminderMessage = (name) =>
    encodeURIComponent(
      `🙏 Hare Krishna ${name}
  
  This is a gentle reminder regarding your seva.
  Please let us know if we can assist you.
  
  Your servants,
  ISKCON Solapur`
    )
  