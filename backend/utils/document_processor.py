import os
import re

try:
    import fitz
except ImportError:
    fitz = None

try:
    from docx import Document
except ImportError:
    Document = None

try:
    import pytesseract
    from PIL import Image
except ImportError:
    pytesseract = None
    Image = None

TEXT_EXTENSIONS = {'.txt', '.md'}
IMAGE_EXTENSIONS = {'.png', '.jpg', '.jpeg', '.tiff', '.bmp'}
PDF_EXTENSIONS = {'.pdf'}
DOCX_EXTENSIONS = {'.docx'}

AMOUNT_PATTERN = re.compile(r"₹?\s*([0-9,]+(?:\.[0-9]+)?)\s*(crore|cr|lakh|lac|million|mn)?", re.IGNORECASE)
PROJECT_PATTERN = re.compile(r"at least\s+(\d+)\s+(?:similar\s+)?projects|completed\s+(\d+)\s+similar\s+projects|\b(\d+)\s+similar\s+projects\b", re.IGNORECASE)
GST_PATTERN = re.compile(r"gst\s*registration|gst\s*number|gst\b", re.IGNORECASE)
ISO_PATTERN = re.compile(r"iso\s*9001|iso\s*9001:\d+|iso\s+9001\b", re.IGNORECASE)
MANDATORY_PATTERN = re.compile(r"\b(must|shall|required|mandatory|should)\b", re.IGNORECASE)
OPTIONAL_PATTERN = re.compile(r"\b(preferred|desirable|optional|may)\b", re.IGNORECASE)


def extract_text_from_file(filepath):
    if not os.path.isfile(filepath):
        return ''
    ext = os.path.splitext(filepath)[1].lower()
    try:
        if ext in TEXT_EXTENSIONS:
            text = _read_text_file(filepath)
        elif ext in PDF_EXTENSIONS:
            try:
                text = _extract_text_from_pdf(filepath)
            except Exception as e:
                print(f'PDF extraction failed for {filepath}: {e}')
                text = ''
        elif ext in DOCX_EXTENSIONS:
            try:
                text = _extract_text_from_docx(filepath)
            except Exception as e:
                print(f'DOCX extraction failed for {filepath}: {e}')
                text = ''
        elif ext in IMAGE_EXTENSIONS:
            try:
                text = _extract_text_from_image(filepath)
            except Exception as e:
                print(f'Image OCR failed for {filepath}: {e}')
                text = ''
        else:
            print(f'Unsupported file extension for {filepath}')
            text = ''
        if not text or not text.strip():
            print(f'Warning: No text extracted from {filepath}. File may be unreadable or empty.')
    except Exception as e:
        print(f'Critical error extracting text from {filepath}: {e}')
        text = ''
    print(f'Extracted text from {filepath}:', text[:200])  # Debug print
    return text


def _read_text_file(filepath):
    with open(filepath, 'r', encoding='utf-8', errors='ignore') as handle:
        return handle.read()


def _extract_text_from_pdf(path):
    if not fitz:
        raise RuntimeError('PyMuPDF is required to extract text from PDF files.')
    document = fitz.open(path)
    pages = []
    for page in document:
        text = page.get_text()
        if text.strip():
            pages.append(text)
        else:
            pages.append(_ocr_pdf_page(page))
    return '\n'.join(pages)


def _ocr_pdf_page(page):
    if not pytesseract or not Image:
        return ''
    pix = page.get_pixmap(alpha=False)
    image = Image.frombytes('RGB', [pix.width, pix.height], pix.samples)
    return pytesseract.image_to_string(image, lang='eng')


def _extract_text_from_docx(path):
    if not Document:
        raise RuntimeError('python-docx is required to extract text from DOCX files.')
    document = Document(path)
    return '\n'.join(paragraph.text for paragraph in document.paragraphs)


def _extract_text_from_image(path):
    if not pytesseract or not Image:
        raise RuntimeError('pytesseract and Pillow are required to extract text from images.')
    image = Image.open(path)
    return pytesseract.image_to_string(image, lang='eng')


def normalize_amount(value_text):
    if not value_text:
        return None
    value_text = value_text.replace(',', '').replace('₹', '').strip().lower()
    multiplier = 1
    if 'crore' in value_text or 'cr' in value_text:
        multiplier = 10000000
    elif 'lakh' in value_text or 'lac' in value_text:
        multiplier = 100000
    elif 'million' in value_text or 'mn' in value_text:
        multiplier = 1000000

    match = re.search(r'([0-9]+(?:\.[0-9]+)?)', value_text)
    if not match:
        return None
    return float(match.group(1)) * multiplier


