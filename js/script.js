/* Portfolio behaviour: mobile menu, resume preview, photo fallback, reveal, GQI charts. */
(function () {
  document.documentElement.classList.add('js');

  // Mobile menu
  var btn = document.getElementById('menuBtn'), nav = document.getElementById('navLinks');
  btn.addEventListener('click', function () {
    var open = nav.classList.toggle('open');
    btn.setAttribute('aria-expanded', String(open));
    btn.textContent = open ? 'Close' : 'Menu';
  });
  nav.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () {
      nav.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); btn.textContent = 'Menu';
    });
  });

  // Photo fallback: shows initials if assets/images/professional-photo.jpg is missing
  var photo = document.getElementById('profilePhoto'), fb = document.getElementById('photoFallback');
  function noPhoto() { photo.style.display = 'none'; fb.hidden = false; }
  photo.addEventListener('error', noPhoto);
  if (photo.complete && photo.naturalWidth === 0) noPhoto();

  // Resume preview (iframe loads only when opened)
  var pBtn = document.getElementById('previewBtn'), pBox = document.getElementById('previewBox');
  pBtn.addEventListener('click', function () {
    var show = pBox.hidden;
    pBox.hidden = !show;
    pBtn.setAttribute('aria-expanded', String(show));
    pBtn.textContent = show ? 'Hide preview' : 'Preview here';
    var f = pBox.querySelector('iframe');
    if (show && !f.getAttribute('src')) f.setAttribute('src', f.dataset.src);
  });

  // Scroll reveal
  var els = document.querySelectorAll('.card,.metric,.tl-item,.section-head,.contact-card');
  els.forEach(function (e) { e.classList.add('reveal'); });
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('visible'); io.unobserve(x.target); } });
    }, { threshold: 0.05 });
    els.forEach(function (e) { io.observe(e); });
  } else els.forEach(function (e) { e.classList.add('visible'); });

  /* Project data: from Project_cip.xlsx (GQI + Ratios sheets). Edit here if figures change. */
  var years = ['FY20–21', 'FY21–22', 'FY22–23', 'FY23–24', 'FY24–25'];
  var totals = [55.00, 75.77, 78.46, 77.68, 81.41];
  var dims = [
    ['Board Independence', 20, [0, 10, 10, 9.33, 7.69]],
    ['Board Diversity', 15, [0, 0.83, 0.71, 0.67, 7.31]],
    ['Board Activity', 15, [15, 15, 15, 15, 15]],
    ['Attendance', 10, [10, 9.94, 9.75, 9.68, 9.74]],
    ['Audit Committee Quality', 20, [10, 20, 18, 18, 16.67]],
    ['CSR Compliance', 15, [15, 15, 15, 15, 15]],
    ['Disclosure & Transparency', 10, [5, 5, 10, 10, 10]]
  ];
  var indep = [0, 6, 7, 7, 5], board = [7, 12, 14, 15, 13];
  var f2 = function (n) { return (Math.round(n * 100) / 100).toFixed(2); };

  // GQI bar chart
  document.getElementById('gqiBars').innerHTML = years.map(function (y, i) {
    return '<div class="bar"><span>' + y + '</span><div class="track"><div class="fill" style="width:' +
      (totals[i] / 105 * 100).toFixed(2) + '%"></div></div><strong>' + f2(totals[i]) + '</strong></div>';
  }).join('');

  // Year explorer
  var tabs = document.getElementById('yearTabs'), list = document.getElementById('dimList');
  var tot = document.getElementById('exTotal'), sub = document.getElementById('exSub'), note = document.getElementById('exNote');
  function show(i) {
    tabs.querySelectorAll('button').forEach(function (b, k) { b.setAttribute('aria-pressed', String(k === i)); });
    list.innerHTML = dims.map(function (d) {
      var v = d[2], diff = i ? v[i] - v[i - 1] : 0;
      var delta = i && Math.abs(diff) >= 0.005 ? '<em class="' + (diff > 0 ? 'up' : 'down') + '">' + (diff > 0 ? '+' : '−') + f2(Math.abs(diff)) + '</em>' : '';
      return '<div class="dim"><span class="name">' + d[0] + '</span><div class="track"><div class="fill" style="width:' + (v[i] / d[1] * 100) + '%"></div></div><span class="val">' + f2(v[i]) + ' / ' + d[1] + delta + '</span></div>';
    }).join('');
    tot.innerHTML = f2(totals[i]) + '<small> / 105</small>';
    sub.textContent = years[i] + ' · ' + indep[i] + ' of ' + board[i] + ' directors independent';
    if (!i) { note.textContent = 'Baseline year: no independent directors on the board; Audit Committee and Disclosure scores were still low.'; return; }
    var ch = dims.map(function (d) { return [d[0], d[2][i] - d[2][i - 1]]; })
      .filter(function (x) { return Math.abs(x[1]) >= 1; })
      .sort(function (a, b) { return Math.abs(b[1]) - Math.abs(a[1]); }).slice(0, 3);
    var dt = totals[i] - totals[i - 1];
    var t = (dt >= 0 ? '+' : '−') + f2(Math.abs(dt)) + ' points vs ' + years[i - 1] + '.';
    if (ch.length) t += ' Biggest movers: ' + ch.map(function (x) { return x[0] + ' (' + (x[1] > 0 ? '+' : '−') + f2(Math.abs(x[1])) + ')'; }).join(', ') + '.';
    if (i === 1) t += ' The rise coincided with the first independent-director appointments; it is an association, not proof of cause.';
    if (i === 4) t += ' Independent directors fell from 7 to 5, while Board Diversity rose.';
    note.textContent = t;
  }
  years.forEach(function (y, i) {
    var b = document.createElement('button'); b.type = 'button'; b.textContent = y;
    b.addEventListener('click', function () { show(i); }); tabs.appendChild(b);
  });
  show(4);
})();
