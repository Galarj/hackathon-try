# ==========================================
# LAYER 7: DEPLOYMENT ARCHITECTURE
# Complete Alibaba Cloud Infrastructure Setup
# ==========================================

## ARCHITECTURE OVERVIEW

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER DEVICES                             │
│              (Desktop, Mobile, Tablet Browsers)                  │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────────────┐
│                    ALIBABA CLOUD CDN                             │
│              (Content Delivery Network - Global)                 │
│         • Cache static assets (HTML, CSS, JS, images)           │
│         • SSL/TLS termination                                    │
│         • DDoS protection                                        │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────────────┐
│                    API GATEWAY (ALB)                             │
│              Application Load Balancer                           │
│         • Route requests to backend services                     │
│         • Health checks                                          │
│         • Rate limiting                                          │
└────────────────────┬────────────────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
        ↓            ↓            ↓
┌──────────┐  ┌──────────┐  ┌──────────┐
│Function  │  │Function  │  │Function  │
│Compute 1 │  │Compute 2 │  │Compute 3 │
│/api/     │  │/api/     │  │/api/     │
│verify    │  │generate  │  │stats     │
└────┬─────┘  └────┬─────┘  └────┬─────┘
     │             │             │
     └─────────────┼─────────────┘
                   │
        ┌──────────┼──────────┐
        │          │          │
        ↓          ↓          ↓
┌──────────────────────────────────────┐
│      ALIBABA CLOUD SERVICES          │
│                                      │
│  ┌────────────────────────────────┐ │
│  │  QWEN AI (GenAI)               │ │
│  │  • Text verification           │ │
│  │  • Image analysis              │ │
│  │  • Video deepfake detection    │ │
│  │  • Script generation           │ │
│  └────────────────────────────────┘ │
│                                      │
│  ┌────────────────────────────────┐ │
│  │  OSS (Object Storage)          │ │
│  │  • User uploads                │ │
│  │  • Generated videos            │ │
│  │  • Thumbnails                  │ │
│  │  • Static assets               │ │
│  └────────────────────────────────┘ │
│                                      │
│  ┌────────────────────────────────┐ │
│  │  RDS (Database)                │ │
│  │  • Verification records        │ │
│  │  • Video metadata              │ │
│  │  • User activity logs          │ │
│  │  • Application stats           │ │
│  └────────────────────────────────┘ │
│                                      │
│  ┌────────────────────────────────┐ │
│  │  Video Generation Service      │ │
│  │  • Text-to-speech (Filipino)   │ │
│  │  • Video rendering             │ │
│  │  • Subtitle generation         │ │
│  └────────────────────────────────┘ │
└──────────────────────────────────────┘
                   │
                   ↓
┌──────────────────────────────────────┐
│   MONITORING & LOGGING               │
│  • CloudMonitor                      │
│  • Log Service (SLS)                 │
│  • Alert notifications               │
└──────────────────────────────────────┘
```

---

## COMPONENT DETAILS

### 1. FRONTEND HOSTING

**Service:** Alibaba Cloud CDN + OSS

**Purpose:**
- Host static frontend files (HTML, CSS, JS)
- Global content delivery
- Fast loading times worldwide

**Configuration:**
```yaml
OSS Bucket (Frontend):
  Name: truthchain-ph-frontend
  Region: ap-southeast-5 (Philippines/Jakarta - closest to PH)
  Access: Public Read
  Files:
    - index.html
    - styles.css
    - app.js
    - assets/ (images, icons, fonts)
  
  Static Website Hosting: Enabled
  Index Document: index.html
  Error Document: index.html (SPA routing)

CDN Domain:
  Domain: www.truthchain.ph
  Origin: truthchain-ph-frontend.oss-ap-southeast-5.aliyuncs.com
  HTTPS: Enabled (SSL certificate)
  Cache Rules:
    - HTML: 1 hour
    - CSS/JS: 7 days
    - Images: 30 days
  Compression: Gzip + Brotli
  
Security:
  DDoS Protection: Enabled
  WAF (Web Application Firewall): Enabled
  Access Control: Geo-restriction (optional)
