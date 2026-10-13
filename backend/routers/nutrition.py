from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas
from auth import get_current_user

router = APIRouter(prefix="/api/nutrition", tags=["AI Food & Nutrition Suggestions"])

MANDATORY_NUTRITION_DISCLAIMER = (
    "Nutrition guidance provided by VitaMind AI is strictly for general health education. "
    "Dietary recommendations should not replace individualized clinical medical nutrition therapy "
    "prescribed by a registered dietitian (RD) or certified physician."
)

NUTRITION_DATABASE: Dict[str, Dict[str, Any]] = {
    "diabetes": {
        "label": "Diabetes / Blood Sugar Management",
        "keywords": ["diabetes", "sugar", "insulin", "glucose", "pre-diabetes", "a1c"],
        "clinical_rationale": "Prioritizes low glycemic index (GI) carbohydrates rich in soluble viscosity-forming fiber to blunt postprandial glucose excursions and support peripheral insulin receptor sensitivity.",
        "beneficial_foods": [
            {
                "name": "Steel-Cut Oats & Barley",
                "category": "Complex Fiber",
                "why_it_helps": "Packed with beta-glucan soluble fiber that slows gastric emptying and carbohydrate absorption.",
                "how_to_consume": "Cook in water or unsweetened almond milk topped with chia seeds."
            },
            {
                "name": "Wild Salmon & Sardines",
                "category": "Healthy Proteins & Fats",
                "why_it_helps": "High in EPA/DHA omega-3 fatty acids that reduce systemic vascular inflammation without impacting glycemic levels.",
                "how_to_consume": "Bake or grill 2–3 times per week with herbs and lemon."
            },
            {
                "name": "Spinach, Kale & Bitter Greens",
                "category": "Leafy Vegetables",
                "why_it_helps": "Extremely low in digestible carbs while rich in magnesium and alpha-lipoic acid, an antioxidant shown to enhance cellular glucose uptake.",
                "how_to_consume": "Enjoy raw in salads, lightly steamed, or sautéed with garlic."
            },
            {
                "name": "Chia Seeds & Ground Flaxseeds",
                "category": "Seeds & Healthy Fats",
                "why_it_helps": "Form a gel-like matrix in the digestive tract that moderates blood sugar surges and promotes satiety.",
                "how_to_consume": "Sprinkle 1–2 tablespoons onto oatmeal, plain Greek yogurt, or smoothies."
            },
            {
                "name": "Ceylon Cinnamon",
                "category": "Herbs & Spices",
                "why_it_helps": "Contains bioactive cinnamaldehyde which studies suggest mimics insulin and facilitates cellular glucose transport.",
                "how_to_consume": "Add 1/2 teaspoon daily to morning oats or warm herbal teas."
            }
        ],
        "foods_to_avoid": [
            {
                "name": "High-Fructose Corn Syrup & Soda",
                "reason": "Rapidly absorbed free sugars that induce severe blood glucose spikes and hepatic steatosis.",
                "healthier_alternative": "Sparkling mineral water infused with fresh cucumber slices or lemon."
            },
            {
                "name": "Refined White Flour & Pastries",
                "reason": "Stripped of germ and bran fiber, causing rapid digestive breakdown into pure glucose.",
                "healthier_alternative": "100% sprouted whole grain or almond flour breads."
            },
            {
                "name": "Commercial Sweetened Yogurts",
                "reason": "Often contain upwards of 20g of hidden sucrose and high-fructose syrups per cup.",
                "healthier_alternative": "Plain Greek yogurt sweetened naturally with a handful of fresh berries."
            }
        ],
        "sample_daily_meal_plan": {
            "breakfast": "Steel-cut oatmeal prepared with water, topped with Ceylon cinnamon, chia seeds, and 1/4 cup blueberries.",
            "lunch": "Mediterranean mixed green salad with grilled salmon, chickpeas, diced cucumber, and cold-pressed olive oil vinaigrette.",
            "afternoon_snack": "A handful of raw unroasted walnuts alongside celery sticks.",
            "dinner": "Baked chicken breast with roasted garlic cauliflower mash and steamed lemon asparagus."
        },
        "lifestyle_and_hydration_rules": [
            "Drink at least 2.5 liters of pure water daily to support renal glucose clearance.",
            "Take a gentle 10-minute walk immediately after major meals to stimulate muscle glucose transport (GLUT4).",
            "Maintain consistent meal timing to avoid extreme hypoglycemic dips."
        ]
    },

    "hypertension": {
        "label": "Hypertension / High Blood Pressure",
        "keywords": ["hypertension", "blood pressure", "bp", "cardiac", "heart"],
        "clinical_rationale": "Follows the clinical DASH (Dietary Approaches to Stop Hypertension) principles, optimizing high potassium-to-sodium ratios, dietary magnesium, and endothelial-derived nitric oxide precursors.",
        "beneficial_foods": [
            {
                "name": "Fresh Beets & Beetroot Juice",
                "category": "Root Vegetables",
                "why_it_helps": "Rich in dietary inorganic nitrates, which the body converts into nitric oxide to relax vascular smooth muscle and widen blood vessels.",
                "how_to_consume": "Roast whole beets or blend a small amount of fresh beetroot into smoothies."
            },
            {
                "name": "Bananas & Avocados",
                "category": "Potassium Superfoods",
                "why_it_helps": "High potassium counters the hypertensive effects of sodium by promoting renal sodium excretion and easing blood vessel tension.",
                "how_to_consume": "Eat 1 medium banana or half an avocado daily."
            },
            {
                "name": "Crushed Raw Garlic",
                "category": "Cardio Herb",
                "why_it_helps": "Releases allicin, an organic sulfur compound shown to stimulate hydrogen sulfide and nitric oxide production.",
                "how_to_consume": "Crush fresh garlic cloves and let sit for 5 minutes before adding to dressings or light sautéing."
            },
            {
                "name": "Pomegranate & Pomegranate Seeds",
                "category": "Polyphenol Fruits",
                "why_it_helps": "Clinical trials demonstrate natural ACE-inhibitory and antioxidant effects that support arterial flexibility.",
                "how_to_consume": "Enjoy fresh pomegranate seeds over salads or drink 100ml pure unsweetened juice."
            },
            {
                "name": "Unsalted Almonds & Pumpkin Seeds",
                "category": "Magnesium Seeds",
                "why_it_helps": "Abundant in elemental magnesium, which regulates vascular tone and cellular calcium influx in arterial walls.",
                "how_to_consume": "A small daily handful (30g) as a mid-day snack."
            }
        ],
        "foods_to_avoid": [
            {
                "name": "Cured Deli Meats & Sausages",
                "reason": "Exceedingly high in hidden sodium preservatives and nitrates that trigger arterial stiffness.",
                "healthier_alternative": "Freshly roasted turkey breast or pasture-raised eggs."
            },
            {
                "name": "Canned Soups & Commercial Bouillon",
                "reason": "Can deliver over 1,000mg of sodium in a single serving, exceeding half the daily DASH recommendation.",
                "healthier_alternative": "Homemade vegetable or bone broths seasoned with herbs and zero added salt."
            },
            {
                "name": "Salted Pretzels & Potato Chips",
                "reason": "High sodium paired with inflammatory oxidized vegetable oils.",
                "healthier_alternative": "Air-popped popcorn seasoned with smoked paprika and nutritional yeast."
            }
        ],
        "sample_daily_meal_plan": {
            "breakfast": "Cooked rolled oats with sliced banana, pumpkin seeds, and a splash of unsweetened almond milk.",
            "lunch": "Quinoa grain bowl with roasted beets, steamed broccoli, edamame, and lemon-tahini dressing.",
            "afternoon_snack": "A cup of plain unsweetened Greek yogurt with fresh pomegranate seeds.",
            "dinner": "Herb-roasted cod with baked sweet potato and steamed garlic spinach."
        },
        "lifestyle_and_hydration_rules": [
            "Limit total daily dietary sodium intake to under 1,500–2,000 mg.",
            "Engage in 30 minutes of low-impact aerobic walking daily to bolster endothelial nitric oxide synthase.",
            "Practice slow resonant breathing (6 breaths per minute) for 5 minutes twice daily."
        ]
    },

    "gerd": {
        "label": "Acid Reflux / GERD",
        "keywords": ["gerd", "acid reflux", "heartburn", "gastric", "stomach", "acidity"],
        "clinical_rationale": "Emphasizes non-acidic, low-fat soothing foods that do not trigger transient lower esophageal sphincter (LES) relaxation or stimulate excessive gastric hydrochloric acid secretions.",
        "beneficial_foods": [
            {
                "name": "Oatmeal & Whole Oats",
                "category": "Demulcent Grain",
                "why_it_helps": "Gentle, non-acidic fiber that absorbs stomach acid and creates a protective coating across gastric mucosa.",
                "how_to_consume": "Cook with water or almond milk; avoid adding high-acid toppings."
            },
            {
                "name": "Fresh Ginger Root Tea",
                "category": "Digestive Rhizome",
                "why_it_helps": "Natural gastroprotective and anti-inflammatory properties that ease nausea and promote gentle gastric emptying.",
                "how_to_consume": "Steep 3–4 slices of peeled fresh ginger root in hot water for 10 minutes."
            },
            {
                "name": "Honeydew & Cantaloupe Melons",
                "category": "Alkaline Fruits",
                "why_it_helps": "High pH (alkaline) fruits that are very gentle on the esophagus, unlike citrus.",
                "how_to_consume": "Enjoy chilled fresh melon cubes between meals."
            },
            {
                "name": "Fennel & Steamed Green Beans",
                "category": "Low-Acid Greens",
                "why_it_helps": "Extremely low in dietary acid and compounds that provoke gastroesophageal reflux.",
                "how_to_consume": "Lightly steam green beans with olive oil; slice fennel into fresh salads."
            },
            {
                "name": "Lean Turkey & Skinless Chicken",
                "category": "Low-Fat Protein",
                "why_it_helps": "High-fat meats delay gastric emptying, worsening reflux. Lean poultry digests smoothly without excess bile release.",
                "how_to_consume": "Poached, baked, or boiled without heavy black pepper or garlic."
            }
        ],
        "foods_to_avoid": [
            {
                "name": "Citrus Fruits & Tomato Sauces",
                "reason": "High native acidity directly irritates sensitive esophageal linings and stimulates gastric enzymes.",
                "healthier_alternative": "Ripe bananas, papayas, and honeydew melons."
            },
            {
                "name": "Deep-Fried Fatty Foods",
                "reason": "High lipid content slows digestion and causes prolonged relaxation of the lower esophageal sphincter.",
                "healthier_alternative": "Air-fried or oven-roasted lean proteins."
            },
            {
                "name": "Peppermint & Dark Chocolate",
                "reason": "Both contain methylxanthine compounds that pharmacologically relax the esophageal sphincter valve.",
                "healthier_alternative": "Chamomile or licorice root (DGL) herbal tea."
            }
        ],
        "sample_daily_meal_plan": {
            "breakfast": "Warm oatmeal made with oat milk, topped with sliced banana and a drizzle of honey.",
            "lunch": "Sliced lean turkey wrap with butterhead lettuce, cucumber, and light olive oil.",
            "afternoon_snack": "A bowl of cubed cantaloupe melon with steeped ginger tea.",
            "dinner": "Baked sweet potato with poached chicken breast and steamed zucchini."
        },
        "lifestyle_and_hydration_rules": [
            "Never lie down flat within 3 hours of eating dinner.",
            "Eat smaller, more frequent meals rather than large high-volume dinners.",
            "Elevate the head of your bed 6 inches to leverage gravity against nighttime acid backflow."
        ]
    },

    "cholesterol": {
        "label": "High Cholesterol / Lipid Balance",
        "keywords": ["cholesterol", "lipids", "ldl", "triglycerides", "statin", "atherosclerosis"],
        "clinical_rationale": "Focuses on viscous soluble fibers that trap bile acids in the gut for excretion, alongside plant sterols and monounsaturated fatty acids that lower circulating LDL particles without reducing beneficial HDL.",
        "beneficial_foods": [
            {
                "name": "Extra Virgin Olive Oil",
                "category": "Monounsaturated Fat",
                "why_it_helps": "Rich in oleic acid and polyphenols that protect LDL particles from atherogenic oxidative damage.",
                "how_to_consume": "Drizzle 2 tablespoons daily over vegetables and grain bowls."
            },
            {
                "name": "Hass Avocados",
                "category": "Plant Sterols",
                "why_it_helps": "Supplies monounsaturated fats and beta-sitosterol, which competes with dietary cholesterol absorption in the small intestine.",
                "how_to_consume": "Add half an avocado to lunch bowls or salads."
            },
            {
                "name": "Brussels Sprouts & Legumes",
                "category": "Soluble Fiber",
                "why_it_helps": "Soluble fiber binds cholesterol in the intestinal lumen, prompting the liver to pull LDL from circulation to manufacture new bile.",
                "how_to_consume": "Roast Brussels sprouts with olive oil or incorporate lentils into soups."
            },
            {
                "name": "Raw English Walnuts",
                "category": "Omega-3 Nuts",
                "why_it_helps": "High in plant-based alpha-linolenic acid (ALA) which lowers triglyceride levels and improves arterial compliance.",
                "how_to_consume": "Eat 28g (about 14 halves) as a morning snack."
            }
        ],
        "foods_to_avoid": [
            {
                "name": "Commercial Trans Fats & Hydrogenated Oils",
                "reason": "Directly elevates small dense LDL cholesterol while simultaneously depleting protective HDL.",
                "healthier_alternative": "Cold-pressed extra virgin olive oil or avocado oil."
            },
            {
                "name": "Fatty Processed Sausages & Bacon",
                "reason": "High in saturated palmitic and myristic fatty acids that downregulate hepatic LDL clearance receptors.",
                "healthier_alternative": "Wild salmon, sardines, or plant-based bean patties."
            }
        ],
        "sample_daily_meal_plan": {
            "breakfast": "Barley porridge or oatmeal with walnuts, chia seeds, and raspberries.",
            "lunch": "Lentil and vegetable soup served with a mixed dark greens salad and extra virgin olive oil.",
            "afternoon_snack": "A small handful of raw almonds and an organic apple with peel (pectin fiber).",
            "dinner": "Pan-seared wild salmon with roasted Brussels sprouts and brown rice."
        },
        "lifestyle_and_hydration_rules": [
            "Incorporate 40 minutes of moderate aerobic cardio 4 times per week to elevate circulating HDL.",
            "Consume at least 30g of total dietary fiber daily, prioritizing soluble sources."
        ]
    },

    "general": {
        "label": "Holistic Vitality & Metabolic Health",
        "keywords": ["general", "wellness", "vitality", "fatigue", "energy", "longevity"],
        "clinical_rationale": "A nutrient-dense anti-inflammatory dietary framework designed to support cellular mitochondrial biogenesis, stable hormonal rhythms, gut microbiome diversity, and sustained daytime energy.",
        "beneficial_foods": [
            {
                "name": "Wild Blueberries & Blackberries",
                "category": "Antioxidant Berries",
                "why_it_helps": "Loaded with anthocyanins that cross the blood-brain barrier to combat oxidative stress and enhance cognitive clarity.",
                "how_to_consume": "Enjoy 1/2 cup fresh or frozen daily in morning oats or snacks."
            },
            {
                "name": "Fermented Foods (Kefir, Kimchi, Greek Yogurt)",
                "category": "Probiotics",
                "why_it_helps": "Enriches gut microbiome diversity, synthesizing essential short-chain fatty acids (SCFAs) that regulate immune and mental health.",
                "how_to_consume": "Include 1 serving of fermented foods daily."
            },
            {
                "name": "Green Tea / Matcha",
                "category": "EGCG Polyphenols",
                "why_it_helps": "Supplies L-theanine and epigallocatechin gallate (EGCG) for calm, sustained focus without cortisol spikes.",
                "how_to_consume": "Brew 1–2 cups in the morning or early afternoon."
            },
            {
                "name": "Dark Leafy Greens & Microgreens",
                "category": "Micronutrient Matrix",
                "why_it_helps": "High folate, vitamin K1, lutein, and minerals that nourish cellular methylation and metabolic detox pathways.",
                "how_to_consume": "Incorporate generous handfuls into salads or warm bowls."
            }
        ],
        "foods_to_avoid": [
            {
                "name": "Ultra-Processed Packaged Snack Foods",
                "reason": "De-structured nutrient matrix combined with chemical additives that disrupt metabolic and gut signaling.",
                "healthier_alternative": "Whole nuts, roasted chickpeas, or fresh fruit."
            },
            {
                "name": "Refined Added Sugars & Energy Drinks",
                "reason": "Provokes rapid insulin spikes followed by debilitating energy crashes and systemic fatigue.",
                "healthier_alternative": "Matcha green tea or sparkling lemon water."
            }
        ],
        "sample_daily_meal_plan": {
            "breakfast": "Steel-cut oats with chia seeds, wild blueberries, and a spoon of raw almond butter.",
            "lunch": "Quinoa grain bowl with roasted sweet potato, edamame, baby spinach, and lemon-tahini dressing.",
            "afternoon_snack": "A cup of probiotic plain kefir with a handful of walnuts.",
            "dinner": "Grilled wild fish or organic tofu with steamed broccoli, roasted carrots, and extra virgin olive oil."
        },
        "lifestyle_and_hydration_rules": [
            "Target 2.5–3.0 liters of clean fluid daily.",
            "Eat within an 10–12 hour daylight window to synchronize digestive metabolic circadian clocks.",
            "Aim to eat at least 30 different plant varieties across each week for microbiome health."
        ]
    }
}

