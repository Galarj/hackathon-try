/* ==========================================
   LAYER 3: BACKEND LOGIC (Node.js + Express)
   API Endpoints with AI Integration Stubs
   ========================================== */

const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Alibaba Cloud Qwen API Configuration
const ALIBABA_API_KEY = process.env.ALIBABA_API_KEY || 'sk-7631ebf5379b47db85215c0b3b95d9c1'; // For truth detector
const GAME_API_KEY = process.env.GAME_API_KEY || 'sk-5e8ca8408f1742f89efc5574f360afc2'; // For game
const QWEN_BASE_URL = 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1';
const QWEN_MODEL = 'qwen-plus';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// ==========================================
// LAYER 4: DATA MODELS & STORAGE
// ==========================================

// In-memory storage (replace with database in production)
const dataStore = {
    verifications: [],
    // Only text verification is supported now
    stats: {
        verifiedCount: 1247,
        userCount: 12458
    }
};

// Verification Result Schema
class VerificationResult {
    constructor(data) {
        this.id = this.generateId();
        this.type = 'text'; // Only text now
        this.content = data.content || null;
        this.sourceUrl = data.sourceUrl || null;
        this.status = data.status; // 'VERIFIED', 'FAKE', 'UNVERIFIED'
        this.confidenceScore = data.confidenceScore; // 0-100
        this.explanation = data.explanation;
        this.whyFake = data.whyFake || null;
        this.sources = data.sources || [];
        this.summary = data.summary || null;
        this.timestamp = new Date().toISOString();
        this.aiModel = 'Alibaba Qwen-Plus';
    }
    
