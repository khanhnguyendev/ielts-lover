import { ISystemSettingsRepository, SystemSetting } from "./interfaces";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export class SystemSettingsRepository implements ISystemSettingsRepository {
    async getByKey<T>(key: string): Promise<T | null> {
        const supabase = await createServerSupabaseClient();
        const { data, error } = await supabase
            .from("system_settings")
            .select("setting_value")
            .eq("setting_key", key)
            .single();

        if (error) {
            if (error.code === "PGRST116") return null;
            throw new Error(`[SystemSettingsRepository] getByKey failed: ${error.message}`);
        }
        return data.setting_value as T;
    }

    async listAll(): Promise<SystemSetting[]> {
        const supabase = await createServerSupabaseClient();
        const { data, error } = await supabase
            .from("system_settings")
            .select("*")
            .order("setting_key", { ascending: true });

        if (error) throw new Error(`[SystemSettingsRepository] listAll failed: ${error.message}`);
        return data as SystemSetting[];
    }

    async updateSetting(key: string, value: any): Promise<void> {
        const supabase = await createServerSupabaseClient();
        const { error } = await supabase
            .from("system_settings")
            .update({
                setting_value: value,
                updated_at: new Date().toISOString()
            })
            .eq("setting_key", key);

        if (error) throw new Error(`[SystemSettingsRepository] Failed to update setting: ${error.message}`);
    }
}
