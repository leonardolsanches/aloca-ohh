from flask import Flask, render_template, request, redirect, url_for, session

app = Flask(__name__, static_folder='static', template_folder='templates')
app.secret_key = 'seu-segredo-aqui'  # Necessário para usar sessões

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/login', methods=['GET'])
def login_page():
    if 'user' in session:
        return redirect(url_for('alocacao'))
    return render_template('login.html')

@app.route('/login', methods=['POST'])
def login():
    username = request.form['username']
    password = request.form['password']
    profile = request.form['profile']
    if username == 'admin' and password == 'password':
        session['user'] = {'username': username, 'profile': profile}
        return redirect(url_for('alocacao'))
    return 'Credenciais inválidas', 401

@app.route('/alocacao')
def alocacao():
    if 'user' not in session:
        return redirect(url_for('login_page'))
    return render_template('alocacao.html')

@app.route('/logout')
def logout():
    session.pop('user', None)
    return redirect(url_for('home'))

if __name__ == '__main__':
    app.run(debug=True)
