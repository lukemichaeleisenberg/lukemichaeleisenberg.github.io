const API = 'https://countries.trevorblades.com/graphql';

// ── GraphQL helpers ────────────────────────────────────────────────────────
const QUERIES = {
	listQuery: `query ListCountries {
  countries {
    code
    name
    emoji
    continent { name }
  }
}`,
	detailQuery: (code) => `query CountryDetail {
  country(code: "${code}") {
    code
    name
    native
    emoji
    capital
    phone
    currency
    languages { name native }
    continent { name }
    states { name }
    awsRegion
  }
}`
};

let lastResponse = null;
let currentQuery = QUERIES.listQuery;
let activeTab = 'query';
let allCountries = [];

async function gqlFetch(query) {
	currentQuery = query;
	renderGqlPanel();
	const res = await fetch(API, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ query })
	});
	const data = await res.json();
	lastResponse = data;
	renderGqlPanel();
	return data;
}

// ── Country list ───────────────────────────────────────────────────────────
async function loadCountries() {
	try {
		const data = await gqlFetch(QUERIES.listQuery);
		allCountries = data.data.countries.sort((a, b) => a.name.localeCompare(b.name));
		renderList(allCountries);
	} catch (e) {
		document.getElementById('countryList').innerHTML =
			`<div class="error-msg">⚠ failed to load: ${e.message}</div>`;
	}
}

function renderList(countries) {
	const list = document.getElementById('countryList');
	const count = document.getElementById('listCount');
	if (!countries.length) {
		list.innerHTML = '<div class="no-results">no matches</div>';
		count.textContent = '';
		return;
	}
	list.innerHTML = countries.map(c => `
		<div class="country-item" data-code="${c.code}" data-cy="country-item" tabindex="0" role="button" aria-label="${c.name}">
			<span class="flag" data-cy="country-flag">${c.emoji}</span>
			<span class="name" data-cy="country-name">${c.name}</span>
			<span class="code" data-cy="country-code">${c.code}</span>
		</div>
	`).join('');
	count.textContent = `${countries.length} countries`;

	list.querySelectorAll('.country-item').forEach(el => {
		el.addEventListener('click', () => selectCountry(el.dataset.code));
		el.addEventListener('keydown', e => { if (e.key === 'Enter') selectCountry(el.dataset.code); });
	});
}

// ── Search ─────────────────────────────────────────────────────────────────
document.getElementById('searchInput').addEventListener('input', e => {
	const q = e.target.value.toLowerCase();
	const filtered = allCountries.filter(c =>
		c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q)
	);
	renderList(filtered);
});

// ── Country detail ─────────────────────────────────────────────────────────
async function selectCountry(code) {
	// Mark active
	document.querySelectorAll('.country-item').forEach(el =>
		el.classList.toggle('active', el.dataset.code === code));

	const panel = document.getElementById('detailPanel');
	panel.innerHTML = `<div class="loading-spinner" style="height:300px"><div class="spinner"></div> loading…</div>`;

	try {
		const data = await gqlFetch(QUERIES.detailQuery(code));
		const c = data.data.country;
		renderDetail(c);
	} catch (e) {
		panel.innerHTML = `<div class="detail-content"><div class="error-msg">⚠ ${e.message}</div></div>`;
	}
}

function tag(text, accent) {
	return `<span class="tag${accent ? ' accent' : ''}" data-cy="tag">${text}</span>`;
}