def resolve_condition_key(health_issue_text: Optional[str]) -> str:
    if not health_issue_text:
        return "general"
    
    text = health_issue_text.lower()
    for key, data in NUTRITION_DATABASE.items():
        if key in text:
            return key
        for kw in data["keywords"]:
            if kw in text:
                return key
    return "general"

@router.get("/recommendations", response_model=schemas.NutritionRecommendationResponse)
def get_nutrition_recommendations(
    issue: Optional[str] = Query(None, description="Health issue or condition name (e.g. Diabetes, Hypertension, GERD)"),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # If not passed in query, use the user's registered health issue from profile
    query_issue = issue or current_user.health_issue or "General Vitality"
    condition_key = resolve_condition_key(query_issue)
    data = NUTRITION_DATABASE.get(condition_key, NUTRITION_DATABASE["general"])

    return schemas.NutritionRecommendationResponse(
        health_issue=data["label"],
        clinical_rationale=data["clinical_rationale"],
        beneficial_foods=[schemas.BeneficialFoodItem(**f) for f in data["beneficial_foods"]],
        foods_to_avoid=[schemas.AvoidFoodItem(**a) for a in data["foods_to_avoid"]],
        sample_daily_meal_plan=schemas.MealPlan(**data["sample_daily_meal_plan"]),
        lifestyle_and_hydration_rules=data["lifestyle_and_hydration_rules"],
        disclaimer=MANDATORY_NUTRITION_DISCLAIMER
    )

@router.get("/conditions")
def get_available_conditions():
    return [
        {"key": k, "label": v["label"]}
        for k, v in NUTRITION_DATABASE.items()
    ]
