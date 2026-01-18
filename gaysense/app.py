from flask import Flask, render_template, send_from_directory, jsonify
import os
from datetime import datetime

app = Flask(__name__)

DOWNLOAD_DIR = 'static/downloads'

GAMES_CONFIG = {
    'ddnet': {
        'name': 'DDNet',
        'description': 'DDNet - модификация Teeworlds с улучшенной физикой.',
        'icon': 'ddnet.png'
    },
    'cs2': {
        'name': 'CS 2',
        'description': 'Counter-Strike 2 - современный шутер от Valve.',
        'icon': 'cs2.png'
    },
    'minecraft': {
        'name': 'Minecraft',
        'description': 'Песочница с бесконечными возможностями.',
        'icon': 'minecraft.png'
    }
}

@app.route('/')
def index():
    # Главная страница
    return render_template('index.html')

@app.route('/api/files/<game>')
def get_files(game):
    # Получить список файлов для игры
    if game not in GAMES_CONFIG:
        return jsonify({'error': 'Game not found'}), 404

    game_dir = os.path.join(DOWNLOAD_DIR, game)
    if not os.path.exists(game_dir):
        return jsonify({'files': []})

    files = []
    for filename in os.listdir(game_dir):
        filepath = os.path.join(game_dir, filename)
        if os.path.isfile(filepath):
            stat = os.stat(filepath)
            files.append({
                'name': filename,
                'size': stat.st_size,
                'size_human': format_size(stat.st_size),
                'modified': datetime.fromtimestamp(stat.st_mtime).strftime('%Y-%m-%d %H:%M'),
                'url': f'/download/{game}/{filename}'
            })

    files.sort(key=lambda x: x['modified'], reverse=True)
    return jsonify({'files': files})

@app.route('/download/<game>/<filename>')
def download_file(game, filename):
    # Скачать файл
    if game not in GAMES_CONFIG:
        return 'Game not found', 404

    return send_from_directory(os.path.join(DOWNLOAD_DIR, game), filename, as_attachment=True)

@app.route('/api/games')
def get_games():
    # Получить конфигурацию игр
    return jsonify(GAMES_CONFIG)

def format_size(bytes_size):
    # Форматировать размер файла
    for unit in ['B', 'KB', 'MB', 'GB']:
        if bytes_size < 1024.0:
            return f"{bytes_size:.1f} {unit}"
        bytes_size /= 1024.0
    return f"{bytes_size:.1f} TB"

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)