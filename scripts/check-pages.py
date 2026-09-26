"""Check the generated site's navigation and asset graph without dependencies."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1] / 'dist'
EXPECTED = {'/', '/about/', '/work/', '/work/legacy-garage/', '/work/engineering/', '/work/caliguide/', '/sports/', '/editing/', '/interests/'}


class Page(HTMLParser):
    def __init__(self, path):
        super().__init__()
        self.path, self.ids, self.links, self.h1s, self.dialogs = path, set(), [], 0, 0
        self.feed(path.read_text())

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if 'id' in attrs:
            assert attrs['id'] not in self.ids, f'Duplicate id: {self.path}: {attrs["id"]}'
            self.ids.add(attrs['id'])
        self.h1s += tag == 'h1'
        self.dialogs += tag == 'dialog'
        assert 'data-profile' not in attrs, f'Old profile control in {self.path}'
        for key in ('href', 'src'):
            if attrs.get(key):
                self.links.append(attrs[key])


pages = {path: Page(path) for path in ROOT.rglob('index.html')}
routes = {'/' + str(path.parent.relative_to(ROOT)).strip('.') + '/' if path.parent != ROOT else '/' for path in pages}
assert routes == EXPECTED, f'Unexpected routes: {routes ^ EXPECTED}'
for path, page in pages.items():
    assert page.h1s == 1, f'Expected one h1 in {path}'
    assert page.dialogs == 0, f'Unexpected dialog in {path}'
    for link in page.links:
        url = urlsplit(link)
        if url.scheme or url.netloc:
            continue
        target = (ROOT / unquote(url.path).lstrip('/')) if url.path.startswith('/') else (path.parent / unquote(url.path))
        if not url.path:
            target = path
        elif target.is_dir():
            target /= 'index.html'
        assert target.is_file(), f'Broken link from {path}: {link}'
        if url.fragment and target in pages:
            assert unquote(url.fragment) in pages[target].ids, f'Broken anchor from {path}: {link}'
print(f'Passed: {len(pages)} pages, one h1 each, all local links/assets/anchors resolve, no obsolete modal controls.')
