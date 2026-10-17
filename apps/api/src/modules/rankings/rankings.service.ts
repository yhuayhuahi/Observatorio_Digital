import { supabaseAdmin } from "../../config/supabase.ts";
import { calculateScores } from "../../core/score-engine.ts";
import { evaluateSlaThreshold } from "../../core/sla-evaluator.ts";
import type { RankingItemDTO, RawMeasurement, EntityCategory } from "../../core/types.ts";

export class RankingsService {
  async getRankings(options?: {
    categoria?: string;
    region?: string;
    orderBy?: "scoreGlobal" | "scoreDisponibilidad" | "scoreDesempeno" | "scoreAccesibilidad";
  }): Promise<{ data: RankingItemDTO[]; total: number }> {
    const orderBy = options?.orderBy || "scoreGlobal";

    // 1. Obtener entidades activas
    let entitiesQuery = supabaseAdmin
      .from("entidades")
      .select("id, nombre, url, categoria, region")
      .eq("activa", true);

    if (options?.categoria) {
      entitiesQuery = entitiesQuery.eq("categoria", options.categoria);
    }
    if (options?.region) {
      entitiesQuery = entitiesQuery.eq("region", options.region);
    }

    const { data: entities, error: errEntities } = await entitiesQuery;
    if (errEntities) {
      throw new Error(`Error al cargar entidades para ranking: ${errEntities.message}`);
    }
    if (!entities || entities.length === 0) {
      return { data: [], total: 0 };
    }

    const entityIds = entities.map((e) => e.id);

    // 2. Obtener las mediciones más recientes de las entidades seleccionadas (solo columnas numéricas requeridas)
    const { data: rawMeasurements, error: errMediciones } = await supabaseAdmin
      .from("mediciones_crudas")
      .select(
        "id, entidad_id, fecha_captura, status_code, tiempo_respuesta_ms, disponible, score_desempeno, score_accesibilidad, lcp_segundos"
      )
      .in("entidad_id", entityIds)
      .order("fecha_captura", { ascending: false });

    if (errMediciones) {
      throw new Error(`Error al cargar mediciones para ranking: ${errMediciones.message}`);
    }

    // Mapear la medición más reciente por entidad
    const latestMap = new Map<number, RawMeasurement>();
    for (const m of (rawMeasurements || []) as RawMeasurement[]) {
      if (!latestMap.has(m.entidad_id)) {
        latestMap.set(m.entidad_id, m);
      }
    }

    // 3. Calcular scores y estructurar items
    const rankingItems: Array<Omit<RankingItemDTO, "posicion">> = [];

    for (const ent of entities) {
      const measurement = latestMap.get(ent.id);
      const scores = measurement
        ? calculateScores(measurement)
        : { scoreGlobal: 0, scoreDisponibilidad: 0, scoreDesempeno: 0, scoreAccesibilidad: 0 };

      // Para estado de SLA preliminar se evalúa la disponibilidad observada
      const uptime = measurement?.disponible ? 100 : 0;
      const estadoSla = evaluateSlaThreshold(uptime);

      rankingItems.push({
        entidadId: ent.id,
        nombre: ent.nombre,
        url: ent.url,
        categoria: ent.categoria as EntityCategory,
        region: ent.region,
        scoreGlobal: scores.scoreGlobal,
        scoreDisponibilidad: scores.scoreDisponibilidad,
        scoreDesempeno: scores.scoreDesempeno,
        scoreAccesibilidad: scores.scoreAccesibilidad,
        estadoSla,
        fechaMedicion: measurement?.fecha_captura || new Date().toISOString(),
      });
    }

    // 4. Ordenar dinámicamente según el criterio solicitado
    rankingItems.sort((a, b) => {
      const valA = a[orderBy];
      const valB = b[orderBy];
      return valB - valA;
    });

    // 5. Asignar posiciones ordinales (1-indexed)
    const rankedData: RankingItemDTO[] = rankingItems.map((item, index) => ({
      ...item,
      posicion: index + 1,
    }));

    return {
      data: rankedData,
      total: rankedData.length,
    };
  }

  async getEntityRankingPosition(entidadId: number): Promise<number> {
    const { data } = await this.getRankings({});
    const index = data.findIndex((item) => item.entidadId === entidadId);
    return index >= 0 ? index + 1 : 1;
  }
}

export const rankingsService = new RankingsService();
