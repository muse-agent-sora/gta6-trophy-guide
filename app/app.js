// Leonida Ledger — offline GTA VI trophy tracker.
// Loads only data/trophies.json (same folder, relative path) and saves progress
// in localStorage. No network request is ever made.
(function () {
  'use strict';

  var EARNED_KEY = 'leonida-ledger-earned-v1';
  var SPOILER_KEY = 'leonida-ledger-spoiler-v1';
  var DEMO_IDS = [2, 3, 8, 9, 16, 19, 21, 32, 35, 42, 46, 53, 55];

  var STAGES = [
    { n: 1, title: 'Play the story', body: 'Chapters 1 to 4, the named missions and the final mission. Twelve trophies unlock just by finishing the story — no grinding, no choices to get wrong.' },
    { n: 2, title: 'Stranger chains', body: 'Seven trophies from the stranger mission strands: the five character finals, the 8-strand silver, and Bret’s hunt. Start each chain as soon as it unlocks — TechWiser reports these have windows tied to story progress (single source).' },
    { n: 3, title: 'Open-world sweep', body: 'Nine trophies from exploring Leonida: meditation spots, cards, WAiNK locations, vehicles, the 52 areas, garages and the Scooter Bros app. Do the Chapter 1 balcony meditation in Stage 1, before Chapter 1 ends.' },
    { n: 4, title: 'Activities & skills', body: 'Nine trophies from the pastimes: 250 stunts, all 9 activity types, 42 shooting-range golds, drone races, 20 race wins, fishing, arcade, bowling and 50 challenges.' },
    { n: 5, title: 'Crime & money', body: 'Sixteen trophies from robberies, wanted levels, Combat Focus and the economy: partner robberies, bank vaults, armored trucks, gang operations, laundering $250,000 and spending $100,000.' },
    { n: 6, title: '100% completion', body: 'One gold: A Long Road. Finish the checklist after the story. PowerPyx calls the thresholds lenient, and most of the progress comes from the other trophies.' },
    { n: 7, title: 'Platinum', body: 'Vice Got a Price! unlocks by itself once the other 54 are earned. There is nothing extra to do — the roadmap ends here.' }
  ];

  var KIND_LABELS = {
    story: 'Story', missable: 'Missable', collectibles: 'Collectibles',
    activities: 'Activities', 'open-world': 'Open World', goal: 'Goal', online: 'Online'
  };

  var trophies = [];
  var earned = new Set();
  var spoiler = false;
  var kind = 'all';
  var grade = 'all';
  var query = '';
  var sort = 'list';
  var earnedOnly = false;
  var unearnedOnly = false;
  var selectedId = null;
  var view = 'checklist';

  function $(id) { return document.getElementById(id); }
  function loadEarned() {
    try {
      var raw = localStorage.getItem(EARNED_KEY);
      if (raw) JSON.parse(raw).forEach(function (id) { earned.add(id); });
    } catch (e) { earned = new Set(); }
  }
  function saveEarned() {
    try { localStorage.setItem(EARNED_KEY, JSON.stringify(Array.from(earned))); } catch (e) {}
  }
  function loadSpoiler() {
    try { spoiler = localStorage.getItem(SPOILER_KEY) === '1'; } catch (e) { spoiler = false; }
  }
  function saveSpoiler() {
    try { localStorage.setItem(SPOILER_KEY, spoiler ? '1' : '0'); } catch (e) {}
  }
  function trophyById(id) {
    for (var i = 0; i < trophies.length; i++) if (trophies[i].id === id) return trophies[i];
    return null;
  }
  function isHiddenFromReader(t) {
    return spoiler && t.kind === 'story' && !earned.has(t.id);
  }
  function displayName(t) {
    return isHiddenFromReader(t) ? 'Hidden story trophy' : t.name;
  }
  function displayDesc(t) {
    return isHiddenFromReader(t) ? 'Hidden on PlayStation until earned — tick it off to reveal it.' : t.description;
  }
  function countLabel(t) {
    if (t.count == null) return null;
    if (t.id === 52 || t.id === 53) return '$' + t.count.toLocaleString('en-US');
    return String(t.count);
  }
  function pill(text, cls) {
    var s = document.createElement('span');
    s.className = 'pill ' + (cls || '');
    s.textContent = text;
    return s;
  }

  function visibleTrophies() {
    var out = [];
    var q = query.trim().toLowerCase();
    for (var i = 0; i < trophies.length; i++) {
      var t = trophies[i];
      if (kind === 'online') continue; // the list has no online trophies (see empty note)
      if (kind === 'missable') { if (!t.missable) continue; }
      else if (kind !== 'all' && t.kind !== kind) continue;
      if (grade !== 'all' && t.grade !== grade) continue;
      if (earnedOnly && !earned.has(t.id)) continue;
      if (unearnedOnly && earned.has(t.id)) continue;
      if (q) {
        var hay = isHiddenFromReader(t) ? '' : (t.name + ' ' + t.description + ' ' + t.guide).toLowerCase();
        if (hay.indexOf(q) === -1) continue;
      }
      out.push(t);
    }
    var gradeRank = { platinum: 0, gold: 1, silver: 2, bronze: 3 };
    if (sort === 'grade') out.sort(function (a, b) { return gradeRank[a.grade] - gradeRank[b.grade] || a.id - b.id; });
    if (sort === 'name') out.sort(function (a, b) { return displayName(a).localeCompare(displayName(b)); });
    if (sort === 'roadmap') out.sort(function (a, b) { return a.stage - b.stage || a.id - b.id; });
    return out;
  }

  function renderProgress() {
    var total = trophies.length;
    var n = earned.size;
    $('earnedCount').textContent = String(n);
    $('progressFill').style.width = total ? Math.round(100 * n / total) + '%' : '0%';
    var pct = total ? Math.round(100 * n / total) : 0;
    var plat = trophyById(1);
    $('progressText').textContent = pct + '% · Platinum: ' + (plat && earned.has(1) ? 'Vice Got a Price! earned' : 'Vice Got a Price! still locked');
    var counts = { platinum: [0, 0], gold: [0, 0], silver: [0, 0], bronze: [0, 0] };
    trophies.forEach(function (t) {
      counts[t.grade][1]++;
      if (earned.has(t.id)) counts[t.grade][0]++;
    });
    $('gradeCounts').innerHTML = '';
    var parts = ['Platinum', 'Gold', 'Silver', 'Bronze'].map(function (g) {
      var c = counts[g.toLowerCase()];
      return g + ' ' + c[0] + '/' + c[1];
    });
    $('gradeCounts').textContent = parts.join(' · ');
    var badge = $('missableBadge');
    if (badge) badge.textContent = String(trophies.filter(function (t) { return t.missable; }).length);
  }

  function renderList() {
    var list = $('trophyList');
    list.innerHTML = '';
    var shown = visibleTrophies();
    if (kind === 'online') {
      var note = document.createElement('li');
      note.className = 'empty-note';
      note.textContent = 'No online trophies in this list. Every one of the 55 trophies is single-player (Push Square, citing Exophase) — nothing here needs GTA Online, which does not exist at launch.';
      list.appendChild(note);
    } else if (shown.length === 0) {
      var empty = document.createElement('li');
      empty.className = 'empty-note';
      empty.textContent = 'No trophies match these filters. Clear the search or pick another kind.';
      list.appendChild(empty);
    }
    shown.forEach(function (t) {
      var li = document.createElement('li');
      li.className = 'trophy-row' + (earned.has(t.id) ? ' earned' : '') + (selectedId === t.id ? ' selected' : '');
      li.dataset.id = String(t.id);
      var box = document.createElement('input');
      box.type = 'checkbox';
      box.checked = earned.has(t.id);
      box.setAttribute('aria-label', 'Mark ' + displayName(t) + ' earned');
      box.addEventListener('change', function (ev) {
        ev.stopPropagation();
        toggleEarned(t.id);
      });
      box.addEventListener('click', function (ev) { ev.stopPropagation(); });
      var body = document.createElement('div');
      var name = document.createElement('div');
      name.className = 'trophy-name';
      name.textContent = displayName(t);
      var desc = document.createElement('div');
      desc.className = 'trophy-desc';
      desc.textContent = displayDesc(t);
      var meta = document.createElement('div');
      meta.className = 'trophy-meta';
      meta.appendChild(pill(t.grade, t.grade));
      meta.appendChild(pill(KIND_LABELS[t.kind] || t.kind, ''));
      if (t.count != null) meta.appendChild(pill('Target: ' + countLabel(t), ''));
      if (t.hidden) meta.appendChild(pill('Hidden', 'hidden'));
      if (t.missable) meta.appendChild(pill('Missable', 'missable'));
      else if (t.watch) meta.appendChild(pill('Story window', 'watch'));
      body.appendChild(name);
      body.appendChild(desc);
      body.appendChild(meta);
      var dot = document.createElement('span');
      dot.className = 'grade-dot';
      dot.textContent = earned.has(t.id) ? '✓' : '○';
      li.appendChild(box);
      li.appendChild(body);
      li.appendChild(dot);
      li.addEventListener('click', function () { selectTrophy(t.id); });
      list.appendChild(li);
    });
    var label = kind === 'all' ? 'All trophies' : (KIND_LABELS[kind] || kind);
    var gLabel = grade === 'all' ? '' : ', ' + grade;
    $('filterNote').textContent = shown.length + ' of ' + trophies.length + ' shown · ' + label + gLabel +
      (spoiler ? ' · story spoilers hidden' : ' · spoilers shown');
  }

  function renderDetail() {
    var pane = $('detailPane');
    pane.innerHTML = '';
    var t = selectedId != null ? trophyById(selectedId) : null;
    if (!t) {
      var hint = document.createElement('p');
      hint.textContent = 'Pick a trophy on the left to read its guide, its sources and when it can be missed.';
      pane.appendChild(hint);
      return;
    }
    var masked = isHiddenFromReader(t);
    var h = document.createElement('h2');
    h.textContent = masked ? 'Hidden story trophy' : t.name;
    pane.appendChild(h);
    var off = document.createElement('p');
    off.className = 'official';
    if (masked) {
      off.textContent = 'Official name and description hidden until earned — turn the spoiler setting off, or tick it earned, to reveal them.';
    } else {
      off.innerHTML = '';
      var b = document.createElement('b');
      b.textContent = 'Official: ';
      off.appendChild(b);
      off.appendChild(document.createTextNode('“' + t.description + '” — ' + t.grade + ' trophy' + (t.hidden ? ', hidden on PlayStation' : '') + (t.count != null ? ', PSN target: ' + countLabel(t) : '') + '.'));
    }
    pane.appendChild(off);
    if (!masked && t.watch) {
      var warn = document.createElement('div');
      warn.className = 'warning';
      warn.textContent = t.missable ? '⚠ Possibly missable — ' + t.watch : '⏱ Story window — ' + t.watch;
      pane.appendChild(warn);
    }
    if (!masked) {
      var gh = document.createElement('h3');
      gh.textContent = 'Guide';
      pane.appendChild(gh);
      var gp = document.createElement('p');
      gp.className = 'guide-text';
      gp.textContent = t.guide;
      pane.appendChild(gp);
      var sh = document.createElement('h3');
      sh.textContent = 'Sources';
      pane.appendChild(sh);
      var ul = document.createElement('ul');
      ul.className = 'sources';
      t.sources.forEach(function (s) {
        var li = document.createElement('li');
        li.textContent = s;
        ul.appendChild(li);
      });
      pane.appendChild(ul);
    }
    var row = document.createElement('div');
    row.className = 'nav-row';
    var prev = document.createElement('button');
    prev.type = 'button';
    prev.textContent = '← Previous';
    prev.addEventListener('click', function () { stepTrophy(-1); });
    var next = document.createElement('button');
    next.type = 'button';
    next.textContent = 'Next →';
    next.addEventListener('click', function () { stepTrophy(1); });
    var earn = document.createElement('button');
    earn.type = 'button';
    earn.className = 'earned-btn';
    earn.textContent = earned.has(t.id) ? '✓ Earned — untick' : 'Mark earned';
    earn.addEventListener('click', function () { toggleEarned(t.id); });
    row.appendChild(prev);
    row.appendChild(earn);
    row.appendChild(next);
    pane.appendChild(row);
  }

  function stepTrophy(d) {
    var shown = visibleTrophies();
    if (!shown.length) return;
    var idx = 0;
    for (var i = 0; i < shown.length; i++) if (shown[i].id === selectedId) idx = i;
    var next = shown[(idx + d + shown.length) % shown.length];
    selectTrophy(next.id);
  }

  function renderRoadmap() {
    var host = $('roadmapStages');
    host.innerHTML = '';
    STAGES.forEach(function (st) {
      var members = trophies.filter(function (t) { return t.stage === st.n; });
      var done = members.filter(function (t) { return earned.has(t.id); }).length;
      var card = document.createElement('div');
      card.className = 'stage';
      var head = document.createElement('div');
      head.className = 'stage-head';
      var h = document.createElement('h2');
      var num = document.createElement('span');
      num.className = 'stage-num';
      num.textContent = 'Stage ' + st.n + ' — ';
      h.appendChild(num);
      h.appendChild(document.createTextNode(st.title));
      var prog = document.createElement('span');
      prog.className = 'muted';
      prog.textContent = done + ' / ' + members.length + ' earned';
      head.appendChild(h);
      head.appendChild(prog);
      card.appendChild(head);
      var p = document.createElement('p');
      p.textContent = st.body;
      card.appendChild(p);
      var ul = document.createElement('ul');
      ul.className = 'stage-list';
      members.forEach(function (t) {
        var li = document.createElement('li');
        if (earned.has(t.id)) li.className = 'done';
        li.textContent = (isHiddenFromReader(t) ? 'Hidden story trophy' : t.name) + ' ';
        var g = document.createElement('span');
        g.className = 'mini-grade';
        g.textContent = t.grade;
        li.appendChild(g);
        li.addEventListener('click', function () { selectTrophy(t.id); showView('checklist'); });
        ul.appendChild(li);
      });
      card.appendChild(ul);
      host.appendChild(card);
    });
  }

  function renderMissables() {
    var host = $('missableList');
    host.innerHTML = '';
    var hot = trophyById(28);
    if (hot) {
      var card = document.createElement('div');
      card.className = 'missable-card hot';
      var h = document.createElement('h2');
      h.textContent = '⚠ ' + hot.name + ' — possibly missable';
      card.appendChild(h);
      var p1 = document.createElement('p');
      p1.innerHTML = '';
      p1.appendChild(document.createTextNode('Official: “' + hot.description + '” — bronze. '));
      var strong = document.createElement('strong');
      strong.textContent = 'Do this early, in Chapter 1.';
      p1.appendChild(strong);
      card.appendChild(p1);
      var p2 = document.createElement('p');
      p2.textContent = hot.guide;
      card.appendChild(p2);
      var p3 = document.createElement('p');
      p3.className = 'muted';
      p3.textContent = 'Sources: ' + hot.sources.join(' · ');
      card.appendChild(p3);
      host.appendChild(card);
    }
    var watchers = trophies.filter(function (t) { return t.watch && !t.missable; });
    if (watchers.length) {
      var card2 = document.createElement('div');
      card2.className = 'missable-card';
      var h2 = document.createElement('h2');
      h2.textContent = 'Story-window watch list — ' + watchers.length + ' trophies';
      card2.appendChild(h2);
      var p = document.createElement('p');
      p.textContent = 'Not confirmed missable, but TechWiser (single source) reports these stranger chains have windows linked to story progress. Begin each chain as soon as it unlocks to be safe.';
      card2.appendChild(p);
      var ul = document.createElement('ul');
      ul.className = 'stage-list';
      watchers.forEach(function (t) {
        var li = document.createElement('li');
        if (earned.has(t.id)) li.className = 'done';
        li.textContent = displayName(t) + ' — ' + t.description;
        ul.appendChild(li);
      });
      card2.appendChild(ul);
      host.appendChild(card2);
    }
    var safe = document.createElement('div');
    safe.className = 'missable-card';
    var h3 = document.createElement('h2');
    h3.textContent = 'Everything else is safe';
    safe.appendChild(h3);
    var ps = document.createElement('p');
    ps.textContent = 'The other 47 trophies are tied to story missions that always unlock, or to free-roam activities, collectibles and purchases that stay available after the story. No second playthrough is needed for any of them on the evidence of the official descriptions.';
    safe.appendChild(ps);
    host.appendChild(safe);
  }

  function renderAll() {
    renderProgress();
    renderList();
    renderDetail();
    renderRoadmap();
    renderMissables();
  }

  function toggleEarned(id) {
    if (earned.has(id)) earned.delete(id);
    else earned.add(id);
    saveEarned();
    renderAll();
  }
  function selectTrophy(id) {
    selectedId = id;
    renderList();
    renderDetail();
  }
  function showView(v) {
    view = v;
    document.querySelectorAll('.tab').forEach(function (b) {
      b.classList.toggle('active', b.dataset.view === v);
    });
    document.querySelectorAll('.view').forEach(function (s) {
      s.classList.toggle('active', s.id === 'view-' + v);
    });
  }
  function setSpoiler(on) {
    spoiler = on;
    saveSpoiler();
    var a = $('spoilerToggle');
    var b = $('spoilerToggle2');
    if (a) a.checked = on;
    if (b) b.checked = on;
    renderAll();
  }
  function seedDemo() {
    DEMO_IDS.forEach(function (id) { earned.add(id); });
    saveEarned();
    renderAll();
  }

  function exportProgress() {
    var payload = { game: 'Grand Theft Auto VI', guide: 'Leonida Ledger', exportedAt: new Date().toISOString(), earned: Array.from(earned).sort(function (a, b) { return a - b; }) };
    var blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'gta6-trophy-progress.json';
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }
  function importProgress(file, statusEl) {
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function () {
      try {
        var data = JSON.parse(String(reader.result));
        var ids = Array.isArray(data) ? data : data.earned;
        if (!Array.isArray(ids)) throw new Error('no earned list');
        var next = new Set();
        ids.forEach(function (v) {
          if (typeof v === 'number') { if (trophyById(v)) next.add(v); }
          else if (typeof v === 'string') {
            var found = null;
            trophies.forEach(function (t) { if (t.name === v) found = t; });
            if (found) next.add(found.id);
          }
        });
        earned = next;
        saveEarned();
        renderAll();
        if (statusEl) statusEl.textContent = 'Imported ' + earned.size + ' earned trophies from ' + file.name + '.';
      } catch (e) {
        if (statusEl) statusEl.textContent = 'Could not import ' + file.name + ': not a Leonida Ledger progress file.';
      }
    };
    reader.readAsText(file);
  }

  function applyParams() {
    var params = new URLSearchParams(window.location.search);
    var v = params.get('view');
    if (v && document.getElementById('view-' + v)) showView(v);
    var k = params.get('kind');
    if (k && (KIND_LABELS[k] || k === 'all')) {
      kind = k;
      document.querySelectorAll('#kindChips .chip').forEach(function (x) {
        x.classList.toggle('active', x.dataset.kind === k);
      });
    }
    if (params.get('spoiler') === 'on') spoiler = true;
    if (params.get('demo') === '1' && earned.size === 0) seedDemo();
    var open = params.get('open');
    if (open) {
      var id = parseInt(open, 10);
      if (trophyById(id)) selectedId = id;
    }
  }

  function bind() {
    document.querySelectorAll('.tab').forEach(function (b) {
      b.addEventListener('click', function () { showView(b.dataset.view); });
    });
    document.querySelectorAll('#kindChips .chip').forEach(function (c) {
      c.addEventListener('click', function () {
        kind = c.dataset.kind;
        document.querySelectorAll('#kindChips .chip').forEach(function (x) {
          x.classList.toggle('active', x === c);
        });
        renderList();
      });
    });
    $('searchInput').addEventListener('input', function (e) { query = e.target.value; renderList(); });
    $('gradeFilter').addEventListener('change', function (e) { grade = e.target.value; renderList(); });
    $('sortSelect').addEventListener('change', function (e) { sort = e.target.value; renderList(); });
    $('earnedOnly').addEventListener('change', function (e) { earnedOnly = e.target.checked; if (earnedOnly) { unearnedOnly = false; $('unearnedOnly').checked = false; } renderList(); });
    $('unearnedOnly').addEventListener('change', function (e) { unearnedOnly = e.target.checked; if (unearnedOnly) { earnedOnly = false; $('earnedOnly').checked = false; } renderList(); });
    $('spoilerToggle').addEventListener('change', function (e) { setSpoiler(e.target.checked); });
    $('spoilerToggle2').addEventListener('change', function (e) { setSpoiler(e.target.checked); });
    $('exportBtn').addEventListener('click', exportProgress);
    $('importInput').addEventListener('change', function (e) {
      importProgress(e.target.files[0], $('importStatus'));
      e.target.value = '';
    });
    $('demoBtn').addEventListener('click', seedDemo);
    $('resetBtn').addEventListener('click', function () {
      if (window.confirm('Reset all progress? This clears every ticked trophy.')) {
        earned = new Set();
        saveEarned();
        renderAll();
      }
    });
  }

  fetch('data/trophies.json').then(function (r) { return r.json(); }).then(function (doc) {
    trophies = doc.trophies || [];
    loadEarned();
    loadSpoiler();
    if (selectedId == null && trophies.length) selectedId = 28; // open the missable one first: it is the guide's key warning
    bind();
    applyParams();
    if (selectedId == null && trophies.length) selectedId = trophies[0].id;
    setSpoiler(spoiler);
    showView(view);
    renderAll();
  }).catch(function () {
    $('trophyList').innerHTML = '<li class="empty-note">Could not load data/trophies.json. Serve app/ over HTTP (node serve.ts) and reload.</li>';
  });
})();