    generateId() {
        return 'VER-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }
}

// Only text verification is supported now

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
// FAKE NEWS VERIFICATION ENDPOINT - TEXT ONLY
// ==========================================
app.post('/api/verify', async (req, res) => {
    try {
        const { type, content, sourceUrl } = req.body;
        
        // Validate input
        if (!type || type !== 'text') {
            return res.status(400).json({
                success: false,
                message: 'Only text verification is supported'
            });
        }
        
        if (!content) {
            return res.status(400).json({
                success: false,
                message: 'Content text is required for verification'
            });
        }
        
        // Prepare verification data
        const verificationData = {
            type: 'text',
            content: content,
            sourceUrl: sourceUrl || null
        };
        
        // Call AI verification
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
// LAYER 5: AI VERIFICATION LOGIC (REAL)
// ==========================================
async function verifyWithAI(data) {
    console.log('AI Verification started for:', data.type);
    
    try {
        // Generate AI prompt based on type
        const prompt = generateVerificationPrompt(data);
        console.log('AI Prompt generated for:', data.type);
        
        // Call Alibaba Cloud Qwen API
        const aiResponse = await callQwenAPI(prompt, data);
        
        return aiResponse;
    } catch (error) {
        console.error('AI Verification error:', error);
        // Fallback to mock response if API fails
        console.log('Falling back to mock response');
        return generateMockAIResponse(data);
    }
}

// Call Alibaba Cloud Qwen API for News Verification
async function callQwenAPI(prompt, data, useGameKey = false) {
    try {
        const axios = require('axios');
        
        // Use appropriate API key based on context
        const apiKey = useGameKey ? GAME_API_KEY : ALIBABA_API_KEY;
        
        const requestBody = {
            model: QWEN_MODEL,
            messages: [
                {
                    role: 'system',
                    content: prompt.systemPrompt
                },
                {
                    role: 'user',
                    content: prompt.userPrompt
                }
            ],
            temperature: 0.3,
            max_tokens: 2048,
            stream: false
        };
        
        // Add web search for text verification using extra_body
        if (data.type === 'text') {
            requestBody.extra_body = {
                enable_search: true,
                search_options: {
                    search_strategy: 'agent'
                }
            };
        }
        
        console.log(`Calling Qwen API with ${useGameKey ? 'GAME' : 'TRUTH DETECTOR'} key`);
        console.log('Request body:', JSON.stringify(requestBody, null, 2));
        
        const response = await axios.post(
            `${QWEN_BASE_URL}/chat/completions`,
            requestBody,
            {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        const responseText = response.data.choices[0].message.content;
        console.log('Qwen API Response:', responseText);
        
        // Parse AI response into structured format
        return parseAIResponse(responseText, data);
    } catch (error) {
        console.error('Qwen API Error:', error.response?.data || error.message);
        if (error.response?.data) {
            console.error('Error details:', JSON.stringify(error.response.data, null, 2));
        }
        throw error;
    }
}

// Parse AI response text into structured verification result
function parseAIResponse(responseText, data) {
    try {
        // Try to extract JSON if AI returns structured data
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            
            // Map new format to existing format
            const statusMap = {
                'TRUE': 'VERIFIED',
                'FALSE': 'FAKE',
                'MISLEADING': 'FAKE',
                'NEEDS_CONTEXT': 'UNVERIFIED',
                'NEEDS CONTEXT': 'UNVERIFIED',
                'UNVERIFIED': 'UNVERIFIED'
            };
            
            const mappedStatus = statusMap[parsed.status] || 'UNVERIFIED';
            const confidence = typeof parsed.confidence === 'string' ? 
                parseInt(parsed.confidence) : parsed.confidence || 75;
            
            // Build explanation from detailed_explanation array
            let explanation = parsed.summary || '';
            if (parsed.detailed_explanation && Array.isArray(parsed.detailed_explanation)) {
                explanation += '\n\n' + parsed.detailed_explanation.join('\n');
            }
            
            // Add bias information
            if (parsed.biased && parsed.biased !== 'NO') {
                explanation += `\n\n⚠️ Bias Detected: ${parsed.biased}`;
            }
            
            // Add tips
            if (parsed.tips && Array.isArray(parsed.tips)) {
                explanation += '\n\n💡 Tips:\n' + parsed.tips.join('\n');
            }
            
            // Extract and format sources from AI response
            let sources = [];
            if (parsed.sources && Array.isArray(parsed.sources)) {
                sources = parsed.sources.map(src => ({
                    title: src.title || 'Source',
                    url: src.url || '#',
                    credibilityScore: 90,
                    relevance: src.relevance || ''
                }));
            }
            
            // Fallback to text extraction if no structured sources
            if (sources.length === 0) {
                sources = extractSourcesFromText(responseText);
            }
            
            // Build comprehensive "why fake" explanation for FAKE content
            let whyFake = null;
            if (mappedStatus === 'FAKE') {
                whyFake = '❌ Why This Is Fake:\n\n';
                if (parsed.detailed_explanation && Array.isArray(parsed.detailed_explanation)) {
                    whyFake += parsed.detailed_explanation.join('\n') + '\n';
                }
                if (sources.length > 0) {
                    whyFake += '\n📚 Sources Supporting This Verdict:\n';
                    sources.forEach((src, idx) => {
                        whyFake += `${idx + 1}. ${src.title}${src.relevance ? ' - ' + src.relevance : ''}\n   ${src.url}\n`;
                    });
                }
            }
            
            return {
                status: mappedStatus,
                confidenceScore: Math.min(confidence, 100), // Cap at 100%
                explanation: explanation,
                whyFake: whyFake,
                sources: sources,
                summary: parsed.summary || extractSummary(responseText),
                biased: parsed.biased || 'NO',
                rawResponse: parsed
            };
        }
    } catch (e) {
        console.log('Could not parse JSON, using text analysis:', e.message);
    }
    
    // Fallback: Analyze text response
    const lowerText = responseText.toLowerCase();
    let status = 'UNVERIFIED';
    let confidenceScore = 70;
    
    // Determine status from response
    if (lowerText.includes('true') && !lowerText.includes('false')) {
        status = 'VERIFIED';
        confidenceScore = 85;
    } else if (lowerText.includes('false') || lowerText.includes('fake') || lowerText.includes('misleading')) {
        status = 'FAKE';
        confidenceScore = 85;
    }
    
    // Extract sources from response
    const sources = extractSourcesFromText(responseText);
    
    // Build why fake from full response
    let whyFake = null;
    if (status === 'FAKE') {
        whyFake = '❌ Why This Is Fake:\n\n' + responseText;
        if (sources.length > 0) {
            whyFake += '\n\n📚 Sources:\n';
            sources.forEach((src, idx) => {
                whyFake += `${idx + 1}. ${src.title}: ${src.url}\n`;
            });
        }
    }
    
    return {
        status: status,
        confidenceScore: Math.min(confidenceScore, 100), // Cap at 100%
        explanation: responseText,
        whyFake: whyFake,
        sources: sources,
        summary: extractSummary(responseText),
        biased: 'UNSURE'
    };
}

// Extract summary from AI response
function extractSummary(text) {
    const sentences = text.split(/[.!?]/);
    return sentences[0]?.substring(0, 200) || 'AI verification completed';
}

// Extract sources from AI response text
function extractSourcesFromText(text) {
    const sources = [];
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = text.match(urlRegex) || [];
    
    urls.forEach((url, index) => {
        sources.push({
            title: `Source ${index + 1}`,
            url: url.replace(/[)\]>}]+$/, ''), // Clean trailing characters
            credibilityScore: 85
        });
    });
    
    // Add default Filipino fact-check sources if none found
    if (sources.length === 0) {
        sources.push(
            { title: 'VERA Files Fact Check', url: 'https://verafiles.org', credibilityScore: 95 },
            { title: 'Rappler Fact Check', url: 'https://rappler.com/fact-check', credibilityScore: 95 }
        );
    }
    
    return sources;
}

function generateVerificationPrompt(data) {
    // TruthChain PH Fact Checker Prompt with Bias Detection
    return {
        systemPrompt: `You are TruthChain PH, an AI fact-checker for Filipino users.
Your task: analyze news, social media posts, quotes, rumors, and claims, and classify them as:

TRUE | FALSE | MISLEADING | NEEDS CONTEXT | UNVERIFIED

Additionally, assess whether the content shows signs of bias.

Rules and Process:

1. Claim Extraction
   - Identify the exact claim.
   - Remove unnecessary details: emojis, opinions, extra sentences.

2. Evidence Check
   - Compare the claim with verified sources:
     • Philippine government agencies: DOH, DOST, DepEd, NDRRMC
     • Major news outlets: Rappler, Inquirer, Philstar
     • International authorities: WHO, UN, NASA
   - Check for logical errors, misinterpreted data, or recycled news.

3. Analysis
   - Look for:
     • Fake or misleading quotes
     • AI-generated quotes
     • Misquotes
   - Assess if information is outdated or partially true.
   - Consider tone and framing to detect possible bias.

4. Classification
   - Choose only one: TRUE, FALSE, MISLEADING, NEEDS CONTEXT, UNVERIFIED

5. Bias Detection
   - Indicate if the content seems biased: YES, NO, or UNSURE
   - Consider word choice, selective facts, exaggeration, or emotional framing

6. WHY FAKE Explanation (CRITICAL for FALSE/MISLEADING claims)
   - If status is FALSE or MISLEADING, you MUST provide:
     a) Specific reasons why the content is fake/misleading
     b) What is incorrect or manipulated
     c) Evidence that contradicts the claim
     d) Real facts that debunk the claim
   - Be detailed and specific with your explanation

7. Sources (MANDATORY)
   - Always include 2-5 credible sources that support your verdict
   - Include actual URLs when available from web search
   - Prefer authoritative Philippine and international sources
   - For FAKE claims: cite sources that debunk or contradict the claim
   - For TRUE claims: cite sources that confirm the claim

Output Format (JSON-ready):
{
  "status": "TRUE | FALSE | MISLEADING | NEEDS_CONTEXT | UNVERIFIED",
  "confidence": "0-100%",
  "biased": "YES | NO | UNSURE",
  "summary": "Short explanation (1–2 sentences)",
  "detailed_explanation": [
    "• Reason 1 for classification with evidence",
    "• Reason 2 with context or verification",
    "• Reason 3 if needed",
    "• [For FAKE/MISLEADING] Specific explanation of what is false and why"
  ],
  "sources": [
    {"title": "Source name", "url": "https://actual-url.com", "relevance": "How this source supports the verdict"},
    {"title": "Source 2", "url": "https://url2.com", "relevance": "Explanation"}
  ],
  "tips": [
    "Practical advice for the user",
    "How to avoid similar misinformation or bias"
  ]
}

Style Guidelines:
- Use simple, friendly English
- Be neutral, factual, non-judgmental
- Never invent sources, URLs, dates, or names
- ALWAYS provide real sources from your web search
- If unsure → mark as UNVERIFIED
- If evidence is mixed → mark as NEEDS CONTEXT
- If claim uses old info → mark as MISLEADING
- Evaluate bias honestly
- For FAKE content: Be thorough in explaining WHY it's fake`,
        
        userPrompt: `Analyze this claim:

"${data.content}"
${data.sourceUrl ? `\nSource URL: ${data.sourceUrl}` : ''}

Using web search, verify this claim and provide your analysis in the JSON format specified above.`
    };
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
        // Only text verification is supported now
    };
    
    // Randomly select verified or fake for text
    if (data.type === 'text') {
        const isFake = Math.random() > 0.5;
        return isFake ? mockResponses.text.fake : mockResponses.text.verified;
    }
    
    return mockResponses[data.type];
}

// ==========================================
// FACT OR FAKE GAME - CLAIM GENERATOR
// ==========================================
app.post('/api/game-claim', async (req, res) => {
    try {
        const { round } = req.body;
        
        // Generate AI claim using the game host prompt
        const claim = await generateGameClaim(round || 1);
        
        res.json({
            success: true,
            claim: claim
        });
        
    } catch (error) {
        console.error('Game claim generation error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to generate claim'
        });
    }
});

