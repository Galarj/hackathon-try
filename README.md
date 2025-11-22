# TruthChain PH - Complete Project Documentation

## 🎯 Project Overview

**TruthChain PH** is a Filipino-friendly AI-powered web application that provides a powerful tool:

1. **Fake News Detector** - Verifies text articles for authenticity using AI

**Technology Stack:**
- Frontend: HTML5, CSS3, Vanilla JavaScript
- Backend: Node.js + Express
- AI: Alibaba Cloud Qwen-2.5
- Deployment: Alibaba Cloud (Fully serverless)

---

## 📁 Project Structure

```
truthchain-ph/
├── index.html              # Main HTML file with complete UI
├── styles.css              # Complete responsive CSS styles
├── app.js                  # Frontend JavaScript logic
├── server.js               # Backend Express API server
├── package.json            # Node.js dependencies
├── data-models.json        # Complete JSON schemas for all data models
├── AI-PROMPTS.md          # AI prompt templates and workflows
├── USER-FLOW.md           # Complete user interaction flows
├── DEPLOYMENT.md          # Alibaba Cloud deployment architecture
└── README.md              # This file
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ installed
- npm or yarn package manager

### Installation

1. **Install Dependencies:**
```bash
npm install
```

2. **Start Backend Server:**
```bash
npm start
```

3. **Open Frontend:**
Open `index.html` in your web browser, or use a local server:
```bash
# Using Python
python -m http.server 8080

# Using Node.js http-server
npx http-server -p 8080
```

4. **Access Application:**
- Frontend: http://localhost:8080
- Backend API: http://localhost:3000/api

---

## 📚 Complete Documentation

### Layer 1: UI/UX Design (HTML + CSS + JS)
- **File:** `index.html`, `styles.css`
- Complete responsive design (desktop + mobile)
- Filipino-friendly interface (Tagalog/Taglish)
- Modular sections: Home, Fake News Detector
- Modals: Onboarding, Error, Success
- Loading states and animations
- Mobile-first responsive design

### Layer 2: App Logic (Vanilla JS)
- **File:** `app.js`
- Complete user interaction handling
- State management (onboarding, verification)
- API integration with backend
- Real-time stats updates
- Recent activity tracking
- Error handling and validation

### Layer 3: Backend Logic (Node.js + Express)
- **File:** `server.js`
- RESTful API endpoints:
  - `POST /api/verify` - Fake news verification
  - `GET /api/stats` - Application statistics
  - `GET /api/recent-activity` - Recent user activity
- CORS support
- Error handling middleware
- AI integration stubs (ready for Alibaba Cloud Qwen)

### Layer 4: Data Models & Storage
- **File:** `data-models.json`
- Complete JSON schemas:
  - `VerificationSubmission` - User submission data
  - `VerificationResult` - AI verification output
  - `UserActivity` - Activity tracking
  - `ApplicationStats` - App statistics
- Input/output specifications for all API endpoints

### Layer 5: AI Prompts & Workflow
- **File:** `AI-PROMPTS.md`
- System prompts for AI models:
  - Text verification
- User prompt templates
- AI-to-AI handoff workflows (multi-agent)
- Example complete workflows
- Alibaba Cloud Qwen integration specs

### Layer 6: Complete User Flow
- **File:** `USER-FLOW.md`
- Detailed step-by-step flows:
  - Onboarding journey
  - Home dashboard interactions
  - Fake news verification (text)
  - Navigation flows
  - Error handling states
  - Success states
- All UI states documented
- Mobile responsive adaptations
- Accessibility considerations

### Layer 7: Deployment Architecture
- **File:** `DEPLOYMENT.md`
- Complete Alibaba Cloud infrastructure:
  - CDN for static assets
  - Function Compute for serverless backend
  - OSS for object storage
  - RDS for database
  - Qwen AI for verification
  - CloudMonitor for logging
- Deployment workflow
- Cost estimation
- Security best practices
- Scaling strategy

---

## 🎨 Features

### Fake News Detector

**Supported Input Types:**
1. **Text Verification**
   - Paste news content
   - Optional source URL
   - AI analyzes for fake news patterns

**Output:**
- Status: VERIFIED, FAKE, or UNVERIFIED
- Confidence Score: 0-100%
- Explanation in Filipino/Taglish
- "Bakit Fake?" breakdown (if fake)
- Credible sources cited
- Timestamp

*(GovGuide AI Video Generator has been removed from the application)*

---

## 🌐 API Endpoints

### 1. Verify Content
```http
POST /api/verify
Content-Type: application/json

{
  "type": "text",
  "content": "string",
  "sourceUrl": "string (optional)"
}

Response:
{
  "success": true,
  "result": {
    "resultId": "VER-1700000000000-abc123xyz",
    "status": "VERIFIED" | "FAKE" | "UNVERIFIED",
    "confidenceScore": 87.5,
    "explanation": "Ang balitang ito ay totoo...",
    "whyFake": "...", // if FAKE
    "sources": [...],
    "summary": "...",
    "timestamp": "2025-11-19T10:30:00.000Z"
  }
}
```

### 2. Generate Video
*(The `/api/generate-video` endpoint has been removed from the application)*

### 3. Get Statistics
```http
GET /api/stats

Response:
{
  "success": true,
  "stats": {
    "verifiedCount": 1247,
    "userCount": 12458
  }
}
```

### 4. Get Recent Activity
```http
GET /api/recent-activity

