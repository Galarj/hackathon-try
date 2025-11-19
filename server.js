/* ==========================================
   LAYER 3: BACKEND LOGIC (Node.js + Express)
   API Endpoints with AI Integration Stubs
   ========================================== */

const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// File upload configuration
const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        const uploadDir = './uploads';
        try {
            await fs.mkdir(uploadDir, { recursive: true });
        } catch (error) {
            console.error('Error creating upload directory:', error);
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB max file size
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|mp4|avi|mov/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only images and videos are allowed.'));
        }
    }
});

// ==========================================
// LAYER 4: DATA MODELS & STORAGE
// ==========================================

// In-memory storage (replace with database in production)
const dataStore = {
    verifications: [],
    videos: [],
    stats: {
        verifiedCount: 1247,
        videoCount: 523,
        userCount: 12458
    }
};

// Verification Result Schema
class VerificationResult {
    constructor(data) {
        this.id = this.generateId();
        this.type = data.type; // 'text', 'image', 'video'
        this.content = data.content || null;
        this.filePath = data.filePath || null;
        this.sourceUrl = data.sourceUrl || null;
        this.status = data.status; // 'VERIFIED', 'FAKE', 'UNVERIFIED'
        this.confidenceScore = data.confidenceScore; // 0-100
        this.explanation = data.explanation;
        this.whyFake = data.whyFake || null;
        this.sources = data.sources || [];
        this.summary = data.summary || null;
        this.timestamp = new Date().toISOString();
        this.aiModel = 'Alibaba Qwen-2.5';
    }
    
    generateId() {
        return 'VER-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }
}

// Video Generation Request Schema
class VideoGenerationRequest {
    constructor(data) {
        this.id = this.generateId();
        this.processId = data.processId;
        this.language = data.language; // 'tagalog', 'taglish', 'english'
        this.detailLevel = data.detailLevel; // 'basic', 'detailed', 'comprehensive'
        this.voiceStyle = data.voiceStyle; // 'friendly', 'professional', 'enthusiastic'
        this.timestamp = new Date().toISOString();
    }
    
    generateId() {
        return 'VID-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }
}

// Generated Video Schema
class GeneratedVideo {
    constructor(data) {
        this.id = data.requestId;
        this.processId = data.processId;
        this.title = data.title;
        this.videoUrl = data.videoUrl;
        this.duration = data.duration;
        this.steps = data.steps;
        this.language = data.language;
        this.transcript = data.transcript || null;
        this.timestamp = new Date().toISOString();
        this.aiModel = 'Alibaba Qwen-2.5 + Video Generation';
    }
}

// ==========================================
// API ENDPOINTS
// ==========================================

// Health Check
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'TruthChain PH API is running',
        timestamp: new Date().toISOString()
    });
});

// Get Stats
app.get('/api/stats', (req, res) => {
    res.json({
        success: true,
        stats: dataStore.stats
    });
});

// Get Recent Activity
app.get('/api/recent-activity', (req, res) => {
    const recentVerifications = dataStore.verifications
        .slice(-10)
        .reverse()
        .map(v => ({
            status: v.status.toLowerCase(),
            title: `${v.status}: ${v.summary || 'Content verification'}`,
            timestamp: formatTimestamp(v.timestamp),
            type: v.type
        }));
    
    res.json({
        success: true,
        activities: recentVerifications
    });
});

// ==========================================
// FAKE NEWS VERIFICATION ENDPOINT
// ==========================================
app.post('/api/verify', upload.single('file'), async (req, res) => {
    try {
        const { type, content, sourceUrl } = req.body;
        
        // Validate input
        if (!type) {
            return res.status(400).json({
                success: false,
                message: 'Verification type is required'
            });
        }
        
        if (type === 'text' && !content) {
            return res.status(400).json({
                success: false,
                message: 'Content text is required for text verification'
            });
        }
        
        if ((type === 'image' || type === 'video') && !req.file) {
            return res.status(400).json({
                success: false,
                message: `${type} file is required for ${type} verification`
            });
        }
        
        // Prepare verification data
        const verificationData = {
            type,
            content: type === 'text' ? content : null,
            filePath: req.file ? req.file.path : null,
            sourceUrl: sourceUrl || null
        };
        
        // Call AI verification (stub - replace with actual AI call)
        const aiResult = await verifyWithAI(verificationData);
        
        // Create verification result
        const result = new VerificationResult(aiResult);
        
        // Store result
        dataStore.verifications.push(result);
        dataStore.stats.verifiedCount++;
        
        // Return result
        res.json({
            success: true,
            result: result
        });
        
    } catch (error) {
        console.error('Verification error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Verification failed'
        });
    }
});

// ==========================================
// LAYER 5: AI VERIFICATION LOGIC (STUB)
// ==========================================
async function verifyWithAI(data) {
    // STUB: Replace with actual Alibaba Cloud GenAI API call
    // This is where you would integrate with Qwen-2.5 or other AI models
    
    console.log('AI Verification started for:', data.type);
    
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate AI prompt based on type
    const prompt = generateVerificationPrompt(data);
    console.log('AI Prompt:', prompt);
    
    // STUB: Simulated AI response
    // In production, call: const aiResponse = await callAlibabaGenAI(prompt);
    const aiResponse = generateMockAIResponse(data);
    
    return aiResponse;
}

