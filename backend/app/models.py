# models.py
from sqlalchemy import Column, Integer, String, Float, Boolean, Date, DateTime as SQLDateTime, Text, ForeignKey, Enum, JSON
from sqlalchemy.orm import relationship, backref
from sqlalchemy.sql import func
from .database import Base
import enum

# Enums para status e prioridade
class IssueStatus(str, enum.Enum):
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    RESOLVED = "resolved"
    CLOSED = "closed"
    REOPENED = "reopened"

class IssuePriority(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class IssueType(str, enum.Enum):
    BUG = "bug"
    FEATURE = "feature"
    IMPROVEMENT = "improvement"
    QUESTION = "question"
    TASK = "task"

# 2. Modelo para Gestão de Usuários
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

    # Adicionar relacionamentos
    comments = relationship("Comment", back_populates="user")
    created_issues = relationship("Issue", foreign_keys=[Issue.created_by], back_populates="creator")
    assigned_issues = relationship("Issue", foreign_keys=[Issue.assigned_to], back_populates="assignee")
    issue_changes = relationship("IssueHistory", back_populates="user")

    def __repr__(self):
        return f"User(id={self.id}, username={self.username}, email={self.email})"

# 3. Modelo para Personalização
class Customization(Base):
    __tablename__ = "customizations"
    __table_args__ = {"schema": "xlon"}

    id = Column(Integer, primary_key=True, index=True)
    sidebar_color = Column(String)
    button_color = Column(String)
    font_color = Column(String)

# Modelo para comentários
class Comment(Base):
    __tablename__ = "comments"

    comment_id = Column(Integer, primary_key=True)
    text = Column(Text, nullable=False)
    
    # Referência ao contrato
    contract_id = Column(Integer, ForeignKey('contracts.contract_id', ondelete='CASCADE'))
    contract = relationship("Contract", back_populates="comments")
    
    # Referência ao usuário que criou o comentário
    user_id = Column(Integer, ForeignKey('users.user_id'))
    user = relationship("User", back_populates="comments")
    
    # Metadados do comentário
    selection_text = Column(Text)  # Texto selecionado no documento
    selection_position = Column(JSON)  # Posição do texto selecionado {start, end}
    parent_comment_id = Column(Integer, ForeignKey('comments.comment_id'))  # Para respostas
    
    # Campos de auditoria
    created_at = Column(SQLDateTime(timezone=True), server_default=func.now())
    updated_at = Column(SQLDateTime(timezone=True), onupdate=func.now())
    is_deleted = Column(Boolean, default=False)
    
    # Relacionamentos
    replies = relationship("Comment", 
                         backref=backref("parent", remote_side=[comment_id]),
                         cascade="all, delete-orphan")

# Modelo para issues
class Issue(Base):
    __tablename__ = "issues"

    issue_id = Column(Integer, primary_key=True)
    title = Column(String(200), nullable=False)
    description = Column(Text)
    
    # Referência ao contrato
    contract_id = Column(Integer, ForeignKey('contracts.contract_id', ondelete='CASCADE'))
    contract = relationship("Contract", back_populates="issues")
    
    # Campos de status e prioridade
    status = Column(Enum(IssueStatus), default=IssueStatus.OPEN)
    priority = Column(Enum(IssuePriority), default=IssuePriority.MEDIUM)
    issue_type = Column(Enum(IssueType), default=IssueType.TASK)
    
    # Atribuições
    created_by = Column(Integer, ForeignKey('users.user_id'))
    assigned_to = Column(Integer, ForeignKey('users.user_id'))
    
    # Metadados da issue
    due_date = Column(SQLDateTime(timezone=True))
    tags = Column(JSON)  # Array de tags
    related_text = Column(Text)  # Texto relacionado do contrato
    text_position = Column(JSON)  # Posição do texto no documento
    
    # Campos de auditoria
    created_at = Column(SQLDateTime(timezone=True), server_default=func.now())
    updated_at = Column(SQLDateTime(timezone=True), onupdate=func.now())
    resolved_at = Column(SQLDateTime(timezone=True))
    closed_at = Column(SQLDateTime(timezone=True))
    
    # Relacionamentos
    creator = relationship("User", foreign_keys=[created_by], backref="created_issues")
    assignee = relationship("User", foreign_keys=[assigned_to], backref="assigned_issues")
    comments = relationship("Comment", cascade="all, delete-orphan")

# Modelo para histórico de issues
class IssueHistory(Base):
    __tablename__ = "issue_history"

    history_id = Column(Integer, primary_key=True)
    issue_id = Column(Integer, ForeignKey('issues.issue_id', ondelete='CASCADE'))
    
    # Campos que foram alterados
    changed_fields = Column(JSON)  # {field: {old_value, new_value}}
    
    # Quem fez a alteração
    changed_by = Column(Integer, ForeignKey('users.user_id'))
    changed_at = Column(SQLDateTime(timezone=True), server_default=func.now())
    
    # Relacionamentos
    issue = relationship("Issue", backref="history")
    user = relationship("User", backref="issue_changes")

# Atualizar o modelo Contract para incluir os relacionamentos
class Contract(Base):
    # ... campos existentes ...
    
    # Adicionar relacionamentos
    comments = relationship("Comment", back_populates="contract", cascade="all, delete-orphan")
    issues = relationship("Issue", back_populates="contract", cascade="all, delete-orphan")