Response:
{
  "success": true,
  "activities": [
    {
      "status": "verified",
      "title": "Verified: Government policy announcement",
      "timestamp": "2 minutes ago",
      "type": "text"
    }
  ]
}
```

---

## 🔧 Configuration

### Backend Configuration (server.js)

```javascript
const PORT = process.env.PORT || 3000;
const API_BASE_URL = 'http://localhost:3000/api';

// AI API Configuration (replace with actual Alibaba Cloud credentials)
const QWEN_API_KEY = process.env.QWEN_API_KEY;
const QWEN_ENDPOINT = process.env.QWEN_ENDPOINT;
```

### Frontend Configuration (app.js)

```javascript
const API_BASE_URL = 'http://localhost:3000/api';

// Update this when deploying to production
// const API_BASE_URL = 'https://api.truthchain.ph';
```

---

## 🚀 Deployment to Alibaba Cloud

Complete deployment guide in **DEPLOYMENT.md** includes:

1. **Setup Alibaba Cloud Account**
2. **Create OSS Buckets** (frontend, uploads, content)
3. **Deploy Frontend to OSS + CDN**
4. **Setup RDS Database**
5. **Deploy Function Compute** (serverless backend)
6. **Configure Load Balancer**
7. **Integrate Qwen AI API**
8. **Setup Monitoring & Logging**

**Estimated Monthly Cost:** ~$557 USD
- Scales with usage
- Free tier available for testing

---

## 🔐 Security

- **HTTPS/SSL** for all connections
- **Input validation** on all endpoints
- **File type restrictions** for uploads
- **Rate limiting** to prevent abuse
- **CORS** configured for frontend domain
- **Environment variables** for sensitive data
- **Encryption at rest** (OSS, RDS)
- **VPC isolation** for backend services

---

## 📱 Responsive Design

**Breakpoints:**
- Desktop: > 768px
- Tablet: 481-768px
- Mobile: ≤ 480px

**Mobile Optimizations:**
- Hamburger menu navigation
- Touch-friendly buttons (44x44px minimum)
- Single-column layouts
- Optimized file upload zones
- Responsive content player

---

## 🎯 User Experience Features

- **Onboarding tutorial** for first-time users
- **Real-time statistics** (auto-updating)
- **Recent activity feed** (last 10 items)
- **Loading states** with spinners and progress bars
- **Error modals** with user-friendly messages
- **Success confirmations** for completed actions
- **Drag-and-drop file upload**
- **File preview** before verification
- **Downloadable content**
- **Shareable content links**

---

## 🌍 Internationalization

**Supported Languages:**
- **Tagalog** - Full Filipino
- **Taglish** - Mix of Tagalog and English (default)
- **English** - Formal English

**Filipino Context:**
- Government processes specific to Philippines
- Filipino-friendly explanations
- Local sources cited (PNA, PCOO, VERA Files, Rappler)
- Cultural awareness in AI responses

---

## 🧪 Testing

**Manual Testing Checklist:**

### Fake News Detector
- [ ] Text verification works
- [ ] Source URL optional field
- [ ] Loading states display
- [ ] Results display correctly
- [ ] Error handling works

### Navigation
- [ ] Desktop navigation works
- [ ] Mobile hamburger menu works
- [ ] Section transitions smooth
- [ ] Onboarding shows for first-time users
- [ ] Onboarding can be completed

### Responsive
- [ ] Desktop layout correct
- [ ] Tablet layout correct
- [ ] Mobile layout correct
- [ ] All interactions work on mobile

---

## 🐛 Known Issues & Limitations

**Current Implementation:**
- Backend uses **mock AI responses** (stubs)
- Replace with actual **Alibaba Cloud Qwen API** in production
- Stats are **simulated**
- Connect to real **database** for production

**Production Requirements:**
- Alibaba Cloud account with Qwen API access
- RDS database setup
- OSS bucket configuration
- Domain name and SSL certificate

---

## 📈 Future Enhancements

1. **User Authentication**
   - Login/signup functionality
   - User profiles
   - Save verification history

2. **Advanced Features**
   - Batch verification (multiple files)
   - Video export in different formats
   - Custom content branding
   - Verification reports (PDF export)

3. **Social Features**
   - Share verifications on social media
   - Community fact-checking
   - User ratings and feedback

4. **Analytics Dashboard**
   - Admin panel
   - Usage statistics
   - Popular topics
   - Fake news trends

5. **Mobile Apps**
   - iOS app (React Native)
   - Android app (React Native)
   - Push notifications

---

## 📞 Support & Contact

**Project:** TruthChain PH  
**Version:** 1.0.0  
**License:** MIT  

**For Questions:**
- Check documentation files (AI-PROMPTS.md, USER-FLOW.md, DEPLOYMENT.md)
- Review code comments in source files
- Contact: [Your Contact Information]

---

## 🙏 Acknowledgments

- **Alibaba Cloud** - Cloud infrastructure and AI services
- **Qwen AI** - Powerful language model for verification
- **Filipino Fact-Checkers** - Inspiration for verification criteria
- **Philippine Government** - Official process information

---

## 📄 License

MIT License - Feel free to use, modify, and distribute this project.






NOTE: 
THIS WORK WAS MADE BY ROLANDO ZAGALA JR FOR THE ALIBABA CLOUD AI HACKATHON

---

**Built with ❤️ for the Filipino people**

*Totoo ba o fake? Alamin sa TruthChain PH!*
