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

async function getAllBookingRequests(supabase): Promise<BookingWithDetails[]> {
    const { data: bookings, error } = await supabase.from("bookings").select(
        `
            *,
            users(*),
            parts (
                *,
                vehicles (*)
            ),
            mechanics (*)
        `
    );

    if (error) {
        console.error("Error fetching booking requests:", error);
        throw new Error(`Failed to fetch booking requests: ${error.message}`);
    }

    const statusPriority: Record<string, number> = {
        pending: 1,
        accepted: 2,
        in_progress: 3,
        completed: 4,
        mixed: 5,
        cancelled: 6,
        rejected: 7,
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

export default async function AdminBookingRequestsPage() {
    try {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return (
                <div className="error-container">
                    <h2>Please log in to view booking requests</h2>
                </div>
            );
        }

        const { data: profile } = await supabase
            .from("user_profiles")
            .select("*")
            .eq("id", user.id)
            .single();

        if (profile?.role !== "admin") {
            return (
                <div className="error-container">
                    <h2>Access denied</h2>
                    <p>You must be an admin to view this page.</p>
                </div>
            );
        }

        const bookings = await getAllBookingRequests(supabase);

        return (
            <div>
                <BookingRequestsPanel
                    user={{ name: "Admin" }}
                    bookings={bookings}
                    userType="admin"
                    isAdmin={true}
                />
            </div>
        );
    } catch (error) {
        console.error("Admin booking requests error:", error);
        return (
            <div className="error-container">
                <h2>Unable to load booking requests</h2>
                <p>Please try again later.</p>
            </div>
        );
    }
}