function renderDetail(c) {
	const panel = document.getElementById('detailPanel');
	const langs = c.languages?.length
		? c.languages.map(l => tag(`${l.name}${l.native && l.native !== l.name ? ` · ${l.native}` : ''}`)).join('')
		: tag('—');
	const states = c.states?.length
		? c.states.slice(0, 20).map(s => tag(s.name)).join('') + (c.states.length > 20 ? `<span class="tag">+${c.states.length - 20} more</span>` : '')
		: tag('no state data');

	panel.innerHTML = `
		<div class="detail-content" data-cy="detail-content">
			<div class="detail-hero" data-cy="detail-hero">
				<div class="detail-emoji" data-cy="detail-emoji">${c.emoji}</div>
				<div class="detail-names">
					<h1 data-cy="detail-country-name">${c.name}</h1>
					${c.native && c.native !== c.name ? `<div class="native" data-cy="detail-native">${c.native}</div>` : ''}
					<span class="code-badge" data-cy="code-badge">${c.code}</span>
				</div>
			</div>
			<div class="detail-grid" data-cy="detail-grid">
				<div class="detail-card" data-cy="detail-card">
					<div class="card-label" data-cy="card-label">continent</div>
					<div class="card-value" data-cy="card-value">${c.continent?.name ?? '—'}</div>
				</div>
				<div class="detail-card" data-cy="detail-card">
					<div class="card-label" data-cy="card-label">capital</div>
					<div class="card-value" data-cy="card-value">${c.capital ?? '—'}</div>
				</div>
				<div class="detail-card" data-cy="detail-card">
					<div class="card-label" data-cy="card-label">phone code</div>
					<div class="card-value" data-cy="card-value">+${c.phone ?? '—'}</div>
				</div>
				<div class="detail-card" data-cy="detail-card">
					<div class="card-label" data-cy="card-label">currency</div>
					<div class="card-value" data-cy="card-value">${c.currency ?? '—'}</div>
				</div>
				<div class="detail-card full" data-cy="detail-card">
					<div class="card-label" data-cy="card-label">languages</div>
					<div class="card-value" data-cy="card-value"><div class="tags" data-cy="tags">${langs}</div></div>
				</div>
				<div class="detail-card full" data-cy="detail-card">
					<div class="card-label" data-cy="card-label">states / provinces (${c.states?.length ?? 0})</div>
					<div class="card-value" data-cy="card-value"><div class="tags" data-cy="tags">${states}</div></div>
				</div>
				${c.awsRegion ? `
				<div class="detail-card full" data-cy="detail-card">
					<div class="card-label" data-cy="card-label">aws region</div>
					<div class="card-value" data-cy="card-value"><code style="font-family:'DM Mono',monospace;font-size:0.85rem">${c.awsRegion}</code></div>
				</div>` : ''}
			</div>
		</div>
	`;
}

// ── GraphQL panel ──────────────────────────────────────────────────────────
function renderGqlPanel() {
	const content = document.getElementById('gqlContent');
	if (activeTab === 'query') {
		content.innerHTML = syntaxHL(currentQuery);
	} else {
		content.innerHTML = lastResponse
			? jsonHL(JSON.stringify(lastResponse, null, 2))
			: '<span style="color:#8a8278">— no response yet —</span>';
	}
}

function syntaxHL(q) {
	return q
		.replace(/\b(query|mutation|fragment|on)\b/g, '<span class="kw">$1</span>')
		.replace(/\b([a-z][a-zA-Z]+)(?=\s*[({])/g, '<span class="field">$1</span>')
		.replace(/"([^"]*)"/g, '<span class="str">"$1"</span>');
}

function jsonHL(j) {
	return j
		.replace(/"([^"]+)":/g, '<span class="field">"$1"</span>:')
		.replace(/: "([^"]*)"/g, ': <span class="str">"$1"</span>')
		.replace(/: (\d+\.?\d*)/g, ': <span class="num">$1</span>')
		.replace(/: (true|false|null)/g, ': <span class="kw">$1</span>');
}

document.getElementById('gqlToggle').addEventListener('click', () => {
	document.getElementById('gqlPanel').classList.toggle('open');
	renderGqlPanel();
});
document.getElementById('gqlClose').addEventListener('click', () => {
	document.getElementById('gqlPanel').classList.remove('open');
});
document.querySelectorAll('.gql-tab').forEach(tab => {
	tab.addEventListener('click', () => {
		document.querySelectorAll('.gql-tab').forEach(t => t.classList.remove('active'));
		tab.classList.add('active');
		activeTab = tab.dataset.tab;
		renderGqlPanel();
	});
});

// ── Init ───────────────────────────────────────────────────────────────────
loadCountries();
