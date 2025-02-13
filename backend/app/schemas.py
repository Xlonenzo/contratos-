# schemas.py

from pydantic import BaseModel, EmailStr
from typing import Optional, Dict, Any
from datetime import datetime

# 1. Schemas para Autenticação
class UserLogin(BaseModel):
    username: str
    password: str

    class Config:
        from_attributes = True

# 2. Schemas para Gestão de Usuários
class UserBase(BaseModel):
    username: str
    email: EmailStr
    role: str
    is_active: bool = True
    full_name: str

    class Config:
        from_attributes = True

class UserCreate(UserBase):
    password: str  # Será convertido para hashed_password no backend

class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    role: Optional[str] = None
    full_name: Optional[str] = None
    is_active: Optional[bool] = None

class User(UserBase):
    id: int

    class Config:
        from_attributes = True

# 3. Schemas para Personalização
class CustomizationBase(BaseModel):
    sidebar_color: str
    button_color: str
    font_color: str

class CustomizationCreate(CustomizationBase):
    pass

class Customization(CustomizationBase):
    id: int

    class Config:
        from_attributes = True

# 4. Schema para Upload de Logo
class LogoUploadResponse(BaseModel):
    logo_url: str

    class Config:
        from_attributes = True

# 5. Schema de resposta base para APIs
class BaseResponse(BaseModel):
    success: bool
    message: str
    data: Optional[dict] = None
    error: Optional[str] = None

# Schemas para Empresas
class EmpresaBase(BaseModel):
    razaoSocial: str
    nomeFantasia: Optional[str] = None
    cnpj: str
    inscricaoEstadual: Optional[str] = None
    endereco: Optional[str] = None
    numero: Optional[str] = None
    complemento: Optional[str] = None
    bairro: Optional[str] = None
    cidade: Optional[str] = None
    estado: Optional[str] = None
    cep: Optional[str] = None
    telefone: Optional[str] = None
    email: str
    status: str = "ativo"

    class Config:
        from_attributes = True

class EmpresaCreate(EmpresaBase):
    pass

class EmpresaUpdate(EmpresaBase):
    pass

class Empresa(EmpresaBase):
    id: int
    dataCadastro: datetime

    class Config:
        from_attributes = True

