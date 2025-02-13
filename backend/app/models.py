# models.py
from sqlalchemy import Column, Integer, String, Boolean, DateTime as SQLDateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base

class User(Base):
    __tablename__ = "users"
    __table_args__ = {"schema": "xlon"}

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(100), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False)
    full_name = Column(String(100), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(SQLDateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(SQLDateTime(timezone=True), server_default=func.now(), nullable=False)

    def __repr__(self):
        return f"User(id={self.id}, username={self.username}, email={self.email})"

class Organization(Base):
    __tablename__ = "organizations"
    __table_args__ = {"schema": "xlon"}

    org_id = Column(Integer, primary_key=True)
    org_name = Column(String(200), nullable=False)
    org_type = Column(String(50))
    tax_identification_number = Column(String(20), unique=True)
    address = Column(String(200))
    city = Column(String(100))
    state = Column(String(50))
    country = Column(String(50))
    created_at = Column(SQLDateTime(timezone=True), server_default=func.now())
    updated_at = Column(SQLDateTime(timezone=True), onupdate=func.now())

class Customization(Base):
    __tablename__ = "customizations"
    __table_args__ = {"schema": "xlon"}

    id = Column(Integer, primary_key=True, index=True)
    sidebar_color = Column(String)
    button_color = Column(String)
    font_color = Column(String)

class Empresa(Base):
    __tablename__ = "empresas"
    __table_args__ = {"schema": "xlon"}

    id = Column(Integer, primary_key=True, index=True)
    razao_social = Column(String(255), nullable=False)
    nome_fantasia = Column(String(255))
    cnpj = Column(String(14), unique=True, nullable=False)
    inscricao_estadual = Column(String(20))
    endereco = Column(String(255))
    numero = Column(String(10))
    complemento = Column(String(100))
    bairro = Column(String(100))
    cidade = Column(String(100))
    estado = Column(String(2))
    cep = Column(String(8))
    telefone = Column(String(20))
    email = Column(String(255), nullable=False)
    status = Column(String(10), default="ativo")
    data_cadastro = Column(SQLDateTime(timezone=True), server_default=func.now())

    class Config:
        orm_mode = True


