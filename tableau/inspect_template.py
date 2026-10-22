import xml.etree.ElementTree as ET

tree1 = ET.parse(r'C:\Users\rohan\OneDrive\Documents\SEM-Stuff\DataViz\Book1.twb')
root1 = tree1.getroot()

print('Root attributes:')
for k, v in root1.attrib.items():
    print(f'  {k}="{v}"')

print('\nDocument format manifest:')
manifest = root1.find('document-format-change-manifest')
for child in manifest:
    print(f'  <{child.tag} />')

print('\nPreferences:')
prefs = root1.find('preferences')
for child in prefs:
    print(f'  <preference {child.attrib} />')

print('\nWindows:')
windows = root1.find('windows')
print(windows.attrib)
for win in windows:
    print(f'  <window {win.attrib} />')
