import os
import json
import time
import logging
import traceback
from datetime import datetime
from typing import Dict, List, Optional, Any
from functools import wraps

import requests
from flask import Flask, request, jsonify, g
from flask_cors import CORS
from dotenv import load_dotenv
import firebase_admin
from firebase_admin import credentials, firestore

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)

# Configure CORS
allowed_origins = [o.strip().rstrip('/') for o in os.getenv('ALLOWED_ORIGINS', 'http://localhost:3000').split(',') if o.strip()]
CORS(app, origins=allowed_origins, supports_credentials=True)

# Initialize Firebase Admin SDK
def initialize_firebase():
    try:
        if not firebase_admin._apps:
            # For development, use service account key file
            if os.path.exists('firebase-service-account.json'):
                cred = credentials.Certificate('firebase-service-account.json')
            elif not os.getenv('FIREBASE_PRIVATE_KEY'):
                # Optional: only used to log searches. The AI endpoints work without it.
                logger.info("Firebase admin credentials not set; search logging disabled")
                return None
            else:
                # For production, use environment variables
                cred_dict = {
                    "type": "service_account",
                    "project_id": os.getenv('FIREBASE_PROJECT_ID'),
                    "private_key_id": os.getenv('FIREBASE_PRIVATE_KEY_ID'),
                    "private_key": os.getenv('FIREBASE_PRIVATE_KEY').replace('\\n', '\n'),
                    "client_email": os.getenv('FIREBASE_CLIENT_EMAIL'),
                    "client_id": os.getenv('FIREBASE_CLIENT_ID'),
                    "auth_uri": os.getenv('FIREBASE_AUTH_URI'),
                    "token_uri": os.getenv('FIREBASE_TOKEN_URI'),
                }
                cred = credentials.Certificate(cred_dict)
            
            firebase_admin.initialize_app(cred)
        
        return firestore.client()
    except Exception as e:
        logger.error(f"Failed to initialize Firebase: {e}")
        return None

# ---------------------------------------------------------------------------
# AI providers
#
# Groq (default): free tier, OpenAI-compatible, fast open models. Set GROQ_API_KEY.
# Gemini (optional): set GEMINI_API_KEY instead and `pip install google-genai`.
# Find doesn't rely on either model's memory for citations: it searches
# OpenAlex (250M+ scholarly works) and the model only summarises those papers.
# ---------------------------------------------------------------------------
GROQ_BASE_URL = os.getenv('GROQ_BASE_URL', 'https://api.groq.com/openai/v1').rstrip('/')
GROQ_MODEL = os.getenv('GROQ_MODEL', 'openai/gpt-oss-120b')
GEMINI_MODEL = os.getenv('GEMINI_MODEL', 'gemini-flash-latest')
OPENALEX_URL = os.getenv('OPENALEX_URL', 'https://api.openalex.org').rstrip('/')

SYSTEM_PROMPT = (
    "You are a careful research-writing assistant. Never invent citations, data or "
    "quotes. If you are unsure, say so plainly."
)


class AIResult:
    def __init__(self, text: str):
        self.text = (text or '').strip()


class GroqModel:
    provider = 'groq'

    def __init__(self, api_key: str, model_name: str):
        self.api_key = api_key
        self.model_name = model_name

    def generate_content(self, prompt: str) -> AIResult:
        res = requests.post(
            f"{GROQ_BASE_URL}/chat/completions",
            headers={'Authorization': f"Bearer {self.api_key}", 'Content-Type': 'application/json'},
            json={
                'model': self.model_name,
                'messages': [
                    {'role': 'system', 'content': SYSTEM_PROMPT},
                    {'role': 'user', 'content': prompt},
                ],
                'temperature': 0.3,
            },
            timeout=90,
        )
        if res.status_code >= 400:
            raise RuntimeError(f"Groq error {res.status_code}: {res.text[:300]}")
        return AIResult(res.json()['choices'][0]['message']['content'])


class GeminiModel:
    provider = 'gemini'

    def __init__(self, api_key: str, model_name: str):
        from google import genai  # optional dependency
        self.client = genai.Client(api_key=api_key)
        self.model_name = model_name

    def generate_content(self, prompt: str) -> AIResult:
        response = self.client.models.generate_content(
            model=self.model_name, contents=f"{SYSTEM_PROMPT}\n\n{prompt}"
        )
        return AIResult(response.text)


