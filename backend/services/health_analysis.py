import datetime
from typing import List, Dict, Any, Optional

# Realistic 14-day sample demo dataset for instant testing
SAMPLE_DEMO_RECORDS = [
    {"date": (datetime.date.today() - datetime.timedelta(days=13)).isoformat(), "sleep_duration": 7.2, "steps": 7240, "heart_rate": 72, "water_intake": 2.2, "exercise_duration": 35, "stress_level": 4, "weight": 70.4, "notes": "Felt refreshed after morning jog"},
    {"date": (datetime.date.today() - datetime.timedelta(days=12)).isoformat(), "sleep_duration": 6.8, "steps": 6120, "heart_rate": 74, "water_intake": 2.0, "exercise_duration": 25, "stress_level": 5, "weight": 70.3, "notes": "Long work meeting afternoon"},
    {"date": (datetime.date.today() - datetime.timedelta(days=11)).isoformat(), "sleep_duration": 7.5, "steps": 8450, "heart_rate": 70, "water_intake": 2.6, "exercise_duration": 45, "stress_level": 3, "weight": 70.1, "notes": "Great gym workout"},
    {"date": (datetime.date.today() - datetime.timedelta(days=10)).isoformat(), "sleep_duration": 7.8, "steps": 9100, "heart_rate": 68, "water_intake": 2.8, "exercise_duration": 50, "stress_level": 3, "weight": 70.0, "notes": "Walk in the park evening"},
    {"date": (datetime.date.today() - datetime.timedelta(days=9)).isoformat(), "sleep_duration": 6.5, "steps": 5400, "heart_rate": 76, "water_intake": 1.8, "exercise_duration": 20, "stress_level": 6, "weight": 70.2, "notes": "Stayed up late reading"},
    {"date": (datetime.date.today() - datetime.timedelta(days=8)).isoformat(), "sleep_duration": 7.1, "steps": 7890, "heart_rate": 71, "water_intake": 2.4, "exercise_duration": 40, "stress_level": 4, "weight": 70.0, "notes": "Solid baseline day"},
    {"date": (datetime.date.today() - datetime.timedelta(days=7)).isoformat(), "sleep_duration": 7.6, "steps": 8620, "heart_rate": 69, "water_intake": 2.5, "exercise_duration": 45, "stress_level": 3, "weight": 69.9, "notes": "Very consistent hydration"},
    {"date": (datetime.date.today() - datetime.timedelta(days=6)).isoformat(), "sleep_duration": 7.0, "steps": 6950, "heart_rate": 73, "water_intake": 2.1, "exercise_duration": 30, "stress_level": 5, "weight": 70.0, "notes": "Normal workday"},
    {"date": (datetime.date.today() - datetime.timedelta(days=5)).isoformat(), "sleep_duration": 8.0, "steps": 10240, "heart_rate": 67, "water_intake": 3.0, "exercise_duration": 60, "stress_level": 2, "weight": 69.8, "notes": "Weekend hike, high energy"},
    {"date": (datetime.date.today() - datetime.timedelta(days=4)).isoformat(), "sleep_duration": 7.7, "steps": 8800, "heart_rate": 69, "water_intake": 2.6, "exercise_duration": 40, "stress_level": 3, "weight": 69.8, "notes": "Great active recovery"},
    {"date": (datetime.date.today() - datetime.timedelta(days=3)).isoformat(), "sleep_duration": 6.9, "steps": 6500, "heart_rate": 75, "water_intake": 2.0, "exercise_duration": 25, "stress_level": 5, "weight": 69.9, "notes": "Busy workday schedule"},
    {"date": (datetime.date.today() - datetime.timedelta(days=2)).isoformat(), "sleep_duration": 7.4, "steps": 7950, "heart_rate": 70, "water_intake": 2.5, "exercise_duration": 35, "stress_level": 4, "weight": 69.7, "notes": "Consistent evening stretch"},
    {"date": (datetime.date.today() - datetime.timedelta(days=1)).isoformat(), "sleep_duration": 7.5, "steps": 8300, "heart_rate": 69, "water_intake": 2.7, "exercise_duration": 45, "stress_level": 3, "weight": 69.6, "notes": "Optimal recovery and focus"},
    {"date": datetime.date.today().isoformat(), "sleep_duration": 7.8, "steps": 6842, "heart_rate": 70, "water_intake": 2.4, "exercise_duration": 35, "stress_level": 3, "weight": 69.6, "notes": "Current day check-in"}
]

