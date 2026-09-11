import React, { useEffect, useMemo, useState } from 'react';

/**
 * Gestor de la biblioteca visual.
 *
 * Lee public/assets/assets-manifest.json, que describe la procedencia verificada
 * de cada activo. La licencia, la fuente y la atribución se muestran siempre y
 * no son editables desde aquí: el manifiesto es material versionado y cambiarlo
 * a mano desde el panel abriría la puerta a publicar un recurso con una licencia
 * que nadie comprobó.
 *
 * Lo que sí puede ajustar la edición —título mostrado, texto alternativo,
 * descripción y crédito visible— se guarda como superposición en el contenido.
 */

const CATEGORY_LABEL = {
  territorio: 'Territorio',
  municipalidad: 'Municipalidad',
  ilustracion: 'Ilustraciones',
  'marca-oficial': 'Marcas oficiales'
};

const STATUS_LABEL = {
  approved: 'Aprobado',
  'pending-authorization': 'Pendiente de autorización',
  'available-unused': 'Disponible, sin usar',
  rejected: 'Descartado'
};

const kb = n => (n >= 1024 ? `${Math.round(n / 1024)} kB` : `${n} B`);

export function VisualLibrary({ API, content, reload }) {
  const [manifest, setManifest] = useState(null);
  const [meta, setMeta] = useState({});
  const [health, setHealth] = useState({});
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);
  const [filters, setFilters] = useState({ q: '', category: '', license: '', institution: '', location: '' });
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [flash, setFlash] = useState('');

  useEffect(() => {
    API.manifest().then(setManifest).catch(e => setError(e.message));
    API.assetMeta().then(setMeta).catch(() => {});
  }, []);

  /* Comprobación real de que cada archivo existe y responde. */
  useEffect(() => {
    if (!manifest) return;
    let cancelled = false;
    (async () => {
      const result = {};
      for (const a of manifest.assets) {
        try {
          const r = await fetch(a.file, { method: 'HEAD' });
          result[a.id] = { ok: r.ok, status: r.status, bytes: Number(r.headers.get('content-length') || 0) };
        } catch {
          result[a.id] = { ok: false, status: 0 };
        }
      }
      if (!cancelled) setHealth(result);
    })();
    return () => { cancelled = true; };
  }, [manifest]);

  const assets = manifest?.assets || [];
  const merged = useMemo(() => assets.map(a => ({ ...a, ...(meta[a.id] || {}) })), [assets, meta]);

  const options = useMemo(() => {
    const uniq = key => [...new Set(assets.map(a => a[key]).filter(Boolean))].sort();
    return { categories: uniq('category'), licenses: uniq('license'), institutions: uniq('institution'), locations: uniq('location') };
  }, [assets]);

  const visible = useMemo(() => {
    const q = filters.q.trim().toLowerCase();
    return merged.filter(a => {
      if (filters.category && a.category !== filters.category) return false;
      if (filters.license && a.license !== filters.license) return false;
      if (filters.institution && a.institution !== filters.institution) return false;
      if (filters.location && a.location !== filters.location) return false;
      if (!q) return true;
      return [a.title, a.description, a.alt, a.category, (a.tags || []).join(' '), a.location, a.author]
        .join(' ').toLowerCase().includes(q);
    });
  }, [merged, filters]);

  /* Dónde está usado cada activo hoy, leído del contenido real. */
  const usageIndex = useMemo(() => {
    const index = {};
    const note = (url, where) => { if (url) (index[url] ||= []).push(where); };
    for (const [k, v] of Object.entries(content.site || {})) {
      if (/image/i.test(k) && typeof v === 'string') note(v, `Portada · ${k}`);
    }
    for (const col of ['capsules', 'notes', 'libraryCollections']) {
      for (const item of content[col] || []) note(item.imageUrl, `${col} · ${item.title || item.id}`);
    }
    return index;
  }, [content]);

  const open = a => {
    setSelected(a);
    setForm({ title: a.title || '', alt: a.alt || '', description: a.description || '', credit: a.credit || a.attribution || '' });
    setFlash('');
  };

  const save = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const saved = await API.saveAssetMeta(selected.id, form);
      setMeta(m => ({ ...m, [selected.id]: saved }));
      setFlash('Metadatos guardados.');
    } catch (e) {
      setFlash(e.message);
    } finally {
      setSaving(false);
    }
  };

  const copy = async (text, label) => {
    try { await navigator.clipboard.writeText(text); setFlash(`${label} copiada al portapapeles.`); }
    catch { setFlash(`Copia manualmente: ${text}`); }
  };

  if (error) return <><div className="page-head"><div><p className="kicker">Biblioteca visual</p><h1>No fue posible leer el manifiesto</h1><p>{error}</p></div></div><section className="panel-card"><p className="muted">Genera el manifiesto con <code>node scripts/build-assets.mjs</code> y recarga esta página.</p></section></>;
  if (!manifest) return <div className="loading">Cargando biblioteca visual…</div>;

  const broken = Object.entries(health).filter(([, h]) => !h.ok);
  const notUsable = manifest.notUsed || [];

  return <>
    <div className="page-head">
      <div>
        <p className="kicker">Biblioteca visual</p>
        <h1>Activos disponibles</h1>
        <p>Cada imagen del portal, con su procedencia verificada. La licencia y la fuente se muestran siempre y no se editan desde aquí.</p>
      </div>
      <span className="asset-count">{visible.length} de {assets.length}</span>
    </div>

    {broken.length > 0 &&
      <div className="storage-warning" role="alert">
        <strong>{broken.length} archivo(s) no responden</strong>
        <p>{broken.map(([id]) => id).join(', ')}. Vuelve a ejecutar <code>node scripts/build-assets.mjs</code> o restaura los archivos que falten.</p>
      </div>}

    <section className="panel-card">
      <div className="asset-filters">
        <label className="grow">Buscar
          <input value={filters.q} onChange={e => setFilters(f => ({ ...f, q: e.target.value }))} placeholder="Título, descripción, etiqueta, lugar…" />
        </label>
        <label>Categoría
          <select value={filters.category} onChange={e => setFilters(f => ({ ...f, category: e.target.value }))}>
            <option value="">Todas</option>
            {options.categories.map(c => <option key={c} value={c}>{CATEGORY_LABEL[c] || c}</option>)}
          </select>
        </label>
        <label>Licencia
          <select value={filters.license} onChange={e => setFilters(f => ({ ...f, license: e.target.value }))}>
            <option value="">Todas</option>
            {options.licenses.map(l => <option key={l} value={l}>{l.length > 46 ? l.slice(0, 46) + '…' : l}</option>)}
          </select>
        </label>
        <label>Institución
          <select value={filters.institution} onChange={e => setFilters(f => ({ ...f, institution: e.target.value }))}>
            <option value="">Todas</option>
            {options.institutions.map(i => <option key={i} value={i}>{i}</option>)}
          </select>
        </label>
        <label>Ubicación
          <select value={filters.location} onChange={e => setFilters(f => ({ ...f, location: e.target.value }))}>
            <option value="">Todas</option>
            {options.locations.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </label>
      </div>
    </section>

    <section className="panel-card">
      <div className="asset-grid">
        {visible.map(a => {
          const h = health[a.id];
          const used = usageIndex[a.file] || [];
          return (
            <button type="button" key={a.id} className={`asset-card${selected?.id === a.id ? ' on' : ''}${h && !h.ok ? ' broken' : ''}`} onClick={() => open(a)}>
              <span className="asset-thumb">
                <img src={a.thumbnail || a.file} alt="" loading="lazy" decoding="async" />
              </span>
              <span className="asset-body">
                <strong>{a.title}</strong>
                <small>{a.width}×{a.height} · {a.aspectRatio} · {kb(a.bytes)}</small>
                <span className="asset-tags">
                  <em className={`chip chip-${a.status}`}>{STATUS_LABEL[a.status] || a.status}</em>
                  {a.locked && <em className="chip chip-locked">Símbolo oficial</em>}
                  {used.length > 0
                    ? <em className="chip chip-used">En uso ({used.length})</em>
                    : <em className="chip">Sin uso</em>}
                </span>
              </span>
            </button>
          );
        })}
        {!visible.length && <p className="muted">Ningún activo coincide con el filtro.</p>}
      </div>
    </section>

    {selected && form &&
      <section className="panel-card asset-detail">
        <div className="editor-head">
          <div>
            <h2>{selected.title}</h2>
            <p className="muted">{selected.file}</p>
          </div>
          <button className="plain" onClick={() => { setSelected(null); setForm(null); }}>Cerrar</button>
        </div>

        <div className="asset-detail-grid">
          <figure className={selected.type === 'illustration' ? 'asset-preview plate' : 'asset-preview'}>
            <img src={selected.file} alt={selected.alt || ''} />
          </figure>

          <div>
            <dl className="asset-provenance">
              <dt>Licencia</dt><dd>{selected.license}</dd>
              <dt>Autor</dt><dd>{selected.author || '—'}</dd>
              <dt>Institución</dt><dd>{selected.institution || '—'}</dd>
              <dt>Página de origen</dt>
              <dd>{/^https?:/.test(selected.sourcePage)
                ? <a href={selected.sourcePage} target="_blank" rel="noopener noreferrer">{selected.sourcePage} ↗</a>
                : selected.sourcePage}</dd>
              <dt>Atribución</dt><dd>{selected.attribution || '—'}</dd>
              <dt>Consultado</dt><dd>{selected.retrievedAt}</dd>
              <dt>Dimensiones</dt><dd>{selected.width}×{selected.height} px · {selected.aspectRatio}</dd>
              <dt>Estado</dt><dd>{STATUS_LABEL[selected.status] || selected.status}</dd>
            </dl>

            {selected.notes && <p className="asset-note">{selected.notes}</p>}

            {selected.locked &&
              <p className="asset-note asset-note-locked">
                Símbolo oficial. Se usa tal cual: no se recorta, no se recolorea y no se modifica.
              </p>}

            <div className="asset-actions">
              <button type="button" onClick={() => copy(selected.file, 'Ruta local')}>Copiar ruta local</button>
              {(usageIndex[selected.file] || []).length > 0 &&
                <span className="muted">En uso: {(usageIndex[selected.file] || []).join(' · ')}</span>}
            </div>

            <AssignPanel API={API} content={content} reload={reload} asset={selected} onFlash={setFlash} />
          </div>
        </div>

        <div className="form-grid asset-meta-form">
          <label>Título mostrado<input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} /></label>
          <label>Crédito visible<input value={form.credit} onChange={e => setForm(f => ({ ...f, credit: e.target.value }))} /></label>
          <label className="wide">Texto alternativo
            <textarea rows="2" value={form.alt} onChange={e => setForm(f => ({ ...f, alt: e.target.value }))} />
            <small className="muted">Describe lo que muestra la imagen para quien no puede verla. No repitas la fecha ni la categoría.</small>
          </label>
          <label className="wide">Descripción<textarea rows="2" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></label>
          <div className="wide form-actions">
            <button className="primary" disabled={saving} onClick={save}>{saving ? 'Guardando…' : 'Guardar metadatos'}</button>
            {flash && <span className="muted">{flash}</span>}
          </div>
        </div>
      </section>}

    {notUsable.length > 0 &&
      <section className="panel-card">
        <h2>Revisados y no incorporados</h2>
        <p className="muted">Constancia de lo que se verificó y por qué no se usa. Estos recursos no están en el repositorio y no pueden seleccionarse.</p>
        <div className="list">
          {notUsable.map(r => (
            <div className="list-row" key={r.id}>
              <span className="ordinal">—</span>
              <div className="grow">
                <small>{STATUS_LABEL[r.status] || r.status} · {r.license}</small>
                <h3>{r.title}</h3>
                <p>{r.reason}</p>
                {/^https?:/.test(r.sourcePage) && <a href={r.sourcePage} target="_blank" rel="noopener noreferrer">Ver origen ↗</a>}
              </div>
            </div>
          ))}
        </div>
      </section>}
  </>;
}

