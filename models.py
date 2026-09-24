from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    mobile = Column(String(20), nullable=False)
    college = Column(String(150), nullable=False)
    password = Column(String(255), nullable=False)

    # Relationships
    bus_passes = relationship("BusPass", back_populates="student", cascade="all, delete-orphan")
    payments = relationship("Payment", back_populates="student", cascade="all, delete-orphan")


class BusPass(Base):
    __tablename__ = "bus_passes"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    source = Column(String(100), nullable=False)
    destination = Column(String(100), nullable=False)
    pass_type = Column(String(50), nullable=False)  # "Monthly", "Quarterly"
    start_date = Column(String(50), nullable=False)
    end_date = Column(String(50), nullable=False)
    status = Column(String(20), default="Pending", nullable=False)  # "Pending", "Approved", "Rejected"

    # Relationships
    student = relationship("Student", back_populates="bus_passes")
    payment = relationship("Payment", back_populates="bus_pass", uselist=False, cascade="all, delete-orphan")


class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    pass_id = Column(Integer, ForeignKey("bus_passes.id"), nullable=False)
    amount = Column(Float, default=300.0, nullable=False)
    payment_status = Column(String(50), default="Successful", nullable=False)
    payment_date = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    student = relationship("Student", back_populates="payments")
    bus_pass = relationship("BusPass", back_populates="payment")
