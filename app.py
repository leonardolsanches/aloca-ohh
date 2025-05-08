from flask import Flask, render_template, request, redirect, url_for
import logging

# Configurar logging para depuração
logging.basicConfig(level=logging.DEBUG)

app = Flask(__name__)

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

if __name__ == '__main__':
    # Iniciar o servidor Flask
    logging.info("Iniciando o servidor Flask na porta 5000...")
    app.run(debug=True, host='0.0.0.0', port=5000)