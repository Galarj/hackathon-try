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
const API_BASE_URL = 'http://localhost:3000/api';

// ==========================================
// GAME DESIGN GENERATOR
// ==========================================
async function generateGameDesign() {
    try {
        // Show loading
        showLoading('Generating...', 'AI is creating a new game design. Please wait...');
        
        const response = await fetch(`${API_BASE_URL}/generate-game-design`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                gameName: 'Fact or Fake?',
                designType: 'complete'
            })
        });
        
        const data = await response.json();
        
        hideLoading();
        
        if (data.success) {
            displayGeneratedDesign(data.result);
        } else {
            showError('Generation Failed', data.message || 'Unable to generate game design');
        }
    } catch (error) {
        hideLoading();
        console.error('Game design generation error:', error);
        showError('Generation Failed', 'Unable to generate game design. Please try again.');
    }
}

function displayGeneratedDesign(result) {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 900px; max-height: 90vh; overflow-y: auto;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                <h2 style="margin: 0;"><i class="fas fa-magic"></i> Generated Game Design</h2>
                <button onclick="this.closest('.modal').remove()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: var(--medium-gray);">×</button>
            </div>
            <p style="color: var(--medium-gray); margin-bottom: 1.5rem;">
                <strong>Game:</strong> ${result.gameName} | <strong>Type:</strong> ${result.designType}
            </p>
            <div style="background: #f8f9fa; padding: 2rem; border-radius: 8px; white-space: pre-wrap; font-family: 'Segoe UI', Arial, sans-serif; font-size: 0.95rem; line-height: 1.8; max-height: 60vh; overflow-y: auto;">
                ${result.content}
            </div>
            <div style="display: flex; gap: 1rem; margin-top: 1.5rem;">
                <button class="btn btn-primary" onclick="copyDesignToClipboard(\`${result.content.replace(/`/g, '\\`').replace(/\\/g, '\\\\').replace(/\$/g, '\\$')}\`)">
                    <i class="fas fa-copy"></i> Copy to Clipboard
                </button>
                <button class="btn btn-outline" onclick="this.closest('.modal').remove()">
                    Close
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function copyDesignToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showSuccess('Copied!', 'Design copied to clipboard successfully');
    }).catch(err => {
        console.error('Copy failed:', err);
        showError('Copy Failed', 'Unable to copy to clipboard');
    });
}

function showLoading(title, message) {
    const loading = document.createElement('div');
    loading.id = 'globalLoading';
    loading.className = 'modal active';
    loading.innerHTML = `
        <div class="modal-content" style="text-align: center; max-width: 400px;">
            <div class="spinner" style="margin: 2rem auto;"></div>
            <h3>${title}</h3>
            <p style="color: var(--medium-gray);">${message}</p>
        </div>
    `;
    document.body.appendChild(loading);
}

function hideLoading() {
    const loading = document.getElementById('globalLoading');
    if (loading) {
        loading.remove();
    }
}

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
            document.getElementById('videoCount').textContent = formatNumber(data.stats.videoCount);
            document.getElementById('userCount').textContent = formatNumber(data.stats.userCount);
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
            title: 'Fake News: Misleading image about government policy',
            timestamp: '15 minutes ago',
            type: 'image'
        },
        {
            status: 'verified',
            title: 'Generated: Passport Renewal Guide Video',
            timestamp: '1 hour ago',
            type: 'video'
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
    // Update buttons
    document.querySelectorAll('.method-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-method="${method}"]`).classList.add('active');
    
    // Update containers
    document.querySelectorAll('.input-container').forEach(container => {
        container.classList.remove('active');
    });
    document.getElementById(`${method}Input`).classList.add('active');
    
    appState.currentInputMethod = method;
    
    // Reset previous results
    hideVerificationResults();
}

// File Upload Handling
function setupDragAndDrop() {
    const imageZone = document.getElementById('imageUploadZone');
    const videoZone = document.getElementById('videoUploadZone');
    
    [imageZone, videoZone].forEach(zone => {
        zone.addEventListener('dragover', (e) => {
            e.preventDefault();
            zone.style.borderColor = 'var(--primary-blue)';
            zone.style.backgroundColor = 'var(--light-gray)';
        });
        
        zone.addEventListener('dragleave', (e) => {
            e.preventDefault();
            zone.style.borderColor = 'var(--border-gray)';
            zone.style.backgroundColor = 'transparent';
        });
        
        zone.addEventListener('drop', (e) => {
            e.preventDefault();
            zone.style.borderColor = 'var(--border-gray)';
            zone.style.backgroundColor = 'transparent';
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                const type = zone.id === 'imageUploadZone' ? 'image' : 'video';
                handleFileSelection(files[0], type);
            }
        });
    });
}