/** Asignar el activo a una cápsula, nota o colección existente. */
function AssignPanel({ API, content, reload, asset, onFlash }) {
  const [collection, setCollection] = useState('capsules');
  const [target, setTarget] = useState('');
  const [busy, setBusy] = useState(false);
  const items = content[collection] || [];

  useEffect(() => { setTarget(items[0]?.id || ''); }, [collection, content]);

  const blocked = asset.status !== 'approved';

  const assign = async () => {
    if (!target || blocked) return;
    setBusy(true);
    try {
      await API.patch(collection, target, { imageUrl: asset.file, coverAlt: asset.alt || '' });
      await reload();
      onFlash('Imagen asignada, con su texto alternativo.');
    } catch (e) {
      onFlash(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="asset-assign">
      <h3>Asignar a contenido</h3>
      {blocked
        ? <p className="muted">Este activo no está aprobado, así que no puede asignarse.</p>
        : <>
            <div className="asset-assign-row">
              <select value={collection} onChange={e => setCollection(e.target.value)}>
                <option value="capsules">Cápsulas</option>
                <option value="notes">Notas</option>
                <option value="libraryCollections">Colecciones</option>
              </select>
              <select value={target} onChange={e => setTarget(e.target.value)}>
                {items.map(i => <option key={i.id} value={i.id}>{i.title || i.id}</option>)}
                {!items.length && <option value="">Sin elementos</option>}
              </select>
              <button className="primary" disabled={busy || !target} onClick={assign}>{busy ? 'Asignando…' : 'Asignar'}</button>
            </div>
            <small className="muted">Se asigna la imagen y su texto alternativo. La portada anterior se reemplaza.</small>
          </>}
    </div>
  );
}
