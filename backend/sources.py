"""
Free sources for both sides of the platform, proxied so keys stay on the
server and the browser never depends on third-party CORS:

  Research  OpenAlex      works, citations, references, trends, authors
  Stories   Open Library  books, comparable titles, subjects
            Gutendex      public-domain classics (Project Gutenberg)
            Datamuse      synonyms, rhymes, descriptive words
  Both      Groq Whisper  dictation (speech to text)
"""
import os
import logging
from datetime import date
from typing import Any, Dict, List, Optional

import requests
from flask import Blueprint, jsonify, request

logger = logging.getLogger(__name__)
sources_bp = Blueprint('sources', __name__)

OPENALEX_URL = os.getenv('OPENALEX_URL', 'https://api.openalex.org').rstrip('/')
OPENLIBRARY_URL = os.getenv('OPENLIBRARY_URL', 'https://openlibrary.org').rstrip('/')
GUTENDEX_URL = os.getenv('GUTENDEX_URL', 'https://gutendex.com').rstrip('/')
DATAMUSE_URL = os.getenv('DATAMUSE_URL', 'https://api.datamuse.com').rstrip('/')
GROQ_BASE_URL = os.getenv('GROQ_BASE_URL', 'https://api.groq.com/openai/v1').rstrip('/')
WHISPER_MODEL = os.getenv('WHISPER_MODEL', 'whisper-large-v3-turbo')

# Open Library asks apps to identify themselves. Generic on purpose.
HEADERS = {'User-Agent': 'OpenResearchNexus/1.0 (open-source research and writing platform)'}
TIMEOUT = 20

WORK_FIELDS = (
    'id,doi,display_name,publication_year,publication_date,type,authorships,primary_location,'
    'cited_by_count,open_access,primary_topic,abstract_inverted_index'
)


