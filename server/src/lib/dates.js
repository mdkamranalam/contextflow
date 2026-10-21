export function getTodayDateString(
  timeZone = process.env.APP_TIME_ZONE || "Asia/Kolkata",
) {
  try {
    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    return formatter.format(new Date());
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
}

export function formatMinutesToTime(startHour, totalMinutesFromStart) {
  const totalMinutes = startHour * 60 + totalMinutesFromStart;
  const hours = Math.floor(totalMinutes / 60) % 24;
  const mins = totalMinutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}