```

**Deployment Steps:**
1. Upload static files to OSS bucket
2. Configure CDN domain
3. Enable HTTPS with SSL certificate
4. Set cache policies
5. Test access via CDN URL

---

### 2. API GATEWAY & LOAD BALANCER

**Service:** Application Load Balancer (ALB)

**Purpose:**
- Route API requests to serverless functions
- Load balancing across multiple instances
- Health monitoring

**Configuration:**
```yaml
Load Balancer:
  Name: truthchain-api-lb
  Type: Application Load Balancer (Layer 7)
  Region: ap-southeast-5
  
  Listeners:
    - Protocol: HTTPS
      Port: 443
      SSL Certificate: truthchain.ph
      
  Routing Rules:
    - Path: /api/verify
      Target: Function Compute - VerifyFunction
    
    - Path: /api/generate-video
      Target: Function Compute - VideoGenFunction
    
    - Path: /api/stats
      Target: Function Compute - StatsFunction
    
    - Path: /api/recent-activity
      Target: Function Compute - ActivityFunction
  
  Health Checks:
    Interval: 30 seconds
    Timeout: 5 seconds
    Healthy Threshold: 2
    Unhealthy Threshold: 3
  
  Security:
    Rate Limiting: 100 requests/minute per IP
    DDoS Protection: Enabled
    CORS: Enabled (for frontend domain)
```

---

### 3. SERVERLESS BACKEND (Function Compute)

**Service:** Alibaba Function Compute

**Purpose:**
- Run backend API logic
- Auto-scaling based on demand
- Pay-per-use pricing

**Function 1: Verification Function**
```yaml
Function: VerifyFunction
  Runtime: Node.js 16
  Handler: index.handler
  Memory: 512 MB
  Timeout: 30 seconds
  
  Environment Variables:
    QWEN_API_KEY: ${qwen_api_key}
    QWEN_ENDPOINT: https://dashscope.aliyuncs.com/api/v1
    OSS_BUCKET: truthchain-uploads
    RDS_HOST: ${rds_host}
    RDS_USER: ${rds_user}
    RDS_PASSWORD: ${rds_password}
  
  Triggers:
    - Type: HTTP
      Path: /api/verify
      Methods: POST
  
  Permissions:
    - OSS: Read/Write (upload files)
    - RDS: Read/Write (store results)
    - Qwen AI: Invoke API
    - Logging: Write logs
  
  Auto Scaling:
    Min Instances: 1
    Max Instances: 100
    Target CPU: 70%
```

**Function 2: Video Generation Function**
```yaml
Function: VideoGenFunction
  Runtime: Node.js 16
  Handler: index.videoHandler
  Memory: 1024 MB
  Timeout: 120 seconds (2 minutes for video generation)
  
  Environment Variables:
    QWEN_API_KEY: ${qwen_api_key}
    VIDEO_API_KEY: ${video_api_key}
    OSS_BUCKET: truthchain-videos
    RDS_HOST: ${rds_host}
  
  Triggers:
    - Type: HTTP
      Path: /api/generate-video
      Methods: POST
  
  Permissions:
    - OSS: Read/Write
    - RDS: Read/Write
    - Qwen AI: Invoke
    - Video Generation API: Invoke
  
  Auto Scaling:
    Min Instances: 1
    Max Instances: 50
```

**Function 3: Stats & Activity Function**
```yaml
Function: StatsFunction
  Runtime: Node.js 16
  Handler: index.statsHandler
  Memory: 256 MB
  Timeout: 10 seconds
  
  Triggers:
    - Type: HTTP
      Path: /api/stats
      Methods: GET
    - Type: HTTP
      Path: /api/recent-activity
      Methods: GET
  
  Permissions:
    - RDS: Read only
  
  Auto Scaling:
    Min Instances: 1
    Max Instances: 20
```

---

### 4. AI SERVICES (Qwen - Alibaba GenAI)

**Service:** Alibaba Cloud Model Studio (Qwen API)

**Purpose:**
- AI-powered fact-checking
- Image/video analysis
- Content generation

**Configuration:**
```yaml
Qwen API:
  Model: qwen-2.5-72b-instruct
  Region: cn-beijing (or nearest with Qwen support)
  
  API Endpoints:
    Text Generation: /api/v1/services/aigc/text-generation/generation
    Vision Analysis: /api/v1/services/aigc/multimodal-generation/generation
  
  Rate Limits:
    Free Tier: 1,000 requests/day
    Paid Tier: Custom limits
  
  Configuration:
    Temperature: 0.3 (factual responses)
    Max Tokens: 2048
    Top P: 0.9
  
  Usage:
    - Fake news verification
    - Image manipulation detection
    - Video script generation
    - Filipino language processing
