/**
 * 时间段工具函数
 * 用于处理预约时间段的格式转换和展示
 */

/**
 * 将时间段数组按日期分组
 * @param {Array<string>} timeSlots - 格式：["2026-01-10 09:00-10:00", ...]
 * @returns {Object} - 格式：{ "2026-01-10": ["09:00-10:00", ...], ... }
 */
export const groupTimeSlotsByDate = (timeSlots) => {
  if (!Array.isArray(timeSlots) || timeSlots.length === 0) {
    return {}
  }
  
  const grouped = {}
  timeSlots.forEach(slot => {
    if (!slot || typeof slot !== 'string') return
    
    const parts = slot.split(' ')
    if (parts.length !== 2) return
    
    const [date, time] = parts
    if (!grouped[date]) {
      grouped[date] = []
    }
    grouped[date].push(time)
  })
  
  return grouped
}

/**
 * 将日期分组的时间段转换为数组格式
 * @param {Object} groupedSlots - 格式：{ "2026-01-10": ["09:00-10:00", ...], ... }
 * @returns {Array<string>} - 格式：["2026-01-10 09:00-10:00", ...]
 */
export const flattenTimeSlots = (groupedSlots) => {
  if (!groupedSlots || typeof groupedSlots !== 'object') {
    return []
  }
  
  const flattened = []
  Object.keys(groupedSlots).sort().forEach(date => {
    if (Array.isArray(groupedSlots[date])) {
      groupedSlots[date].forEach(time => {
        flattened.push(`${date} ${time}`)
      })
    }
  })
  
  return flattened
}

/**
 * 从时间段数组中提取所有日期
 * @param {Array<string>} timeSlots - 格式：["2026-01-10 09:00-10:00", ...]
 * @returns {Array<string>} - 格式：["2026-01-10", "2026-01-11", ...]
 */
export const extractDatesFromSlots = (timeSlots) => {
  if (!Array.isArray(timeSlots) || timeSlots.length === 0) {
    return []
  }
  
  const dates = new Set()
  timeSlots.forEach(slot => {
    if (!slot || typeof slot !== 'string') return
    
    const parts = slot.split(' ')
    if (parts.length === 2) {
      dates.add(parts[0])
    }
  })
  
  return Array.from(dates).sort()
}

/**
 * 格式化时间段显示（用于列表展示）
 * @param {Array<string>} timeSlots - 格式：["2026-01-10 09:00-10:00", ...]
 * @returns {string} - 格式：2026-01-10: 09:00-10:00, 10:00-11:00 | 2026-01-11: 09:00-10:00
 */
export const formatTimeSlotsDisplay = (timeSlots) => {
  if (!Array.isArray(timeSlots) || timeSlots.length === 0) {
    return '-'
  }
  
  const grouped = groupTimeSlotsByDate(timeSlots)
  const sortedDates = Object.keys(grouped).sort()
  
  if (sortedDates.length === 0) {
    return '-'
  }
  
  return sortedDates
    .map(date => `${date}: ${grouped[date].join(', ')}`)
    .join(' | ')
}

/**
 * 从时间段数组中获取日期范围（用于简化显示）
 * @param {Array<string>} timeSlots - 格式：["2026-01-10 09:00-10:00", ...]
 * @returns {string} - 格式："2026-01-10" 或 "2026-01-10 至 2026-01-12"
 */
export const getDateRangeFromSlots = (timeSlots) => {
  const dates = extractDatesFromSlots(timeSlots)
  
  if (dates.length === 0) {
    return '-'
  }
  
  if (dates.length === 1) {
    return dates[0]
  }
  
  return `${dates[0]} 至 ${dates[dates.length - 1]}`
}

/**
 * 验证时间段格式是否正确
 * @param {Array<string>} timeSlots - 格式：["2026-01-10 09:00-10:00", ...]
 * @returns {boolean} - 是否合法
 */
export const validateTimeSlots = (timeSlots) => {
  if (!Array.isArray(timeSlots) || timeSlots.length === 0) {
    return false
  }
  
  const pattern = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}-\d{2}:\d{2}$/
  
  return timeSlots.every(slot => {
    if (!slot || typeof slot !== 'string') return false
    return pattern.test(slot)
  })
}
