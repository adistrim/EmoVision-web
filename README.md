# EmoVision-Web

This is the web application for [EmoVision](https://github.com/adistrim/emovision), a project that uses machine learning to detect emotions in images.

## Installation

### fastapi-server

1. Set up virtual environment
```bash
cd fastapi-server
python3 -m venv .venv               # python3 or python depending on your system config
source .venv/bin/activate           # for linux and macOS
```
2. Install dependencies
```bash
pip3 install -r requirements.txt    # pip3 or pip depending on your system config
```
3. Run the server
```bash
uvicorn app.main:app --reload
```

### next-client (frontend)
```bash
cd next-client
npm install
npm run dev
```

#### Docker
1. Build the image
```bash
cd server
docker build -t emovision-server .
```
2. Run the container
```bash
docker run --env-file .env -p 8000:8000 emovision-server
```

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
