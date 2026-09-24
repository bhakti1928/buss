from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app import schemas, crud

router = APIRouter(prefix="/payment", tags=["Payment"])

@router.post("/process", status_code=status.HTTP_201_CREATED)
def process_payment(payment_in: schemas.PaymentCreate, db: Session = Depends(get_db)):
    """
    Process a demo payment for the bus pass application.
    Records successful payment transaction with demo payment gateway data.
    """
    # Verify pass exists
    db_pass = crud.get_bus_pass_by_id(db, payment_in.pass_id)
    if not db_pass:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bus pass application not found."
        )

    # Process and record payment
    payment = crud.create_payment(db, payment_in)

    return {
        "message": "Payment Successful",
        "payment_id": payment.id,
        "pass_id": payment.pass_id,
        "student_id": payment.student_id,
        "amount": payment.amount,
        "payment_status": payment.payment_status,
        "payment_date": payment.payment_date.strftime("%Y-%m-%d %H:%M:%S")
    }

@router.get("/pass/{pass_id}", response_model=schemas.PaymentResponse)
def get_payment_details(pass_id: int, db: Session = Depends(get_db)):
    """
    Retrieve payment receipt details for a specific pass ID.
    """
    payment = crud.get_payment_by_pass_id(db, pass_id)
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment record not found for this bus pass."
        )
    return payment
