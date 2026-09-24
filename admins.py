from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.config import ADMIN_USERNAME, ADMIN_PASSWORD
from app import schemas, crud

router = APIRouter(prefix="/admin", tags=["Admin"])

@router.post("/login")
def admin_login(creds: schemas.AdminLogin):
    """
    Authenticate administrator credentials.
    Supports default credentials: admin / admin123 and ishwari / admin123.
    """
    valid_admins = {
        ADMIN_USERNAME.strip().lower(): ADMIN_PASSWORD,
        "admin": "admin123",
        "ishwari": "admin123"
    }

    uname = creds.username.strip().lower()
    if uname in valid_admins and (creds.password == valid_admins[uname] or creds.password == ADMIN_PASSWORD):
        return {
            "message": "Admin login successful",
            "token": "admin-session-token-2026",
            "username": creds.username
        }
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail=f"Invalid credentials for '{creds.username}'. Please use password: admin123"
    )

@router.get("/buspasses", response_model=List[schemas.BusPassResponse])
def get_all_applications(
    status_filter: Optional[str] = Query(None, alias="status"),
    db: Session = Depends(get_db)
):
    """
    Get all bus pass applications with joined student details.
    Optional status filter: 'Pending', 'Approved', 'Rejected'.
    """
    passes = crud.get_all_bus_passes(db, status_filter)
    result = []
    for p in passes:
        student = crud.get_student_by_id(db, p.student_id)
        pmt = crud.get_payment_by_pass_id(db, p.id)
        result.append(schemas.BusPassResponse(
            id=p.id,
            student_id=p.student_id,
            source=p.source,
            destination=p.destination,
            pass_type=p.pass_type,
            start_date=p.start_date,
            end_date=p.end_date,
            status=p.status,
            student_name=student.name if student else "Unknown",
            student_email=student.email if student else "N/A",
            payment_status=pmt.payment_status if pmt else "Paid",
            amount=pmt.amount if pmt else 300.0
        ))
    return result

@router.put("/buspass/{id}", response_model=schemas.BusPassResponse)
def update_application_status(
    id: int,
    status_update: schemas.BusPassStatusUpdate,
    db: Session = Depends(get_db)
):
    """
    Update bus pass status to 'Approved' or 'Rejected'.
    """
    updated_pass = crud.update_bus_pass_status(db, id, status_update.status)
    if not updated_pass:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Bus pass with ID {id} not found."
        )

    student = crud.get_student_by_id(db, updated_pass.student_id)
    pmt = crud.get_payment_by_pass_id(db, updated_pass.id)

    return schemas.BusPassResponse(
        id=updated_pass.id,
        student_id=updated_pass.student_id,
        source=updated_pass.source,
        destination=updated_pass.destination,
        pass_type=updated_pass.pass_type,
        start_date=updated_pass.start_date,
        end_date=updated_pass.end_date,
        status=updated_pass.status,
        student_name=student.name if student else "Unknown",
        student_email=student.email if student else "N/A",
        payment_status=pmt.payment_status if pmt else "Paid",
        amount=pmt.amount if pmt else 300.0
    )

@router.get("/stats", response_model=schemas.DashboardStats)
def get_stats(db: Session = Depends(get_db)):
    """
    Get live counts for admin dashboard cards and home page statistics section.
    """
    return crud.get_dashboard_stats(db)
