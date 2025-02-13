from sqlalchemy.orm import Session
from app.database import SessionLocal, engine, Base
from app.models import User
from app.main import get_password_hash
import logging

logger = logging.getLogger(__name__)

def init_db():
    try:
        # Criar tabelas
        Base.metadata.create_all(bind=engine)
        
        db = SessionLocal()
        
        # Verificar se já existe um usuário admin
        admin = db.query(User).filter(User.username == "admin").first()
        
        if not admin:
            # Criar usuário admin
            hashed_password = get_password_hash("admin123")
            admin_user = User(
                username="admin",
                email="admin@example.com",
                hashed_password=hashed_password,
                role="admin",
                full_name="Administrator",
                is_active=True
            )
            
            db.add(admin_user)
            db.commit()
            logger.info("Usuário admin criado com sucesso")
        
        db.close()
        logger.info("Inicialização do banco de dados concluída")
        
    except Exception as e:
        logger.error(f"Erro ao inicializar banco de dados: {str(e)}")
        raise

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    init_db() 