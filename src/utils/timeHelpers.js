// utils/timeHelpers.js

export const getTimeOfDayFromHour = hour => {
  if (hour >= 5 && hour < 12) return 'Morning';
  if (hour >= 12 && hour < 17) return 'Afternoon';
  if (hour >= 17 && hour < 21) return 'Evening';
  return 'Night time';
};

export const backfillMissingTimes = logs => {
  let hasChanges = false;

  const updatedLogs = logs.map(log => {
    if (!log.timeOfDay) {
      // Use the ID (timestamp) as primary, logDate as fallback
      const timestamp = parseInt(log.id);
      const date = !isNaN(timestamp)
        ? new Date(timestamp)
        : new Date(log.logDate);

      const hour = date.getHours();
      // Use the helper to get the string
      const timeString = getTimeOfDayFromHour(hour);

      hasChanges = true;
      return { ...log, timeOfDay: timeString };
    }
    return log;
  });

  return { updatedLogs, hasChanges };
};