```

**Qwen Vision (for Image/Video Analysis):**
```yaml
Qwen Vision API:
  Model: qwen-vl-plus
  Use Cases:
    - Image analysis
    - OCR (text extraction)
    - Object detection
    - Manipulation detection
  
  Input: Base64 encoded image or video frames
  Output: JSON analysis results
```

---

### 5. OBJECT STORAGE (OSS)

**Service:** Alibaba Cloud Object Storage Service

**Purpose:**
- Store user uploads (images, videos)
- Store generated videos
- Host static assets

**Buckets Configuration:**

**Bucket 1: Uploads**
```yaml
Bucket: truthchain-uploads
  Region: ap-southeast-5
  Storage Class: Standard
  Access: Private
  
  Lifecycle Rules:
    - Temporary uploads: Delete after 7 days (if not verified)
    - Verified content: Transition to IA after 30 days
    - Delete after 1 year
  
  Security:
    Encryption: Server-side (OSS-managed keys)
    Access Control: IAM roles only
    Bucket Policy: Allow Function Compute access
  
  Structure:
    /images/YYYY/MM/DD/filename.jpg
    /videos/YYYY/MM/DD/filename.mp4
```

**Bucket 2: Generated Videos**
```yaml
Bucket: truthchain-videos
  Region: ap-southeast-5
  Storage Class: Standard
  Access: Public Read
  
  CDN: Enabled for fast delivery
  
  Lifecycle Rules:
    - Keep all videos indefinitely
    - Transition to IA after 90 days
  
  Structure:
    /videos/{process-id}/{video-id}.mp4
    /thumbnails/{video-id}.jpg
    /subtitles/{video-id}.srt
```

**Bucket 3: Frontend Assets**
```yaml
Bucket: truthchain-frontend
  Region: ap-southeast-5
  Storage Class: Standard
  Access: Public Read
  CDN: Enabled
  
  Files:
    /index.html
    /styles.css
    /app.js
    /assets/icons/
    /assets/images/
```

---

### 6. DATABASE (RDS)

**Service:** Alibaba Cloud RDS (Relational Database Service)

**Purpose:**
- Store verification records
- Store video metadata
- User activity tracking
- Application statistics

**Configuration:**
```yaml
RDS Instance:
  Engine: MySQL 8.0
  Edition: High-Availability
  Region: ap-southeast-5
  Instance Class: mysql.n2.small.1 (1 vCPU, 2GB RAM)
  Storage: 100 GB SSD
  
  Backup:
    Automatic Backup: Daily at 2 AM
    Retention: 7 days
    Backup Window: 02:00-03:00
  
  Security:
    VPC: Private network
    Whitelist IPs: Function Compute IPs only
    SSL: Enabled
    Encryption at Rest: Enabled
  
  Performance:
    IOPS: 1000
    Connection Pool: 100 connections
```

**Database Schema:**

```sql
-- Verifications Table
CREATE TABLE verifications (
  id VARCHAR(50) PRIMARY KEY,
  user_id VARCHAR(50),
  type ENUM('text', 'image', 'video'),
  content TEXT,
  file_path VARCHAR(255),
  source_url VARCHAR(500),
  status ENUM('VERIFIED', 'FAKE', 'UNVERIFIED'),
  confidence_score DECIMAL(5,2),
  explanation TEXT,
  why_fake TEXT,
  sources JSON,
  summary VARCHAR(500),
  ai_model VARCHAR(50),
  processing_time INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user (user_id),
  INDEX idx_created (created_at),
  INDEX idx_status (status)
);

-- Generated Videos Table
CREATE TABLE generated_videos (
  id VARCHAR(50) PRIMARY KEY,
  user_id VARCHAR(50),
  process_id VARCHAR(50),
  title VARCHAR(255),
  description TEXT,
  video_url VARCHAR(500),
  thumbnail_url VARCHAR(500),
  duration VARCHAR(10),
  language VARCHAR(20),
  steps JSON,
  transcript TEXT,
  ai_model VARCHAR(50),
  generation_time INT,
  views INT DEFAULT 0,
  likes INT DEFAULT 0,
  shares INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_process (process_id),
  INDEX idx_created (created_at)
);

-- User Activity Table
CREATE TABLE user_activity (
  id VARCHAR(50) PRIMARY KEY,
  user_id VARCHAR(50),
  activity_type ENUM('verification', 'video_generation', 'video_view', 'share'),
  reference_id VARCHAR(50),
  status VARCHAR(50),
  title VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user (user_id),
  INDEX idx_created (created_at)
);

