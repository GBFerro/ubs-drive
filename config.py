import os

# Configurações do AWS S3
AWS_ACCESS_KEY = os.getenv('AWS_ACCESS_KEY')
AWS_SECRET_KEY = os.getenv('AWS_SECRET_KEY')
S3_BUCKET = os.getenv('S3_BUCKET')

# Configurações do MongoDB
MONGO_URI = os.getenv('MONGO_URI')  # URL da conexão do MongoDB
DATABASE_NAME = 'ubs_files'
COLLECTION_NAME = 'files_metadata'