def extract_criteria_from_tender_text(text):
    criteria = []
    found_turnover = _find_turnover_requirement(text)
    if found_turnover:
        criteria.append(found_turnover)

    found_projects = _find_project_requirement(text)
    if found_projects:
        criteria.append(found_projects)

    found_gst = _find_gst_requirement(text)
    if found_gst:
        criteria.append(found_gst)

    found_iso = _find_iso_requirement(text)
    if found_iso:
        criteria.append(found_iso)

    if not criteria:
        criteria = [
            {
                'id': 'C01',
                'text': 'Minimum annual turnover of ₹5 crore',
                'type': 'financial',
                'mandatory': True,
                'target': {'value': 50000000, 'operator': '>='}
            },
            {
                'id': 'C02',
                'text': 'At least 3 similar projects completed in the last 5 years',
                'type': 'experience',
                'mandatory': True,
                'target': {'value': 3, 'operator': '>='}
            },
            {
                'id': 'C03',
                'text': 'Valid GST registration',
                'type': 'compliance',
                'mandatory': True
            },
            {
                'id': 'C04',
                'text': 'ISO 9001 certification',
                'type': 'certification',
                'mandatory': False
            }
        ]
    return criteria


def _find_turnover_requirement(text):
    for match in AMOUNT_PATTERN.finditer(text):
        amount = normalize_amount(match.group(0))
        if amount and 'turnover' in text[max(0, match.start()-80):match.end()+80].lower():
            return {
                'id': 'C01',
                'text': 'Minimum annual turnover of ₹{:,.0f}'.format(amount),
                'type': 'financial',
                'mandatory': bool(MANDATORY_PATTERN.search(text[max(0, match.start()-80):match.end()+80])),
                'target': {'value': amount, 'operator': '>='}
            }
    return None


def _find_project_requirement(text):
    for match in PROJECT_PATTERN.finditer(text):
        count = next((int(value) for value in match.groups() if value), None)
        if count:
            return {
                'id': 'C02',
                'text': f'At least {count} similar projects completed in the last 5 years',
                'type': 'experience',
                'mandatory': bool(MANDATORY_PATTERN.search(text[max(0, match.start()-80):match.end()+80])),
                'target': {'value': count, 'operator': '>='}
            }
    return None


def _find_gst_requirement(text):
    if GST_PATTERN.search(text):
        keyword_match = GST_PATTERN.search(text)
        surrounding = text[max(0, keyword_match.start()-80):keyword_match.end()+80]
        return {
            'id': 'C03',
            'text': 'Valid GST registration',
            'type': 'compliance',
            'mandatory': bool(MANDATORY_PATTERN.search(surrounding))
        }
    return None


def _find_iso_requirement(text):
    if ISO_PATTERN.search(text):
        keyword_match = ISO_PATTERN.search(text)
        surrounding = text[max(0, keyword_match.start()-80):keyword_match.end()+80]
        return {
            'id': 'C04',
            'text': 'ISO 9001 certification',
            'type': 'certification',
            'mandatory': not bool(OPTIONAL_PATTERN.search(surrounding))
        }
    return None


def _find_best_amount(text):
    best = None
    best_evidence = None
    for match in AMOUNT_PATTERN.finditer(text):
        amount = normalize_amount(match.group(0))
        if amount is None:
            continue
        if best is None or amount > best:
            best = amount
            best_evidence = match.group(0)
    return best, best_evidence


def _find_best_project_count(text):
    for match in PROJECT_PATTERN.finditer(text):
        count = next((int(value) for value in match.groups() if value), None)
        if count:
            return count, match.group(0)
    return None, None


def parse_bidder_facts(text):
    values = {}
    turnover, turnover_evidence = _find_best_amount(text)
    values['turnover'] = turnover
    values['turnover_evidence'] = turnover_evidence

    project_count, project_evidence = _find_best_project_count(text)
    values['project_count'] = project_count
    values['project_evidence'] = project_evidence


    # Improved GSTIN extraction
    gstin_pattern = re.compile(r'\d{2}[A-Z]{5}\d{4}[A-Z][A-Z0-9]Z[A-Z0-9]')
    gstin_match = gstin_pattern.search(text)
    if gstin_match:
        values['gst_present'] = True
        values['gst_evidence'] = gstin_match.group(0)
    else:
        gst_match = GST_PATTERN.search(text)
        values['gst_present'] = bool(gst_match)
        values['gst_evidence'] = gst_match.group(0) if gst_match else None

    iso_match = ISO_PATTERN.search(text)
    values['iso_9001'] = bool(iso_match)
    values['iso_evidence'] = iso_match.group(0) if iso_match else None

    values['raw_text'] = text
    return values