def _get(url: str, params: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    res = requests.get(url, params=params or {}, headers=HEADERS, timeout=TIMEOUT)
    res.raise_for_status()
    return res.json()


def _fail(e: Exception, what: str):
    logger.error(f"{what} failed: {e}")
    return jsonify({'success': False, 'error': f'{what} is unavailable right now'}), 502


# --------------------------------------------------------------- OpenAlex

def _openalex(path: str, params: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    params = dict(params or {})
    if os.getenv('OPENALEX_API_KEY'):
        params['api_key'] = os.getenv('OPENALEX_API_KEY')
    return _get(f"{OPENALEX_URL}{path}", params)


def _short_id(value: Optional[str]) -> Optional[str]:
    return value.rsplit('/', 1)[-1] if value else None


def rebuild_abstract(inverted: Optional[Dict[str, List[int]]]) -> str:
    if not inverted:
        return ''
    positions = [(pos, word) for word, poss in inverted.items() for pos in poss]
    return ' '.join(word for _, word in sorted(positions))


def shape_work(w: Dict[str, Any], abstract_chars: int = 0) -> Dict[str, Any]:
    authors = [
        {'id': _short_id((a.get('author') or {}).get('id')), 'name': (a.get('author') or {}).get('display_name')}
        for a in (w.get('authorships') or [])
    ]
    authors = [a for a in authors if a['name']]
    loc = w.get('primary_location') or {}
    oa = w.get('open_access') or {}
    topic = w.get('primary_topic') or {}
    shaped = {
        'id': _short_id(w.get('id')),
        'title': w.get('display_name') or 'Untitled',
        'year': w.get('publication_year'),
        'date': w.get('publication_date'),
        'type': w.get('type'),
        'authors': authors[:6],
        'author_count': len(authors),
        'venue': (loc.get('source') or {}).get('display_name'),
        'doi': w.get('doi'),
        'url': w.get('doi') or w.get('id'),
        'cited_by': w.get('cited_by_count', 0),
        'is_oa': bool(oa.get('is_oa')),
        'oa_url': oa.get('oa_url'),
        'topic': topic.get('display_name'),
        'field': ((topic.get('field') or {}).get('display_name')),
    }
    if abstract_chars:
        shaped['abstract'] = rebuild_abstract(w.get('abstract_inverted_index'))[:abstract_chars]
    return shaped


@sources_bp.route('/api/scholar/works', methods=['GET'])
def scholar_works():
    """Search works with filters: q, from, to, oa, type, sort, page."""
    q = request.args.get('q', '').strip()
    if not q:
        return jsonify({'success': False, 'error': 'q is required'}), 400
    filters = []
    y_from, y_to = request.args.get('from'), request.args.get('to')
    if y_from or y_to:
        filters.append(f"publication_year:{y_from or 1900}-{y_to or date.today().year}")
    if request.args.get('oa') == '1':
        filters.append('open_access.is_oa:true')
    if request.args.get('type') in ('article', 'review', 'preprint', 'book', 'dataset'):
        filters.append(f"type:{request.args['type']}")
    sort = {'cited': 'cited_by_count:desc', 'newest': 'publication_date:desc'}.get(request.args.get('sort'))
    params = {'search': q, 'per_page': 15, 'page': max(1, int(request.args.get('page', 1))), 'select': WORK_FIELDS}
    if filters:
        params['filter'] = ','.join(filters)
    if sort:
        params['sort'] = sort
    try:
        data = _openalex('/works', params)
        return jsonify({
            'success': True,
            'count': (data.get('meta') or {}).get('count', 0),
            'results': [shape_work(w, 320) for w in data.get('results', [])],
        })
    except Exception as e:
        return _fail(e, 'OpenAlex search')


def _titles_for(ids: List[str], limit: int) -> List[Dict[str, Any]]:
    ids = [_short_id(i) for i in ids if i][:limit]
    if not ids:
        return []
    data = _openalex('/works', {
        'filter': f"ids.openalex:{'|'.join(ids)}",
        'per_page': limit,
        'select': 'id,doi,display_name,publication_year,authorships,primary_location,cited_by_count,open_access,primary_topic,type,publication_date',
    })
    return [shape_work(w) for w in data.get('results', [])]


@sources_bp.route('/api/scholar/works/<work_id>', methods=['GET'])
def scholar_work(work_id: str):
    """One work with its references, related works and citations per year."""
    try:
        w = _openalex(f"/works/{work_id}")
        detail = shape_work(w, 3000)
        detail['counts_by_year'] = sorted(
            [{'year': c['year'], 'count': c['cited_by_count']} for c in (w.get('counts_by_year') or [])],
            key=lambda c: c['year'],
        )
        detail['reference_count'] = len(w.get('referenced_works') or [])
        detail['references'] = _titles_for(w.get('referenced_works') or [], 12)
        detail['related'] = _titles_for(w.get('related_works') or [], 6)
        detail['keywords'] = [k.get('display_name') for k in (w.get('keywords') or [])][:8]
        return jsonify({'success': True, 'work': detail})
    except Exception as e:
        return _fail(e, 'OpenAlex work lookup')


@sources_bp.route('/api/scholar/works/<work_id>/cited-by', methods=['GET'])
def scholar_cited_by(work_id: str):
    """Works citing this one, newest first. ?since=YYYY-MM-DD for alerts."""
    filters = [f"cites:{work_id}"]
    if request.args.get('since'):
        filters.append(f"from_publication_date:{request.args['since']}")
    try:
        data = _openalex('/works', {
            'filter': ','.join(filters), 'sort': 'publication_date:desc', 'per_page': 15, 'select': WORK_FIELDS,
        })
        return jsonify({
            'success': True,
            'count': (data.get('meta') or {}).get('count', 0),
            'results': [shape_work(w, 240) for w in data.get('results', [])],
        })
    except Exception as e:
        return _fail(e, 'OpenAlex citations')


@sources_bp.route('/api/scholar/trend', methods=['GET'])
def scholar_trend():
    """How many works match a query, per publication year."""
    q = request.args.get('q', '').strip()
    if not q:
        return jsonify({'success': False, 'error': 'q is required'}), 400
    this_year = date.today().year
    try:
        data = _openalex('/works', {
            'search': q, 'filter': f"publication_year:{this_year - 24}-{this_year}", 'group_by': 'publication_year',
        })
        years = sorted(
            [{'year': int(g['key']), 'count': g['count']} for g in data.get('group_by', []) if str(g.get('key', '')).isdigit()],
            key=lambda g: g['year'],
        )
        return jsonify({'success': True, 'years': years})
    except Exception as e:
        return _fail(e, 'OpenAlex trend')


def shape_author(a: Dict[str, Any]) -> Dict[str, Any]:
    insts = a.get('last_known_institutions') or ([a['last_known_institution']] if a.get('last_known_institution') else [])
    return {
        'id': _short_id(a.get('id')),
        'name': a.get('display_name'),
        'orcid': a.get('orcid'),
        'works': a.get('works_count', 0),
        'cited_by': a.get('cited_by_count', 0),
        'h_index': (a.get('summary_stats') or {}).get('h_index'),
        'institution': (insts[0] or {}).get('display_name') if insts else None,
        'topics': [t.get('display_name') for t in (a.get('topics') or [])][:5],
    }


@sources_bp.route('/api/scholar/authors', methods=['GET'])
def scholar_authors():
    q = request.args.get('q', '').strip()
    if not q:
        return jsonify({'success': False, 'error': 'q is required'}), 400
    try:
        data = _openalex('/authors', {'search': q, 'per_page': 8})
        return jsonify({'success': True, 'results': [shape_author(a) for a in data.get('results', [])]})
    except Exception as e:
        return _fail(e, 'OpenAlex authors')


@sources_bp.route('/api/scholar/authors/<author_id>', methods=['GET'])
def scholar_author(author_id: str):
    try:
        a = _openalex(f"/authors/{author_id}")
        works = _openalex('/works', {
            'filter': f"author.id:{author_id}", 'sort': 'cited_by_count:desc', 'per_page': 10, 'select': WORK_FIELDS,
        })
        profile = shape_author(a)
        profile['top_works'] = [shape_work(w) for w in works.get('results', [])]
        profile['counts_by_year'] = sorted(
            [{'year': c['year'], 'count': c.get('works_count', 0)} for c in (a.get('counts_by_year') or [])],
            key=lambda c: c['year'],
        )
        return jsonify({'success': True, 'author': profile})
    except Exception as e:
        return _fail(e, 'OpenAlex author lookup')


# ------------------------------------------------------- Stories sources

def shape_book(d: Dict[str, Any]) -> Dict[str, Any]:
    cover = d.get('cover_i') or d.get('cover_id')
    authors = d.get('author_name') or [a.get('name') for a in (d.get('authors') or []) if a.get('name')]
    return {
        'id': (d.get('key') or '').rsplit('/', 1)[-1],
        'title': d.get('title'),
        'authors': authors[:3],
        'year': d.get('first_publish_year'),
        'subjects': (d.get('subject') or [])[:6],
        'editions': d.get('edition_count'),
        'cover': f"https://covers.openlibrary.org/b/id/{cover}-M.jpg" if cover else None,
        'url': f"https://openlibrary.org{d.get('key')}" if d.get('key') else None,
    }


def openlibrary_books(q: str = '', subject: str = '', limit: int = 12) -> List[Dict[str, Any]]:
    params = {'limit': limit, 'fields': 'key,title,author_name,first_publish_year,cover_i,subject,edition_count'}
    if q:
        params['q'] = q
    if subject:
        params['subject'] = subject
    data = _get(f"{OPENLIBRARY_URL}/search.json", params)
    return [shape_book(d) for d in data.get('docs', [])]


@sources_bp.route('/api/stories/books', methods=['GET'])
def stories_books():
    q, subject = request.args.get('q', '').strip(), request.args.get('subject', '').strip()
    if not q and not subject:
        return jsonify({'success': False, 'error': 'q or subject is required'}), 400
    try:
        return jsonify({'success': True, 'results': openlibrary_books(q, subject)})
    except Exception as e:
        return _fail(e, 'Open Library')


@sources_bp.route('/api/stories/classics', methods=['GET'])
def stories_classics():
    """Public-domain books from Project Gutenberg, via Gutendex."""
    params = {}
    if request.args.get('q'):
        params['search'] = request.args['q']
    if request.args.get('topic'):
        params['topic'] = request.args['topic']
    try:
        data = _get(f"{GUTENDEX_URL}/books", params)
        results = []
        for b in data.get('results', [])[:12]:
            formats = b.get('formats') or {}
            read = next((v for k, v in formats.items() if k.startswith('text/html')), None) or formats.get('text/plain; charset=utf-8')
            results.append({
                'id': b.get('id'),
                'title': b.get('title'),
                'authors': [a.get('name') for a in (b.get('authors') or [])][:2],
                'subjects': (b.get('subjects') or [])[:4],
                'downloads': b.get('download_count', 0),
                'cover': formats.get('image/jpeg'),
                'read_url': read,
                'url': f"https://www.gutenberg.org/ebooks/{b.get('id')}",
            })
        return jsonify({'success': True, 'results': results})
    except Exception as e:
        return _fail(e, 'Project Gutenberg')


WORD_MODES = {
    'syn': 'rel_syn',     # synonyms
    'rhyme': 'rel_rhy',   # perfect rhymes
    'adj': 'rel_jjb',     # adjectives often used to describe the noun
    'noun': 'rel_jja',    # nouns the adjective often describes
    'assoc': 'rel_trg',   # words associated with it
    'means': 'ml',        # means like / reverse dictionary
}


@sources_bp.route('/api/words', methods=['GET'])
def words():
    w = request.args.get('w', '').strip()
    mode = request.args.get('mode', 'syn')
    if not w or mode not in WORD_MODES:
        return jsonify({'success': False, 'error': 'w and a valid mode are required'}), 400
    try:
        data = _get(f"{DATAMUSE_URL}/words", {WORD_MODES[mode]: w, 'max': 40})
        return jsonify({'success': True, 'results': [d.get('word') for d in data if d.get('word')]})
    except Exception as e:
        return _fail(e, 'Datamuse')


# -------------------------------------------------------------- Dictation

@sources_bp.route('/api/transcribe', methods=['POST'])
def transcribe():
    """Speech to text with Whisper on Groq's free tier. Audio is not stored."""
    key = os.getenv('GROQ_API_KEY')
    if not key:
        return jsonify({'success': False, 'error': 'Dictation needs GROQ_API_KEY on the server'}), 503
    audio = request.files.get('audio')
    if not audio:
        return jsonify({'success': False, 'error': 'audio file is required'}), 400
    try:
        res = requests.post(
            f"{GROQ_BASE_URL}/audio/transcriptions",
            headers={'Authorization': f"Bearer {key}"},
            files={'file': (audio.filename or 'dictation.webm', audio.stream, audio.mimetype or 'audio/webm')},
            data={'model': WHISPER_MODEL, 'response_format': 'json', 'language': request.form.get('language', 'en')},
            timeout=60,
        )
        if res.status_code >= 400:
            raise RuntimeError(f"Groq {res.status_code}: {res.text[:200]}")
        return jsonify({'success': True, 'text': (res.json().get('text') or '').strip()})
    except Exception as e:
        return _fail(e, 'Dictation')
