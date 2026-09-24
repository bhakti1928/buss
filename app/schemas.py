from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field

# ---------------- Student Schemas ----------------
class StudentCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    mobile: str = Field(..., min_length=10, max_length=15)
    college: str = Field(..., min_length=2, max_length=150)
    password: str = Field(..., min_length=4)

class StudentLogin(BaseModel):
    email: EmailStr
    password: str

class StudentResponse(BaseModel):
    id: int
    name: str
    email: str
    mobile: str
    college: str

    class Config:
        from_attributes = True

# ---------------- Bus Pass Schemas ----------------
class BusPassCreate(BaseModel):
    student_id: int
    source: str = Field(..., min_length=2, max_length=100)
    destination: str = Field(..., min_length=2, max_length=100)
    pass_type: str = Field(..., min_length=2, max_length=50)  # "Monthly", "Quarterly"
    start_date: str
    end_date: str

class BusPassStatusUpdate(BaseModel):
    status: str = Field(..., pattern="^(Approved|Rejected|Pending)$")

class BusPassResponse(BaseModel):
    id: int
    student_id: int
    source: str
    destination: str
    pass_type: str
    start_date: str
    end_date: str
    status: str
    student_name: Optional[str] = None
    student_email: Optional[str] = None
    payment_status: Optional[str] = None
    amount: Optional[float] = None

    class Config:
        from_attributes = True

# ---------------- Payment Schemas ----------------
class PaymentCreate(BaseModel):
    student_id: int
    pass_id: int
    amount: float = 300.0
    card_holder: Optional[str] = None
    card_number: Optional[str] = None
    expiry_date: Optional[str] = None
    cvv: Optional[str] = None

class PaymentResponse(BaseModel):
    id: int
    student_id: int
    pass_id: int
    amount: float
    payment_status: str
    payment_date: datetime

    class Config:
        from_attributes = True

# ---------------- Admin Schemas ----------------
class AdminLogin(BaseModel):
    username: str
    password: str

class DashboardStats(BaseModel):
    total_applications: int
    pending_applications: int
    approved_applications: int
    rejected_applications: int
    total_students: int
    active_routes: int = 12
