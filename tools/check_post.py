#!/usr/bin/env python3
import sys
import re
import os
import datetime

def parse_front_matter(content):
    """Simple parser for YAML front matter between ---"""
    if not content.startswith('---'):
        return None, "File does not start with '---'"
    
    try:
        end_idx = content.find('\n---', 3)
        if end_idx == -1:
            return None, "Closing '---' not found"
        
        yaml_content = content[3:end_idx]
        data = {}
        for line in yaml_content.split('\n'):
            line = line.strip()
            if not line or line.startswith('#'):
                continue
            if ':' in line:
                key, val = line.split(':', 1)
                data[key.strip()] = val.strip().strip('"').strip("'")
        return data, None
    except Exception as e:
        return None, str(e)

def validate_post(filepath):
    print(f"\n🔍 Checking file: {filepath}")
    
    # 1. Check Filename Format
    basename = os.path.basename(filepath)
    filename_pattern = r'^(\d{4})-(\d{2})-(\d{2})-(.+)\.md$'
    match = re.match(filename_pattern, basename)
    
    if not match:
        print("❌ ERROR: Filename invalid!")
        print(f"   Expected format: YYYY-MM-DD-title-slug.md")
        return False
    
    year, month, day, slug = match.groups()
    print("✅ Filename format is valid.")
    
    # 2. Check Content
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        print(f"❌ ERROR: Could not read file: {e}")
        return False

    # Regex Extraction
    title = re.search(r'^title:\s*(["\']?)(.+?)\1\s*$', content, re.MULTILINE)
    date = re.search(r'^date:\s*(.+?)\s*$', content, re.MULTILINE)
    categories = re.search(r'^categories:\s*\n((?:\s+-\s+.+\n)+)', content, re.MULTILINE)
    teaser = re.search(r'teaser:\s*(["\']?)(.+?)\1\s*$', content, re.MULTILINE)

    metadata = {
        'title': title.group(2) if title else None,
        'date': date.group(1) if date else None,
        'categories': "Present" if categories else None, # Simplified check
        'teaser': teaser.group(2) if teaser else "None"
    }
    
    # 3. Validation Rules
    required_fields = ['title', 'date']
    missing = [f for f in required_fields if not metadata[f]]
    
    if missing:
        print(f"❌ ERROR: Missing required Front Matter fields: {', '.join(missing)}")
        return False
        
    print("✅ Front Matter structure is valid.")
    
    # 4. Simulation Preview
    print("\n-----------------------------------------------------------")
    print(f"📄 PREVIEW: {metadata['title']}")
    print("-----------------------------------------------------------")
    print(f"📅 Published: {metadata['date']} (Year: {year}, Month: {month})")
    print(f"🔗 Permalink: /{year}/{month}/{slug.replace('-', ' ').title()}/")
    print(f"🖼  Header Image: {metadata['teaser']}")
    print("-----------------------------------------------------------")
    
    print("\n✅ Verification Successful! This post is ready for Jekyll.")
    return True

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 tools/check_post.py _posts/YYYY-MM-DD-filename.md")
        sys.exit(1)
        
    filepath = sys.argv[1]
    if os.path.exists(filepath):
        validate_post(filepath)
    else:
        print(f"Error: File '{filepath}' not found.")
