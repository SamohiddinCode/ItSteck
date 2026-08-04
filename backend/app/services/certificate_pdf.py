"""Renders a certificate to a PDF.

The PDF is built on demand from the stored record rather than saved to disk, so
a given code always resolves to a document that matches the current data and
there are no orphaned files to manage.
"""

import logging
from io import BytesIO
from pathlib import Path

from reportlab.lib.colors import HexColor
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas as pdfcanvas

logger = logging.getLogger(__name__)

PAGE_W, PAGE_H = landscape(A4)

BRAND = HexColor("#5B06FF")
INK = HexColor("#141018")
MUTED = HexColor("#6B7280")
RULE = HexColor("#D8D3E4")

# DejaVu is installed in the image (see Dockerfile) and covers Cyrillic.
_FONT_CANDIDATES = [
    ("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"),
    ("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"),
]

FONT_REGULAR = "Helvetica"
FONT_BOLD = "Helvetica-Bold"


def _register_fonts() -> None:
    """Swap in a Unicode font when one is available, else keep Helvetica."""
    global FONT_REGULAR, FONT_BOLD
    for regular, bold in _FONT_CANDIDATES:
        if Path(regular).exists() and Path(bold).exists():
            try:
                pdfmetrics.registerFont(TTFont("DejaVuSans", regular))
                pdfmetrics.registerFont(TTFont("DejaVuSans-Bold", bold))
                FONT_REGULAR, FONT_BOLD = "DejaVuSans", "DejaVuSans-Bold"
                return
            except Exception:  # pragma: no cover - font file unreadable
                logger.warning("Could not register %s, falling back to Helvetica", regular)
                return
    logger.warning("No Unicode font found — non-Latin names may not render")


_register_fonts()


def _fit_font_size(text: str, font: str, max_width: float, start: float, minimum: float) -> float:
    """Shrink a font size until the text fits, so long names never overflow."""
    size = start
    while size > minimum and pdfmetrics.stringWidth(text, font, size) > max_width:
        size -= 1
    return size


def _draw_frame(c: pdfcanvas.Canvas) -> None:
    c.setStrokeColor(BRAND)
    c.setLineWidth(3)
    c.rect(10 * mm, 10 * mm, PAGE_W - 20 * mm, PAGE_H - 20 * mm)
    c.setStrokeColor(RULE)
    c.setLineWidth(0.8)
    c.rect(14 * mm, 14 * mm, PAGE_W - 28 * mm, PAGE_H - 28 * mm)


def _draw_mark(c: pdfcanvas.Canvas, cx: float, top: float) -> None:
    """Brand lockup: wordmark, tagline and a short accent rule."""
    c.setFillColor(BRAND)
    c.setFont(FONT_BOLD, 30)
    c.drawCentredString(cx, top, "ItStek")

    c.setFillColor(MUTED)
    c.setFont(FONT_REGULAR, 8.5)
    c.drawCentredString(cx, top - 6 * mm, "I T   A C A D E M Y")

    c.setStrokeColor(BRAND)
    c.setLineWidth(1.5)
    c.line(cx - 12 * mm, top - 10 * mm, cx + 12 * mm, top - 10 * mm)


def _draw_grade_column(
    c: pdfcanvas.Canvas,
    items: list[dict],
    left: float,
    right: float,
    top: float,
    row_h: float,
    font_size: float,
) -> None:
    """Render one subject/grade column with its own header."""
    c.setFillColor(MUTED)
    c.setFont(FONT_BOLD, 8)
    c.drawString(left, top, "SUBJECT")
    c.drawRightString(right, top, "GRADE")

    y = top - 2.5 * mm
    c.setStrokeColor(BRAND)
    c.setLineWidth(1)
    c.line(left, y, right, y)

    # Reserve room for the grade so a long subject never runs into it.
    max_subject_w = (right - left) - 14 * mm
    for item in items:
        y -= row_h
        c.setFillColor(INK)
        c.setFont(FONT_REGULAR, font_size)
        subject = str(item.get("subject", ""))
        while subject and pdfmetrics.stringWidth(subject, FONT_REGULAR, font_size) > max_subject_w:
            subject = subject[:-1]
        c.drawString(left, y, subject)

        c.setFont(FONT_BOLD, font_size)
        c.setFillColor(BRAND)
        c.drawRightString(right, y, str(item.get("grade", "")))

        c.setStrokeColor(RULE)
        c.setLineWidth(0.4)
        c.line(left, y - row_h * 0.3, right, y - row_h * 0.3)


