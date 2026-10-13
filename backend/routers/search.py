from typing import Optional
from fastapi import APIRouter, Query
import schemas
from services.medical_search import search_trusted_medical_sources

router = APIRouter(prefix="/api/search", tags=["Medical Search"])

@router.get("/medical", response_model=schemas.MedicalSearchResponse)
def search_medical(
    q: str = Query(..., min_length=1, description="Medical query or topic (e.g., 'sleep', 'hypertension', 'ibuprofen')"),
    limit: Optional[int] = Query(5, ge=1, le=15)
):
    results = search_trusted_medical_sources(query=q, limit=limit)
    return schemas.MedicalSearchResponse(
        query=q,
        total=len(results),
        results=results
    )