function handleFileUpload(type) {
    const fileInput = document.getElementById(`${type}File`);
    const file = fileInput.files[0];
    
    if (file) {
        handleFileSelection(file, type);
    }
}

function handleFileSelection(file, type) {
    // Validate file
    const validation = validateFile(file, type);
    if (!validation.valid) {
        showError('Invalid File', validation.message);
        return;
    }
    
    // Store file
    appState.uploadedFile = file;
    
    // Show preview
    showFilePreview(file, type);
    
    // Show verify button
    document.getElementById(`verify${type.charAt(0).toUpperCase() + type.slice(1)}Btn`).style.display = 'block';
}

function validateFile(file, type) {
    const maxSizes = {
        image: 10 * 1024 * 1024, // 10MB
        video: 50 * 1024 * 1024  // 50MB
    };
    
    const allowedTypes = {
        image: ['image/jpeg', 'image/jpg', 'image/png'],
        video: ['video/mp4', 'video/avi', 'video/mov', 'video/quicktime']
    };
    
    if (file.size > maxSizes[type]) {
        return {
            valid: false,
            message: `File size exceeds ${type === 'image' ? '10MB' : '50MB'} limit`
        };
    }
    
    if (!allowedTypes[type].includes(file.type)) {
        return {
            valid: false,
            message: `Invalid file type. Please upload a valid ${type} file.`
        };
    }
    
    return { valid: true };
}

function showFilePreview(file, type) {
    const preview = document.getElementById(`${type}Preview`);
    const reader = new FileReader();
    
    reader.onload = (e) => {
        if (type === 'image') {
            preview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
        } else {
            preview.innerHTML = `<video src="${e.target.result}" controls></video>`;
        }
    };
    
    reader.readAsDataURL(file);
}

