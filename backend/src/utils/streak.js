function formatDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseDateKey(dateKey) {
  const [year, month, day] = String(dateKey).split("-").map(Number);
  return new Date(year, month - 1, day);
}

function previousDateKey(dateKey) {
  const current = parseDateKey(dateKey);
  current.setDate(current.getDate() - 1);
  return formatDateKey(current);
}

function isActiveDay(day) {
  if (!day) return false;
  if (day.submitted) return true;

  const hasPlannedGoals = Array.isArray(day.goals) && day.goals.length > 0;
  if (hasPlannedGoals) return true;

  const reflectionGoals = Array.isArray(day.reflection?.goals) ? day.reflection.goals : [];
  const hasGoalReflection = reflectionGoals.some(
    (goal) => String(goal.text || "").trim() || Number(goal.hours || 0) > 0
  );
  if (hasGoalReflection) return true;

  return Number(day.reflection?.extra?.hours || 0) > 0;
}

function buildStreakStats(days) {
  const dayMap = new Map();
  const activeDateKeys = [];

  for (const day of days || []) {
    dayMap.set(day.dateKey, day);
    if (isActiveDay(day)) {
      activeDateKeys.push(day.dateKey);
    }
  }

  activeDateKeys.sort();

  let currentStreak = 0;
  let cursor = formatDateKey(new Date());
  while (isActiveDay(dayMap.get(cursor))) {
    currentStreak += 1;
    cursor = previousDateKey(cursor);
  }

  let longestStreak = 0;
  let running = 0;
  let prev = null;
  for (const dateKey of activeDateKeys) {
    if (prev && previousDateKey(dateKey) === prev) {
      running += 1;
    } else {
      running = 1;
    }
    longestStreak = Math.max(longestStreak, running);
    prev = dateKey;
  }

  return {
    currentStreak,
    longestStreak,
  };
}

module.exports = {
  buildStreakStats,
};