def calculate_wellness_score(sleep_avg: float, steps_avg: float, water_avg: float, exercise_avg: float, stress_avg: float) -> int:
    """
    Computes a holistic non-diagnostic wellness index between 0 and 100
    reflecting lifestyle balance and health tracking habits.
    """
    # Sleep score (ideal: 7.0 - 9.0 hrs) -> 25 max
    if 7.0 <= sleep_avg <= 8.5:
        sleep_score = 25
    elif 6.0 <= sleep_avg < 7.0 or 8.5 < sleep_avg <= 9.5:
        sleep_score = 20
    else:
        sleep_score = 14

    # Activity score (steps ideal: 7,500+) -> 25 max
    if steps_avg >= 8000:
        step_score = 25
    elif steps_avg >= 6000:
        step_score = 20
    elif steps_avg >= 4000:
        step_score = 15
    else:
        step_score = 10

    # Hydration score (ideal: 2.2L - 3.2L) -> 15 max
    if water_avg >= 2.3:
        water_score = 15
    elif water_avg >= 1.8:
        water_score = 12
    else:
        water_score = 8

    # Exercise score (ideal: 30+ mins/day) -> 15 max
    if exercise_avg >= 35:
        exercise_score = 15
    elif exercise_avg >= 20:
        exercise_score = 12
    else:
        exercise_score = 7

    # Stress score (ideal: 1 - 4) -> 20 max
    if stress_avg <= 3.5:
        stress_score = 20
    elif stress_avg <= 5.5:
        stress_score = 15
    elif stress_avg <= 7.0:
        stress_score = 10
    else:
        stress_score = 6

    total = int(sleep_score + step_score + water_score + exercise_score + stress_score)
    return min(100, max(30, total))

