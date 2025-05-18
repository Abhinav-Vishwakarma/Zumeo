const StatsCard = ({ title, value, icon: Icon, change, changeType = "increase" }) => {
  return (
    <div className="glass-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-300 font-medium">{title}</h3>
        <div className="p-2 rounded-lg bg-cyber-gray text-electric-blue">
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <div className="flex items-end justify-between">
        <div>
          <p className="text-2xl font-bold text-white">{value}</p>

          {change && (
            <div
              className={`flex items-center mt-1 text-sm ${
                changeType === "increase" ? "text-green-500" : "text-red-500"
              }`}
            >
              <span>
                {changeType === "increase" ? "↑" : "↓"} {change}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default StatsCard
