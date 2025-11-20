/* ==========================================
   LAYER 2: APP LOGIC (Vanilla JavaScript)
   Complete user interactions and state management
   ========================================== */

// Global State
const appState = {
    currentSection: 'home',
    currentInputMethod: 'text',
    selectedProcess: null,
    isOnboardingComplete: localStorage.getItem('onboardingComplete') === 'true',
    currentOnboardingStep: 1,
    uploadedFile: null,
    verificationResult: null,
    generatedVideo: null
};

// API Configuration
const API_BASE_URL = 'https://unvirtuously-unfervent-yelanda.ngrok-free.dev/api';

// ==========================================
// GAME DESIGN GENERATOR
// ==========================================

// ==========================================
// INITIALIZATION
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    // Check onboarding status
    if (!appState.isOnboardingComplete) {
        showOnboarding();
    }
    
    // Load recent activity
    loadRecentActivity();
    
    // Setup drag and drop
    setupDragAndDrop();
    
    // Update stats periodically
    updateStats();
    setInterval(updateStats, 30000); // Update every 30 seconds
}

// ==========================================
// ONBOARDING
// ==========================================
function showOnboarding() {
    const modal = document.getElementById('onboardingModal');
    modal.classList.add('active');
}

function nextOnboardingStep() {
    const currentStep = document.querySelector('.onboarding-step.active');
    const nextStep = currentStep.nextElementSibling;
    
    if (nextStep && nextStep.classList.contains('onboarding-step')) {
        currentStep.classList.remove('active');
        nextStep.classList.add('active');
        appState.currentOnboardingStep++;
    }
}

function prevOnboardingStep() {
    const currentStep = document.querySelector('.onboarding-step.active');
    const prevStep = currentStep.previousElementSibling;
    
    if (prevStep && prevStep.classList.contains('onboarding-step')) {
        currentStep.classList.remove('active');
        prevStep.classList.add('active');
        appState.currentOnboardingStep--;
    }
}

function completeOnboarding() {
    localStorage.setItem('onboardingComplete', 'true');
    appState.isOnboardingComplete = true;
    document.getElementById('onboardingModal').classList.remove('active');
}

// ==========================================
// NAVIGATION
// ==========================================
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show selected section
    document.getElementById(sectionId).classList.add('active');
    
    // Update nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    const activeLink = document.querySelector(`[href="#${sectionId}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
    
    appState.currentSection = sectionId;
}

function toggleMobileMenu() {
    const mobileNav = document.getElementById('mobileNav');
    mobileNav.classList.toggle('active');
}

// ==========================================
// STATS UPDATE
// ==========================================
async function updateStats() {
    try {
        const response = await fetch(`${API_BASE_URL}/stats`);
        const data = await response.json();
        
        if (data.success) {
            document.getElementById('verifiedCount').textContent = formatNumber(data.stats.verifiedCount);
        }
    } catch (error) {
        console.error('Error updating stats:', error);
        // Use default values if API fails
    }
}

function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// ==========================================
// RECENT ACTIVITY
// ==========================================
async function loadRecentActivity() {
    const activityList = document.getElementById('recentActivityList');
    
    try {
        const response = await fetch(`${API_BASE_URL}/recent-activity`);
        const data = await response.json();
        
        if (data.success && data.activities) {
            renderRecentActivity(data.activities);
        } else {
            renderDemoActivity();
        }
    } catch (error) {
        console.error('Error loading recent activity:', error);
        renderDemoActivity();
    }
}

function renderRecentActivity(activities) {
    const activityList = document.getElementById('recentActivityList');
    activityList.innerHTML = '';
    
    activities.forEach(activity => {
        const item = createActivityItem(activity);
        activityList.appendChild(item);
    });
}

function renderDemoActivity() {
    const demoActivities = [
        {
            status: 'verified',
            title: 'Verified: "PH receives vaccine donation"',
            timestamp: '2 minutes ago',
            type: 'text'
        },
        {
            status: 'fake',
            title: 'Fake News: Misleading claim about government policy',
            timestamp: '15 minutes ago',
            type: 'text'
        },
        {
            status: 'verified',
            title: 'Verified: New public transportation routes announced',
            timestamp: '1 hour ago',
            type: 'text'
        }
    ];
    
    renderRecentActivity(demoActivities);
}

function createActivityItem(activity) {
    const item = document.createElement('div');
    item.className = 'activity-item';
    
    const statusIcon = activity.status === 'verified' ? 'fa-check-circle' : 
                      activity.status === 'fake' ? 'fa-times-circle' : 'fa-clock';
    
    item.innerHTML = `
        <div class="activity-status ${activity.status}">
            <i class="fas ${statusIcon}"></i>
        </div>
        <div class="activity-content">
            <div class="activity-title">${activity.title}</div>
            <div class="activity-meta">${activity.timestamp}</div>
        </div>
    `;
    
    return item;
}

