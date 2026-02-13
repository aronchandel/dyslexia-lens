import re
from pypdf import PdfReader

def extract_text_from_pdf(file_path: str) -> str:
    """Extracts all raw text from all pages of the PDF."""
    reader = PdfReader(file_path)
    full_content = []
    
    for page in reader.pages:
        text = page.extract_text()
        if text:
            full_content.append(text)
            
    return "\n".join(full_content)

def clean_text(text: str) -> str:
    """Standardizes whitespace and removes unwanted symbols."""
    text = re.sub(r"\*+", "", text)  # remove asterisks
    text = re.sub(r"\s+", " ", text) # collapse all whitespace (newlines/tabs) to 1 space
    return text.strip()

def get_chunks(text: str, size: int = 3000):
    """
    Splits text into chunks of roughly 'size' characters.
    Yields chunks one by one to save memory.
    """
    start = 0
    while start < len(text):
        # determine the end of the chunk
        end = start + size
        
        # if we aren't at the end of the text, try to find a space 
        # so we don't cut a word in half.
        if end < len(text):
            last_space = text.rfind(" ", start, end)
            if last_space != -1:
                end = last_space
        
        yield text[start:end].strip()
        start = end

# --- MAIN EXECUTION LOGIC ---

if __name__ == "__main__":
    file_path = "your_document.pdf" 

    # 1. Get the whole PDF text
    print("Extracting text...")
    try:
        raw_data = extract_text_from_pdf(file_path)

        # 2. Clean the whole thing
        print("Cleaning text...")
        cleaned_data = clean_text(raw_data)

        # 3. Process every chunk in the PDF
        print(f"Total characters found: {len(cleaned_data)}")
        print("Processing chunks...\n")

        all_chunks = list(get_chunks(cleaned_data, size=3000))

        for i, chunk in enumerate(all_chunks):
            print(f"--- Processing Chunk {i+1} of {len(all_chunks)} ({len(chunk)} chars) ---")
            
            # example: here is where you would send 'chunk' to your ai or database
            # response = my_ai_model.process(chunk)
            # print(chunk[:100] + "...") # preview the start of the chunk
            
        print("\nDone! The entire PDF has been processed.")
    except Exception as e:
        print(f"Error processing {file_path}: {e}")