def initialize_model():
    try:
        if os.getenv('GROQ_API_KEY'):
            return GroqModel(os.getenv('GROQ_API_KEY'), GROQ_MODEL)
        if os.getenv('GEMINI_API_KEY'):
            return GeminiModel(os.getenv('GEMINI_API_KEY'), GEMINI_MODEL)
        raise ValueError("Set GROQ_API_KEY (recommended) or GEMINI_API_KEY")
    except Exception as e:
        logger.error(f"Failed to initialize AI model: {e}")
        return None


# xray:find
def openalex_search(query: str, limit: int = 8) -> List[Dict[str, Any]]:
    """Real papers from OpenAlex, so every citation in an answer exists."""
    params = {
        'search': query,
        'per_page': limit,
        'select': 'id,doi,display_name,publication_year,authorships,primary_location,cited_by_count,abstract_inverted_index',
    }
    if os.getenv('OPENALEX_API_KEY'):
        params['api_key'] = os.getenv('OPENALEX_API_KEY')
    res = requests.get(f"{OPENALEX_URL}/works", params=params, timeout=20)
    res.raise_for_status()
    papers = []
    for i, w in enumerate(res.json().get('results', []), start=1):
        authors = [a.get('author', {}).get('display_name') for a in (w.get('authorships') or [])]
        authors = [a for a in authors if a]
        source = ((w.get('primary_location') or {}).get('source') or {}).get('display_name')
        doi = w.get('doi')
        papers.append({
            'n': i,
            'title': w.get('display_name') or 'Untitled',
            'authors': authors[:3] + (['et al.'] if len(authors) > 3 else []),
            'year': w.get('publication_year'),
            'venue': source,
            'cited_by': w.get('cited_by_count', 0),
            'doi': doi,
            'url': doi or w.get('id'),
            'abstract': rebuild_abstract(w.get('abstract_inverted_index'))[:700],
        })
    return papers
# xray:end


def rebuild_abstract(inverted: Optional[Dict[str, List[int]]]) -> str:
    """OpenAlex stores abstracts as {word: [positions]}; put the words back in order."""
    if not inverted:
        return ''
    positions = [(pos, word) for word, poss in inverted.items() for pos in poss]
    return ' '.join(word for _, word in sorted(positions))

# Global instances
db = initialize_firebase()
model = initialize_model()

# Rate limiting and error handling
def exponential_backoff(max_retries=3, base_delay=1):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            for attempt in range(max_retries):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    if attempt == max_retries - 1:
                        raise e
                    delay = base_delay * (2 ** attempt)
                    logger.warning(f"Attempt {attempt + 1} failed: {e}. Retrying in {delay}s...")
                    time.sleep(delay)
            return None
        return wrapper
    return decorator

def handle_errors(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except Exception as e:
            logger.error(f"Error in {func.__name__}: {e}")
            logger.error(traceback.format_exc())
            return jsonify({
                'error': str(e),
                'success': False,
                'timestamp': datetime.utcnow().isoformat()
            }), 500
    return wrapper

# API Routes

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat(),
        'services': {
            'firebase': db is not None,
            'ai': model is not None,
            'openalex': True
        },
        'provider': getattr(model, 'provider', None),
        'model': getattr(model, 'model_name', None)
    })

@app.route('/api/search', methods=['POST'])
@handle_errors
@exponential_backoff()
def grounded_search():
    """
    Find papers in OpenAlex, then summarise them with citations that point at real works
    """
    data = request.get_json()
    query = data.get('query', '').strip()
    context = data.get('context', '')
    
    if not query:
        return jsonify({'error': 'Query is required'}), 400
    
    try:
        papers = openalex_search(query)
    except Exception as e:
        logger.error(f"OpenAlex error: {e}")
        papers = []

    answer = ''
    if model and papers:
        listing = "\n\n".join(
            f"[{p['n']}] {p['title']} ({p['year']}). {', '.join(p['authors'])}. {p['venue'] or ''}\n{p['abstract'] or '(no abstract)'}"
            for p in papers
        )
        prompt = f"""A researcher asked: {query}

Their draft so far (for context only): {context[:800]}

Answer in 2-4 short paragraphs using ONLY the papers below. Cite them as [n].
If the papers don't answer the question, say what they do cover and what is missing.

Papers:
{listing}"""
        try:
            answer = model.generate_content(prompt).text
        except Exception as e:
            logger.error(f"Summary error: {e}")
    elif model and not papers:
        answer = "No matching papers were found in OpenAlex. Try broader or different keywords."

    if not papers and not answer:
        return jsonify({'error': 'Search service temporarily unavailable', 'success': False}), 503

    result = {
        'success': True,
        'query': query,
        'answer': answer,
        'papers': [{k: v for k, v in p.items() if k != 'abstract'} for p in papers],
        'sources': [{'title': p['title'], 'uri': p['url']} for p in papers if p['url']],
        'grounded': bool(papers),
        'timestamp': datetime.utcnow().isoformat(),
    }
    if db:
        log_search_query(query, context, result)
    return jsonify(result)

