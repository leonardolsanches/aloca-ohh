from flask import Flask, render_template, request, redirect, url_for, session

app = Flask(__name__, static_folder='static', template_folder='templates')
app.secret_key = 'seu-segredo'

@app.route('/')
def login_page():
    return redirect(url_for('login'))

@app.route('/login', methods=['GET'])
def login():
    return render_template('login.html')

@app.route('/login', methods=['POST'])
def login_post():
    username = request.form['username']
    password = request.form['password']
    profile = request.form['profile']

    if password == 'Leonardo Lima Sanches':
        session['username'] = username
        return redirect(url_for('alocacao'))
    return 'Credenciais inválidas', 401

@app.route('/alocacao')
def alocacao():
    username = session.get('username', 'Convidado')
    return render_template('alocacao.html', username=username)

@app.route('/aprovacao')
def aprovacao():
    username = session.get('username', 'Convidado')
    return render_template('aprovacao.html', username=username)

@app.route('/bypass')
def bypass():
    session['username'] = 'Convidado'
    return redirect(url_for('alocacao'))

if __name__ == '__main__':
    app.run(debug=True)