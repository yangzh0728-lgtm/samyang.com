"""Check the generated site's navigation and asset graph without dependencies."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1] / 'dist'
EXPECTED = {'/', '/about/', '/work/', '/work/legacy-garage/', '/work/engineering/', '/work/caliguide/', '/sports/', '/editing/', '/interests/', '/travel/'}
REDIRECTS = {'/work/legacy-garage/': '/work/#legacy-garage', '/work/engineering/': '/work/#engineering', '/work/caliguide/': '/work/#caliguide'}


class Page(HTMLParser):
    def __init__(self, path):
        super().__init__()
        self.path, self.ids, self.links, self.h1s, self.dialogs = path, set(), [], 0, 0
        self.redirect = None
        self.feed(path.read_text())

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'meta' and attrs.get('http-equiv') == 'refresh':
            self.redirect = attrs['content'].split('url=', 1)[1]
            self.links.append(self.redirect)
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
    route = '/' + str(path.parent.relative_to(ROOT)) + '/' if path.parent != ROOT else '/'
    assert page.redirect == REDIRECTS.get(route), f'Unexpected redirect in {path}'
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
work = pages[ROOT / 'work/index.html']
for expected in ('projects', 'legacy-garage', 'caliguide', 'engineering', 'fiberscope', 'novatex', 'robotics', 'leadership', 'skills'):
    assert expected in work.ids, f'Missing résumé entry/category: {expected}'
assert not any(link.startswith('/work/') and link != '/work/' and not link.startswith('/work/#') for page in pages.values() for link in page.links), 'A link still points to an individual project page'
assert '11+ years' in (ROOT / 'sports/index.html').read_text(), 'Floorball tenure was not updated'
travel = pages[ROOT / 'travel/index.html']
assert {'atlas-title', 'world-map-title', 'world-map-description', 'travel-country'} <= travel.ids, 'Travel map or country picker is missing'
assert '/travel/' in pages[ROOT / 'index.html'].links, 'Travel is missing from the homepage'
print(f'Passed: {len(EXPECTED) - len(REDIRECTS)} content pages, {len(REDIRECTS)} legacy redirects, résumé entries, travel map and navigation verified; all local links/assets/anchors resolve.')