@app.route('/api/complete', methods=['POST'])
@handle_errors
@exponential_backoff()
def writing_assistance():
    """
    AI-powered writing completion and assistance
    """
    data = request.get_json()
    content = data.get('content', '')
    prompt = data.get('prompt', '')
    style = data.get('style', 'academic')
    
    if not content and not prompt:
        return jsonify({'error': 'Content or prompt is required'}), 400
    
    if not model:
        return jsonify({'error': 'AI service unavailable'}), 503
    
    # Create context-aware completion prompt
    completion_prompt = f"""
    As an expert academic writing assistant, help complete or improve the following text:
    
    Current Content:
    {content}
    
    User Request: {prompt}
    Writing Style: {style}
    
    Please provide:
    1. A natural continuation or improvement of the text
    2. Maintain academic rigor and appropriate tone
    3. Ensure factual accuracy and proper structure
    4. Include relevant technical terminology when appropriate
    
    Provide only the suggested completion or improvement, not commentary.
    """
    
    try:
        response = model.generate_content(completion_prompt)
        
        result = {
            'success': True,
            'completion': response.text,
            'original_length': len(content),
            'completion_length': len(response.text),
            'timestamp': datetime.utcnow().isoformat()
        }
        
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Completion error: {e}")
        return jsonify({
            'error': 'Writing assistance temporarily unavailable',
            'success': False
        }), 503

