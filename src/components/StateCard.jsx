function StatCard({ title, value }) {
    return (
      <div style={{
        padding: "20px",
        borderRadius: "10px",
        background: "#f5f7fa",
        textAlign: "center",
        flex: 1,
      }}>
        <h4>{title}</h4>
        <strong>{value}</strong>
      </div>
    )
  }
  
  export default StatCard
  