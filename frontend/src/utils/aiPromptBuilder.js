/**
 * Generate comprehensive AI feedback prompt for Navgurukul students
 * Includes 8-hour daily study benchmark
 */
export function buildAiFeedbackPrompt({
  totalHours,
  activeDays,
  totalDays,
  goalsCompleted,
  totalGoalsCount,
  totalReflections,
  chartData,
  reviewTexts,
  filter,
}) {
  const avgHoursPerDay = (totalHours / totalDays).toFixed(1);
  const goalCompletionRate = totalGoalsCount > 0 ? Math.round((goalsCompleted / totalGoalsCount) * 100) : 0;
  const activePercentage = Math.round((activeDays / totalDays) * 100);

  // Calculate streak
  let currentStreak = 0;
  for (let i = chartData.length - 1; i >= 0; i--) {
    if (chartData[i].hours > 0) {
      currentStreak++;
    } else {
      break;
    }
  }

  const dailyBreakdown = chartData.map(d => `${d.name}: ${d.hours} hrs`).join(', ');
  const recentReflections = reviewTexts.slice(-10).join(' | ') || 'No reflections yet';

  return `You are a world-class productivity coach for Navgurukul students. Your task is to generate SHORT, DATA-DRIVEN feedback.

STUDENT DATA (${filter}):
- Total Hours: ${totalHours} hrs
- Active Days: ${activeDays}/${totalDays} (${activePercentage}%)
- Streak: ${currentStreak} days
- Goals: ${goalsCompleted}/${totalGoalsCount} (${goalCompletionRate}%)
- Avg: ${avgHoursPerDay} hrs/day
- Reflections: ${totalReflections}

DAILY HOURS: ${dailyBreakdown}
RECENT NOTES: ${recentReflections}

BENCHMARK: 8 hrs/day = Good. Below 8 hrs = Low.

INSTRUCTIONS:
1. Output ONLY valid JSON (no markdown, no extra text)
2. Each array has 1-2 SHORT lines (no paragraphs)
3. Include numbers + insights
4. Be direct and actionable
5. Reference the 8-hour benchmark
6. Do NOT add any text before or after the JSON

RESPOND WITH ONLY THIS JSON:
{
  "productivity": ["Line1", "Line2"],
  "consistency": ["Line1", "Line2"],
  "goalQuality": ["Line1"],
  "timeUsage": ["Line1", "Line2"],
  "pattern": ["Line1"],
  "reflection": ["Line1"],
  "challenges": ["Problem → Solution"],
  "nextAction": ["Action1", "Action2"]
}`;
}

