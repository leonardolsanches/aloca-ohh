from flask import Flask, render_template, request, redirect, url_for

app = Flask(__name__, static_folder='static', template_folder='templates')

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/login', methods=['GET'])
def login_page():
    return render_template('login.html')

@app.route('/login', methods=['POST'])
def login():
    username = request.form['username']
    password = request.form['password']
    profile = request.form['profile']
    if username == 'admin' and password == 'password':
        return redirect(url_for('alocacao'))
    return 'Credenciais inválidas', 401

@app.route('/alocacao')
def alocacao():
    return render_template('alocacao.html')

if __name__ == '__main__':
    app.run(debug=True)
