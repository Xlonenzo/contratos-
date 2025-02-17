# models.py
from sqlalchemy import Column, Integer, String, Boolean, DateTime as SQLDateTime, Date, Text, ARRAY, ForeignKey
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

class Individual(Base):
    __tablename__ = "individuals"
    __table_args__ = {"schema": "xlon"}

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(255), nullable=False)
    cpf = Column(String(11), unique=True, nullable=False)
    rg = Column(String(20))
    orgao_emissor = Column(String(20))
    data_emissao = Column(SQLDateTime)
    data_nascimento = Column(SQLDateTime, nullable=False)
    sexo = Column(String(1))
    estado_civil = Column(String(20))
    nacionalidade = Column(String(100))
    naturalidade = Column(String(100))
    profissao = Column(String(100))
    nome_pai = Column(String(255))
    nome_mae = Column(String(255))
    titulo_eleitor = Column(String(20))
    zona_eleitoral = Column(String(10))
    secao_eleitoral = Column(String(10))
    carteira_trabalho = Column(String(20))
    serie_ctps = Column(String(10))
    pis_pasep = Column(String(20))
    endereco = Column(String(255))
    numero = Column(String(10))
    complemento = Column(String(100))
    bairro = Column(String(100))
    cidade = Column(String(100))
    estado = Column(String(2))
    cep = Column(String(8))
    telefone = Column(String(20))
    celular = Column(String(20))
    email = Column(String(255), nullable=False)
    banco = Column(String(100))
    agencia = Column(String(10))
    conta = Column(String(20))
    tipo_conta = Column(String(20))
    status = Column(String(10), default="ativo")
    observacoes = Column(String(1000))
    data_cadastro = Column(SQLDateTime(timezone=True), server_default=func.now())

    class Config:
        orm_mode = True

class Contract(Base):
    __tablename__ = "contracts"
    __table_args__ = {"schema": "xlon"}

    contract_id = Column(Integer, primary_key=True, index=True)
    contract_number = Column(String(50), unique=True, nullable=False)
    contract_name = Column(String(200), nullable=False)
    contract_type = Column(String(100))
    contract_category = Column(String(100))
    version = Column(Integer, default=1)
    status = Column(String(50), default='pending')
    
    # Partes do contrato - apenas empresas
    party_a_id = Column(Integer, ForeignKey('xlon.empresas.id'))
    party_b_id = Column(Integer, ForeignKey('xlon.empresas.id'))
    
    party_a_role = Column(String(100))
    party_b_role = Column(String(100))
    effective_date = Column(Date, nullable=False)
    expiration_date = Column(Date, nullable=False)
    renewal_terms = Column(String(500))
    payment_terms = Column(Text)
    escalation_clauses = Column(Text)
    document_content = Column(Text)
    
    created_at = Column(SQLDateTime(timezone=True), server_default=func.current_timestamp())
    last_modified_at = Column(SQLDateTime(timezone=True), onupdate=func.current_timestamp())
    last_modified_by = Column(Integer, ForeignKey('xlon.users.id'))
    audit_log = Column(ARRAY(String))

    # Relacionamentos - apenas empresas
    party_a = relationship("Empresa", foreign_keys=[party_a_id])
    party_b = relationship("Empresa", foreign_keys=[party_b_id])
    modifier = relationship("User", foreign_keys=[last_modified_by])

    class Config:
        orm_mode = True