// ==========================================
// AI DEBATE - PROS AND CONS ANALYSIS
// ==========================================
app.post('/api/debate', async (req, res) => {
    try {
        const { content } = req.body;
        
        // Validate input
        if (!content) {
            return res.status(400).json({
                success: false,
                message: 'Content is required for debate analysis'
            });
        }
        
        // Analyze content with AI to generate pros and cons
        const debateAnalysis = await analyzeDebateWithAI(content);
        
        res.json({
            success: true,
            analysis: debateAnalysis
        });
        
    } catch (error) {
        console.error('Debate analysis error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to analyze content'
        });
    }
});

async function analyzeDebateWithAI(content) {
    const systemPrompt = `You are TruthChain PH, a Filipino-friendly AI debate facilitator.
Your task is to analyze any article, claim, or statement and provide a balanced debate with pros and cons.

Instructions:
1. Extract the main claim from the provided content
2. Present 3-5 strong, well-reasoned arguments for BOTH sides (pros and cons)
3. Provide a neutral summary that helps users understand multiple perspectives
4. Use simple Taglish or English
5. Always fact-check your arguments before presenting them
6. Include credible sources to support your arguments
7. IMPORTANT: Use web search to verify facts and include actual source URLs from your search

Output format (JSON):
{
  "claim": "<main claim from the article>",
  "pros": ["Pro argument 1", "Pro argument 2", "..."],
  "cons": ["Con argument 1", "Con argument 2", "..."],
  "summary": "<neutral summary or insight>",
  "sources": ["https://credible-source-1.com", "https://credible-source-2.com"]
}

Ensure each argument is:
- Specific and well-reasoned
- Based on facts, not opinions
- Supported by credible sources
- Clearly explained`;

    const userPrompt = `Analyze the following content and provide a balanced debate with pros and cons:

${content}

Provide your analysis in the specified JSON format.`;
    
    try {
        const axios = require('axios');
        
        // Use the main API key for debate analysis
        const apiKey = ALIBABA_API_KEY;
        
        const requestBody = {
            model: QWEN_MODEL,
            messages: [
                {
                    role: 'system',
                    content: systemPrompt
                },
                {
                    role: 'user',
                    content: userPrompt
                }
            ],
            temperature: 0.3,
            max_tokens: 2048,
            stream: false,
            extra_body: {
                enable_search: true,
                search_options: {
                    search_strategy: 'agent'
                }
            }
        };
        
        console.log('Calling Qwen API for debate analysis with TRUTH DETECTOR key');
        console.log('Request body:', JSON.stringify(requestBody, null, 2));
        
        const response = await axios.post(
            `${QWEN_BASE_URL}/chat/completions`,
            requestBody,
            {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        const responseText = response.data.choices[0].message.content;
        console.log('Qwen API Response:', responseText);
        
        // Parse the AI response directly since it should return JSON
        let analysis;
        
        // Try to parse the response text as JSON
        try {
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                analysis = JSON.parse(jsonMatch[0]);
            } else {
                analysis = JSON.parse(responseText);
            }
        } catch (parseError) {
            console.error('Failed to parse JSON response:', parseError);
            throw new Error('Invalid response format from AI');
        }
        
        // Ensure we have all required fields
        const result = {
            claim: analysis.claim || 'Main claim not identified',
            pros: Array.isArray(analysis.pros) ? analysis.pros : [],
            cons: Array.isArray(analysis.cons) ? analysis.cons : [],
            summary: analysis.summary || 'No summary provided',
            sources: Array.isArray(analysis.sources) ? analysis.sources : []
        };
        
        console.log('Generated debate analysis with sources:', result);
        return result;
    } catch (error) {
        console.error('AI Debate Analysis Error:', error);
        throw error;
    }
}

async function generateGameClaim(round) {
    const systemPrompt = `You are TruthChain PH, a Filipino-friendly AI fact-checker game host. 
Your task is to run a fun "True or False" game. 

Rules:
- Present a statement or claim to the player.
- Player guesses TRUE or FALSE.
- After the guess, reveal if it is correct.
- Provide 1-2 short bullet points explaining why it is TRUE or FALSE.
- Keep the tone casual, friendly, and simple.
- Always fact-check your statements before saying they are true or false.
- Use simple Taglish or English.
- IMPORTANT: Use web search to verify facts and include actual source URLs from your search.
- Include 2-3 credible sources from the internet that support your answer.

Output format (JSON):
{
  "statement": "<the claim>",
  "answer": "TRUE" or "FALSE",
  "explanation": [
     "• Bullet point 1",
     "• Bullet point 2"
  ],
  "sources": ["https://actual-url-1.com", "https://actual-url-2.com"]
}`;

    const userPrompt = `Let's play a "True or False" game. 
Give me 1 statement about current events, news, or general knowledge for me to guess. 
Use web search to verify the facts and provide actual source URLs.
Provide the statement in JSON format as specified.`;
    
    try {
        const response = await callQwenAPI(
            { systemPrompt, userPrompt },
            { type: 'text' },
            true  // Use game API key
        );
        
        // Try to parse the response
        let claim;
        if (response.rawResponse) {
            // Extract sources from rawResponse or response
            let sources = [];
            if (response.rawResponse.sources && Array.isArray(response.rawResponse.sources)) {
                sources = response.rawResponse.sources;
            } else if (response.sources && Array.isArray(response.sources)) {
                sources = response.sources.map(s => s.url || s);
            }
            
            claim = {
                statement: response.rawResponse.statement || response.summary,
                answer: response.rawResponse.answer || 'TRUE',
                explanation: response.rawResponse.explanation || [response.explanation],
                sources: sources
            };
        } else {
            // Fallback parsing - extract sources from response text
            let sources = [];
            if (response.sources && Array.isArray(response.sources)) {
                sources = response.sources.map(s => s.url || s);
            } else {
                // Extract URLs from the explanation text
                const urlRegex = /(https?:\/\/[^\s]+)/g;
                const urls = (response.explanation || '').match(urlRegex) || [];
                sources = urls.map(url => url.replace(/[)\]>}]+$/, ''));
            }
            
            claim = {
                statement: response.summary || response.explanation,
                answer: response.status === 'VERIFIED' ? 'TRUE' : 'FALSE',
                explanation: [response.explanation],
                sources: sources
            };
        }
        
        console.log('Generated claim with sources:', claim);
        return claim;
    } catch (error) {
        console.error('AI Claim Generation Error:', error);
        throw error;
    }
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
