import { createClient } from "@/utils/supabase/server";
import DashboardPanel from "./dashboard";
import { Tables } from "@/data/database.types";

type Vehicle = Tables<"vehicles">;
type Part = Tables<"parts">;
type Type = Tables<"types">;
type Mechanic = Tables<"mechanics">;

async function getVehicles(supabase): Promise<Vehicle[]> {
    const { data: vehicles, error } = await supabase
        .from("vehicles")
        .select("*");

    if (error) {
        console.error("Error fetching vehicles:", error);
        throw new Error(`Failed to fetch vehicles: ${error.message}`);
    }

    return vehicles || [];
}

async function getParts(supabase): Promise<Part[]> {
    const { data: parts, error } = await supabase.from("parts").select("*");

    if (error) {
        console.error("Error fetching parts:", error);
        throw new Error(`Failed to fetch parts: ${error.message}`);
    }

    return parts || [];
}

async function getTypes(supabase): Promise<Type[]> {
    const { data: types, error } = await supabase.from("types").select("*");

    if (error) {
        console.error("Error fetching types:", error);
        throw new Error(`Failed to fetch types: ${error.message}`);
    }

    return types || [];
}

async function getMechanics(supabase): Promise<Mechanic[]> {
    const { data: mechanics, error } = await supabase
        .from("mechanics")
        .select("*");

    if (error) {
        console.error("Error fetching mechanics:", error);
        throw new Error(`Failed to fetch mechanics: ${error.message}`);
    }

    return mechanics || [];
}

export default async function DashboardPage() {
    try {
        const supabase = await createClient();
        const vehicles = await getVehicles(supabase);
        const parts = await getParts(supabase);
        const types = await getTypes(supabase);
        const mechanics = await getMechanics(supabase);
        const {
            data: { user },
        } = await supabase.auth.getUser();
        const { data: profile } = await supabase
            .from("users")
            .select("*")
            .eq("user_id", user.id)
            .single();
        return (
            <DashboardPanel
                vehicles={vehicles}
                parts={parts}
                types={types}
                mechanics={mechanics}
                user={profile}
            />
        );
    } catch (error) {
        console.error("Dashboard error:", error);
        return (
            <div className="error-container">
                <h2>Unable to load dashboard</h2>
                <p>Please try again later.</p>
            </div>
        );
    }
}
