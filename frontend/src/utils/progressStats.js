import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  parseISO,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subMonths,
  subDays,
} from 'date-fns';

export function buildProgressStats({
  goals = {},
  reflections = {},
  filter = 'month',
  customRange,
  includeReviewTexts = false,
}) {
  let totalHours = 0;
  let activeDays = 0;
  let goalsCompleted = 0;
  let totalGoalsCount = 0;
  let totalReflections = 0;
  let chartData = [];
  const reviewTexts = [];

  const today = new Date();
  let intervalStart;
  let intervalEnd;

  if (filter === 'month') {
    intervalStart = startOfMonth(today);
    intervalEnd = endOfMonth(today);
  } else if (filter === 'week') {
    intervalStart = startOfWeek(today, { weekStartsOn: 1 });
    intervalEnd = endOfWeek(today, { weekStartsOn: 1 });
  } else if (filter === 'custom' && customRange?.start && customRange?.end) {
    intervalStart = parseISO(customRange.start);
    intervalEnd = parseISO(customRange.end);
  }

  const allKeys = new Set([...Object.keys(goals), ...Object.keys(reflections)]);
  if (filter === 'all') {
    const sortedKeys = Array.from(allKeys).sort();
    if (sortedKeys.length > 0) {
      intervalStart = parseISO(sortedKeys[0]);
      const lastKey = sortedKeys[sortedKeys.length - 1];
      const todayKey = format(today, 'yyyy-MM-dd');
      intervalEnd = parseISO(lastKey > todayKey ? lastKey : todayKey);
    } else {
      intervalStart = subDays(today, 7);
      intervalEnd = today;
    }
  }

  if (intervalStart && intervalEnd && intervalStart <= intervalEnd) {
    const days = eachDayOfInterval({ start: intervalStart, end: intervalEnd });

    chartData = days.map((day) => {
      const dateKey = format(day, 'yyyy-MM-dd');
      const dayGoalsArr = goals[dateKey] || [];
      const dayRef = reflections[dateKey] || {};

      let dayHours = 0;
      let dayCompletedGoals = 0;
      totalGoalsCount += dayGoalsArr.length;

      if (Array.isArray(dayRef.goals)) {
        dayRef.goals.forEach((goal) => {
          dayHours += Number(goal.hours || 0);
          if (goal.text?.trim() || goal.hours > 0) {
            dayCompletedGoals += 1;
          }
          if (goal.text?.trim()) {
            totalReflections += 1;
            if (includeReviewTexts) reviewTexts.push(goal.text);
          }
        });
      }

      if (dayRef.extra) {
        dayHours += Number(dayRef.extra.hours || 0);
        if (dayRef.extra.text?.trim()) {
          totalReflections += 1;
          if (includeReviewTexts) reviewTexts.push(dayRef.extra.text);
        }
      }

      if (dayHours > 0 || dayCompletedGoals > 0) {
        activeDays += 1;
      }

      totalHours += dayHours;
      goalsCompleted += dayCompletedGoals;

      return {
        dateKey,
        name: format(day, days.length > 14 ? 'MMM d' : 'EEE, MMM d'),
        hours: Number(dayHours.toFixed(1)),
      };
    });
  }

  return {
    totalHours: totalHours.toFixed(1),
    activeDays,
    goalsCompleted,
    totalGoalsCount,
    totalReflections,
    chartData,
    reviewTexts: includeReviewTexts ? reviewTexts.slice(-20) : [],
  };
}

function getDailySubmissionCount(dayRef = {}) {
  const reflectedGoalsCount = Array.isArray(dayRef.goals)
    ? dayRef.goals.filter((goal) => String(goal?.text || '').trim() || Number(goal?.hours || 0) > 0).length
    : 0;

  const hasEndOfDaySummary = Boolean(
    String(dayRef?.extra?.text || '').trim() || Number(dayRef?.extra?.hours || 0) > 0
  );

  // Count actual reflection work: reflected goals + end-of-day summary.
  // Challenge notes are intentionally excluded.
  return reflectedGoalsCount + (hasEndOfDaySummary ? 1 : 0);
}

export function buildSubmissionHeatmap({ goals = {}, reflections = {}, months = 6 }) {
  const today = startOfDay(new Date());
  const rangeStart = startOfDay(subMonths(today, Math.max(1, months) - 1));
  const calendarStart = startOfWeek(rangeStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(today, { weekStartsOn: 0 });

  const allDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  const dayCells = allDays.map((day) => {
    const dateKey = format(day, 'yyyy-MM-dd');
    const submissions = getDailySubmissionCount(reflections[dateKey]);
    const isInRange = day >= rangeStart && day <= today;

    return {
      date: day,
      dateKey,
      submissions,
      inRange: isInRange,
    };
  });

  const weeks = [];
  for (let index = 0; index < dayCells.length; index += 7) {
    weeks.push(dayCells.slice(index, index + 7));
  }

  const monthLabels = [];
  let previousMonth = '';
  weeks.forEach((week, weekIndex) => {
    const firstInRangeDay = week.find((cell) => cell.inRange);
    if (!firstInRangeDay) return;

    const monthKey = format(firstInRangeDay.date, 'yyyy-MM');
    if (monthKey !== previousMonth) {
      monthLabels.push({
        weekIndex,
        label: format(firstInRangeDay.date, 'MMM'),
      });
      previousMonth = monthKey;
    }
  });

  return {
    start: rangeStart,
    end: today,
    weeks,
    monthLabels,
    totalSubmissions: dayCells.reduce((sum, day) => sum + (day.inRange ? day.submissions : 0), 0),
    totalDaysWithSubmissions: dayCells.filter((day) => day.inRange && day.submissions > 0).length,
  };
}
