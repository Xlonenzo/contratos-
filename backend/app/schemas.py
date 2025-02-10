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

