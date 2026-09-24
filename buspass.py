from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app import schemas, crud

router = APIRouter(prefix="/buspass", tags=["Bus Pass"])

@router.post("/apply", status_code=status.HTTP_201_CREATED)
def apply_bus_pass(pass_data: schemas.BusPassCreate, db: Session = Depends(get_db)):
    """
    Submit a new bus pass application for a registered student.
    Sets default status to 'Pending'.
    """
    # Verify student exists
    student = crud.get_student_by_id(db, pass_data.student_id)
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student account not found. Please login again."
        )

    # Basic date validation
    if pass_data.end_date < pass_data.start_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="End date cannot be earlier than start date."
        )

    new_pass = crud.create_bus_pass(db, pass_data)
    return {
        "message": "Bus pass application submitted successfully!",
        "pass_id": new_pass.id,
        "student_id": new_pass.student_id,
        "status": new_pass.status,
        "pass_type": new_pass.pass_type
    }

@router.get("/student/{student_id}", response_model=List[schemas.BusPassResponse])
def get_student_passes(student_id: int, db: Session = Depends(get_db)):
    """
    Fetch all bus pass applications submitted by a specific student.
    """
    student = crud.get_student_by_id(db, student_id)
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found."
        )

    passes = crud.get_bus_passes_by_student(db, student_id)
    result = []
    for p in passes:
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
            student_name=student.name,
            student_email=student.email,
            payment_status=pmt.payment_status if pmt else "Unpaid",
            amount=pmt.amount if pmt else 300.0
        ))
    return result

@router.get("/{pass_id}", response_model=schemas.BusPassResponse)
def get_pass_details(pass_id: int, db: Session = Depends(get_db)):
    """
    Get detailed information for a single bus pass application (used by Receipt & Status pages).
    """
    db_pass = crud.get_bus_pass_by_id(db, pass_id)
    if not db_pass:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bus pass application not found."
        )

    student = crud.get_student_by_id(db, db_pass.student_id)
    pmt = crud.get_payment_by_pass_id(db, db_pass.id)

    return schemas.BusPassResponse(
        id=db_pass.id,
        student_id=db_pass.student_id,
        source=db_pass.source,
        destination=db_pass.destination,
        pass_type=db_pass.pass_type,
        start_date=db_pass.start_date,
        end_date=db_pass.end_date,
        status=db_pass.status,
        student_name=student.name if student else "N/A",
        student_email=student.email if student else "N/A",
        payment_status=pmt.payment_status if pmt else "Paid (Demo)",
        amount=pmt.amount if pmt else 300.0
    )
