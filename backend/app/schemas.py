# schemas.py

from pydantic import BaseModel, EmailStr
from typing import Optional, Dict, Any, List
from datetime import datetime, date

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

class IndividualBase(BaseModel):
    nome: str
    cpf: str
    rg: Optional[str] = None
    orgao_emissor: Optional[str] = None
    data_emissao: Optional[datetime] = None
    data_nascimento: datetime
    sexo: Optional[str] = None
    estado_civil: Optional[str] = None
    nacionalidade: Optional[str] = None
    naturalidade: Optional[str] = None
    profissao: Optional[str] = None
    nome_pai: Optional[str] = None
    nome_mae: Optional[str] = None
    titulo_eleitor: Optional[str] = None
    zona_eleitoral: Optional[str] = None
    secao_eleitoral: Optional[str] = None
    carteira_trabalho: Optional[str] = None
    serie_ctps: Optional[str] = None
    pis_pasep: Optional[str] = None
    endereco: Optional[str] = None
    numero: Optional[str] = None
    complemento: Optional[str] = None
    bairro: Optional[str] = None
    cidade: Optional[str] = None
    estado: Optional[str] = None
    cep: Optional[str] = None
    telefone: Optional[str] = None
    celular: Optional[str] = None
    email: str
    banco: Optional[str] = None
    agencia: Optional[str] = None
    conta: Optional[str] = None
    tipo_conta: Optional[str] = None
    status: str = "ativo"
    observacoes: Optional[str] = None

    class Config:
        from_attributes = True

class IndividualCreate(IndividualBase):
    pass

class IndividualUpdate(IndividualBase):
    pass

class Individual(IndividualBase):
    id: int
    data_cadastro: datetime

    class Config:
        from_attributes = True

# Adicione após os schemas existentes

class ContractBase(BaseModel):
    contract_number: str
    contract_name: str
    contract_type: str
    contract_category: str
    status: str = 'pending'
    party_a_id: Optional[int] = None
    party_b_id: Optional[int] = None
    party_a_role: Optional[str] = None
    party_b_role: Optional[str] = None
    effective_date: date
    expiration_date: date
    renewal_terms: Optional[str] = None
    payment_terms: Optional[str] = None
    escalation_clauses: Optional[str] = None
    document_content: Optional[str] = None
    version: Optional[int] = 1

    class Config:
        from_attributes = True

class ContractCreate(ContractBase):
    pass

class Contract(ContractBase):
    contract_id: int
    created_at: Optional[datetime] = None
    last_modified_at: Optional[datetime] = None
    last_modified_by: Optional[int] = None
    audit_log: Optional[List[str]] = None

    class Config:
        from_attributes = True

