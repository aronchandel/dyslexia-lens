# Dyslexia Lens

A free, AI-powered reading assistant designed to help dyslexic students read and comprehend text more easily. Upload PDFs and get instant text simplification with phonetic chunking, visual anchors, and dyslexia-friendly formatting.

## Features

- Bring Your Own API Key - Use your own Gemini API key (free tier available)
- PDF Upload & Analysis - Upload any PDF and get AI-powered text simplification
- Phonetic Chunking - Breaks complex words into syllables (e.g., "Un·der·stand·ing")
- Smart Simplification - Rewrites text at a 5th-grade reading level
- Visual Anchors - Adds emojis and definitions to help with comprehension
- Text-to-Speech - Listen to simplified text with built-in TTS
- Progress Tracking - Track words read, XP earned, and learning level
- Secure Authentication - Firebase + JWT authentication
- Beautiful UI - Warm, accessible design with focus mode and ruler

## Tech Stack

### Frontend
- React - UI framework
- Vite - Build tool
- Axios - HTTP client
- React Router - Navigation
- Firebase Auth - Google authentication

### Backend
- Node.js + Express - REST API server
- Prisma - Database ORM
- PostgreSQL - Database
- JWT - Token-based authentication
- Multer - File upload handling

### AI Engine
- Python + FastAPI - AI service
- Google Gemini 2.5 Flash - Text analysis and simplification
- Pillow (PIL) - Image processing

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v16 or higher)
- Python (v3.8 or higher)
- PostgreSQL (v12 or higher)
- Git

## Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/abhijeet586/dyslexia-lens.git
cd dyslexia-lens
```

### 2. Database Setup
```bash
createdb dyslexia_db
```

### 3. Backend Setup
```bash
cd server
npm install

# create .env file
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/dyslexia_db?schema=public"
JWT_SECRET="your_secret_key"
PORT=5000

# run prisma migrations
npx prisma migrate dev

# start the server
npm start
```

### 4. Frontend Setup
```bash
cd client
npm install
npm run dev
```

### 5. AI Engine Setup
```bash
cd ai-engine

# create virtual environment
python -m venv venv

# activate virtual environment
# windows:
venv\Scripts\activate
# mac/linux:
source venv/bin/activate

# install dependencies
pip install -r requirements.txt

# start the ai service
python -m uvicorn app.main:app --reload --port 8000
```

### 6. Get a Gemini API Key
1. Go to Google AI Studio: https://aistudio.google.com/app/apikey
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key

### 7. Run the Application
Make sure all three services are running:
- Frontend: http://localhost:5173
- Backend: http://localhost:5000
- AI Engine: http://localhost:8000

Then:
1. Open http://localhost:5173 in your browser
2. Sign up or log in
3. Go to Dashboard
4. Enter your Gemini API key and click Save
5. Upload a PDF and start reading

## Project Structure

```
dyslexia-lens/
├── client/                 # react frontend
│   ├── src/
│   │   ├── components/    # reusable components
│   │   ├── pages/         # page components
│   │   ├── context/       # react context
│   │   └── hooks/         # custom hooks
│   └── package.json
├── server/                # nodejs backend
│   ├── src/
│   │   ├── controllers/   # route controllers
│   │   ├── routes/        # api routes
│   │   ├── middlewares/   # auth & upload middleware
│   │   └── config/        # firebase config
│   ├── prisma/           # database schema
│   └── package.json
├── ai-engine/            # python ai service
│   ├── app/
│   │   ├── main.py       # fastapi app
│   │   └── ai_service.py # gemini integration
│   └── requirements.txt
└── README.md
```

## Usage

1. Sign Up/Login - Create an account or sign in with Google
2. Add API Key - Enter your Gemini API key in the Dashboard
3. Upload PDF - Click "Upload PDF" and select a document
4. Read & Learn - Open the PDF reader and let AI simplify the text
5. Track Progress - View your reading stats and level progress

## Security Notes

- API keys are stored in browser localStorage (client-side only)
- Never commit .env files to Git
- Use environment variables for sensitive data
- Firebase handles authentication securely

## Known Limitations

- Requires internet connection for AI processing
- Free Gemini API has rate limits
- Large PDFs may take longer to process
- Currently optimized for English text

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

## Author

Abhijeet
- GitHub: @abhijeet586
- LinkedIn: https://linkedin.com/in/abhijeet586

## Acknowledgments

- Google Gemini AI for text analysis
- Firebase for authentication
- All open-source libraries used in this project

---

Note: This project is for educational purposes and is not deployed. To run locally, follow the installation instructions above.