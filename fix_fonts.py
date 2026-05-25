import os
import re

directories = ['app', 'src', 'components']
total_replacements = 0

def replace_fonts_in_file(filepath):
    global total_replacements
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content
    # Replace specific bad font families
    content = re.sub(r"fontFamily:\s*['\"]System['\"]", "fontFamily: 'Gilroy-Regular'", content)
    content = re.sub(r"fontFamily:\s*['\"]Ubuntu_700Bold['\"]", "fontFamily: 'Gilroy-Bold'", content)
    content = re.sub(r"fontFamily:\s*['\"]InterMedium['\"]", "fontFamily: 'Gilroy-Medium'", content)
    content = re.sub(r"fontFamily:\s*['\"]Inter_600SemiBold['\"]", "fontFamily: 'Gilroy-SemiBold'", content)
    content = re.sub(r"fontFamily:\s*['\"]Inter_400Regular['\"]", "fontFamily: 'Gilroy-Regular'", content)
    content = re.sub(r"fontFamily:\s*['\"]Calibri['\"]", "fontFamily: 'Gilroy-Regular'", content)

    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        total_replacements += 1
        print(f"Updated fonts in {filepath}")

for directory in directories:
    if os.path.exists(directory):
        for root, dirs, files in os.walk(directory):
            for file in files:
                if file.endswith(('.tsx', '.ts', '.js', '.jsx')):
                    filepath = os.path.join(root, file)
                    replace_fonts_in_file(filepath)

print(f"Font replacement complete! Modified {total_replacements} files.")
