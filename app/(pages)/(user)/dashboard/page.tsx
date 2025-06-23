import { createClient } from "@/utils/supabase/server";
import DashboardPanel from "./dashboard";
import { Tables } from "@/data/database.types";

type Vehicle = Tables<"vehicles">;
type Part = Tables<"parts">;
type Types = Tables<"types">;

async function getVehicles(): Promise<Vehicle[]> {
    const supabase = await createClient();

    const { data: vehicles, error } = await supabase
        .from("vehicles")
        .select("*");

    if (error) {
        console.error("Error fetching vehicles:", error);
        throw new Error(`Failed to fetch vehicles: ${error.message}`);
    }

    return vehicles || [];
}

async function getParts(): Promise<Part[]> {
    const supabase = await createClient();

    const { data: parts, error } = await supabase.from("parts").select("*");

    if (error) {
        console.error("Error fetching parts:", error);
        throw new Error(`Failed to fetch parts: ${error.message}`);
    }

    return parts || [];
}

async function getTypes(): Promise<Types[]> {
    const supabase = await createClient();

    const { data: types, error } = await supabase.from("types").select("*");

    if (error) {
        console.error("Error fetching types:", error);
        throw new Error(`Failed to fetch types: ${error.message}`);
    }

    return types || [];
}

export default async function DashboardPage() {
    try {
        const vehicles = await getVehicles();
        const parts = await getParts();
        const types = await getTypes();
        return (
            <DashboardPanel vehicles={vehicles} parts={parts} types={types} />
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
