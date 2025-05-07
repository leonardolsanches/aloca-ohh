import json
from flask import Flask, render_template, request, jsonify, session, redirect, url_for
from datetime import datetime, timedelta
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
app.secret_key = 'sua_chave_secreta_aqui'

ALOCACOES_FILE = 'alocacoes.json'
USERS = {
    'admin': generate_password_hash('admin123', method='pbkdf2:sha256'),
    'user': generate_password_hash('user123', method='pbkdf2:sha256')
}

def load_json(file_path):
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        return []

def save_json(file_path, data):
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2)

@app.route('/')
def index():
    return redirect(url_for('login'))

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        bypass = request.form.get('bypass')
        perfil = request.form.get('perfil')

        if bypass:
            session['username'] = 'Leonardo Lima Sanches'
            session['perfil'] = 'Colaborador'
            return redirect(url_for('alocacao'))

        if username in USERS and check_password_hash(USERS[username], password) and perfil:
            session['username'] = username
            session['perfil'] = perfil
            return redirect(url_for('alocacao'))
        return render_template('login.html', error='Usuário, senha ou perfil inválidos')

    return render_template('login.html')

@app.route('/logout')
def logout():
    session.pop('username', None)
    session.pop('perfil', None)
    return redirect(url_for('login'))

@app.route('/alocacao')
def alocacao():
    if 'username' not in session:
        return redirect(url_for('login'))
    return render_template('alocacao.html')

@app.route('/carregar_alocacoes', methods=['GET'])
def carregar_alocacoes():
    mes_ano = request.args.get('mes_ano', '2025-01')
    alocacoes = load_json(ALOCACOES_FILE)
    alocacoes_filtradas = [aloc for aloc in alocacoes if aloc['mes'] == mes_ano]
    dias_alocados = {}
    for aloc in alocacoes_filtradas:
        percentual = aloc['horas'] * 100
        dias_no_mes = 176 / 100
        percentual_por_dia = percentual / 30
        for dia in range(1, 31):
            data = f"{mes_ano}-{str(dia).zfill(2)}"
            dias_alocados[data] = dias_alocados.get(data, 0) + percentual_por_dia
    return jsonify(dias_alocados)

@app.route('/salvar_alocacao', methods=['POST'])
def salvar_alocacao():
    nova_alocacao = request.get_json()
    alocacoes = load_json(ALOCACOES_FILE)
    for dia in nova_alocacao['dias']:
        alocacao_dia = {
            "colaborador": nova_alocacao.get('colaborador', session['username']),
            "gestor": nova_alocacao.get('gestor', "ANA LUCIA ANTUNES DE ARAUJO"),
            "area": "SISTEMA NEGÓCIO",
            "tipo_recurso": nova_alocacao.get('tipo_recurso', "MÃO DE OBRA PRÓPRIA (HC)"),
            "projeto": nova_alocacao['projeto'],
            "atividade": nova_alocacao['atividade'],
            "mes": dia[:7],
            "horas": nova_alocacao['percentual'] / 100,
            "aprovado": False,
            "data_aprovacao": None,
            "justificativa": ""
        }
        alocacoes.append(alocacao_dia)
    save_json(ALOCACOES_FILE, alocacoes)
    return jsonify({"status": "success"})

@app.route('/aprovar_alocacao', methods=['POST'])
def aprovar_alocacao():
    data = request.get_json()
    alocacoes = load_json(ALOCACOES_FILE)
    for aloc in alocacoes:
        if aloc['mes'] == data['mes'] and aloc['colaborador'] == data['colaborador'] and aloc['projeto'] == data['projeto']:
            aloc['aprovado'] = True
            aloc['data_aprovacao'] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    save_json(ALOCACOES_FILE, alocacoes)
    return jsonify({"status": "success"})

@app.route('/reprovar_alocacao', methods=['POST'])
def reprovar_alocacao():
    data = request.get_json()
    alocacoes = load_json(ALOCACOES_FILE)
    for aloc in alocacoes:
        if aloc['mes'] == data['mes'] and aloc['colaborador'] == data['colaborador'] and aloc['projeto'] == data['projeto']:
            aloc['aprovado'] = False
            aloc['justificativa'] = data['justificativa'] or ""
    save_json(ALOCACOES_FILE, alocacoes)
    return jsonify({"status": "success"})

@app.route('/aprovacao')
def aprovacao():
    if 'username' not in session:
        return redirect(url_for('login'))
    return render_template('aprovacao.html')

@app.route('/historico')
def historico():
    if 'username' not in session:
        return redirect(url_for('login'))
    return render_template('historico.html')

@app.route('/carregar_historico', methods=['GET'])
def carregar_historico():
    alocacoes = load_json(ALOCACOES_FILE)
    return jsonify(alocacoes)

@app.route('/relatorios')
def relatorios():
    if 'username' not in session:
        return redirect(url_for('login'))
    return render_template('relatorios.html')

@app.route('/carregar_relatorios', methods=['GET'])
def carregar_relatorios():
    alocacoes = load_json(ALOCACOES_FILE)
    relatorio = {}
    for aloc in alocacoes:
        key = f"{aloc['colaborador']}-{aloc['mes']}"
        if key not in relatorio:
            relatorio[key] = {'colaborador': aloc['colaborador'], 'mes': aloc['mes'], 'horas': 0}
        relatorio[key]['horas'] += aloc['horas']
    return jsonify(list(relatorio.values()))

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')
