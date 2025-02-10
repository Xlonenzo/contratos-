from datetime import timedelta

# Configurações JWT
SECRET_KEY = "sua_chave_secreta_muito_segura"  # Em produção, use variável de ambiente
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30 