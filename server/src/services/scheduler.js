import { formatMinutesToTime, getTodayDateString } from "../lib/dates.js";

const PRIORITY_SCORES = {
  urgent: 4,
  high: 3,
  medium: 2,
  low: 1,
};

export function buildSchedule({ tasks, preferences, planDate }) {
  const targetDate = planDate || getTodayDateString();
  const availableMinutes = preferences.available_minutes_per_day;
  const breakMinutes = preferences.preferred_break_minutes;
  const startHour = preferences.day_start_hour;

  // Maximum minutes until midnight from the starting hour
  const minutesUntilMidnight = Math.max(0, (24 - startHour) * 60);
  const effectiveAvailableMinutes = Math.min(
    availableMinutes,
    minutesUntilMidnight,
  );

  // Filter only incomplete tasks
  const pendingTasks = tasks.filter((t) => !t.completed);

  // Sort deterministically:
  // 1. Deadline ascending (tasks due sooner first; null deadlines last)
  // 2. Priority descending (urgent -> high -> medium -> low)
  // 3. ID ascending (stable tie-breaker)
  const sortedTasks = [...pendingTasks].sort((a, b) => {
    if (a.deadline && b.deadline) {
      if (a.deadline !== b.deadline)
        return a.deadline.localeCompare(b.deadline);
    } else if (a.deadline && !b.deadline) {
      return -1;
    } else if (!a.deadline && b.deadline) {
      return 1;
    }

    const priorityDiff =
      (PRIORITY_SCORES[b.priority] || 1) - (PRIORITY_SCORES[a.priority] || 1);
    if (priorityDiff !== 0) return priorityDiff;

    return a.id.localeCompare(b.id);
  });

  const scheduled = [];
  const unscheduled = [];
  let currentOffsetMinutes = 0;

  for (const task of sortedTasks) {
    const isFirstItem = scheduled.length === 0;
    const breakNeeded = !isFirstItem && breakMinutes > 0 ? breakMinutes : 0;
    const totalSlotRequired = breakNeeded + task.estimated_minutes;

    if (currentOffsetMinutes + totalSlotRequired <= effectiveAvailableMinutes) {
      if (breakNeeded > 0) {
        const breakStartTime = formatMinutesToTime(
          startHour,
          currentOffsetMinutes,
        );
        const breakEndTime = formatMinutesToTime(
          startHour,
          currentOffsetMinutes + breakNeeded,
        );
        scheduled.push({
          type: "break",
          durationMinutes: breakNeeded,
          startTime: breakStartTime,
          endTime: breakEndTime,
        });
        currentOffsetMinutes += breakNeeded;
      }

      const taskStartTime = formatMinutesToTime(
        startHour,
        currentOffsetMinutes,
      );
      const taskEndTime = formatMinutesToTime(
        startHour,
        currentOffsetMinutes + task.estimated_minutes,
      );

      scheduled.push({
        type: "task",
        taskId: task.id,
        title: task.title,
        priority: task.priority,
        deadline: task.deadline,
        durationMinutes: task.estimated_minutes,
        startTime: taskStartTime,
        endTime: taskEndTime,
      });

      currentOffsetMinutes += task.estimated_minutes;
    } else {
      unscheduled.push({
        taskId: task.id,
        title: task.title,
        priority: task.priority,
        deadline: task.deadline,
        durationMinutes: task.estimated_minutes,
        reason: "Exceeds available time budget for the day",
      });
    }
  }

  return {
    planDate: targetDate,
    availableMinutes: effectiveAvailableMinutes,
    usedMinutes: currentOffsetMinutes,
    remainingMinutes: Math.max(
      0,
      effectiveAvailableMinutes - currentOffsetMinutes,
    ),
    scheduledTasks: scheduled,
    unscheduledTasks: unscheduled,
  };
}