@app.route('/api/analyze', methods=['POST'])
@handle_errors
@exponential_backoff()
def document_analysis():
    """
    Comprehensive document structure and style analysis
    """
    data = request.get_json()
    content = data.get('content', '')
    analysis_type = data.get('type', 'comprehensive')
    
    if not content:
        return jsonify({'error': 'Content is required'}), 400
    
    if not model:
        return jsonify({'error': 'AI service unavailable'}), 503
    
    # Create detailed analysis prompt
    analysis_prompt = f"""
    As an expert academic editor and writing analyst, provide a comprehensive analysis of the following document:
    
    Document Content:
    {content}
    
    Please analyze and provide structured feedback on:
    
    1. STRUCTURE ANALYSIS:
       - Document organization and flow
       - Paragraph transitions and coherence
       - Argument progression and logic
       - Introduction, body, and conclusion effectiveness
    
    2. STYLE AND CLARITY:
       - Writing clarity and readability
       - Sentence structure variety and complexity
       - Academic tone and voice consistency
       - Technical terminology usage
    
    3. CONTENT QUALITY:
       - Argument strength and evidence support
       - Factual accuracy and credibility
       - Research depth and breadth
       - Citation and reference quality
    
    4. IMPROVEMENT SUGGESTIONS:
       - Specific recommendations for enhancement
       - Areas needing additional research or support
       - Structural reorganization suggestions
       - Style and clarity improvements
    
    5. METRICS:
       - Estimated reading level
       - Word count and paragraph distribution
       - Sentence complexity analysis
       - Overall quality score (1-10)
    
    Provide your analysis in a structured format with actionable recommendations.
    """
    
    try:
        response = model.generate_content(analysis_prompt)
        
        # Extract key metrics
        word_count = len(content.split())
        paragraph_count = len([p for p in content.split('\n\n') if p.strip()])
        
        result = {
            'success': True,
            'analysis': response.text,
            'metrics': {
                'word_count': word_count,
                'paragraph_count': paragraph_count,
                'character_count': len(content),
                'estimated_reading_time': max(1, word_count // 200)  # 200 WPM average
            },
            'timestamp': datetime.utcnow().isoformat()
        }
        
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Analysis error: {e}")
        return jsonify({
            'error': 'Analysis service temporarily unavailable',
            'success': False
        }), 503

@app.route('/api/plagiarism', methods=['POST'])
@handle_errors
@exponential_backoff()
def plagiarism_check():
    """
    Simulated plagiarism detection using AI analysis
    """
    data = request.get_json()
    content = data.get('content', '')
    
    if not content:
        return jsonify({'error': 'Content is required'}), 400
    
    if not model:
        return jsonify({'error': 'AI service unavailable'}), 503
    
    # Create plagiarism analysis prompt
    plagiarism_prompt = f"""
    As a plagiarism detection expert, analyze the following text for potential originality issues:
    
    Content to analyze:
    {content}
    
    Start your response with exactly one line of the form "RISK: low", "RISK: medium" or "RISK: high",
    describing how likely the text contains passages that need a citation or quotation marks.

    Then provide:
    1. Overall originality assessment
    2. Identification of potentially problematic phrases or sentences
    3. Common knowledge vs. specific claims analysis
    4. Writing style consistency evaluation
    5. Recommendations for improving originality
    
    Format your response as a structured report with specific findings and actionable recommendations.
    Note: This is a preliminary assessment and should be supplemented with dedicated plagiarism detection tools.
    """
    
    try:
        response = model.generate_content(plagiarism_prompt)
        
        import re
        match = re.search(r'RISK:\s*(low|medium|high)', response.text, re.IGNORECASE)
        risk_level = match.group(1).lower() if match else 'unknown'
        analysis_text = re.sub(r'^\s*RISK:.*\n?', '', response.text, count=1, flags=re.IGNORECASE)

        result = {
            'success': True,
            'similarity_score': None,
            'risk_level': risk_level,
            'analysis': analysis_text,
            'flagged_segments': extract_flagged_segments(content, response.text),
            'recommendations': extract_recommendations(response.text),
            'timestamp': datetime.utcnow().isoformat(),
            'disclaimer': 'AI review of citation risk, not a database comparison. Use a dedicated plagiarism checker before submission.'
        }
        
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Plagiarism check error: {e}")
        return jsonify({
            'error': 'Plagiarism check temporarily unavailable',
            'success': False
        }), 503

@app.route('/api/asset-analysis', methods=['POST'])
@handle_errors
@exponential_backoff()
def asset_analysis():
    """
    Analyze linked research assets (papers, datasets)
    """
    data = request.get_json()
    asset_type = data.get('type', 'paper')  # 'paper' or 'dataset'
    asset_content = data.get('content', '')
    analysis_focus = data.get('focus', 'summary')
    
    if not asset_content:
        return jsonify({'error': 'Asset content is required'}), 400
    
    if not model:
        return jsonify({'error': 'AI service unavailable'}), 503
    
    if asset_type == 'paper':
        analysis_prompt = f"""
        As a research paper analyst, analyze the following academic paper:
        
        Paper Content:
        {asset_content[:3000]}...
        
        Provide a comprehensive analysis including:
        1. EXECUTIVE SUMMARY: Key findings and contributions
        2. METHODOLOGY: Research approach and experimental design
        3. KEY RESULTS: Main findings with specific data points
        4. SIGNIFICANCE: Impact and relevance to the field
        5. LIMITATIONS: Identified weaknesses or constraints
        6. FUTURE WORK: Suggested research directions
        7. CITATIONS: Key references and their relevance
        8. REPRODUCIBILITY: Assessment of method replicability
        
        Focus on extracting actionable insights and quantitative results.
        """
    else:  # dataset
        analysis_prompt = f"""
        As a data analyst, analyze the following dataset description and contents:
        
        Dataset Information:
        {asset_content[:3000]}...
        
        Provide analysis including:
        1. DATA OVERVIEW: Structure, format, and scope
        2. KEY STATISTICS: Size, variables, distributions
        3. DATA QUALITY: Completeness, accuracy, consistency
        4. POTENTIAL APPLICATIONS: Research use cases
        5. LIMITATIONS: Data constraints and biases
        6. PREPROCESSING NEEDS: Required data cleaning steps
        7. INTEGRATION OPPORTUNITIES: Compatibility with other datasets
        8. ETHICAL CONSIDERATIONS: Privacy and usage constraints
        
        Focus on practical insights for research applications.
        """
    
    try:
        response = model.generate_content(analysis_prompt)
        
        result = {
            'success': True,
            'asset_type': asset_type,
            'analysis': response.text,
            'key_insights': extract_key_insights(response.text),
            'quantitative_data': extract_quantitative_data(response.text),
            'timestamp': datetime.utcnow().isoformat()
        }
        
        # Store analysis for future reference
        if db:
            store_asset_analysis(asset_type, asset_content, result)
        
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Asset analysis error: {e}")
        return jsonify({
            'error': 'Asset analysis temporarily unavailable',
            'success': False
        }), 503

# Helper Functions

def extract_sources_from_response(text: str) -> List[str]:
    """Extract potential source citations from response text"""
    import re
    # Simple pattern to find URLs, DOIs, and citation patterns
    url_pattern = r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+'
    doi_pattern = r'10\.\d{4,}\/[-._;()\/:A-Za-z0-9]+'
    
    sources = []
    sources.extend(re.findall(url_pattern, text))
    sources.extend([f"DOI: {doi}" for doi in re.findall(doi_pattern, text)])
    
    return list(set(sources))  # Remove duplicates

def extract_flagged_segments(content: str, analysis: str) -> List[Dict]:
    """Extract flagged text segments from plagiarism analysis"""
    # Simplified extraction - in a real implementation, this would be more sophisticated
    segments = []
    sentences = content.split('.')
    
    # Look for potentially problematic sentences (longer, more complex)
    for i, sentence in enumerate(sentences):
        if len(sentence.strip()) > 100 and '"' in sentence:
            segments.append({
                'text': sentence.strip(),
                'position': i,
                'risk_level': 'medium',
                'reason': 'Contains quotations or complex phrasing'
            })
    
    return segments[:5]  # Return top 5 flagged segments

def extract_recommendations(analysis: str) -> List[str]:
    """Extract recommendations from analysis text"""
    recommendations = []
    lines = analysis.split('\n')
    
    for line in lines:
        if any(keyword in line.lower() for keyword in ['recommend', 'suggest', 'should', 'consider']):
            recommendations.append(line.strip())
    
    return recommendations[:10]  # Return top 10 recommendations

def extract_key_insights(analysis: str) -> List[str]:
    """Extract key insights from analysis text"""
    insights = []
    lines = analysis.split('\n')
    
    for line in lines:
        if any(keyword in line.lower() for keyword in ['finding', 'result', 'conclusion', 'significant']):
            if len(line.strip()) > 20:  # Only meaningful insights
                insights.append(line.strip())
    
    return insights[:8]  # Return top 8 insights

def extract_quantitative_data(analysis: str) -> List[Dict]:
    """Extract quantitative data points from analysis"""
    import re
    
    # Pattern to find numbers with units or percentages
    number_pattern = r'(\d+(?:\.\d+)?)\s*(%|samples?|participants?|years?|minutes?|hours?|days?|weeks?|months?)'
    
    matches = re.findall(number_pattern, analysis, re.IGNORECASE)
    quantitative_data = []
    
    for value, unit in matches:
        quantitative_data.append({
            'value': float(value),
            'unit': unit.lower(),
            'context': f"{value} {unit}"
        })
    
    return quantitative_data[:10]  # Return top 10 data points

def log_search_query(query: str, context: str, result: Dict):
    """Log search query for analytics"""
    try:
        if db:
            doc_ref = db.collection('search_logs').document()
            doc_ref.set({
                'query': query,
                'context_length': len(context),
                'result_length': len(result.get('answer', '')),
                'timestamp': datetime.utcnow(),
                'success': result.get('success', False)
            })
    except Exception as e:
        logger.error(f"Failed to log search query: {e}")

def store_asset_analysis(asset_type: str, content: str, analysis: Dict):
    """Store asset analysis for future reference"""
    try:
        if db:
            doc_ref = db.collection('asset_analyses').document()
            doc_ref.set({
                'asset_type': asset_type,
                'content_hash': hash(content[:1000]),  # Hash for privacy
                'analysis': analysis,
                'timestamp': datetime.utcnow()
            })
    except Exception as e:
        logger.error(f"Failed to store asset analysis: {e}")

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(405)
def method_not_allowed(error):
    return jsonify({'error': 'Method not allowed'}), 405

@app.errorhandler(500)
def internal_error(error):
    logger.error(f"Internal server error: {error}")
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('FLASK_ENV') == 'development'
    
    logger.info(f"Starting Open Research Nexus API server on port {port}")
    logger.info(f"Debug mode: {debug}")
    logger.info(f"Firebase initialized: {db is not None}")
    logger.info(f"AI model: {getattr(model, 'provider', None)} {getattr(model, 'model_name', None)}")
    
    app.run(host='0.0.0.0', port=port, debug=debug)