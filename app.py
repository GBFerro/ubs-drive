from flask import Flask, request, jsonify, send_file, render_template
from werkzeug.utils import secure_filename
from io import BytesIO
import pymongo
import gridfs
from bson import ObjectId
from config import AWS_ACCESS_KEY, AWS_SECRET_KEY, S3_BUCKET, MONGO_URI, DATABASE_NAME, COLLECTION_NAME

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = './uploads'


# Configurando MongoDB
client = pymongo.MongoClient(MONGO_URI)
db = client[DATABASE_NAME]
collection = db[COLLECTION_NAME]
fs = gridfs.GridFS(db)

# Rota para a página principal
@app.route('/')
def index():
    return render_template('index.html')

# Rota para fazer o upload do arquivo
@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'Nenhum arquivo enviado'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'Nenhum arquivo selecionado'}), 400
    
    if file:
        # Salvando o arquivo localmente
        filename = secure_filename(file.filename)
        # file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        # file.save(file_path)

        file_id = fs.put(file, filename=filename, content_type=file.content_type)
        
        # Enviando o arquivo para o AWS S3
        # s3.upload_file(file_path, S3_BUCKET, filename)

        # Salvando metadados no MongoDB
        file_metadata = {
            "filename": filename,
            "content_type": file.content_type,
            "file_id": file_id
        }

        db.files_metadata.insert_one(file_metadata)

        return jsonify({'message': 'Arquivo enviado com sucesso!', 'file_url': file_metadata['s3_url']}), 201

# Rota para listar e filtrar arquivos
@app.route('/files', methods=['GET'])
def list_files():
    file_type = request.args.get('type')
    query = {}
    if file_type:
        query['content_type'] = file_type

    files = collection.find(query)
    file_list = []
    
    for file in files:
        file['_id'] = str(file['_id'])  # Converte ObjectId para string
        file_list.append(file)

    return jsonify(file_list), 200

# Rota para baixar arquivos
@app.route('/download/<filename>', methods=['GET'])
def download_file(filename):
    try:
        # Baixar o arquivo do GridFS
        file_id = ObjectId(file_id)
        file = fs.get(file_id)
        return send_file(BytesIO(file.read()), attachment_filename=file.filename, mimetype=file.content_type)
    except Exception as e:
        return jsonify({'error': str(e)}), 404

if __name__ == '__main__':
    app.run(debug=True)
