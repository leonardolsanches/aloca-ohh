
from flask import Flask, render_template, send_from_directory, request, jsonify
import os

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('login.html')

@app.route('/alocacao')
def alocacao():
    return render_template('alocacao.html')

@app.route('/aprovacao')
def aprovacao():
    return render_template('aprovacao.html')

@app.route('/data/<path:filename>')
def data(filename):
    return send_from_directory('data', filename)

@app.route('/static/js/<path:filename>')
def js(filename):
    return send_from_directory('static/js', filename)

@app.route('/static/css/<path:filename>')
def css(filename):
    return send_from_directory('static/css', filename)

@app.route('/static/img/<path:filename>')
def img(filename):
    return send_from_directory('static/img', filename)

if __name__ == '__main__':
    app.run(debug=True)