// ==========================================
// FAKE NEWS DETECTOR
// ==========================================

// Input Method Selection
function selectInputMethod(method) {
    // Only text verification is supported now
    // Update buttons
    document.querySelectorAll('.method-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-method="${method}"]`).classList.add('active');
    
    // Update containers
    document.querySelectorAll('.input-container').forEach(container => {
        container.classList.remove('active');
    });
    document.getElementById('textInput').classList.add('active');
    
    appState.currentInputMethod = method;
    
    // Reset previous results
    hideVerificationResults();
}

// File Upload Handling
function setupDragAndDrop() {
    // Only text verification is supported now
}

function handleFileUpload(type) {
    // Only text verification is supported now
}

function handleFileSelection(file, type) {
    // Only text verification is supported now
}

function validateFile(file, type) {
    // Only text verification is supported now
    return { valid: false, message: 'Only text verification is supported' };
}

function showFilePreview(file, type) {
    // Only text verification is supported now
}

// News Verification
async function verifyNews(type) {
    // Only text verification is supported
    const newsText = document.getElementById('newsText').value.trim();
    const sourceUrl = document.getElementById('sourceUrl').value.trim();
    
    if (!newsText) {
        showError('Missing Content', 'Please enter the news text to verify.');
        return;
    }
    
    const contentData = {
        type: 'text',
        content: newsText,
        sourceUrl: sourceUrl || null
    };
    
    // Show loading state
    showVerificationLoading();
    
    try {
        // Call verification API
        const result = await callVerificationAPI(contentData);
        
        // Hide loading
        hideVerificationLoading();
        
        // Show results
        showVerificationResults(result);
        
        // Add to recent activity
        addToRecentActivity(result);
        
    } catch (error) {
        hideVerificationLoading();
        showError('Verification Failed', error.message || 'Unable to verify content. Please try again.');
    }
}

async function callVerificationAPI(contentData) {
    // Only text verification is supported
    const response = await fetch(`${API_BASE_URL}/verify`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            type: contentData.type,
            content: contentData.content,
            sourceUrl: contentData.sourceUrl || null
        })
    });
    
    const data = await response.json();
    
    if (!response.ok || !data.success) {
        throw new Error(data.message || 'Verification failed');
    }
    
    return data.result;
}

function showVerificationLoading() {
    document.getElementById('verificationLoading').classList.add('active');
    document.getElementById('verificationResults').classList.remove('active');
}

function hideVerificationLoading() {
    document.getElementById('verificationLoading').classList.remove('active');
}

