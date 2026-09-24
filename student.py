import re
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app import schemas, crud

router = APIRouter(prefix="/student", tags=["Student"])

@router.post("/register", status_code=status.HTTP_201_CREATED)
def register_student(student: schemas.StudentCreate, db: Session = Depends(get_db)):
    """
    Register a new student account.
    Validates required fields, email format, 10-digit mobile, and checks for duplicate email.
    """
    # Validate mobile number digits
    cleaned_mobile = re.sub(r"\D", "", student.mobile)
    if len(cleaned_mobile) < 10:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Mobile number must contain at least 10 digits."
        )

    # Check for duplicate email
    existing_student = crud.get_student_by_email(db, student.email)
    if existing_student:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A student with this email address already exists. Please login."
        )

    new_student = crud.create_student(db, student)
    return {
        "message": "Student registered successfully!",
        "student_id": new_student.id,
        "name": new_student.name,
        "email": new_student.email
    }

@router.post("/login")
def login_student(credentials: schemas.StudentLogin, db: Session = Depends(get_db)):
    """
    Authenticate student with email and password.
    Returns clear, helpful guidance if email is not found or password doesn't match.
    """
    clean_email = credentials.email.strip().lower()
    clean_password = credentials.password.strip()

    student = crud.get_student_by_email(db, clean_email)
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No account found with this email address. Please register first."
        )

    if student.password.strip() != clean_password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect password. Please re-enter your password or click the eye icon to check."
        )

    return {
        "message": "Login successful!",
        "student_id": student.id,
        "name": student.name,
        "email": student.email,
        "college": student.college,
        "mobile": student.mobile
    }

@router.get("/{id}", response_model=schemas.StudentResponse)
def get_student(id: int, db: Session = Depends(get_db)):
    """
    Get profile information of a student by ID.
    """
    student = crud.get_student_by_id(db, id)
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found."
        )
    return student