function generateVerificationPrompt(data) {
    // LAYER 5: AI Prompt Templates
    
    if (data.type === 'text') {
        return {
            systemPrompt: `You are a Filipino fact-checker AI. Your role is to verify news and information for accuracy. 
Analyze the content critically, check for misinformation, and provide clear explanations in Filipino/Taglish.
Always cite credible sources and explain your reasoning.`,
            
            userPrompt: `Verify ang sumusunod na balita:

Content: ${data.content}
${data.sourceUrl ? `Source URL: ${data.sourceUrl}` : ''}

Please provide:
1. Verdict: VERIFIED, FAKE, or UNVERIFIED
2. Confidence Score (0-100)
3. Explanation (in Filipino/Taglish)
4. If fake, explain "Bakit fake?"
5. Credible sources to support your verdict`
        };
    } else if (data.type === 'image') {
        return {
            systemPrompt: `You are an image analysis AI specializing in detecting fake news, manipulated images, and misinformation in Filipino media.
Analyze images for signs of manipulation, verify claims made in the image, and provide Filipino-friendly explanations.`,
            
            userPrompt: `Analyze this image for fake news or manipulation.
File: ${data.filePath}

Provide:
1. Verdict: VERIFIED, FAKE, or UNVERIFIED
2. Confidence Score
3. Analysis of the image (manipulation, context, claims)
4. Explanation in Filipino/Taglish
5. Sources if available`
        };
    } else if (data.type === 'video') {
        return {
            systemPrompt: `You are a video analysis AI that detects deepfakes, manipulated videos, and misinformation in Filipino media.
Analyze video content, detect manipulations, verify claims, and provide comprehensive Filipino-friendly reports.`,
            
            userPrompt: `Analyze this video for fake news or manipulation.
File: ${data.filePath}

Provide:
1. Verdict: VERIFIED, FAKE, or UNVERIFIED
2. Confidence Score
3. Video analysis (deepfake detection, manipulation, context)
4. Explanation in Filipino/Taglish
5. Timeline of key moments
6. Sources if available`
        };
    }
}

function generateMockAIResponse(data) {
    // STUB: Mock AI response for demonstration
    // Replace with actual AI API response parsing
    
    const mockResponses = {
        text: {
            verified: {
                status: 'VERIFIED',
                confidenceScore: 87,
                explanation: 'Ang balitang ito ay totoo at napatunayan sa mga kredibleng sources. Ang mga fact-check organizations at official government statements ay nag-confirm nito.',
                whyFake: null,
                sources: [
                    { title: 'Official Government Press Release', url: 'https://pcoo.gov.ph/press-releases' },
                    { title: 'Philippine News Agency', url: 'https://pna.gov.ph' }
                ],
                summary: 'Verified government announcement'
            },
            fake: {
                status: 'FAKE',
                confidenceScore: 92,
                explanation: 'Ang balitang ito ay fake news at walang katotohanan. Walang credible source na nag-confirm nito.',
                whyFake: 'Fake dahil: (1) Walang official statement mula sa government, (2) Hindi ito na-publish sa mga legitimate news outlets, (3) Ang source ay known fake news peddler, (4) May mga factual inconsistencies sa claims.',
                sources: [
                    { title: 'Fact-Check: VERA Files', url: 'https://verafiles.org' },
                    { title: 'Rappler Fact-Check', url: 'https://rappler.com/fact-check' }
                ],
                summary: 'Fake news about government policy'
            }
        },
        image: {
            status: 'FAKE',
            confidenceScore: 85,
            explanation: 'Ang larawang ito ay manipulated. Nakita namin ang signs ng photo editing at may inconsistencies sa metadata.',
            whyFake: 'Fake dahil: (1) May visible signs ng photoshop, (2) Ang metadata ay edited, (3) Ang context ng image ay mali, (4) Hindi ito original source.',
            sources: [
                { title: 'Reverse Image Search Results', url: 'https://google.com/imghp' }
            ],
            summary: 'Manipulated image spreading misinformation'
        },
        video: {
            status: 'UNVERIFIED',
            confidenceScore: 65,
            explanation: 'Hindi pa namin ma-verify completely ang video na ito. May some questionable elements pero walang definitive proof na fake.',
            whyFake: null,
            sources: [],
            summary: 'Video requiring further investigation'
        }
    };
    
    // Randomly select verified or fake for text
    if (data.type === 'text') {
        const isFake = Math.random() > 0.5;
        return isFake ? mockResponses.text.fake : mockResponses.text.verified;
    }
    
    return mockResponses[data.type];
}

