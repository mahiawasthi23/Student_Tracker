function toFrontendState(days) {
  const goals = {};
  const reflections = {};

  for (const day of days) {
    goals[day.dateKey] = (day.goals || []).map((goal) => ({
      id: goal.id,
      text: goal.text,
    }));

    reflections[day.dateKey] = {
      goals: (day.reflection?.goals || []).map((goal) => ({
        goalId: goal.goalId,
        text: goal.text || "",
        hours: Number(goal.hours || 0),
      })),
      extra: {
        text: day.reflection?.extra?.text || "",
        hours: Number(day.reflection?.extra?.hours || 0),
      },
      submitted: Boolean(day.submitted),
    };
  }

  return { goals, reflections };
}

module.exports = { toFrontendState };
