import React, { useState, useMemo } from 'react';
import type { RankingEntity } from '../types/dashboard';

export interface DynamicRankingTableProps {
  initialEntities: RankingEntity[];
  lastUpdated?: string;
}

type SortColumn = 'posicion' | 'nombre' | 'scoreGlobal' | 'scoreDisponibilidad' | 'scoreDesempeno' | 'scoreAccesibilidad';
type SortDirection = 'asc' | 'desc';

export default function DynamicRankingTable({ initialEntities, lastUpdated }: DynamicRankingTableProps) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedRegion, setSelectedRegion] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [sortCol, setSortCol] = useState<SortColumn>('posicion');
  const [sortDir, setSortDir] = useState<SortDirection>('asc');
  const [pageSize, setPageSize] = useState<number>(20);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Derive categories and regions
  const categories = useMemo(() => {
    const set = new Set<string>();
    initialEntities.forEach(e => { if (e.categoria) set.add(e.categoria); });
    return Array.from(set).sort();
  }, [initialEntities]);

  const regions = useMemo(() => {
    const set = new Set<string>();
    initialEntities.forEach(e => { if (e.region) set.add(e.region); });
    return Array.from(set).sort();
  }, [initialEntities]);

  // Filtering
  const filtered = useMemo(() => {
    return initialEntities.filter(entity => {
      const matchSearch = search.trim() === '' ||
        entity.nombre.toLowerCase().includes(search.toLowerCase()) ||
        entity.url.toLowerCase().includes(search.toLowerCase());

      const matchCategory = selectedCategory === 'ALL' || entity.categoria === selectedCategory;
      const matchRegion = selectedRegion === 'ALL' || entity.region === selectedRegion;
      const matchStatus = selectedStatus === 'ALL' || entity.estadoSla === selectedStatus;

      return matchSearch && matchCategory && matchRegion && matchStatus;
    });
  }, [initialEntities, search, selectedCategory, selectedRegion, selectedStatus]);

  // Sorting
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let valA = a[sortCol];
      let valB = b[sortCol];

      if (typeof valA === 'string') {
        const cmp = valA.localeCompare(valB as string);
        return sortDir === 'asc' ? cmp : -cmp;
      }

      if (valA < valB) return sortDir === 'asc' ? -1 : 1;
      if (valA > valB) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filtered, sortCol, sortDir]);

  // Paginación
  const totalPages = pageSize > 0 ? Math.ceil(sorted.length / pageSize) : 1;
  const safePage = Math.min(Math.max(1, currentPage), Math.max(1, totalPages));

  const paginated = useMemo(() => {
    if (pageSize <= 0) return sorted;
    const start = (safePage - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, safePage, pageSize]);

  const handleSort = (col: SortColumn) => {
    if (sortCol === col) {
      setSortDir(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortCol(col);
      setSortDir(col === 'posicion' || col === 'nombre' ? 'asc' : 'desc');
    }
  };

  const getSortIcon = (col: SortColumn) => {
    if (sortCol !== col) {
      return (
        <span style={{ opacity: 0.3, marginLeft: 4 }}>↕</span>
      );
    }
    return (
      <span style={{ color: 'var(--md-sys-color-primary)', marginLeft: 4, fontWeight: 'bold' }}>
        {sortDir === 'asc' ? '↑' : '↓'}
      </span>
    );
  };

  return (
    <div className="dynamic-ranking-container" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      {/* Search and Filters Bar */}
      <div className="m3-card" style={{ padding: 'var(--space-4)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-3)' }}>
          {/* Search Input */}
          {/* Search Input */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
            <label htmlFor="ranking-search" style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--md-sys-color-on-surface-variant)' }}>
              Buscar Portal o Entidad
            </label>
            <input
              id="ranking-search"
              type="search"
              className="m3-input"
              placeholder="Ej. PCM, Salud, Cusco, munlima..."
              value={search}
              onChange={e => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              aria-label="Buscar entidad por nombre o dominio"
            />
          </div>

          {/* Category Filter */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
            <label htmlFor="filter-category" style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--md-sys-color-on-surface-variant)' }}>
              Categoría Institucional
            </label>
            <select
              id="filter-category"
              className="m3-select"
              value={selectedCategory}
              onChange={e => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="ALL">Todas las Categorías ({initialEntities.length})</option>
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Region Filter */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
            <label htmlFor="filter-region" style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--md-sys-color-on-surface-variant)' }}>
              Región
            </label>
            <select
              id="filter-region"
              className="m3-select"
              value={selectedRegion}
              onChange={e => {
                setSelectedRegion(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="ALL">Todas las Regiones</option>
              {regions.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          {/* SLA Status Filter */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
            <label htmlFor="filter-status" style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--md-sys-color-on-surface-variant)' }}>
              Estado de Cumplimiento SLA
            </label>
            <select
              id="filter-status"
              className="m3-select"
              value={selectedStatus}
              onChange={e => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="ALL">Todos los Estados</option>
              <option value="CUMPLE">Cumple SLA (&ge; 99.5%)</option>
              <option value="EN_RIESGO">En Riesgo (98.0% - 99.4%)</option>
              <option value="INCUMPLE">Incumple (&lt; 98.0%)</option>
            </select>
          </div>
        </div>

        {/* Counter & Reset */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'var(--space-3)', paddingTop: 'var(--space-2)', borderTop: '1px solid var(--md-sys-color-outline-variant)' }}>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--md-sys-color-on-surface-variant)' }}>
            Mostrando <strong>{sorted.length}</strong> de {initialEntities.length} portales evaluados
            {lastUpdated && ` • Actualizado: ${lastUpdated}`}
          </span>
          {(search || selectedCategory !== 'ALL' || selectedRegion !== 'ALL' || selectedStatus !== 'ALL') && (
            <button
              type="button"
              className="m3-btn m3-btn-outlined"
              style={{ minHeight: '32px', padding: '2px 12px', fontSize: 'var(--text-xs)' }}
              onClick={() => {
                setSearch('');
                setSelectedCategory('ALL');
                setSelectedRegion('ALL');
                setSelectedStatus('ALL');
                setCurrentPage(1);
              }}
            >
              Restablecer filtros
            </button>
          )}
        </div>
      </div>

      {/* Table Container */}
      <div className="m3-table-wrapper" role="region" aria-label="Tabla de Ranking de Calidad Digital" tabIndex={0}>
        <table className="m3-table">
          <thead>
            <tr>
              <th scope="col" style={{ width: '60px', textAlign: 'center' }}>
                <button
                  type="button"
                  style={{ background: 'none', border: 'none', font: 'inherit', fontWeight: 'bold', cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}
                  onClick={() => handleSort('posicion')}
                  aria-label="Ordenar por puesto en ranking"
                >
                  # {getSortIcon('posicion')}
                </button>
              </th>
              <th scope="col">
                <button
                  type="button"
                  style={{ background: 'none', border: 'none', font: 'inherit', fontWeight: 'bold', cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}
                  onClick={() => handleSort('nombre')}
                  aria-label="Ordenar por nombre de entidad"
                >
                  Entidad Institucional {getSortIcon('nombre')}
                </button>
              </th>
              <th scope="col">Categoría / Región</th>
              <th scope="col" style={{ textAlign: 'right' }}>
                <button
                  type="button"
                  style={{ background: 'none', border: 'none', font: 'inherit', fontWeight: 'bold', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', marginLeft: 'auto' }}
                  onClick={() => handleSort('scoreGlobal')}
                  aria-label="Ordenar por puntaje global"
                >
                  Score Global {getSortIcon('scoreGlobal')}
                </button>
              </th>
              <th scope="col" style={{ textAlign: 'right' }}>
                <button
                  type="button"
                  style={{ background: 'none', border: 'none', font: 'inherit', fontWeight: 'bold', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', marginLeft: 'auto' }}
                  onClick={() => handleSort('scoreDisponibilidad')}
                  aria-label="Ordenar por disponibilidad"
                >
                  Uptime {getSortIcon('scoreDisponibilidad')}
                </button>
              </th>
              <th scope="col" style={{ textAlign: 'right' }}>
                <button
                  type="button"
                  style={{ background: 'none', border: 'none', font: 'inherit', fontWeight: 'bold', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', marginLeft: 'auto' }}
                  onClick={() => handleSort('scoreDesempeno')}
                  aria-label="Ordenar por desempeño web"
                >
                  Velocidad {getSortIcon('scoreDesempeno')}
                </button>
              </th>
              <th scope="col" style={{ textAlign: 'right' }}>
                <button
                  type="button"
                  style={{ background: 'none', border: 'none', font: 'inherit', fontWeight: 'bold', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', marginLeft: 'auto' }}
                  onClick={() => handleSort('scoreAccesibilidad')}
                  aria-label="Ordenar por accesibilidad WCAG"
                >
                  Accesibilidad {getSortIcon('scoreAccesibilidad')}
                </button>
              </th>
              <th scope="col" style={{ textAlign: 'center' }}>SLA 99.5%</th>
              <th scope="col" style={{ textAlign: 'center' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
                  <p style={{ margin: 0, fontWeight: 600 }}>No se encontraron portales con los filtros seleccionados.</p>
                  <p style={{ margin: 'var(--space-1) 0 0', fontSize: 'var(--text-xs)' }}>Intente con otros términos o limpie los criterios de búsqueda.</p>
                </td>
              </tr>
            ) : (
              paginated.map((entity) => {
                const isTop3 = entity.posicion <= 3;
                return (
                  <tr key={entity.id}>
                    <td style={{ textAlign: 'center', fontWeight: 800 }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '28px',
                          height: '28px',
                          borderRadius: 'var(--md-shape-full)',
                          backgroundColor: isTop3 ? 'var(--md-sys-color-primary-container)' : 'transparent',
                          color: isTop3 ? 'var(--md-sys-color-on-primary-container)' : 'inherit',
                          fontSize: 'var(--text-xs)'
                        }}
                      >
                        {entity.posicion}
                      </span>
                    </td>
                    <td>
                      <div>
                        <a
                          href={`/entidad/${entity.id}`}
                          style={{ fontWeight: 700, color: 'var(--md-sys-color-primary)', textDecoration: 'none' }}
                        >
                          {entity.nombre}
                        </a>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--md-sys-color-on-surface-variant)' }}>
                          <a
                            href={entity.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: 'inherit', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                          >
                            <span>{entity.url.replace('https://', '')}</span>
                            <span style={{ fontSize: '10px' }}>↗</span>
                          </a>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: 'var(--text-xs)' }}>
                        <span style={{ fontWeight: 600 }}>{entity.categoria}</span>
                        {entity.region && (
                          <span style={{ color: 'var(--md-sys-color-on-surface-variant)', display: 'block' }}>
                            {entity.region}
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 800, fontSize: 'var(--text-base)' }}>
                      <span style={{
                        color: entity.scoreGlobal >= 90 ? 'var(--color-status-success)' : entity.scoreGlobal >= 80 ? 'var(--color-status-warning)' : 'var(--color-status-danger)'
                      }}>
                        {entity.scoreGlobal.toFixed(1)}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>
                      {entity.scoreDisponibilidad.toFixed(1)}%
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>
                      {entity.scoreDesempeno.toFixed(0)}/100
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>
                      {entity.scoreAccesibilidad.toFixed(0)}%
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className={`m3-chip ${
                        entity.estadoSla === 'CUMPLE' ? 'm3-chip-success' : entity.estadoSla === 'EN_RIESGO' ? 'm3-chip-warning' : 'm3-chip-danger'
                      }`}>
                        {entity.estadoSla === 'CUMPLE' ? 'CUMPLE' : entity.estadoSla === 'EN_RIESGO' ? 'RIESGO' : 'INCUMPLE'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                        <a
                          href={`/entidad/${entity.id}`}
                          className="m3-btn m3-btn-outlined"
                          style={{ minHeight: '28px', padding: '2px 8px', fontSize: '11px', textDecoration: 'none' }}
                          title={`Ver ficha técnica de ${entity.nombre}`}
                        >
                          Ficha
                        </a>
                        <a
                          href={`/auditor-ia?entidad=${entity.id}`}
                          className="m3-btn m3-btn-tonal"
                          style={{ minHeight: '28px', padding: '2px 8px', fontSize: '11px', textDecoration: 'none' }}
                          title={`Auditar con IA ${entity.nombre}`}
                        >
                          Auditar IA
                        </a>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div
        className="m3-card"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 'var(--space-3)',
          padding: 'var(--space-3) var(--space-4)',
          fontSize: 'var(--text-xs)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <label htmlFor="page-size-select" style={{ fontWeight: 600, color: 'var(--md-sys-color-on-surface-variant)' }}>
            Filas por página:
          </label>
          <select
            id="page-size-select"
            className="m3-select"
            style={{ minHeight: '32px', padding: '2px 8px', fontSize: 'var(--text-xs)' }}
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
          >
            <option value={15}>15</option>
            <option value={20}>20</option>
            <option value={30}>30</option>
            <option value={50}>50</option>
            <option value={0}>Todas ({sorted.length})</option>
          </select>
          <span style={{ color: 'var(--md-sys-color-on-surface-variant)', marginLeft: 'var(--space-2)' }}>
            {sorted.length > 0
              ? `${(safePage - 1) * pageSize + 1} - ${pageSize > 0 ? Math.min(safePage * pageSize, sorted.length) : sorted.length} de ${sorted.length} entidades`
              : '0 resultados'}
          </span>
        </div>

        {pageSize > 0 && totalPages > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
            <button
              type="button"
              className="m3-btn m3-btn-outlined"
              style={{ minHeight: '32px', padding: '2px 8px', fontSize: 'var(--text-xs)' }}
              disabled={safePage <= 1}
              onClick={() => setCurrentPage(1)}
              title="Primera página"
            >
              «
            </button>
            <button
              type="button"
              className="m3-btn m3-btn-outlined"
              style={{ minHeight: '32px', padding: '2px 10px', fontSize: 'var(--text-xs)' }}
              disabled={safePage <= 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              title="Página anterior"
            >
              ‹ Anterior
            </button>
            <span style={{ padding: '0 var(--space-2)', fontWeight: 600, color: 'var(--md-sys-color-on-surface)' }}>
              Pág. {safePage} de {totalPages}
            </span>
            <button
              type="button"
              className="m3-btn m3-btn-outlined"
              style={{ minHeight: '32px', padding: '2px 10px', fontSize: 'var(--text-xs)' }}
              disabled={safePage >= totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              title="Página siguiente"
            >
              Siguiente ›
            </button>
            <button
              type="button"
              className="m3-btn m3-btn-outlined"
              style={{ minHeight: '32px', padding: '2px 8px', fontSize: 'var(--text-xs)' }}
              disabled={safePage >= totalPages}
              onClick={() => setCurrentPage(totalPages)}
              title="Última página"
            >
              »
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
