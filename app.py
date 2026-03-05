from flask import Flask, render_template, jsonify
import json
import os

app = Flask(__name__)

# 設定ファイルのパス
CONFIG_PATH = os.path.join(os.path.dirname(__file__), 'config.json')

def load_config():
    """設定ファイルから情報を読み込む"""
    if os.path.exists(CONFIG_PATH):
        with open(CONFIG_PATH, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {"address": "", "reservation_url": ""}

@app.route('/')
def index():
    """トップページを表示"""
    config = load_config()
    return render_template('index.html', config=config)

@app.route('/courses')
def courses():
    """コース一覧ページを表示"""
    config = load_config()
    return render_template('courses.html', config=config)

@app.route('/api/config')
def get_config():
    """フロントエンド向けのAPI（住所などの情報をJavaScriptに渡すため）"""
    return jsonify(load_config())

if __name__ == '__main__':
    app.run(debug=True, port=5050)

