from flask import Flask, request, jsonify, render_template
import os
import requests
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

OPENROUTER_API_KEY = "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"

def extract_code_blocks(response):
    """Ekstrak semua blok kode dari response"""
    code_blocks = []
    current_block = []
    in_block = False
    language = ""

    for line in response.split('\n'):
        if line.startswith('```'):
            if in_block:
                code_blocks.append({
                    'language': language,
                    'code': '\n'.join(current_block)
                })
                current_block = []
                in_block = False
            else:
                language = line[3:].strip() or 'plaintext'
                in_block = True
        elif in_block:
            current_block.append(line)

    return code_blocks

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/chat', methods=['POST'])
def chat():
    user_message = request.json['message']

    prompt = f"""
    [PERINTAH KETAT]
    1. BUATKAN CODENYA BERDASARKAN APA YANG DI INPUT
    2. RESPON HANYA BERISI KODE
    3. TANPA TEKS PENJELASAN
    4. PASTIKAN FORMAT:
       ```html
       <!DOCTYPE html>
       ...
       ```
       ```css
       /* CSS */
       ...
       ```
       ```javascript
       // JS
       ...
       ```
    4. KODE HARUS LENGKAP DAN BISA LANGSUNG DICOBA

    Permintaan: {user_message}
    """

    try:
        headers = {
            "Authorization": f"Bearer {OPENROUTER_API_KEY}",
            "Content-Type": "application/json"
        }

        payload = {
            "model": "deepseek/deepseek-chat-v3-0324:free",
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.1,
            "max_tokens": 2000
        }

        response = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers=headers,
            json=payload,
            timeout=30
        )
        
        raw_content = response.json()['choices'][0]['message']['content']
        code_blocks = extract_code_blocks(raw_content)
        
        # Jika tidak ada blok kode, kembalikan raw content
        if not code_blocks:
            return jsonify({
                'response': raw_content,
                'status': 'success'
            })
        
        # Format response untuk frontend
        formatted_response = ""
        for block in code_blocks:
            formatted_response += f"```{block['language']}\n{block['code']}\n```\n\n"
        
        return jsonify({
            'response': formatted_response.strip(),
            'status': 'success',
            'code_blocks': code_blocks  # Untuk debugging
        })
        
    except Exception as e:
        app.logger.error(f"Chat error: {str(e)}")
        return jsonify({
            'response': f"Server Error: {str(e)}",
            'status': 'error'
        }), 500

if __name__ == '__main__':
    app.run(port=5000, debug=True)