function showVerificationResults(result) {
    const container = document.getElementById('verificationResults');
    appState.verificationResult = result;
    
    const statusClass = result.status.toLowerCase();
    const statusIcon = result.status === 'VERIFIED' ? 'fa-check-circle' : 
                      result.status === 'FAKE' ? 'fa-times-circle' : 'fa-exclamation-triangle';
    
    const statusText = result.status === 'VERIFIED' ? 'Verified - Totoo' : 
                      result.status === 'FAKE' ? 'Fake News - Hindi Totoo' : 'Di Makumpirma';
    
    container.innerHTML = `
        <div class="result-header ${statusClass}">
            <div class="result-icon ${statusClass}">
                <i class="fas ${statusIcon}"></i>
            </div>
            <div>
                <div class="result-title">${statusText}</div>
                <div class="result-confidence">
                    <span>Confidence Score:</span>
                    <div class="confidence-bar">
                        <div class="confidence-fill" style="width: ${result.confidenceScore}%; background-color: ${getConfidenceColor(result.confidenceScore)}"></div>
                    </div>
                    <span>${result.confidenceScore}%</span>
                </div>
            </div>
        </div>
        
        <div class="result-body">
            <div class="result-section">
                <h3><i class="fas fa-info-circle"></i> Paliwanag</h3>
                <p>${result.explanation}</p>
            </div>
            
            ${result.status === 'FAKE' ? `
                <div class="result-section">
                    <h3><i class="fas fa-exclamation-triangle"></i> Bakit Fake?</h3>
                    <p>${result.whyFake}</p>
                </div>
            ` : ''}
            
            ${result.sources && result.sources.length > 0 ? `
                <div class="result-section">
                    <h3><i class="fas fa-link"></i> Sources</h3>
                    <div class="sources-list">
                        ${result.sources.map(source => `
                            <div class="source-item">
                                <i class="fas fa-external-link-alt"></i>
                                <a href="${source.url}" target="_blank">${source.title}</a>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
            
            <div class="result-section">
                <h3><i class="fas fa-clock"></i> Timestamp</h3>
                <p>${new Date(result.timestamp).toLocaleString('en-PH')}</p>
            </div>
        </div>
    `;
    
    container.classList.add('active');
}

function hideVerificationResults() {
    document.getElementById('verificationResults').classList.remove('active');
}

function getConfidenceColor(score) {
    if (score >= 80) return 'var(--success-green)';
    if (score >= 60) return 'var(--warning-orange)';
    return 'var(--error-red)';
}

function addToRecentActivity(result) {
    const activity = {
        status: result.status === 'VERIFIED' ? 'verified' : 'fake',
        title: `${result.status}: ${result.summary || 'Content verification'}`,
        timestamp: 'Just now',
        type: result.type
    };
    
    const activityList = document.getElementById('recentActivityList');
    const item = createActivityItem(activity);
    activityList.insertBefore(item, activityList.firstChild);
    
    // Keep only last 10 items
    while (activityList.children.length > 10) {
        activityList.removeChild(activityList.lastChild);
    }
}

// Only text verification is supported now

// Only text verification is supported now

// Only text verification is supported now

// Only text verification is supported now

// Only text verification is supported now

// ==========================================
// FACT OR FAKE GAME
// ==========================================

const gameState = {
    isPlaying: false,
    currentRound: 0,
    score: 0,
    streak: 0,
    currentClaim: null,
    userAnswer: null
};

function showGameScreen(screenName) {
    document.querySelectorAll('.game-screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(`game${screenName.charAt(0).toUpperCase() + screenName.slice(1)}`).classList.add('active');
}

async function startFactGame() {
    gameState.isPlaying = true;
    gameState.currentRound = 1;
    gameState.score = 0;
    gameState.streak = 0;
    
    updateGameStats();
    await loadNewClaim();
}

async function loadNewClaim() {
    showGameScreen('loading');
    
    try {
        const claim = await generateAIClaim();
        gameState.currentClaim = claim;
        
        // Show the claim
        document.getElementById('claimText').textContent = claim.statement;
        showGameScreen('play');
    } catch (error) {
        console.error('Error generating claim:', error);
        let errorMessage = 'Unable to generate claim. Please try again.';
        if (error.message) {
            errorMessage = error.message;
        }
        showError('Game Error', errorMessage);
        showGameScreen('welcome');
    }
}

async function generateAIClaim() {
    const response = await fetch(`${API_BASE_URL}/game-claim`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            round: gameState.currentRound
        })
    });
    
    const data = await response.json();
    
    if (!data.success) {
        throw new Error(data.message || 'Failed to generate claim');
    }
    
    return data.claim;
}

async function submitGameAnswer(answer) {
    gameState.userAnswer = answer;
    
    // Disable buttons
    document.querySelectorAll('.btn-game').forEach(btn => {
        btn.disabled = true;
    });
    
    // Check answer
    const isCorrect = answer === gameState.currentClaim.answer;
    
    if (isCorrect) {
        gameState.score += 100;
        gameState.streak++;
    } else {
        gameState.streak = 0;
    }
    
    // Show result
    showGameResult(isCorrect);
}

function showGameResult(isCorrect) {
    const feedbackEl = document.getElementById('resultFeedback');
    const explanationEl = document.getElementById('resultExplanation');
    
    if (isCorrect) {
        feedbackEl.innerHTML = `
            <div class="feedback-correct">
                <i class="fas fa-check-circle"></i>
                <h2>Tama! Correct!</h2>
                <p>+100 points | Streak: ${gameState.streak}</p>
            </div>
        `;
    } else {
        feedbackEl.innerHTML = `
            <div class="feedback-wrong">
                <i class="fas fa-times-circle"></i>
                <h2>Mali! Wrong!</h2>
                <p>Streak reset to 0</p>
            </div>
        `;
    }
    
    // Show explanation with sources
    const explanation = gameState.currentClaim.explanation;
    let explanationHTML = `
        <div class="explanation-content">
            <h3><i class="fas fa-lightbulb"></i> Why is it ${gameState.currentClaim.answer}?</h3>
            <ul class="explanation-list">
    `;
    
    if (Array.isArray(explanation)) {
        explanation.forEach(point => {
            explanationHTML += `<li>${point}</li>`;
        });
    } else {
        explanationHTML += `<li>${explanation}</li>`;
    }
    
    explanationHTML += `</ul>`;
    
    // Add sources if available
    if (gameState.currentClaim.sources && gameState.currentClaim.sources.length > 0) {
        explanationHTML += `
            <div class="game-sources">
                <h4><i class="fas fa-link"></i> Sources:</h4>
                <ul>
        `;
        gameState.currentClaim.sources.forEach(source => {
            explanationHTML += `<li><a href="${source}" target="_blank">${source}</a></li>`;
        });
        explanationHTML += `</ul></div>`;
    }
    
    explanationHTML += `</div>`;
    explanationEl.innerHTML = explanationHTML;
    
    showGameScreen('result');
}