def evaluate_bidder(criteria, facts, bidder_name):
    details = []
    for criterion in criteria:
        result = 'Need Manual Review'
        evidence = 'No evidence found'
        confidence = 60
        if criterion['type'] == 'financial':
            turnover = facts.get('turnover')
            evidence_text = facts.get('turnover_evidence')
            if turnover is None:
                result = 'Review'
                evidence = 'No turnover amount could be extracted'
            elif turnover >= criterion['target']['value']:
                result = 'Pass'
                evidence = f'Extracted annual turnover ₹{turnover:,.0f} (evidence: {evidence_text})'
                confidence = 88
            else:
                result = 'Fail'
                evidence = f'Extracted annual turnover ₹{turnover:,.0f} (evidence: {evidence_text}) is below the required threshold'
                confidence = 92
        elif criterion['type'] == 'experience':
            projects = facts.get('project_count')
            project_evidence = facts.get('project_evidence')
            if projects is None:
                result = 'Review'
                evidence = 'No project count could be extracted'
            elif projects >= criterion['target']['value']:
                result = 'Pass'
                evidence = f'Found {projects} similar projects (evidence: {project_evidence})'
                confidence = 84
            else:
                result = 'Fail'
                evidence = f'Found {projects} similar projects (evidence: {project_evidence}), fewer than required'
                confidence = 90
        elif criterion['type'] == 'compliance':
            gst_present = facts.get('gst_present')
            gst_evidence = facts.get('gst_evidence')
            if gst_present:
                result = 'Pass'
                evidence = f'GST registration detected (evidence: {gst_evidence})'
                confidence = 90
            else:
                result = 'Fail'
                evidence = 'GST registration not detected'
                confidence = 75
        elif criterion['type'] == 'certification':
            iso_present = facts.get('iso_9001')
            iso_evidence = facts.get('iso_evidence')
            if iso_present:
                result = 'Pass'
                evidence = f'ISO 9001 certification detected (evidence: {iso_evidence})'
                confidence = 80
            else:
                result = 'Fail' if criterion.get('mandatory', False) else 'Review'
                evidence = 'ISO 9001 certification not found'
                confidence = 65
        # Add a human-readable explanation for each criterion verdict
        if result == 'Pass':
            explanation = f"Bidder meets the criterion: {criterion['text']}. Reason: {evidence}"
        elif result == 'Fail':
            explanation = f"Bidder does NOT meet the criterion: {criterion['text']}. Reason: {evidence}"
        else:
            explanation = f"Unable to determine if bidder meets the criterion: {criterion['text']}. Reason: {evidence}"

        details.append({
            'criterion_id': criterion['id'],
            'criterion': criterion['text'],
            'result': result,
            'evidence': evidence,
            'document': bidder_name,
            'confidence': confidence,
            'source_type': 'text',
            'explanation': explanation
        })

    status = 'Eligible'
    if any(d['result'] == 'Fail' for d in details):
        status = 'Not Eligible'
    elif any(d['result'] in ['Review', 'Need Manual Review'] for d in details):
        status = 'Need Manual Review'
    score = sum(25 for detail in details if detail['result'] == 'Pass')

    return {
        'bidder': bidder_name,
        'status': status,
        'score': score,
        'details': details
    }


def classify_document(text):
    text_lower = text.lower()
    tender_keywords = ['tender', 'invitation to bid', 'request for proposal', 'rfp', 'bid invitation', 'tender notice']
    bid_keywords = ['bid', 'proposal', 'quotation', 'offer', 'tender submission', 'bid document']
    
    tender_score = sum(1 for kw in tender_keywords if kw in text_lower)
    bid_score = sum(1 for kw in bid_keywords if kw in text_lower)
    
    if tender_score > bid_score:
        return 'Tender Document'
    elif bid_score > tender_score:
        return 'Bid Document'
    else:
        return 'Unknown Document Type'
