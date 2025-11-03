import streamlit as st
import torch
import nibabel as nib
import numpy as np
from model.network import Network
from skimage.transform import resize
import matplotlib.pyplot as plt
import tempfile
import datetime
import time
from io import BytesIO
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib.utils import ImageReader

# ----------------- PAGE CONFIG -----------------
st.set_page_config(page_title="🧠 Alzheimer's Detection", layout="centered")

st.title("🧠 Alzheimer's MRI Prediction System")
st.write("Upload your MRI scan (.nii or .nii.gz) and enter patient details to get AI-powered prediction results")

# ----------------- MODEL PARAMETERS -----------------
input_channels = 1
input_shape = (200, 200, 150)
output_size = 2
CLASSES = ["No Alzheimer's", "Alzheimer's Detected"]

# ----------------- LOAD MODEL -----------------
@st.cache_resource
def load_model():
    model = Network(input_channels, input_shape, output_size)
    model.load_state_dict(torch.load("alzheimers_model.pth", map_location="cpu"))
    model.eval()
    return model

model = load_model()

# ----------------- PDF BUILDER -----------------
def build_pdf_bytes(patient_info, mri_filename, model_name, predicted_class, probs, chart_png_buf):
    buffer = BytesIO()
    PAGE_WIDTH, PAGE_HEIGHT = A4
    margin_x = 50
    y = PAGE_HEIGHT - 60

    c = canvas.Canvas(buffer, pagesize=A4)

    # ---------- HEADER ----------
    c.setFont("Helvetica-Bold", 18)
    c.drawCentredString(PAGE_WIDTH/2, y, "🧠 Alzheimer's Detection MRI Report")
    y -= 25
    c.setFont("Helvetica", 10)
    c.drawCentredString(PAGE_WIDTH/2, y, f"Generated: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    y -= 20

    # Blue line
    c.setStrokeColorRGB(0/255, 102/255, 204/255)
    c.setLineWidth(2)
    c.line(margin_x, y, PAGE_WIDTH - margin_x, y)
    y -= 30

    # ---------- PATIENT INFO ----------
    c.setFont("Helvetica-Bold", 12)
    c.drawString(margin_x, y, "Patient Information")
    y -= 18
    c.setFont("Helvetica", 10)
    info_lines = [
        f"Name: {patient_info['name']}",
        f"Patient ID: {patient_info['id']}",
        f"Age: {patient_info['age']}",
        f"Contact: {patient_info['contact']}",
        f"Report Date: {patient_info['date']}"
    ]
    for line in info_lines:
        c.drawString(margin_x+10, y, line)
        y -= 14
    if patient_info.get("notes"):
        c.drawString(margin_x+10, y, f"Notes: {patient_info['notes']}")
        y -= 20

    # Blue line
    c.setStrokeColorRGB(0/255, 102/255, 204/255)
    c.line(margin_x, y, PAGE_WIDTH - margin_x, y)
    y -= 30

    # ---------- PREDICTION RESULT ----------
    c.setFont("Helvetica-Bold", 12)
    c.drawString(margin_x, y, "Prediction Result")
    y -= 25

    result_text = CLASSES[predicted_class]
    confidence_text = f"{probs[predicted_class]*100:.2f}%"

    if predicted_class == 1:
        # Red highlight
        c.setFillColorRGB(0.9, 0.2, 0.2)
    else:
        # Green highlight
        c.setFillColorRGB(0.2, 0.7, 0.2)

    # Box
    c.rect(margin_x, y-10, PAGE_WIDTH - 2*margin_x, 25, fill=1, stroke=0)
    c.setFillColorRGB(1, 1, 1)
    c.setFont("Helvetica-Bold", 12)
    c.drawCentredString(PAGE_WIDTH/2, y+2, f"{result_text}  — Confidence: {confidence_text}")
    y -= 50

    # Extra details
    c.setFillColorRGB(0,0,0)
    c.setFont("Helvetica", 10)
    alt_idx = 1 - predicted_class
    c.drawString(margin_x+10, y, f"Alternative: {CLASSES[alt_idx]} ({probs[alt_idx]*100:.2f}%)")
    y -= 15
    c.drawString(margin_x+10, y, f"MRI File: {mri_filename}")
    y -= 15
    c.drawString(margin_x+10, y, f"Model Used: {model_name}")
    y -= 25

    # Blue line
    c.setStrokeColorRGB(0/255, 102/255, 204/255)
    c.line(margin_x, y, PAGE_WIDTH - margin_x, y)
    y -= 30

    # ---------- PROBABILITY + DONUT CHART ----------
    c.setFont("Helvetica-Bold", 12)
    c.drawString(margin_x, y, "Probability Distribution")
    y -= 20

    # Left column = probability bars
    bar_x = margin_x+10
    bar_w = 200
    bar_h = 14
    text_offset = 220
    c.setFont("Helvetica", 10)

    # No Alzheimer's (green)
    c.setFillColorRGB(0.9, 1, 0.9)
    c.rect(bar_x, y, bar_w, bar_h, fill=1, stroke=0)
    c.setFillColorRGB(0.2, 0.8, 0.2)
    c.rect(bar_x, y, bar_w*probs[0], bar_h, fill=1, stroke=0)
    c.setFillColorRGB(0,0,0)
    c.drawString(bar_x+text_offset, y+2, f"No Alzheimer's: {probs[0]*100:.2f}%")
    y -= 25

    # Alzheimer's (red)
    c.setFillColorRGB(1, 0.9, 0.9)
    c.rect(bar_x, y, bar_w, bar_h, fill=1, stroke=0)
    c.setFillColorRGB(0.9, 0.2, 0.2)
    c.rect(bar_x, y, bar_w*probs[1], bar_h, fill=1, stroke=0)
    c.setFillColorRGB(0,0,0)
    c.drawString(bar_x+text_offset, y+2, f"Alzheimer's: {probs[1]*100:.2f}%")

    # Right column = donut chart
    try:
        img = ImageReader(chart_png_buf)
        img_x = PAGE_WIDTH - margin_x - 180
        img_y = PAGE_HEIGHT/2 - 80
        c.drawImage(img, img_x, img_y, width=160, height=160)
    except:
        pass

    y -= 70

    # Blue line
    c.setStrokeColorRGB(0/255, 102/255, 204/255)
    c.line(margin_x, y, PAGE_WIDTH - margin_x, y)
    y -= 30

    # ---------- DISCLAIMER ----------
    c.setFont("Helvetica", 9)
    disclaimer = (
        "Disclaimer: This is an AI-assisted prediction report intended for research/educational purposes only. "
        "It should not be used as a definitive medical diagnosis. "
        "Please consult a qualified medical professional for clinical decisions."
    )
    text_obj = c.beginText(margin_x, y)
    text_obj.setFont("Helvetica", 9)
    for line in disclaimer.split(". "):
        text_obj.textLine(line.strip() + ('.' if not line.endswith('.') else ''))
    c.drawText(text_obj)

    c.showPage()
    c.save()
    buffer.seek(0)
    return buffer

# ----------------- PATIENT INFO FORM -----------------
st.markdown("### 🧾 Patient Information")
col1, col2 = st.columns(2)

with col1:
    patient_name = st.text_input("👤 Patient Name")
    patient_age = st.number_input("🎂 Age", min_value=1, max_value=120, step=1)
    patient_id = st.text_input("🆔 Patient ID")

with col2:
    patient_contact = st.text_input("📞 Contact Number")
    patient_date = st.date_input("📅 Date", value=datetime.date.today())
    patient_notes = st.text_area("📝 Notes")

# ----------------- FILE UPLOADER -----------------
uploaded_file = st.file_uploader("📂 Upload MRI File", type=["nii", "nii.gz"])

# ----------------- PREDICTION -----------------
if uploaded_file is not None:
    st.success(f"✅ File uploaded: {uploaded_file.name}")

    if st.button("🔍 Run Prediction"):
        try:
            # ----------------- WAIT SIMULATION -----------------
            with st.spinner("⏳ Processing MRI Scan... Please wait"):
                progress = st.progress(0)
                for i in range(100):
                    time.sleep(0.02)
                    progress.progress(i + 1)

            # Save uploaded file temporarily
            with tempfile.NamedTemporaryFile(delete=False, suffix=".nii") as tmp_file:
                tmp_file.write(uploaded_file.getbuffer())
                tmp_path = tmp_file.name

            # Load MRI file
            mri_img = nib.load(tmp_path)
            mri_data = mri_img.get_fdata()

            # Normalize & resize
            mri_data = (mri_data - np.min(mri_data)) / (np.max(mri_data) - np.min(mri_data))
            if mri_data.shape != input_shape:
                st.warning(f"⚠ MRI shape {mri_data.shape} does not match {input_shape}. Resizing...")
                mri_data = resize(mri_data, input_shape, anti_aliasing=True)

            # Convert to tensor
            mri_tensor = torch.tensor(mri_data, dtype=torch.float32).unsqueeze(0).unsqueeze(0)

            # Run prediction
            with torch.no_grad():
                output = model(mri_tensor)
                probs = torch.softmax(output, dim=0).numpy()
                predicted_class = np.argmax(probs)

            # ----------------- REPORT DISPLAY -----------------
            st.markdown("## 📋 Prediction Report")

            # Patient info section
            st.markdown(f"""
            **👤 Patient Name:** {patient_name if patient_name else "N/A"}  
            **🆔 Patient ID:** {patient_id if patient_id else "N/A"}  
            **🎂 Age:** {patient_age if patient_age else "N/A"}  
            **📞 Contact:** {patient_contact if patient_contact else "N/A"}  
            **📅 Date:** {patient_date}  
            **📝 Notes:** {patient_notes if patient_notes else "N/A"}  
            """)

            # MRI + Model info
            st.info(f"**Patient MRI File:** {uploaded_file.name}")
            st.write(f"**Model Used:** `alzheimers_model.pth`")
            st.write(f"**Device:** CPU")

            # Stylish Prediction Card
            if predicted_class == 1:  # Alzheimer's Detected
                st.error(f"🚨 Prediction: **{CLASSES[predicted_class]}**\n\nConfidence: {probs[predicted_class]*100:.2f}%")
            else:  # No Alzheimer's
                st.success(f"✅ Prediction: **{CLASSES[predicted_class]}**\n\nConfidence: {probs[predicted_class]*100:.2f}%")

            st.write(f"**Alternative:** {CLASSES[1-predicted_class]} ({probs[1-predicted_class]*100:.2f}%)")

            # Warning if confidence is low
            if probs[predicted_class]*100 < 70:
                st.warning("⚠ Confidence < 70% → Prediction uncertain. Further scans recommended.")

            # ----------------- PROBABILITY BARS -----------------
            st.markdown("### 📊 Probability Scores")
            st.progress(int(probs[0]*100))
            st.write(f"🟢 No Alzheimer's: {probs[0]*100:.2f}%")
            st.progress(int(probs[1]*100))
            st.write(f"🔴 Alzheimer's Detected: {probs[1]*100:.2f}%")

            # ----------------- DONUT CHART -----------------
            st.markdown("### 🎯 Probability Distribution")
            fig, ax = plt.subplots()
            ax.pie(
                probs,
                labels=CLASSES,
                autopct='%1.1f%%',
                startangle=90,
                colors=["#4ade80", "#f87171"],
                wedgeprops={'width': 0.4}
            )
            ax.axis('equal')
            st.pyplot(fig)

            # Save chart as PNG
            chart_buf = BytesIO()
            fig.savefig(chart_buf, format="png")
            chart_buf.seek(0)

            # ----------------- DOWNLOAD PDF -----------------
            patient_info = {
                "name": patient_name if patient_name else "N/A",
                "id": patient_id if patient_id else "N/A",
                "age": patient_age if patient_age else "N/A",
                "contact": patient_contact if patient_contact else "N/A",
                "date": patient_date,
                "notes": patient_notes if patient_notes else ""
            }
            pdf_buffer = build_pdf_bytes(patient_info, uploaded_file.name, "alzheimers_model.pth", predicted_class, probs, chart_buf)

            st.download_button(
                label="📥 Download Professional PDF Report",
                data=pdf_buffer,
                file_name=f"Alzheimers_Report_{patient_info['id']}.pdf",
                mime="application/pdf"
            )

        except Exception as e:
            st.error(f"❌ Error while processing file: {e}")
