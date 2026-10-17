import { describe, test, expect } from 'bun:test';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const DIST_DIR = resolve(import.meta.dir, '../dist');
const STYLES_FILE = resolve(import.meta.dir, '../src/styles/tokens.css');

describe('Frontend Dashboard & Material Design 3 Spec Compliance', () => {
  test('Design Tokens (tokens.css) define M3 color tokens and dark mode', () => {
    expect(existsSync(STYLES_FILE)).toBe(true);
    const css = readFileSync(STYLES_FILE, 'utf-8');

    // M3 Light Theme tokens
    expect(css).toContain('--md-sys-color-primary:');
    expect(css).toContain('--md-sys-color-surface:');
    expect(css).toContain('--color-status-success:');
    expect(css).toContain('--color-status-warning:');
    expect(css).toContain('--color-status-danger:');

    // M3 Dark Theme tokens
    expect(css).toContain('[data-theme="dark"]');
    expect(css).toContain('--color-brand-red:');

    // Mandatory Focus-Visible outline rule
    expect(css).toContain(':focus-visible');
    expect(css).toContain('outline: 3px solid');
  });

  test('Static distribution generated all required SDD-MOD-004 pages', () => {
    const requiredPages = [
      'index.html',
      'ranking/index.html',
      'incidentes/index.html',
      'reportes/index.html',
      'auditor-ia/index.html',
      'entidad/1/index.html'
    ];

    for (const page of requiredPages) {
      const pagePath = resolve(DIST_DIR, page);
      expect(existsSync(pagePath)).toBe(true);
    }
  });

  test('WCAG 2.1 AA Accessibility & Semantic Markup in index.html', () => {
    const html = readFileSync(resolve(DIST_DIR, 'index.html'), 'utf-8');

    // Document language
    expect(html).toContain('lang="es"');

    // Skip Link
    expect(html).toContain('href="#main-content"');
    expect(html).toContain('skip-link');

    // Semantic landmarks
    expect(html).toContain('<header');
    expect(html).toContain('<nav');
    expect(html).toContain('<main id="main-content"');
    expect(html).toContain('<footer');

    // Dark Mode Switcher & Inline FOUC Prevention Script
    expect(html).toContain('id="theme-toggle-btn"');
    expect(html).toContain('localStorage.getItem(\'theme\')');
    expect(html).toContain('data-theme');
  });

  test('National Ranking page renders DynamicRankingTable island placeholder and headers', () => {
    const html = readFileSync(resolve(DIST_DIR, 'ranking/index.html'), 'utf-8');
    expect(html).toContain('Ranking Nacional de Calidad Digital');
    expect(html).toContain('40% Disponibilidad (Uptime)');
    expect(html).toContain('30% Core Web Vitals');
    expect(html).toContain('30% WCAG 2.1 AA');
  });

  test('ITIL v4 Incident Board renders MTTR, severity badges and root cause analysis', () => {
    const html = readFileSync(resolve(DIST_DIR, 'incidentes/index.html'), 'utf-8');
    expect(html).toContain('Tablero de Incidentes ITIL v4');
    expect(html).toContain('MTTR Promedio');
    expect(html).toContain('Causa Raíz');
  });

  test('Download Center renders CSV and JSON export links for all official datasets', () => {
    const html = readFileSync(resolve(DIST_DIR, 'reportes/index.html'), 'utf-8');
    expect(html).toContain('Centro de Descargas y Datos Abiertos');
    expect(html).toContain('ranking_nacional_calidad_digital.csv');
    expect(html).toContain('reporte_sla_portales.csv');
    expect(html).toContain('incidentes_itil_portales.csv');
    expect(html).toContain('auditoria_accesibilidad_wcag.csv');
  });

  test('Auditor IA page integrates RAG knowledge base panel and Chat Widget island', () => {
    const html = readFileSync(resolve(DIST_DIR, 'auditor-ia/index.html'), 'utf-8');
    expect(html).toContain('Auditor Inteligente del Estado Peruano');
    expect(html).toContain('D.L. N° 1412');
    expect(html).toContain('D.S. N° 029-2021-PCM');
    expect(html).toContain('R.SGTD N° 001-2025');
    expect(html).toContain('WCAG 2.1');
  });

  test('Institutional Sheet (/entidad/1) includes Core Web Vitals, SLA meter and accessibility audit section', () => {
    const html = readFileSync(resolve(DIST_DIR, 'entidad/1/index.html'), 'utf-8');
    expect(html).toContain('Largest Contentful Paint (LCP)');
    expect(html).toContain('Disponibilidad SLA');
    expect(html).toContain('Auditoría de Accesibilidad Web (WCAG 2.1 AA)');
  });

  test('Entity with detected accessibility issues (/entidad/13) renders DOM selectors and remediation advice', () => {
    const html = readFileSync(resolve(DIST_DIR, 'entidad/13/index.html'), 'utf-8');
    expect(html).toContain('Auditoría de Accesibilidad Web (WCAG 2.1 AA)');
    expect(html).toContain('Selector DOM afectado');
    expect(html).toContain('Solución recomendada');
  });
});
