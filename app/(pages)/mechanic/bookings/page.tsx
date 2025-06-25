import { createClient } from "@/utils/supabase/server";
import { Tables } from "@/data/database.types";
import BookingRequestsPanel from "../../user/bookings/booking-requests";

type User = Tables<"users">;
type Booking = Tables<"bookings">;
type Part = Tables<"parts">;
type Vehicle = Tables<"vehicles">;
type Mechanic = Tables<"mechanics">;

interface BookingWithDetails extends Booking {
    users: User;
    parts: Part & {
        vehicles: Vehicle;
    };
    mechanics: Mechanic;
}

async function getMechanicBookings(
    supabase,
    mechanicId: string
): Promise<BookingWithDetails[]> {
    const { data: bookings, error } = await supabase
        .from("bookings")
        .select(
            `
            *,
            users(*),
            parts (
                *,
                vehicles (*)
            ),
            mechanics (*)
        `
        )
        .eq("mechanic_id", mechanicId);

    if (error) {
        console.error("Error fetching mechanic bookings:", error);
        throw new Error(`Failed to fetch mechanic bookings: ${error.message}`);
    }

    const statusPriority: Record<string, number> = {
        pending: 1,
        accepted: 2,
        completed: 3,
        mixed: 4,
        cancelled: 5,
        rejected: 6,
    };

    return (bookings || []).sort((a, b) => {
        const statusA = statusPriority[a.status?.toLowerCase()] ?? 99;
        const statusB = statusPriority[b.status?.toLowerCase()] ?? 99;

        if (statusA !== statusB) {
            return statusA - statusB;
        }

        const dateA = a.date ? new Date(a.date).getTime() : 0;
        const dateB = b.date ? new Date(b.date).getTime() : 0;

        return dateB - dateA;
    });
}

export default async function MechanicDashboard() {
    try {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        const { data: mechanic } = await supabase
            .from("mechanics")
            .select("*")
            .eq("profile_id", user.id)
            .single();

        if (!user || !mechanic) {
            return (
                <div className="error-container">
                    <h2>Please log in as a mechanic to view your dashboard</h2>
                </div>
            );
        }

        const bookings = await getMechanicBookings(supabase, mechanic.id);

        return (
            <div>
                <BookingRequestsPanel
                    user={mechanic}
                    bookings={bookings}
                    userType="mechanic"
                />
            </div>
        );
    } catch (error) {
        console.error("Mechanic dashboard error:", error);
        return (
            <div className="error-container">
                <h2>Unable to load mechanic dashboard</h2>
                <p>Please try again later.</p>
            </div>
        );
    }
}
