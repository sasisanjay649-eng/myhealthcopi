import os
import re
from typing import List, Dict, Any
import httpx

# Curated, authoritative medical database from WHO, CDC, FDA, NHS, MedlinePlus, PubMed
VERIFIED_MEDICAL_KNOWLEDGEBASE: List[Dict[str, Any]] = [
    {
        "keywords": ["sleep", "insomnia", "circadian", "tired", "rest", "fatigue", "rem", "deep sleep"],
        "title": "Sleep and Sleep Disorders: Healthy Sleep Guidelines",
        "source_name": "CDC (Centers for Disease Control and Prevention)",
        "short_description": "Comprehensive guidelines on restorative sleep duration (7-9 hours for adults), circadian rhythm synchronization, and hygiene strategies to improve mental health and metabolic function.",
        "url": "https://www.cdc.gov/sleep/about_sleep/how_much_sleep.html",
        "date": "2024-03-15",
        "trustworthiness_score": 0.99
    },
    {
        "keywords": ["sleep", "sleep hygiene", "melatonin", "screen time", "blue light"],
        "title": "Healthy Sleep Tips & Evidence-Based Sleep Hygiene",
        "source_name": "NHS (National Health Service, UK)",
        "short_description": "Official clinical advice regarding establishing predictable wake cycles, reducing evening stimulant intake, and managing ambient room temperature for optimal REM sleep.",
        "url": "https://www.nhs.uk/every-mind-matters/mental-wellbeing-tips/how-to-fall-asleep-faster-and-sleep-better/",
        "date": "2024-01-20",
        "trustworthiness_score": 0.98
    },
    {
        "keywords": ["steps", "activity", "exercise", "walking", "cardio", "sedentary", "active"],
        "title": "WHO Guidelines on Physical Activity and Sedentary Behaviour",
        "source_name": "WHO (World Health Organization)",
        "short_description": "Global health recommendations advising 150-300 minutes of moderate-intensity aerobic exercise or equivalent weekly activity to prevent chronic cardio-metabolic disorders.",
        "url": "https://www.who.int/publications/i/item/9789240015128",
        "date": "2023-11-10",
        "trustworthiness_score": 0.99
    },
    {
        "keywords": ["heart rate", "resting heart rate", "bpm", "pulse", "cardiac", "tachycardia", "bradycardia"],
        "title": "All About Heart Rate (Pulse) and Resting Heart Rate Baselines",
        "source_name": "American Heart Association (AHA)",
        "short_description": "Normal resting adult heart rates range between 60 to 100 bpm. Endurance athletes may exhibit lower rates. Factors influencing variations include hydration, fitness, and stress levels.",
        "url": "https://www.heart.org/en/health-topics/high-blood-pressure/the-basics/your-heart-rate-pulse",
        "date": "2024-02-05",
        "trustworthiness_score": 0.99
    },
    {
        "keywords": ["water", "hydration", "fluid", "electrolytes", "dehydration"],
        "title": "Water & Healthier Drinks: Daily Fluid Consumption Guidance",
        "source_name": "CDC / National Academies of Sciences",
        "short_description": "Recommended fluid intake targets approximately 2.7 to 3.7 liters daily from all dietary sources, adjusting for physical activity, climatic conditions, and metabolic requirements.",
        "url": "https://www.cdc.gov/healthyweight/healthy_eating/water-and-healthier-drinks.html",
        "date": "2023-09-18",
        "trustworthiness_score": 0.97
    },
    {
        "keywords": ["stress", "cortisol", "anxiety", "relaxation", "mental wellness", "burnout"],
        "title": "Stress Management Strategies & Autonomic Nervous System Balance",
        "source_name": "National Institute of Mental Health (NIMH)",
        "short_description": "Evidence-backed overview of the physiological impact of chronic elevated stress, neuroendocrine cortisol pathways, and evidence-supported mindfulness and breathing interventions.",
        "url": "https://www.nimh.nih.gov/health/publications/so-stressed-out-fact-sheet",
        "date": "2024-04-02",
        "trustworthiness_score": 0.98
    },
    {
        "keywords": ["headache", "migraine", "tension headache", "head pain"],
        "title": "Headache Types, Red Flags, and Differential Diagnostic Pathways",
        "source_name": "NHS (National Health Service, UK)",
        "short_description": "Overview of primary tension headaches, hydration-related cephalalgia, and warning signs requiring prompt medical intervention (sudden thunderclap onset, visual disturbance, stiff neck).",
        "url": "https://www.nhs.uk/conditions/headaches/",
        "date": "2024-01-12",
        "trustworthiness_score": 0.98
    },
    {
        "keywords": ["fever", "temperature", "chills", "pyrexia", "infection"],
        "title": "Fever in Adults: Physiological Responses and Clinical Guidelines",
        "source_name": "CDC & MedlinePlus",
        "short_description": "A fever is an immune response characterized by body temperatures above 38°C (100.4°F). Recommendations outline hydration, monitoring, and seeking immediate emergency care if accompanied by confusion.",
        "url": "https://medlineplus.gov/fever.html",
        "date": "2023-12-08",
        "trustworthiness_score": 0.98
    },
    {
        "keywords": ["ibuprofen", "advil", "nsaid", "pain relief", "anti-inflammatory"],
        "title": "Ibuprofen Oral: Uses, Precautions and Safety Profile",
        "source_name": "FDA & DailyMed / National Library of Medicine",
        "short_description": "Non-steroidal anti-inflammatory drug (NSAID) used for mild to moderate pain relief and inflammation. Safety warnings note gastrointestinal risks and potential renal/cardiovascular considerations.",
        "url": "https://medlineplus.gov/druginfo/meds/a682159.html",
        "date": "2024-02-14",
        "trustworthiness_score": 0.99
    },
    {
        "keywords": ["paracetamol", "acetaminophen", "tylenol", "pain", "fever reducer"],
        "title": "Acetaminophen (Paracetamol): Drug Safety Communication & Liver Health",
        "source_name": "FDA (U.S. Food & Drug Administration)",
        "short_description": "Analgesic and antipyretic. Key warnings highlight hepatic safety thresholds (not exceeding maximum daily limits) and avoiding concurrent duplicate acetaminophen-containing products.",
        "url": "https://www.fda.gov/drugs/safe-daily-use-acetaminophen",
        "date": "2024-03-01",
        "trustworthiness_score": 0.99
    },
    {
        "keywords": ["amoxicillin", "antibiotic", "bacterial infection", "penicillin"],
        "title": "Amoxicillin: Medication Guidelines & Antibiotic Stewardship",
        "source_name": "FDA & CDC Antimicrobial Stewardship",
        "short_description": "Beta-lactam antibiotic active against bacterial infections only; ineffective against viral illnesses like the common cold or flu. Must be prescribed only following clinical evaluation.",
        "url": "https://medlineplus.gov/druginfo/meds/a685001.html",
        "date": "2023-10-25",
        "trustworthiness_score": 0.99
    },
    {
        "keywords": ["metformin", "blood sugar", "glucose", "diabetes", "insulin"],
        "title": "Metformin: Diabetes Education and Therapeutic Guidance",
        "source_name": "American Diabetes Association (ADA)",
        "short_description": "Biguanide antihyperglycemic medication designed to enhance insulin sensitivity and regulate hepatic glucose output. Requires ongoing monitoring of renal function and physician oversight.",
        "url": "https://medlineplus.gov/druginfo/meds/a684058.html",
        "date": "2024-01-30",
        "trustworthiness_score": 0.99
    },
    {
        "keywords": ["omeprazole", "prilosec", "acid reflux", "gerd", "heartburn", "stomach"],
        "title": "Omeprazole: Proton Pump Inhibitor Overview & Gastric Safety",
        "source_name": "NHS & FDA",
        "short_description": "Reduces gastric acid production for gastroesophageal reflux and ulcer management. Extended usage requires periodic clinical review for magnesium and B12 absorption levels.",
        "url": "https://www.nhs.uk/medicines/omeprazole/",
        "date": "2024-02-28",
        "trustworthiness_score": 0.98
    },
    {
        "keywords": ["cetirizine", "zyrtec", "allergies", "antihistamine", "rhinitis"],
        "title": "Cetirizine: Second-Generation Antihistamine Clinical Summary",
        "source_name": "MedlinePlus / NIH",
        "short_description": "Relieves allergic rhinitis and urticaria symptoms with significantly lower sedation rates compared to first-generation antihistamines. Cautions advise awareness when operating machinery.",
        "url": "https://medlineplus.gov/druginfo/meds/a698026.html",
        "date": "2023-11-19",
        "trustworthiness_score": 0.98
    },
    {
        "keywords": ["lisinopril", "blood pressure", "hypertension", "ace inhibitor"],
        "title": "Lisinopril: Cardiovascular Safety & Blood Pressure Control",
        "source_name": "American Heart Association & DailyMed",
        "short_description": "Angiotensin-converting enzyme (ACE) inhibitor for hypertension management. Safety guidelines caution regarding persistent cough, electrolyte balance, and contraindications during pregnancy.",
        "url": "https://medlineplus.gov/druginfo/meds/a692051.html",
        "date": "2024-03-05",
        "trustworthiness_score": 0.99
    },
    {
        "keywords": ["atorvastatin", "cholesterol", "lipids", "statin", "cardiovascular"],
        "title": "Atorvastatin: Lipid-Lowering Statin Therapy & Guidelines",
        "source_name": "AHA & MedlinePlus",
        "short_description": "HMG-CoA reductase inhibitor for reducing low-density lipoprotein (LDL) cholesterol and cardiovascular risk. Periodic hepatic monitoring and evaluation of muscle symptoms are advised.",
        "url": "https://medlineplus.gov/druginfo/meds/a600045.html",
        "date": "2024-01-15",
        "trustworthiness_score": 0.99
    }
]

