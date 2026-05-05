
from flask import Flask, jsonify, request, send_file
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flasgger import Swagger
import os
import uuid
from datetime import datetime
from werkzeug.utils import secure_filename
from io import BytesIO
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer

from utils.document_processor import (
    extract_text_from_file,
    extract_criteria_from_tender_text,
    parse_bidder_facts,
    evaluate_bidder,
    classify_document,
)

UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), 'uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
# SQLite DB config
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///nyayai.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
CORS(app, resources={r"/*": {"origins": "https://nyay-ai-project.vercel.app"}})
db = SQLAlchemy(app)
Swagger(app)

# --- Database Models ---
class Evaluation(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    evaluation_id = db.Column(db.String, unique=True, nullable=False)
    tender = db.Column(db.String)
    bidders = db.Column(db.String)  # Comma-separated for simplicity
    created_at = db.Column(db.String)

class Bidder(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    evaluation_id = db.Column(db.String, db.ForeignKey('evaluation.evaluation_id'))
    name = db.Column(db.String)
    status = db.Column(db.String)

class Audit(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    evaluation_id = db.Column(db.String, db.ForeignKey('evaluation.evaluation_id'))
    time = db.Column(db.String)
    action = db.Column(db.String)
    details = db.Column(db.String)

# To create tables, run once in Python shell:
# >>> from app import db
# >>> db.create_all()

EVALUATIONS = {}

BLACKLISTED_VENDORS = [
    {'name': 'ABC Contractors Pvt Ltd', 'gstin': '27ABCDE1234F2Z5'},
    {'name': 'Xenon Infrastructure', 'gstin': '07ABCDE1234F2Z5'},
    {'name': 'Vigilance Systems', 'gstin': '09ABCDE1234F2Z5'}
]

EXTRACTION_ENGINE_METADATA = {
    'engine': 'local-parser-ocr',
    'version': '1.0',
    'description': 'Regex-based extraction with OCR fallback'
}


def create_evaluation_id():
    return str(uuid.uuid4())


def compute_overall_status(details):
    if any(detail['result'] == 'Fail' for detail in details):
        return 'Not Eligible'
    if any(detail['result'] in ['Review', 'Need Manual Review'] for detail in details):
        return 'Need Manual Review'
    return 'Eligible'


def add_audit_entry(evaluation, action, details=None, actor=None, metadata=None):
    if 'audit' not in evaluation:
        evaluation['audit'] = []
    entry = {
        'time': datetime.utcnow().isoformat() + 'Z',
        'action': action,
        'details': details or {}
    }
    if actor:
        entry['actor'] = actor
    if metadata:
        entry['metadata'] = metadata
    evaluation['audit'].append(entry)


def find_blacklist_matches(text, filename):
    normalized = (text or '').lower() + ' ' + (filename or '').lower()
    matches = []
    for vendor in BLACKLISTED_VENDORS:
        if vendor['gstin'].lower() in normalized or vendor['name'].lower() in normalized:
            matches.append(vendor)
    return matches


@app.route('/')
def home():
        """
        Home endpoint
        ---
        responses:
            200:
                description: Backend is running
        """
        return jsonify({'message': 'Backend is running'})


def save_file(file, prefix):
    filename = secure_filename(file.filename)
    save_name = f"{prefix}_{filename}"
    save_path = os.path.join(app.config['UPLOAD_FOLDER'], save_name)
    file.save(save_path)
    return save_name


@app.route('/upload/tender', methods=['POST'])
def upload_tender():
    if 'file' not in request.files:
        return jsonify({'success': False, 'error': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'success': False, 'error': 'No selected file'}), 400
    filename = save_file(file, 'tender')
    return jsonify({'success': True, 'filename': filename})


@app.route('/upload/bidders', methods=['POST'])
def upload_bidders():
    if 'files' not in request.files:
        return jsonify({'success': False, 'error': 'No files part'}), 400
    files = request.files.getlist('files')
    saved = []
    for file in files:
        if file and file.filename:
            filename = save_file(file, 'bidder')
            saved.append(filename)
    if not saved:
        return jsonify({'success': False, 'error': 'No files uploaded'}), 400
    return jsonify({'success': True, 'filenames': saved})


@app.route('/evaluate', methods=['POST'])
def evaluate():
    """
    Evaluate bidders against tender
    ---
    consumes:
      - application/json
    parameters:
      - in: body
        name: body
        schema:
          type: object
          properties:
            tender:
              type: string
            bidders:
              type: array
              items:
                type: string
    responses:
      200:
        description: Evaluation result returned
    """
    payload = request.get_json(silent=True) or {}
    tender_file = payload.get('tender')
    bidder_files = payload.get('bidders', [])

    if not tender_file or not bidder_files:
        return jsonify({'success': False, 'error': 'Tender and bidder file names are required'}), 400

    tender_path = os.path.join(app.config['UPLOAD_FOLDER'], tender_file)
    tender_text = ''
    try:
        tender_text = extract_text_from_file(tender_path)
    except Exception:
        tender_text = ''

    criteria = extract_criteria_from_tender_text(tender_text)

    evaluations = []
    bidder_previews = []
    for bidder_filename in bidder_files:
        bidder_path = os.path.join(app.config['UPLOAD_FOLDER'], bidder_filename)
        bidder_text = ''
        try:
            bidder_text = extract_text_from_file(bidder_path)
        except Exception:
            bidder_text = ''
        bidder_facts = parse_bidder_facts(bidder_text)
        bidder_eval = evaluate_bidder(criteria, bidder_facts, bidder_filename)
        bidder_eval['document_preview'] = bidder_text[:320]
        bidder_eval['full_document_text'] = bidder_text  # Store full text for evidence viewer
        bidder_eval['document_type'] = classify_document(bidder_text)
        blacklist_matches = find_blacklist_matches(bidder_text, bidder_filename)
        bidder_eval['blacklist_flag'] = bool(blacklist_matches)
        bidder_eval['blacklist_matches'] = blacklist_matches
        evaluations.append(bidder_eval)
        bidder_previews.append({
            'bidder': bidder_filename,
            'preview': bidder_text[:240]
        })

    evaluation_id = create_evaluation_id()
    evaluation = {
        'evaluation_id': evaluation_id,
        'tender': tender_file,
        'bidders': bidder_files,
        'criteria': criteria,
        'evaluations': evaluations,
        'tender_preview': tender_text[:600],
        'bidder_previews': bidder_previews,
        'tender_type': classify_document(tender_text),
        'audit': [],
        'created_at': datetime.utcnow().isoformat() + 'Z',
        'system_metadata': EXTRACTION_ENGINE_METADATA
    }
    add_audit_entry(
        evaluation,
        'evaluation_created',
        {'tender': tender_file, 'bidder_count': len(bidder_files), 'blacklist_alerts': sum(1 for ev in evaluations if ev.get('blacklist_flag'))},
        actor='AI',
        metadata=EXTRACTION_ENGINE_METADATA
    )
    if any(ev.get('blacklist_flag') for ev in evaluations):
        add_audit_entry(
            evaluation,
            'blacklist_check',
            {'blacklist_matches': [ev['blacklist_matches'] for ev in evaluations if ev.get('blacklist_flag')]},
            actor='AI'
        )
    EVALUATIONS[evaluation_id] = evaluation

    return jsonify({
        'success': True,
        'evaluation_id': evaluation_id,
        'evaluation': evaluation
    })


@app.route('/evaluations', methods=['GET'])
def list_evaluations():
    evaluations = [
        {
            'evaluation_id': eid,
            'tender': value['tender'],
            'created_at': value['created_at'],
            'bidder_count': len(value['bidders']),
            'status_counts': {
                'Eligible': sum(1 for item in value['evaluations'] if item['status'] == 'Eligible'),
                'Not Eligible': sum(1 for item in value['evaluations'] if item['status'] == 'Not Eligible'),
                'Need Manual Review': sum(1 for item in value['evaluations'] if item['status'] == 'Need Manual Review')
            },
            'blacklist_alerts': sum(1 for item in value['evaluations'] if item.get('blacklist_flag')),
            'audit_count': len(value.get('audit', []))
        }
        for eid, value in EVALUATIONS.items()
    ]
    return jsonify({'success': True, 'evaluations': evaluations})


@app.route('/evaluation/<evaluation_id>', methods=['GET'])
def get_evaluation(evaluation_id):
    evaluation = EVALUATIONS.get(evaluation_id)
    if not evaluation:
        return jsonify({'success': False, 'error': 'Evaluation not found'}), 404
    return jsonify({'success': True, 'evaluation': evaluation})


@app.route('/evaluation/<evaluation_id>/criteria', methods=['POST'])
def update_criteria(evaluation_id):
    payload = request.get_json(silent=True) or {}
    new_criteria = payload.get('criteria')
    if not isinstance(new_criteria, list):
        return jsonify({'success': False, 'error': 'Criteria list is required'}), 400

    evaluation = EVALUATIONS.get(evaluation_id)
    if not evaluation:
        return jsonify({'success': False, 'error': 'Evaluation not found'}), 404

    evaluation['criteria'] = new_criteria
    add_audit_entry(evaluation, 'criteria_updated', {'criteria_count': len(new_criteria)}, actor='User')
    return jsonify({'success': True, 'evaluation': evaluation})


@app.route('/review', methods=['POST'])
def review():
    payload = request.get_json(silent=True) or {}
    evaluation_id = payload.get('evaluation_id')
    bidder = payload.get('bidder')
    criterion_id = payload.get('criterion_id')
    decision = payload.get('decision')

    evaluation = EVALUATIONS.get(evaluation_id)
    if not evaluation:
        return jsonify({'success': False, 'error': 'Evaluation not found'}), 404
    if not bidder or not criterion_id or decision not in ['pass', 'fail']:
        return jsonify({'success': False, 'error': 'bidder, criterion_id, and valid decision are required'}), 400

    modified = False
    for item in evaluation['evaluations']:
        if item['bidder'] != bidder:
            continue
        for detail in item['details']:
            if detail['criterion_id'] != criterion_id:
                continue
            detail['result'] = 'Pass' if decision == 'pass' else 'Fail'
            detail['evidence'] = f"{detail.get('evidence', '')} (review override)"
            detail['reviewed'] = True
            modified = True
        if modified:
            item['status'] = compute_overall_status(item['details'])
            item['score'] = sum(25 for d in item['details'] if d['result'] == 'Pass')
            item['last_updated'] = datetime.utcnow().isoformat() + 'Z'
            break

    if not modified:
        return jsonify({'success': False, 'error': 'Matching bidder or criterion not found'}), 404

    evaluation['last_reviewed'] = datetime.utcnow().isoformat() + 'Z'
    add_audit_entry(evaluation, 'review_override', {'bidder': bidder, 'criterion_id': criterion_id, 'decision': decision}, actor='User')
    return jsonify({'success': True, 'evaluation': evaluation})


@app.route('/evaluation/<evaluation_id>/audit/pdf', methods=['GET'])
def download_audit_pdf(evaluation_id):
    evaluation = EVALUATIONS.get(evaluation_id)
    if not evaluation:
        return jsonify({'success': False, 'error': 'Evaluation not found'}), 404

    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter)
    styles = getSampleStyleSheet()
    story = []

    story.append(Paragraph(f"Audit Trail for Evaluation {evaluation_id}", styles['Title']))
    story.append(Spacer(1, 12))

    for entry in evaluation.get('audit', []):
        time = entry['time']
        action = entry['action']
        details = entry['details']
        story.append(Paragraph(f"Time: {time}", styles['Normal']))
        story.append(Paragraph(f"Action: {action}", styles['Normal']))
        if details:
            story.append(Paragraph(f"Details: {details}", styles['Normal']))
        story.append(Spacer(1, 12))

    doc.build(story)
    buffer.seek(0)

    return send_file(buffer, as_attachment=True, download_name=f"audit_{evaluation_id}.pdf", mimetype='application/pdf')


@app.route('/summary/pdf', methods=['GET'])
def download_summary_pdf():

    evaluations = list(EVALUATIONS.values())
    total_evaluations = len(evaluations)
    total_bidders = sum(len(ev['bidders']) for ev in evaluations)

    status_totals = {'Eligible': 0, 'Not Eligible': 0, 'Need Manual Review': 0}
    for ev in evaluations:
        for item in ev.get('evaluations', []):
            status = item.get('status')
            if status in status_totals:
                status_totals[status] += 1

    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter)
    styles = getSampleStyleSheet()
    story = []

    story.append(Paragraph("Evaluation Summary Report", styles['Title']))
    story.append(Spacer(1, 12))
    story.append(Paragraph(f"Generated on: {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC')}", styles['Normal']))
    story.append(Spacer(1, 12))

    story.append(Paragraph("Overall Statistics", styles['Heading2']))
    story.append(Spacer(1, 12))
    story.append(Paragraph(f"Total Evaluations: {total_evaluations}", styles['Normal']))
    story.append(Paragraph(f"Total Bidders Evaluated: {total_bidders}", styles['Normal']))
    story.append(Paragraph(f"Eligible Bidders: {status_totals['Eligible']}", styles['Normal']))
    story.append(Paragraph(f"Not Eligible Bidders: {status_totals['Not Eligible']}", styles['Normal']))
    story.append(Paragraph(f"Bidders Needing Manual Review: {status_totals['Need Manual Review']}", styles['Normal']))
    story.append(Spacer(1, 12))

    if evaluations:
        story.append(Paragraph("Recent Evaluations", styles['Heading2']))
        story.append(Spacer(1, 12))
        for ev in sorted(evaluations, key=lambda x: x['created_at'], reverse=True)[:10]:  # Last 10
            story.append(Paragraph(f"ID: {ev['evaluation_id'][:8]} - Tender: {ev['tender']} - Bidders: {len(ev['bidders'])} - Created: {ev['created_at'][:10]}", styles['Normal']))
            story.append(Spacer(1, 6))

    doc.build(story)
    buffer.seek(0)

    return send_file(buffer, as_attachment=True, download_name="evaluation_summary.pdf", mimetype='application/pdf')


@app.route('/evaluation/<evaluation_id>', methods=['DELETE'])
def delete_evaluation(evaluation_id):
    if evaluation_id in EVALUATIONS:
        del EVALUATIONS[evaluation_id]
        return jsonify({'success': True, 'message': 'Evaluation deleted'})
    return jsonify({'success': False, 'error': 'Evaluation not found'}), 404


if __name__ == '__main__':
    app.run(debug=True)
