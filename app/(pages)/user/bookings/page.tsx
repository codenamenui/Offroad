import { createClient } from "@/utils/supabase/server";
import BookingRequestsPanel from "./booking-requests";
import { Tables } from "@/data/database.types";

type Booking = Tables<"bookings">;
type Part = Tables<"parts">;
type Vehicle = Tables<"vehicles">;
type Mechanic = Tables<"mechanics">;

interface BookingWithDetails extends Booking {
    parts: Part & {
        vehicles: Vehicle;
    };
    mechanics: Mechanic;
}

async function getBookingRequests(
    supabase,
    userId: string
): Promise<BookingWithDetails[]> {
    const { data: bookings, error } = await supabase
        .from("bookings")
        .select(
            `
            *,
            parts (
                *,
                vehicles (*)
            ),
            mechanics (*)
        `
        )
        .eq("user_id", userId);

    if (error) {
        console.error("Error fetching booking requests:", error);
        throw new Error(`Failed to fetch booking requests: ${error.message}`);
    }

    const statusPriority: Record<string, number> = {
        pending: 1,
        confirmed: 2,
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

        // If status is the same, sort by date (newest first)
        const dateA = a.date ? new Date(a.date).getTime() : 0;
        const dateB = b.date ? new Date(b.date).getTime() : 0;

        return dateB - dateA;
    });
}

export default async function BookingRequestsPage() {
    try {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();
        const { data: profile } = await supabase
            .from("users")
            .select("*")
            .eq("user_id", user.id)
            .single();

        if (!user) {
            return (
                <div className="error-container">
                    <h2>Please log in to view your booking requests</h2>
                </div>
            );
        }

        const bookings = await getBookingRequests(supabase, user.id);

        return (
            <div>
                <BookingRequestsPanel user={profile} bookings={bookings} />
            </div>
        );
    } catch (error) {
        console.error("Booking requests error:", error);
        return (
            <div className="error-container">
                <h2>Unable to load booking requests</h2>
                <p>Please try again later.</p>
            </div>
        );
    }
}
