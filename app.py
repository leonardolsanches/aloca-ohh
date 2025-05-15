from flask import Flask, render_template, request, redirect, url_for, send_from_directory
import logging
import os

# Configurar logging para depuração
logging.basicConfig(level=logging.DEBUG)

# Inicializar o Flask com os diretórios corretos
app = Flask(__name__, template_folder='templates', static_folder='static')

# Rota para a página de login
@app.route('/')
@app.route('/login')
def login():
    logging.debug("Acessando a rota /login")
    return render_template('login.html')

# Rota para a página de alocação
@app.route('/alocacao')
def alocacao():
    username = request.args.get('username', 'Convidado')
    logging.debug(f"Acessando a rota /alocacao com username: {username}")
    return render_template('alocacao.html', username=username)

# Rota para a página de aprovação
@app.route('/aprovacao')
def aprovacao():
    username = request.args.get('username', 'Convidado')
    logging.debug(f"Acessando a rota /aprovacao com username: {username}")
    return render_template('aprovacao.html', username=username)

# Rota para servir arquivos JSON da pasta /data/
@app.route('/data/<path:filename>')
def serve_data_files(filename):
    logging.debug(f"Servindo arquivo da pasta /data/: {filename}")
    return send_from_directory('data', filename)

if __name__ == '__main__':
    # Iniciar o servidor Flask
    logging.info("Iniciando o servidor Flask na porta 5000...")
    app.run(debug=True, host='0.0.0.0', port=5000)
