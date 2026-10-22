import xml.etree.ElementTree as ET

tree = ET.parse(r'C:\Users\rohan\OneDrive\Documents\SEM-Stuff\DataViz\Book1.twb')
root = tree.getroot()

db = root.find('dashboards').find('dashboard')
print(ET.tostring(db, encoding='utf-8').decode('utf-8', errors='replace'))