// ==========================================
// GOVGUIDE VIDEO GENERATION ENDPOINT
// ==========================================
app.post('/api/generate-video', async (req, res) => {
    try {
        const { processId, language, detailLevel, voiceStyle } = req.body;
        
        // Validate input
        if (!processId) {
            return res.status(400).json({
                success: false,
                message: 'Process ID is required'
            });
        }
        
        // Create generation request
        const request = new VideoGenerationRequest({
            processId,
            language: language || 'tagalog',
            detailLevel: detailLevel || 'detailed',
            voiceStyle: voiceStyle || 'friendly'
        });
        
        // Generate video with AI (stub)
        const videoResult = await generateVideoWithAI(request);
        
        // Create generated video record
        const video = new GeneratedVideo({
            requestId: request.id,
            processId: request.processId,
            ...videoResult,
            language: request.language
        });
        
        // Store video
        dataStore.videos.push(video);
        dataStore.stats.videoCount++;
        
        // Return result
        res.json({
            success: true,
            result: video
        });
        
    } catch (error) {
        console.error('Video generation error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Video generation failed'
        });
    }
});

// ==========================================
// LAYER 5: AI VIDEO GENERATION LOGIC (STUB)
// ==========================================
async function generateVideoWithAI(request) {
    // STUB: Replace with actual Alibaba Cloud Video Generation API
    
    console.log('AI Video Generation started for:', request.processId);
    
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Generate AI prompt for video content
    const prompt = generateVideoPrompt(request);
    console.log('AI Video Prompt:', prompt);
    
    // STUB: Simulated AI video generation
    // In production: const videoData = await callAlibabaVideoGenAI(prompt);
    const videoData = generateMockVideo(request);
    
    return videoData;
}

function generateVideoPrompt(request) {
    // LAYER 5: AI Prompt for Video Generation
    
    const processDetails = {
        'passport': 'Philippine Passport Application Process',
        'drivers-license': "LTO Driver's License Application",
        'nbi-clearance': 'NBI Clearance Application',
        'bir-registration': 'BIR Registration for Self-Employed',
        'sss-registration': 'SSS Membership Registration',
        'philhealth': 'PhilHealth Registration',
        'pagibig': 'Pag-IBIG Membership Registration',
        'business-permit': 'Business Permit Application'
    };
    
    return {
        systemPrompt: `You are a Filipino government process expert AI. Your role is to create comprehensive, step-by-step video guides for government processes.
Generate clear, accurate, and helpful content in ${request.language} with a ${request.voiceStyle} tone.
Focus on practical steps, required documents, fees, and helpful tips.`,
        
        userPrompt: `Create a ${request.detailLevel} video guide for: ${processDetails[request.processId]}

Generate:
1. Video script in ${request.language}
2. Step-by-step process breakdown
3. Required documents list
4. Estimated fees
5. Processing time
6. Helpful tips and reminders
7. Visual suggestions for each step

Voice style: ${request.voiceStyle}
Language: ${request.language}
Detail level: ${request.detailLevel}`
    };
}

function generateMockVideo(request) {
    // STUB: Mock video generation
    // Replace with actual video generation and upload to Alibaba OSS
    
    const processSteps = {
        'passport': [
            'Mag-register online sa DFA appointment system',
            'Piliin ang processing type (new, renewal)',
            'Pumili ng appointment date at location',
            'Bayaran ang application fee (P950 regular, P1,200 expedited)',
            'Pumunta sa DFA office sa appointment date',
            'Dalhin ang required documents: Birth Certificate (PSA), Valid ID, Appointment confirmation',
            'Mag-picture at biometrics',
            'Hintayin ang release date (10-12 working days regular, 6 working days expedited)'
        ],
        'drivers-license': [
            'Kumuha ng medical certificate',
            'Pumunta sa LTO licensing center',
            'Submit requirements at fill up application form',
            'Magbayad ng fees (Student Permit + Non-Pro: P585)',
            'Mag-take ng written exam',
            'Mag-take ng practical driving exam',
            'Kunin ang driver\'s license'
        ],
        'nbi-clearance': [
            'Mag-register online sa nbi-clearance.com',
            'Fill up application form',
            'Piliin ang NBI branch at schedule',
            'Bayaran ang fee online (P155)',
            'Pumunta sa NBI branch',
            'Dalhin ang valid ID at reference number',
            'Mag-picture at fingerprint',
            'Kunin ang clearance (same day kung walang hit)'
        ]
    };
    
    const steps = processSteps[request.processId] || [
        'Register at government office',
        'Submit required documents',
        'Pay processing fees',
        'Wait for processing',
        'Claim your document'
    ];
    
    return {
        title: `How to: ${request.processId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}`,
        videoUrl: `/videos/${request.id}.mp4`, // Stub URL
        duration: '5:30',
        steps: steps,
        transcript: `Kamusta, Pilipino! Sa video na ito, tutulungan natin kayo sa proseso ng ${request.processId}...`
    };
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================
function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return `${days} day${days > 1 ? 's' : ''} ago`;
}

// ==========================================
// START SERVER
// ==========================================
app.listen(PORT, () => {
    console.log(`🚀 TruthChain PH API Server running on port ${PORT}`);
    console.log(`📍 API Base URL: http://localhost:${PORT}/api`);
    console.log(`🔍 Health Check: http://localhost:${PORT}/api/health`);
});

module.exports = app;