// News Verification
async function verifyNews(type) {
    let contentData;
    
    // Gather content based on type
    if (type === 'text') {
        const newsText = document.getElementById('newsText').value.trim();
        const sourceUrl = document.getElementById('sourceUrl').value.trim();
        
        if (!newsText) {
            showError('Missing Content', 'Please enter the news text to verify.');
            return;
        }
        
        contentData = {
            type: 'text',
            content: newsText,
            sourceUrl: sourceUrl || null
        };
    } else {
        if (!appState.uploadedFile) {
            showError('Missing File', `Please upload a ${type} file to verify.`);
            return;
        }
        
        contentData = {
            type: type,
            file: appState.uploadedFile
        };
    }
    
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
    // For text verification, send JSON
    if (contentData.type === 'text') {
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
    } else {
        // For image/video, use FormData (not currently supported)
        const formData = new FormData();
        formData.append('type', contentData.type);
        formData.append('file', contentData.file);
        
        const response = await fetch(`${API_BASE_URL}/verify`, {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (!response.ok || !data.success) {
            throw new Error(data.message || 'Verification failed');
        }
        
        return data.result;
    }
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

// ==========================================
// GOVGUIDE AI VIDEO GENERATOR
// ==========================================

const processData = {
    'passport': {
        title: 'Passport Application',
        icon: 'fa-passport',
        description: 'Step-by-step guide para sa pag-apply ng Philippine Passport',
        duration: '5-7 minutes',
        difficulty: 'Medium'
    },
    'drivers-license': {
        title: "Driver's License",
        icon: 'fa-id-card',
        description: 'Guide sa pagkuha ng driver\'s license sa LTO',
        duration: '6-8 minutes',
        difficulty: 'Medium'
    },
    'nbi-clearance': {
        title: 'NBI Clearance',
        icon: 'fa-file-alt',
        description: 'Paano kumuha ng NBI Clearance online at walk-in',
        duration: '4-5 minutes',
        difficulty: 'Easy'
    },
    'bir-registration': {
        title: 'BIR Registration',
        icon: 'fa-file-invoice',
        description: 'Guide sa pag-register sa BIR para sa self-employed',
        duration: '7-10 minutes',
        difficulty: 'Hard'
    },
    'sss-registration': {
        title: 'SSS Registration',
        icon: 'fa-id-badge',
        description: 'Step-by-step SSS registration guide',
        duration: '5-6 minutes',
        difficulty: 'Easy'
    },
    'philhealth': {
        title: 'PhilHealth Registration',
        icon: 'fa-heartbeat',
        description: 'Paano mag-register sa PhilHealth',
        duration: '4-5 minutes',
        difficulty: 'Easy'
    },
    'pagibig': {
        title: 'Pag-IBIG Registration',
        icon: 'fa-home',
        description: 'Guide sa Pag-IBIG membership registration',
        duration: '4-5 minutes',
        difficulty: 'Easy'
    },
    'business-permit': {
        title: 'Business Permit',
        icon: 'fa-briefcase',
        description: 'Paano kumuha ng Business Permit sa LGU',
        duration: '8-10 minutes',
        difficulty: 'Hard'
    }
};

function selectProcess(processId) {
    // Update selected state
    document.querySelectorAll('.process-card').forEach(card => {
        card.classList.remove('selected');
    });
    event.target.closest('.process-card').classList.add('selected');
    
    appState.selectedProcess = processId;
    
    // Show process details
    showProcessDetails(processId);
    
    // Show video options
    showVideoOptions(processId);
}

function showProcessDetails(processId) {
    const details = document.getElementById('processDetails');
    const process = processData[processId];
    
    details.innerHTML = `
        <h3><i class="fas ${process.icon}"></i> ${process.title}</h3>
        <p>${process.description}</p>
        <div class="process-info">
            <div class="info-item">
                <i class="fas fa-clock"></i>
                <div>
                    <strong>Duration:</strong> ${process.duration}
                </div>
            </div>
            <div class="info-item">
                <i class="fas fa-signal"></i>
                <div>
                    <strong>Difficulty:</strong> ${process.difficulty}
                </div>
            </div>
        </div>
    `;
    
    details.classList.add('active');
}

function showVideoOptions(processId) {
    const options = document.getElementById('videoOptions');
    
    options.innerHTML = `
        <h3>Video Generation Options:</h3>
        
        <div class="option-group">
            <label for="language">Wika / Language:</label>
            <select id="language">
                <option value="tagalog">Tagalog</option>
                <option value="taglish">Taglish</option>
                <option value="english">English</option>
            </select>
        </div>
        
        <div class="option-group">
            <label for="detailLevel">Detail Level:</label>
            <select id="detailLevel">
                <option value="basic">Basic - Quick overview</option>
                <option value="detailed" selected>Detailed - Step-by-step</option>
                <option value="comprehensive">Comprehensive - Full guide</option>
            </select>
        </div>
        
        <div class="option-group">
            <label for="voiceStyle">Voice Style:</label>
            <select id="voiceStyle">
                <option value="friendly" selected>Friendly & Casual</option>
                <option value="professional">Professional</option>
                <option value="enthusiastic">Enthusiastic</option>
            </select>
        </div>
        
        <button class="btn btn-primary btn-large" onclick="generateVideo()">
            <i class="fas fa-magic"></i> Generate Video
        </button>
    `;
    
    options.classList.add('active');
}

async function generateVideo() {
    if (!appState.selectedProcess) {
        showError('No Process Selected', 'Please select a government process first.');
        return;
    }
    
    const options = {
        processId: appState.selectedProcess,
        language: document.getElementById('language').value,
        detailLevel: document.getElementById('detailLevel').value,
        voiceStyle: document.getElementById('voiceStyle').value
    };
    
    // Show loading state
    showVideoLoading();
    
    try {
        // Call video generation API
        const result = await callVideoGenerationAPI(options);
        
        // Hide loading
        hideVideoLoading();
        
        // Show video player
        showVideoPlayer(result);
        
        // Add to recent activity
        addVideoToRecentActivity(result);
        
        // Show success message
        showSuccess('Video Generated!', 'Ang iyong GovGuide video ay handa na!');
        
    } catch (error) {
        hideVideoLoading();
        showError('Generation Failed', error.message || 'Unable to generate video. Please try again.');
    }
}

async function callVideoGenerationAPI(options) {
    const response = await fetch(`${API_BASE_URL}/generate-video`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(options)
    });
    
    const data = await response.json();
    
    if (!response.ok || !data.success) {
        throw new Error(data.message || 'Video generation failed');
    }
    
    return data.result;
}

function showVideoLoading() {
    const loading = document.getElementById('videoLoading');
    loading.classList.add('active');
    
    // Simulate progress
    let progress = 0;
    const progressBar = document.getElementById('videoProgress');
    
    const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress > 90) progress = 90;
        progressBar.style.width = `${progress}%`;
    }, 500);
    
    // Store interval for cleanup
    loading.dataset.interval = interval;
}