def _draw_grades(
    c: pdfcanvas.Canvas, subjects: list[dict], top: float, bottom: float, cx: float
) -> None:
    """Draw the subject/grade table centred on cx, always fitting above bottom.

    Long transcripts switch to two columns rather than shrinking to an
    unreadable size or running into the footer.
    """
    if not subjects:
        return

    table_w = 170 * mm
    left = cx - table_w / 2
    available = top - bottom

    # Row height is derived from the space available, so the table can never
    # overflow; two columns kick in once one column would get too cramped.
    rows_per_col = len(subjects)
    row_h = min(8 * mm, available / rows_per_col)
    two_columns = row_h < 4.5 * mm and len(subjects) > 1

    if two_columns:
        rows_per_col = (len(subjects) + 1) // 2
        row_h = min(8 * mm, available / rows_per_col)

    font_size = 11 if row_h >= 7 * mm else (9 if row_h >= 5.5 * mm else 7.5)

    if not two_columns:
        _draw_grade_column(c, subjects, left, left + table_w, top, row_h, font_size)
        return

    gutter = 12 * mm
    col_w = (table_w - gutter) / 2
    _draw_grade_column(
        c, subjects[:rows_per_col], left, left + col_w, top, row_h, font_size
    )
    _draw_grade_column(
        c,
        subjects[rows_per_col:],
        left + col_w + gutter,
        left + table_w,
        top,
        row_h,
        font_size,
    )


def render_certificate(
    *,
    code: str,
    student_name: str,
    course_title: str,
    subjects: list[dict],
    issued_at,
    verify_url: str | None = None,
) -> bytes:
    buf = BytesIO()
    c = pdfcanvas.Canvas(buf, pagesize=landscape(A4))
    c.setTitle(f"ItStek Certificate {code}")
    c.setAuthor("ItStek")
    c.setSubject(f"Certificate of completion — {student_name}")

    cx = PAGE_W / 2
    text_w = PAGE_W - 70 * mm
    _draw_frame(c)

    _draw_mark(c, cx, PAGE_H - 30 * mm)

    c.setFillColor(INK)
    c.setFont(FONT_BOLD, 22)
    c.drawCentredString(cx, PAGE_H - 52 * mm, "CERTIFICATE OF COMPLETION")

    c.setFillColor(MUTED)
    c.setFont(FONT_REGULAR, 10.5)
    c.drawCentredString(cx, PAGE_H - 64 * mm, "This is to certify that")

    name_size = _fit_font_size(student_name, FONT_BOLD, text_w, 32, 14)
    c.setFillColor(BRAND)
    c.setFont(FONT_BOLD, name_size)
    c.drawCentredString(cx, PAGE_H - 78 * mm, student_name)

    c.setFillColor(MUTED)
    c.setFont(FONT_REGULAR, 10.5)
    c.drawCentredString(cx, PAGE_H - 90 * mm, "has successfully completed the course")

    course_size = _fit_font_size(course_title, FONT_BOLD, text_w, 16, 9)
    c.setFillColor(INK)
    c.setFont(FONT_BOLD, course_size)
    c.drawCentredString(cx, PAGE_H - 101 * mm, course_title)

    # The table takes the space between the header block and the footer rule.
    _draw_grades(c, subjects, top=PAGE_H - 118 * mm, bottom=42 * mm, cx=cx)

    # Footer: the code is what makes the document verifiable.
    footer_rule_y = 32 * mm
    c.setStrokeColor(RULE)
    c.setLineWidth(0.8)
    c.line(28 * mm, footer_rule_y, PAGE_W - 28 * mm, footer_rule_y)

    c.setFillColor(MUTED)
    c.setFont(FONT_REGULAR, 8)
    c.drawString(28 * mm, footer_rule_y - 6 * mm, "CERTIFICATE No.")
    c.drawRightString(PAGE_W - 28 * mm, footer_rule_y - 6 * mm, "ISSUED")

    c.setFillColor(INK)
    c.setFont(FONT_BOLD, 12)
    c.drawString(28 * mm, footer_rule_y - 12 * mm, code)
    c.drawRightString(PAGE_W - 28 * mm, footer_rule_y - 12 * mm, issued_at.strftime("%d %B %Y"))

    if verify_url:
        c.setFillColor(MUTED)
        c.setFont(FONT_REGULAR, 8)
        c.drawCentredString(cx, footer_rule_y - 11 * mm, f"Verify at {verify_url}")

    c.showPage()
    c.save()
    return buf.getvalue()