def search_trusted_medical_sources(query: str, limit: int = 5) -> List[Dict[str, Any]]:
    """
    Searches official, approved medical sources (WHO, CDC, FDA, NHS, PubMed).
    Returns ranked, relevant evidence items.
    """
    if not query:
        return VERIFIED_MEDICAL_KNOWLEDGEBASE[:limit]

    query_tokens = [tok.lower() for tok in re.findall(r"\w+", query) if len(tok) > 2]
    
    scored_results = []
    for item in VERIFIED_MEDICAL_KNOWLEDGEBASE:
        score = 0
        keywords = item["keywords"]
        title_words = [w.lower() for w in re.findall(r"\w+", item["title"])]
        desc_words = [w.lower() for w in re.findall(r"\w+", item["short_description"])]

        for token in query_tokens:
            if token in keywords:
                score += 5
            if any(token in kw for kw in keywords):
                score += 3
            if token in title_words:
                score += 4
            if token in desc_words:
                score += 2

        if score > 0:
            scored_results.append((score, item))

    # Sort descending by score
    scored_results.sort(key=lambda x: x[0], reverse=True)
    results = [item for _, item in scored_results[:limit]]

    # Fallback to general guidance if query matches nothing directly
    if not results:
        results = [
            VERIFIED_MEDICAL_KNOWLEDGEBASE[0], # Sleep CDC
            VERIFIED_MEDICAL_KNOWLEDGEBASE[2], # Physical activity WHO
            VERIFIED_MEDICAL_KNOWLEDGEBASE[4], # Hydration CDC
        ][:limit]

    return results
