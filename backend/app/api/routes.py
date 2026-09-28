from pathlib import Path
from uuid import uuid4

import pandas as pd
from fastapi import APIRouter, File, HTTPException, UploadFile

from app.services.analytics import analyze_dataframe
from app.services.ml import build_customer_intelligence

router = APIRouter(prefix="/api")

BASE_DIR = Path(__file__).resolve().parents[2]
UPLOAD_DIR = BASE_DIR / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)


def read_uploaded_file(path: Path) -> pd.DataFrame:
    if path.suffix.lower() == ".csv":
        return pd.read_csv(path)
    if path.suffix.lower() in {".xlsx", ".xls"}:
        return pd.read_excel(path)
    raise ValueError("Only CSV and Excel files are supported.")


@router.post("/upload")
async def upload_dataset(file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="Missing filename.")

    extension = Path(file.filename).suffix.lower()
    if extension not in {".csv", ".xlsx", ".xls"}:
        raise HTTPException(
            status_code=400,
            detail="Please upload a CSV or Excel file."
        )

    safe_name = f"{uuid4().hex}{extension}"
    destination = UPLOAD_DIR / safe_name

    content = await file.read()
    if len(content) > 20 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="File is larger than 20 MB.")

    destination.write_bytes(content)

    try:
        df = read_uploaded_file(destination)
        result = build_customer_intelligence(df)
        result["file_name"] = file.filename
        return result
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.get("/sample")
def sample_dashboard():
    sample_path = BASE_DIR.parent / "data" / "sample_customers.csv"
    df = pd.read_csv(sample_path)
    return build_customer_intelligence(df)


@router.post("/profile")
async def profile_dataset(file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="Missing filename.")

    extension = Path(file.filename).suffix.lower()
    if extension not in {".csv", ".xlsx", ".xls"}:
        raise HTTPException(status_code=400, detail="CSV or Excel only.")

    temp_path = UPLOAD_DIR / f"{uuid4().hex}{extension}"
    temp_path.write_bytes(await file.read())

    try:
        df = read_uploaded_file(temp_path)
        return analyze_dataframe(df)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    finally:
        temp_path.unlink(missing_ok=True)
