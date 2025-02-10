# main.py

from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import logging
import os
from . import models, schemas
from .database import SessionLocal, engine
from passlib.context import CryptContext
from fastapi.security import OAuth2PasswordBearer
from .security import create_access_token, verify_token

# Configuração de logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI()

# Configuração CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configurar o contexto de hash de senha
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Função para gerar hash da senha
def get_password_hash(password: str):
    return pwd_context.hash(password)

# Função para verificar senha
def verify_password(plain_password: str, hashed_password: str):
    return pwd_context.verify(plain_password, hashed_password)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Rotas para Autenticação e Usuários
@app.post("/api/login")
def login(user: schemas.UserLogin, db: Session = Depends(get_db)):
    try:
        db_user = db.query(models.User).filter(models.User.username == user.username).first()
        
        if not db_user:
            raise HTTPException(status_code=401, detail="Usuário não encontrado")

        if not verify_password(user.password, db_user.hashed_password):
            raise HTTPException(status_code=401, detail="Senha incorreta")
        
        if not db_user.is_active:
            raise HTTPException(status_code=401, detail="Usuário inativo")
        
        # Criar token de acesso
        access_token = create_access_token(
            data={"sub": db_user.username, "role": db_user.role}
        )
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "username": db_user.username,
            "role": db_user.role
        }
        
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Erro no login: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")

# Função para proteger rotas
async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Credenciais inválidas",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    username = verify_token(token)
    if username is None:
        raise credentials_exception
        
    user = db.query(models.User).filter(models.User.username == username).first()
    if user is None:
        raise credentials_exception
    return user

@app.post("/api/users", response_model=schemas.User)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    try:
        # Verificar se username já existe
        db_user = db.query(models.User).filter(models.User.username == user.username).first()
        if db_user:
            raise HTTPException(status_code=400, detail="Username já está em uso")

        # Verificar se email já existe
        db_user = db.query(models.User).filter(models.User.email == user.email).first()
        if db_user:
            raise HTTPException(status_code=400, detail="Email já está em uso")

        # Criar objeto de usuário com hash da senha
        hashed_password = get_password_hash(user.password)
        db_user = models.User(
            username=user.username,
            email=user.email,
            hashed_password=hashed_password,  # Usar o hash da senha
            role=user.role,
            full_name=user.full_name,
            is_active=user.is_active
        )

        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user

    except HTTPException as he:
        raise he
    except Exception as e:
        db.rollback()
        logger.error(f"Erro ao criar usuário: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro ao criar usuário")

@app.put("/api/users/{user_id}", response_model=schemas.User)
def update_user(user_id: int, user: schemas.UserUpdate, db: Session = Depends(get_db)):
    try:
        db_user = db.query(models.User).filter(models.User.id == user_id).first()
        if not db_user:
            raise HTTPException(status_code=404, detail="Usuário não encontrado")

        # Atualizar campos se fornecidos
        if user.username is not None:
            # Verificar se novo username já existe
            existing_user = db.query(models.User).filter(
                models.User.username == user.username,
                models.User.id != user_id
            ).first()
            if existing_user:
                raise HTTPException(status_code=400, detail="Username já está em uso")
            db_user.username = user.username

        if user.email is not None:
            # Verificar se novo email já existe
            existing_user = db.query(models.User).filter(
                models.User.email == user.email,
                models.User.id != user_id
            ).first()
            if existing_user:
                raise HTTPException(status_code=400, detail="Email já está em uso")
            db_user.email = user.email

        if user.password is not None:
            # Gerar hash para nova senha
            db_user.hashed_password = get_password_hash(user.password)

        if user.role is not None:
            db_user.role = user.role

        if user.full_name is not None:
            db_user.full_name = user.full_name

        if user.is_active is not None:
            db_user.is_active = user.is_active

        db.commit()
        db.refresh(db_user)
        return db_user

    except HTTPException as he:
        raise he
    except Exception as e:
        db.rollback()
        logger.error(f"Erro ao atualizar usuário: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro ao atualizar usuário")

@app.get("/api/users", response_model=List[schemas.User])
def list_users(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Sem permissão")
    users = db.query(models.User).all()
    return users

@app.delete("/api/users/{user_id}", response_model=schemas.User)
def delete_user(user_id: int, db: Session = Depends(get_db)):
    try:
        db_user = db.query(models.User).filter(models.User.id == user_id).first()
        if db_user is None:
            raise HTTPException(status_code=404, detail="Usuário não encontrado")
        user_data = {
            "id": db_user.id,
            "username": db_user.username,
            "email": db_user.email,
            "role": db_user.role,
            "is_active": db_user.is_active,
            "full_name": db_user.full_name or ''
        }
        db.delete(db_user)
        db.commit()
        return schemas.User(**user_data)
    except Exception as e:
        db.rollback()
        logger.error(f"Erro ao deletar usuário: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Rotas para Customização
@app.post("/api/customization", response_model=schemas.Customization)
async def create_customization(customization: schemas.CustomizationCreate, db: Session = Depends(get_db)):
    try:
        db_customization = models.Customization(**customization.dict())
        db.add(db_customization)
        db.commit()
        db.refresh(db_customization)
        return db_customization
    except Exception as e:
        logger.error(f"Erro ao criar customização: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/customization", response_model=schemas.Customization)
async def update_customization(customization: schemas.CustomizationCreate, db: Session = Depends(get_db)):
    try:
        # Buscar customização existente ou criar nova
        db_customization = db.query(models.Customization).first()
        if not db_customization:
            db_customization = models.Customization()
            db.add(db_customization)
        
        # Atualizar campos
        for key, value in customization.dict().items():
            setattr(db_customization, key, value)
        
        db.commit()
        db.refresh(db_customization)
        return db_customization
    except Exception as e:
        db.rollback()
        logger.error(f"Erro ao atualizar customização: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/customization")
def get_customization(db: Session = Depends(get_db)):
    try:
        customization = db.query(models.Customization).first()
        if not customization:
            customization = models.Customization(
                sidebar_color="#1a73e8",
                button_color="#1a73e8",
                font_color="#000000"
            )
            db.add(customization)
            db.commit()
            db.refresh(customization)
        return customization
    except Exception as e:
        logger.error(f"Erro ao buscar customização: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Test Routes
@app.get("/api/test-cors")
async def test_cors():
    return {"message": "CORS está funcionando!"}

@app.get("/test")
def test_route():
    return {"message": "Test route working"}

@app.post("/api/reset-password/{username}")
def reset_password(username: str, db: Session = Depends(get_db)):
    try:
        # Buscar usuário
        db_user = db.query(models.User).filter(models.User.username == username).first()
        if not db_user:
            raise HTTPException(status_code=404, detail="Usuário não encontrado")
        
        # Gerar hash para "admin123"
        plain_password = "admin123"
        hashed_password = get_password_hash(plain_password)
        
        # Log antes da atualização
        logger.info(f"Senha antiga (hash): {db_user.hashed_password}")
        
        # Atualizar a senha no banco com o novo hash
        db_user.hashed_password = hashed_password
        db.commit()
        
        # Log após a atualização
        logger.info(f"Nova senha definida com hash: {hashed_password}")
        
        return {"message": f"Senha resetada com sucesso para o usuário {username}"}
        
    except Exception as e:
        logger.error(f"Erro ao resetar senha: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Erro ao resetar senha")

if __name__ == "__main__":
    logger.info("Iniciando a aplicação...")
    models.Base.metadata.create_all(bind=engine)
    logger.info("Tabelas criadas (se não existirem)")




