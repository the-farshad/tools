(function () {
  const form = document.getElementById('ics-form');
  const allDay = document.getElementById('all-day');
  const startEl = document.getElementById('start');
  const endEl = document.getElementById('end');
  const preview = document.getElementById('preview');
  const status = document.getElementById('status');
  const copyBtn = document.getElementById('copy-link');
  const clearBtn = document.getElementById('clear');

  const FIELDS = ['title','location','description','start','end','reminder','freq','count','all-day'];

  // ---------- helpers ----------

  function fold(line) {
    // RFC 5545: lines max 75 octets, continuation starts with space
    if (line.length <= 75) return line;
    const parts = [];
    let i = 0;
    parts.push(line.slice(0, 75));
    i = 75;
    while (i < line.length) {
      parts.push(' ' + line.slice(i, i + 74));
      i += 74;
    }
    return parts.join('\r\n');
  }

  function escIcs(s) {
    return String(s == null ? '' : s)
      .replace(/\\/g, '\\\\')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,')
      .replace(/\r?\n/g, '\\n');
  }

  function pad(n) { return n < 10 ? '0' + n : '' + n; }

  function fmtUtc(date) {
    return date.getUTCFullYear() +
      pad(date.getUTCMonth() + 1) +
      pad(date.getUTCDate()) + 'T' +
      pad(date.getUTCHours()) +
      pad(date.getUTCMinutes()) +
      pad(date.getUTCSeconds()) + 'Z';
  }

  function fmtDate(date) {
    return date.getUTCFullYear() +
      pad(date.getUTCMonth() + 1) +
      pad(date.getUTCDate());
  }

  function uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  function setStatus(msg, isError) {
    status.innerHTML = '';
    if (!msg) return;
    const div = document.createElement('div');
    div.className = 'notice' + (isError ? ' error' : '');
    div.textContent = msg;
    status.appendChild(div);
  }

  // ---------- model from form ----------

  function readForm() {
    const fd = new FormData(form);
    return {
      title: fd.get('title') || '',
      location: fd.get('location') || '',
      description: fd.get('description') || '',
      start: fd.get('start') || '',
      end: fd.get('end') || '',
      reminder: fd.get('reminder') || '',
      freq: fd.get('freq') || '',
      count: fd.get('count') || '',
      'all-day': allDay.checked ? '1' : '',
    };
  }

  function validate(d) {
    if (!d.title.trim()) return 'Title is required.';
    if (!d.start) return 'Start is required.';
    if (!d.end && !d['all-day']) return 'End is required.';
    if (!d['all-day']) {
      const s = new Date(d.start);
      const e = new Date(d.end);
      if (isNaN(s) || isNaN(e)) return 'Start or end is not a valid datetime.';
      if (e <= s) return 'End must be after start.';
    }
    if (d.freq && d.count) {
      const n = parseInt(d.count, 10);
      if (!Number.isFinite(n) || n < 1) return 'Times must be a positive number.';
    }
    return null;
  }

  function buildIcs(d) {
    const lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//thefarshad//ics-builder//EN',
      'CALSCALE:GREGORIAN',
      'BEGIN:VEVENT',
      'UID:' + uuid() + '@thefarshad.com',
      'DTSTAMP:' + fmtUtc(new Date()),
    ];

    if (d['all-day']) {
      // YYYY-MM-DD only
      const s = new Date(d.start);
      const e = d.end ? new Date(d.end) : new Date(s.getTime() + 86400000);
      lines.push('DTSTART;VALUE=DATE:' + fmtDate(s));
      lines.push('DTEND;VALUE=DATE:' + fmtDate(e));
    } else {
      lines.push('DTSTART:' + fmtUtc(new Date(d.start)));
      lines.push('DTEND:' + fmtUtc(new Date(d.end)));
    }

    lines.push('SUMMARY:' + escIcs(d.title));
    if (d.location) lines.push('LOCATION:' + escIcs(d.location));
    if (d.description) lines.push('DESCRIPTION:' + escIcs(d.description));

    if (d.freq) {
      let r = 'RRULE:FREQ=' + d.freq;
      if (d.count) r += ';COUNT=' + parseInt(d.count, 10);
      lines.push(r);
    }

    if (d.reminder) {
      lines.push('BEGIN:VALARM');
      lines.push('ACTION:DISPLAY');
      lines.push('TRIGGER:-PT' + parseInt(d.reminder, 10) + 'M');
      lines.push('DESCRIPTION:' + escIcs(d.title));
      lines.push('END:VALARM');
    }

    lines.push('END:VEVENT');
    lines.push('END:VCALENDAR');

    return lines.map(fold).join('\r\n') + '\r\n';
  }

  function safeFilename(s) {
    return (s || 'event').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'event';
  }

  function download(filename, content) {
    const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  // ---------- preview ----------

  function fmtWhen(d) {
    if (d['all-day']) {
      const s = new Date(d.start);
      return s.toLocaleDateString() + (d.end ? ' &mdash; ' + new Date(d.end).toLocaleDateString() : '') + ' (all day)';
    }
    if (!d.start || !d.end) return '';
    const s = new Date(d.start);
    const e = new Date(d.end);
    const sameDay = s.toDateString() === e.toDateString();
    const opts = { hour: 'numeric', minute: '2-digit' };
    if (sameDay) {
      return s.toLocaleDateString() + ' &middot; ' + s.toLocaleTimeString([], opts) + ' &mdash; ' + e.toLocaleTimeString([], opts);
    }
    return s.toLocaleString() + ' &mdash; ' + e.toLocaleString();
  }

  function refreshPreview() {
    const d = readForm();
    if (!d.title && !d.start) {
      preview.style.display = 'none';
      return;
    }
    preview.style.display = '';
    document.getElementById('pv-title').textContent = d.title || '(untitled)';
    document.getElementById('pv-when').innerHTML = fmtWhen(d);
    document.getElementById('pv-where').textContent = d.location ? '@ ' + d.location : '';
    let r = '';
    if (d.freq) r = 'Repeats ' + d.freq.toLowerCase() + (d.count ? ' &times; ' + parseInt(d.count, 10) : '');
    document.getElementById('pv-repeat').innerHTML = r;
  }

  // ---------- share link ----------

  function toQueryString(d) {
    const params = new URLSearchParams();
    FIELDS.forEach(k => {
      if (d[k]) params.set(k, d[k]);
    });
    return params.toString();
  }

  function fromQueryString() {
    const params = new URLSearchParams(location.search);
    FIELDS.forEach(k => {
      const v = params.get(k);
      if (v == null) return;
      if (k === 'all-day') {
        if (v === '1') allDay.checked = true;
      } else {
        const el = form.elements[k];
        if (el) el.value = v;
      }
    });
    syncAllDay();
    refreshPreview();
  }

  // ---------- all-day toggle ----------

  function syncAllDay() {
    if (allDay.checked) {
      startEl.type = 'date';
      endEl.type = 'date';
    } else {
      startEl.type = 'datetime-local';
      endEl.type = 'datetime-local';
    }
  }

  // ---------- wire ----------

  form.addEventListener('input', refreshPreview);
  form.addEventListener('change', refreshPreview);
  allDay.addEventListener('change', () => { syncAllDay(); refreshPreview(); });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const d = readForm();
    const err = validate(d);
    if (err) { setStatus(err, true); return; }
    const ics = buildIcs(d);
    download(safeFilename(d.title) + '.ics', ics);
    setStatus('Downloaded ' + safeFilename(d.title) + '.ics');
  });

  copyBtn.addEventListener('click', () => {
    const d = readForm();
    const url = location.origin + location.pathname + '?' + toQueryString(d);
    navigator.clipboard.writeText(url).then(
      () => setStatus('Share link copied to clipboard.'),
      () => {
        setStatus(url, false);
      }
    );
  });

  clearBtn.addEventListener('click', () => {
    form.reset();
    history.replaceState(null, '', location.pathname);
    syncAllDay();
    preview.style.display = 'none';
    setStatus('');
  });

  // initial
  fromQueryString();
})();