function nextGameRound() {
    gameState.currentRound++;
    updateGameStats();
    
    // Re-enable buttons
    document.querySelectorAll('.btn-game').forEach(btn => {
        btn.disabled = false;
    });
    
    loadNewClaim();
}

function updateGameStats() {
    document.getElementById('currentRound').textContent = gameState.currentRound;
    document.getElementById('gameScore').textContent = gameState.score;
    document.getElementById('gameStreak').textContent = gameState.streak;
}

function quitGame() {
    gameState.isPlaying = false;
    showGameScreen('welcome');
    
    if (gameState.score > 0) {
        showSuccess('Game Over', `Final Score: ${gameState.score} points!`);
    }
}

// ==========================================
// AI DEBATE FUNCTIONS
// ==========================================

async function analyzeDebate() {
    const content = document.getElementById('debateContent').value.trim();
    
    // Validate input
    if (!content) {
        showError('Input Error', 'Please enter an article, claim, or statement to debate.');
        return;
    }
    
    // Show loading state
    document.getElementById('debateLoading').style.display = 'block';
    document.getElementById('debateResults').style.display = 'none';
    
    try {
        // Call the API
        const response = await fetch(`${API_BASE_URL}/debate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ content })
        });
        
        const data = await response.json();
        
        if (!response.ok || !data.success) {
            throw new Error(data.message || 'Failed to analyze content');
        }
        
        // Display results
        displayDebateResults(data.analysis);
        
    } catch (error) {
        console.error('Debate analysis error:', error);
        showError('Analysis Error', error.message || 'Failed to analyze the content. Please try again.');
    } finally {
        // Hide loading state
        document.getElementById('debateLoading').style.display = 'none';
    }
}

function displayDebateResults(analysis) {
    const resultsContainer = document.getElementById('debateResults');
    
    // Create HTML for the results
    let html = `
        <div class="debate-claim">
            <h3>Main Claim:</h3>
            <p class="claim-text">${escapeHtml(analysis.claim)}</p>
        </div>
        
        <div class="debate-sections">
            <div class="pros-section">
                <h3><i class="fas fa-thumbs-up"></i> Pros (Arguments For)</h3>
                <ul class="argument-list">
    `;
    
    // Add pros
    if (analysis.pros && analysis.pros.length > 0) {
        analysis.pros.forEach(pro => {
            html += `<li>${escapeHtml(pro)}</li>`;
        });
    } else {
        html += `<li>No pros provided</li>`;
    }
    
    html += `
                </ul>
            </div>
            
            <div class="cons-section">
                <h3><i class="fas fa-thumbs-down"></i> Cons (Arguments Against)</h3>
                <ul class="argument-list">
    `;
    
    // Add cons
    if (analysis.cons && analysis.cons.length > 0) {
        analysis.cons.forEach(con => {
            html += `<li>${escapeHtml(con)}</li>`;
        });
    } else {
        html += `<li>No cons provided</li>`;
    }
    
    html += `
                </ul>
            </div>
        </div>
        
        <div class="debate-summary">
            <h3><i class="fas fa-balance-scale"></i> Balanced Summary</h3>
            <p>${escapeHtml(analysis.summary)}</p>
        </div>
    `;
    
    // Add sources if available
    if (analysis.sources && analysis.sources.length > 0) {
        html += `
            <div class="debate-sources">
                <h3><i class="fas fa-link"></i> Sources</h3>
                <ul class="sources-list">
        `;
        
        analysis.sources.forEach(source => {
            const url = typeof source === 'string' ? source : source.url || '';
            const title = typeof source === 'string' ? source : source.title || url;
            if (url) {
                html += `<li><a href="${escapeHtml(url)}" target="_blank" rel="noopener">${escapeHtml(title)}</a></li>`;
            }
        });
        
        html += `
                </ul>
            </div>
        `;
    }
    
    resultsContainer.innerHTML = html;
    resultsContainer.style.display = 'block';
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ==========================================
// MODAL FUNCTIONS
// ==========================================

function showError(title, message) {
    document.getElementById('errorTitle').textContent = title;
    document.getElementById('errorMessage').textContent = message;
    document.getElementById('errorModal').classList.add('active');
}

function closeErrorModal() {
    document.getElementById('errorModal').classList.remove('active');
}

function showSuccess(title, message) {
    document.getElementById('successTitle').textContent = title;
    document.getElementById('successMessage').textContent = message;
    document.getElementById('successModal').classList.add('active');
}

function closeSuccessModal() {
    document.getElementById('successModal').classList.remove('active');
}

// Close modals when clicking outside
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.classList.remove('active');
    }
}