function hideVideoLoading() {
    const loading = document.getElementById('videoLoading');
    clearInterval(loading.dataset.interval);
    loading.classList.remove('active');
    document.getElementById('videoProgress').style.width = '0%';
}

function showVideoPlayer(result) {
    const player = document.getElementById('videoPlayer');
    appState.generatedVideo = result;
    
    player.innerHTML = `
        <h3>Generated Video: ${processData[appState.selectedProcess].title}</h3>
        <div class="video-wrapper">
            <video controls autoplay>
                <source src="${result.videoUrl}" type="video/mp4">
                Your browser does not support the video tag.
            </video>
        </div>
        
        <div class="video-info">
            <h3>Video Steps:</h3>
            <ul class="video-steps">
                ${result.steps.map(step => `<li>${step}</li>`).join('')}
            </ul>
        </div>
        
        <div style="display: flex; gap: 1rem; margin-top: 1rem;">
            <button class="btn btn-primary" onclick="downloadVideo()">
                <i class="fas fa-download"></i> Download Video
            </button>
            <button class="btn btn-outline" onclick="shareVideo()">
                <i class="fas fa-share-alt"></i> Share
            </button>
        </div>
    `;
    
    player.classList.add('active');
}

function downloadVideo() {
    if (!appState.generatedVideo) return;
    
    const link = document.createElement('a');
    link.href = appState.generatedVideo.videoUrl;
    link.download = `govguide-${appState.selectedProcess}.mp4`;
    link.click();
    
    showSuccess('Download Started', 'Your video is being downloaded.');
}

function shareVideo() {
    if (!appState.generatedVideo) return;
    
    if (navigator.share) {
        navigator.share({
            title: `GovGuide: ${processData[appState.selectedProcess].title}`,
            text: 'Check out this helpful government process guide!',
            url: appState.generatedVideo.videoUrl
        }).catch(err => console.error('Share failed:', err));
    } else {
        // Fallback - copy link
        navigator.clipboard.writeText(appState.generatedVideo.videoUrl);
        showSuccess('Link Copied', 'Video link copied to clipboard!');
    }
}

function addVideoToRecentActivity(result) {
    const activity = {
        status: 'verified',
        title: `Generated: ${processData[appState.selectedProcess].title} Guide`,
        timestamp: 'Just now',
        type: 'video'
    };
    
    const activityList = document.getElementById('recentActivityList');
    const item = createActivityItem(activity);
    activityList.insertBefore(item, activityList.firstChild);
}

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
