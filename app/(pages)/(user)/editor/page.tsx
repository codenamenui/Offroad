import { createClient } from "@/utils/supabase/server";
import EditorPanel from "./editor";
import { Tables } from "@/data/database.types";

type Vehicle = Tables<"vehicles">;
type Part = Tables<"parts">;
type Type = Tables<"types">;
type Mechanic = Tables<"mechanics">;
type Booking = Tables<"bookings">;

interface BookingWithDetails extends Booking {
    parts: Part & {
        vehicles: Vehicle;
    };
    mechanics: Mechanic;
}

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

async function getEditBooking(
    supabase,
    bookingGroupId: number
): Promise<BookingWithDetails[] | null> {
    const { data: bookings, error } = await supabase
        .from("bookings")
        .select(
            `
            *,
            parts!inner(*),
            mechanics(*)
        `
        )
        .eq("booking_group_id", bookingGroupId);

    if (error || !bookings) {
        console.error("Error fetching booking:", error);
        return null;
    }

    return bookings;
}

export default async function EditorPage({
    searchParams,
}: {
    searchParams: { edit_booking?: string };
}) {
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

        let editBooking = null;
        if (searchParams.edit_booking) {
            const bookingGroupId = parseInt(searchParams.edit_booking);
            editBooking = await getEditBooking(supabase, bookingGroupId);
        }

        return (
            <EditorPanel
                vehicles={vehicles}
                parts={parts}
                types={types}
                mechanics={mechanics}
                user={profile}
                editBooking={editBooking}
            />
        );
    } catch (error) {
        console.error("Editor error:", error);
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-red-600 mb-4">
                        Unable to load editor
                    </h1>
                    <p className="text-gray-600">Please try again later.</p>
                </div>
            </div>
        );
    }
}
