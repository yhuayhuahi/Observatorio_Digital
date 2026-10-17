import { supabaseAdmin } from "../../config/supabase.ts";
import type { Entity, RawMeasurement } from "../../core/types.ts";

export class EntitiesRepository {
  async findAll(filters?: {
    categoria?: string;
    region?: string;
    activa?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<{ data: Entity[]; count: number }> {
    let query = supabaseAdmin
      .from("entidades")
      .select("*", { count: "exact" });

    if (filters?.categoria) {
      query = query.eq("categoria", filters.categoria);
    }
    if (filters?.region) {
      query = query.eq("region", filters.region);
    }
    if (filters?.activa !== undefined) {
      query = query.eq("activa", filters.activa);
    }

    query = query.order("nombre", { ascending: true });

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }
    if (filters?.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 100) - 1);
    }

    const { data, error, count } = await query;
    if (error) {
      throw new Error(`Error al consultar entidades: ${error.message}`);
    }

    return {
      data: (data || []) as Entity[],
      count: count || 0,
    };
  }

  async findById(id: number): Promise<Entity | null> {
    const { data, error } = await supabaseAdmin
      .from("entidades")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      return null;
    }
    return data as Entity;
  }

  async findMeasurements(
    entidadId: number,
    options?: { limit?: number; from?: string; to?: string }
  ): Promise<RawMeasurement[]> {
    let query = supabaseAdmin
      .from("mediciones_crudas")
      .select("*")
      .eq("entidad_id", entidadId)
      .order("fecha_captura", { ascending: false });

    if (options?.from) {
      query = query.gte("fecha_captura", options.from);
    }
    if (options?.to) {
      query = query.lte("fecha_captura", options.to);
    }
    if (options?.limit) {
      query = query.limit(options.limit);
    } else {
      query = query.limit(30);
    }

    const { data, error } = await query;
    if (error) {
      throw new Error(`Error al consultar mediciones de entidad ${entidadId}: ${error.message}`);
    }

    return (data || []) as RawMeasurement[];
  }

  async findLatestMeasurement(entidadId: number): Promise<RawMeasurement | null> {
    const { data, error } = await supabaseAdmin
      .from("mediciones_crudas")
      .select("*")
      .eq("entidad_id", entidadId)
      .order("fecha_captura", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      return null;
    }
    return data as RawMeasurement;
  }
}

export const entitiesRepository = new EntitiesRepository();
