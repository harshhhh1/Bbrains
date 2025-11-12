from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/submit-data', methods=['GET'])
def submit_data():
    username = request.form.get('username')
    password = request.form.get('password')
    return jsonify(success=True, username=username)

if __name__ == '__main__':
    app.run(debug=True)