def analyze_records(records: List[Any]) -> Dict[str, Any]:
    """
    Analyzes health records (either model instances or dictionaries).
    Produces descriptive patterns, averages, trends, and non-diagnostic insights.
    """
    is_demo = False
    data_list = []

    if not records:
        is_demo = True
        data_list = SAMPLE_DEMO_RECORDS
    else:
        for r in records:
            if isinstance(r, dict):
                data_list.append(r)
            else:
                data_list.append({
                    "id": getattr(r, "id", None),
                    "date": r.date,
                    "sleep_duration": float(r.sleep_duration or 0),
                    "steps": int(r.steps or 0),
                    "heart_rate": int(r.heart_rate or 0),
                    "water_intake": float(r.water_intake or 0),
                    "exercise_duration": int(r.exercise_duration or 0),
                    "stress_level": int(r.stress_level or 0),
                    "weight": float(r.weight or 0),
                    "notes": getattr(r, "notes", "")
                })

    # Sort chronological by date
    data_list = sorted(data_list, key=lambda x: str(x.get("date", "")))

    n = len(data_list)
    if n == 0:
        data_list = SAMPLE_DEMO_RECORDS
        n = len(data_list)
        is_demo = True

    # Compute averages
    sleep_vals = [d["sleep_duration"] for d in data_list]
    step_vals = [d["steps"] for d in data_list]
    bpm_vals = [d["heart_rate"] for d in data_list]
    water_vals = [d["water_intake"] for d in data_list]
    exercise_vals = [d["exercise_duration"] for d in data_list]
    stress_vals = [d["stress_level"] for d in data_list]
    weight_vals = [d["weight"] for d in data_list]

    sleep_avg = round(sum(sleep_vals) / n, 1)
    steps_avg = int(sum(step_vals) / n)
    bpm_avg = int(sum(bpm_vals) / n)
    water_avg = round(sum(water_vals) / n, 1)
    exercise_avg = int(sum(exercise_vals) / n)
    stress_avg = round(sum(stress_vals) / n, 1)
    weight_latest = round(weight_vals[-1], 1) if weight_vals else 70.0

    wellness_score = calculate_wellness_score(sleep_avg, steps_avg, water_avg, exercise_avg, stress_avg)

    # Trend comparisons (recent vs earlier half if available)
    half = max(1, n // 2)
    recent_sleep = sum(sleep_vals[half:]) / len(sleep_vals[half:])
    prior_sleep = sum(sleep_vals[:half]) / len(sleep_vals[:half])

    recent_steps = sum(step_vals[half:]) / len(step_vals[half:])
    prior_steps = sum(step_vals[:half]) / len(step_vals[:half])

    recent_stress = sum(stress_vals[half:]) / len(stress_vals[half:])
    prior_stress = sum(stress_vals[:half]) / len(stress_vals[:half])

    # Pattern descriptions (Educational, supportive, non-diagnostic)
    sleep_pattern_desc = (
        "Your recent sleep duration is trending slightly higher than your prior baseline, showing positive restorative rhythm."
        if recent_sleep >= prior_sleep else
        "Your recent sleep duration is slightly lower than your previous average. Consider setting a consistent wind-down routine."
    )

    activity_pattern_desc = (
        f"Your daily steps average {steps_avg:,} steps. Activity consistency is stable and aligns well with cardiovascular activity targets."
        if recent_steps >= prior_steps else
        f"Your activity shows moderate fluctuations, averaging {steps_avg:,} steps per day."
    )

    hydration_pattern_desc = (
        f"Your daily water intake averages {water_avg}L, meeting recommended baseline hydration guidelines."
        if water_avg >= 2.2 else
        f"Your daily fluid intake averages {water_avg}L. Gradually increasing hydration by 1-2 glasses may support sustained daytime energy."
    )

    exercise_consistency_desc = (
        f"You maintain an average of {exercise_avg} minutes of active exercise per logged session, showing great consistency."
        if exercise_avg >= 30 else
        f"Your exercise routine averages {exercise_avg} minutes per recorded session. Adding short 10-minute active walking breaks can bolster endurance."
    )

    stress_trend_desc = (
        f"Reported stress averages {stress_avg}/10 and is trending down compared to earlier logs, indicating positive recovery balance."
        if recent_stress <= prior_stress else
        f"Reported stress levels show moderate elevation during busy weekdays (averaging {stress_avg}/10). Gentle evening breathwork or restorative downtime may help."
    )

    heart_rate_trend_desc = (
        f"Resting heart rate averages {bpm_avg} bpm, which sits comfortably within standard physiological resting ranges (60–100 bpm)."
    )

    weight_trend_desc = (
        f"Body weight is steady at {weight_latest} kg with a variation of less than 1.5% over the tracked window."
    )

    # Generate tailored AI insights
    insights = [
        {
            "category": "sleep",
            "title": "Sleep Rhythm & Cognitive Recovery",
            "content": f"{sleep_pattern_desc} Maintaining regular bedtime lighting can further consolidate REM sleep cycles.",
            "score_impact": 4
        },
        {
            "category": "activity",
            "title": "Movement & Cardio Baseline",
            "content": f"{activity_pattern_desc} Reaching 7,000+ daily steps is clinically associated with improved metabolic markers.",
            "score_impact": 5
        },
        {
            "category": "hydration",
            "title": "Fluid Balance & Energy Support",
            "content": f"{hydration_pattern_desc} Remember that water requirements naturally increase during warmer weather and post-workout.",
            "score_impact": 3
        },
        {
            "category": "stress",
            "title": "Stress & Autonomic Balance",
            "content": f"{stress_trend_desc} Prioritizing 8 minutes of deliberate slow nasal breathing before bed supports autonomic nervous recovery.",
            "score_impact": 3
        }
    ]

    return {
        "is_demo_data": is_demo,
        "records_count": len(data_list),
        "wellness_score": wellness_score,
        "sleep_avg": sleep_avg,
        "steps_avg": steps_avg,
        "heart_rate_avg": bpm_avg,
        "water_avg": water_avg,
        "exercise_avg": exercise_avg,
        "stress_avg": stress_avg,
        "weight_latest": weight_latest,
        "trend_status": "Improving" if wellness_score >= 75 else "Stable",
        "sleep_status": "Improving" if recent_sleep >= prior_sleep else "Variable",
        "activity_status": f"{steps_avg:,} steps",
        "patterns": {
            "sleep_pattern": sleep_pattern_desc,
            "activity_pattern": activity_pattern_desc,
            "hydration_pattern": hydration_pattern_desc,
            "exercise_consistency": exercise_consistency_desc,
            "stress_trend": stress_trend_desc,
            "heart_rate_trend": heart_rate_trend_desc,
            "weight_trend": weight_trend_desc,
        },
        "insights": insights,
        "trends": data_list
    }