-- Stats Table (for caching)
CREATE TABLE app_stats (
  id INT PRIMARY KEY AUTO_INCREMENT,
  verified_count INT DEFAULT 0,
  fake_news_detected INT DEFAULT 0,
  video_count INT DEFAULT 0,
  user_count INT DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

---

### 7. VIDEO GENERATION SERVICE

**Service:** Alibaba Cloud Video AI + Custom Integration

**Purpose:**
- Generate explainer videos from scripts
- Text-to-speech in Filipino
- Video editing and rendering

**Configuration:**
```yaml
Video Generation:
  Service: Custom integration with video generation API
  
  Text-to-Speech:
    Provider: Alibaba Cloud Text-to-Speech
    Language: Filipino (Tagalog)
    Voice: Female/Male (configurable)
    Quality: High (24kHz)
  
  Video Rendering:
    Resolution: 1920x1080 (1080p)
    Format: MP4 (H.264)
    Frame Rate: 30 fps
    Bitrate: 5 Mbps
  
  Components:
    - Background images/videos
    - Text overlays (step numbers, titles)
    - Animated transitions
    - Filipino narration
    - Background music (optional)
    - Subtitles (SRT format)
  
  Output:
    Upload to OSS: truthchain-videos bucket
    Generate thumbnail: First frame
    Generate subtitles: Auto-sync with narration
```

---

### 8. MONITORING & LOGGING

**Service:** Alibaba Cloud CloudMonitor + Log Service (SLS)

**Purpose:**
- Monitor application health
- Track errors and performance
- Alert on issues

**CloudMonitor Configuration:**
```yaml
Monitoring:
  Metrics Tracked:
    - Function Compute:
      • Invocation count
      • Error rate
      • Duration
      • Memory usage
    
    - OSS:
      • Request count
      • Bandwidth usage
      • Error rate
    
    - RDS:
      • CPU usage
      • Connections
      • IOPS
      • Slow queries
    
    - CDN:
      • Request count
      • Bandwidth
      • Hit rate
      • Error rate
  
  Dashboards:
    - Application Overview
    - AI API Usage
    - Storage Metrics
    - User Activity
  
  Alerts:
    - Function error rate > 5%: Email + SMS
    - RDS CPU > 80%: Email
    - OSS storage > 90%: Email
    - CDN error rate > 1%: Email
```

**Log Service Configuration:**
```yaml
Log Service (SLS):
  Project: truthchain-logs
  
  Logstores:
    - function-logs:
      • All function invocation logs
      • Request/response data
      • Error stack traces
    
    - api-access-logs:
      • API endpoint access
      • Response times
      • Status codes
    
    - ai-api-logs:
      • Qwen API calls
      • Token usage
      • Response times
  
  Log Retention: 30 days
  
  Log Analysis:
    - Query logs by time range
    - Filter by error level
    - Analyze API performance
    - Track user patterns
```

---

## DEPLOYMENT WORKFLOW

### Step-by-Step Deployment Process

**1. Setup Alibaba Cloud Account**
```bash
# Create Alibaba Cloud account
# Enable required services:
- Function Compute
- OSS
- RDS
- CDN
- Model Studio (Qwen)
- CloudMonitor
- Log Service
```

**2. Create OSS Buckets**
```bash
# Using Alibaba Cloud CLI
aliyun oss mb oss://truthchain-frontend --region ap-southeast-5
aliyun oss mb oss://truthchain-uploads --region ap-southeast-5
aliyun oss mb oss://truthchain-videos --region ap-southeast-5

# Set bucket policies
aliyun oss set-bucket-acl --bucket truthchain-frontend --acl public-read
aliyun oss set-bucket-acl --bucket truthchain-uploads --acl private
aliyun oss set-bucket-acl --bucket truthchain-videos --acl public-read
```

**3. Deploy Frontend to OSS**
```bash
# Upload static files
aliyun oss cp index.html oss://truthchain-frontend/
aliyun oss cp styles.css oss://truthchain-frontend/
aliyun oss cp app.js oss://truthchain-frontend/

# Enable static website hosting
aliyun oss website --bucket truthchain-frontend \
  --index-document index.html \
  --error-document index.html
```

**4. Setup CDN**
```bash
# Create CDN domain
aliyun cdn AddCdnDomain \
  --DomainName www.truthchain.ph \
  --CdnType web \
  --Sources truthchain-frontend.oss-ap-southeast-5.aliyuncs.com

# Configure HTTPS
aliyun cdn SetDomainServerCertificate \
  --DomainName www.truthchain.ph \
  --CertType upload \
  --ServerCertificate "$(cat cert.pem)" \
  --PrivateKey "$(cat key.pem)"
```

**5. Setup RDS Database**
```bash
# Create RDS instance
aliyun rds CreateDBInstance \
  --Engine MySQL \
  --EngineVersion 8.0 \
  --DBInstanceClass mysql.n2.small.1 \
  --DBInstanceStorage 100 \
  --Region ap-southeast-5

# Create database and tables
mysql -h <rds-host> -u admin -p < schema.sql
```

**6. Deploy Function Compute**
```bash
# Package function code
cd backend
npm install --production
zip -r function.zip .

# Create Function Compute service
aliyun fc CreateService --serviceName truthchain-api

# Deploy verification function
aliyun fc CreateFunction \
  --serviceName truthchain-api \
  --functionName VerifyFunction \
  --runtime nodejs16 \
  --handler index.handler \
  --codeZipFile function.zip \
  --memorySize 512 \
  --timeout 30

# Deploy video generation function
aliyun fc CreateFunction \
  --serviceName truthchain-api \
  --functionName VideoGenFunction \
  --runtime nodejs16 \
  --handler index.videoHandler \
  --codeZipFile function.zip \
  --memorySize 1024 \
  --timeout 120
```

**7. Configure Load Balancer**
```bash
# Create ALB instance
aliyun slb CreateLoadBalancer \
  --LoadBalancerName truthchain-api-lb \
  --AddressType internet \
  --Region ap-southeast-5

# Add listeners and routing rules
# (Configure via console or API)
```

**8. Setup Monitoring**
```bash
# Enable CloudMonitor for all resources
# Configure alert rules
# Create dashboards

# Enable Log Service
aliyun sls CreateProject --projectName truthchain-logs
aliyun sls CreateLogstore --project truthchain-logs --logstore function-logs
```

---

## COST ESTIMATION

### Monthly Cost Breakdown (Estimated)

```
Component                  Usage                      Cost (USD/month)
─────────────────────────────────────────────────────────────────────
Function Compute          1M invocations, 512MB      $15
RDS MySQL                 mysql.n2.small.1           $35
OSS Storage               100GB                      $2
OSS Traffic               1TB outbound               $120
CDN Traffic               5TB                        $200
Qwen AI API               10K requests               $50
Video Generation API      500 videos                 $100
Load Balancer             1 instance                 $20
CloudMonitor              Standard                   $5
Log Service               10GB/day                   $10
─────────────────────────────────────────────────────────────────────
TOTAL                                                ~$557/month
```

**Note:** Costs scale with usage. Alibaba Cloud offers free tier for initial testing.

---

## SECURITY BEST PRACTICES

**1. Network Security**
- VPC for backend services
- Private subnets for RDS
- Security groups with minimal permissions
- No public internet access for RDS

**2. Access Control**
- RAM (Resource Access Management) roles
- Least privilege principle
- Separate credentials for each service
- Rotate credentials regularly

**3. Data Security**
- Encryption at rest (OSS, RDS)
- Encryption in transit (HTTPS/SSL)
- Secure API keys storage (Function Compute env vars)
- Data backup and disaster recovery

**4. Application Security**
- Input validation on all endpoints
- Rate limiting to prevent abuse
- CORS configuration
- XSS and CSRF protection
- Content Security Policy headers

---

## SCALING STRATEGY

**Auto-Scaling Configuration:**

**Function Compute:**
- Min instances: 1
- Max instances: 100
- Scale trigger: CPU > 70% or latency > 1s
- Scale cooldown: 30 seconds

**RDS:**
- Start: mysql.n2.small.1 (1 vCPU, 2GB)
- Scale up: mysql.n2.medium.1 (2 vCPU, 4GB) when CPU > 80%
- Consider read replicas for high read traffic

**OSS:**
- No scaling needed (automatically scales)
- Monitor storage usage and costs

**CDN:**
- Automatically scales
- Consider multi-region if global traffic increases

---

This completes the comprehensive Alibaba Cloud deployment architecture for TruthChain PH!
