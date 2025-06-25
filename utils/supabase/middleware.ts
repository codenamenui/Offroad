import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { hasEnvVars } from "../utils";

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    });

    // If the env vars are not set, skip middleware check
    if (!hasEnvVars) {
        return supabaseResponse;
    }

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    );
                    supabaseResponse = NextResponse.next({
                        request,
                    });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    const {
        data: { user },
    } = await supabase.auth.getUser();

    const pathname = request.nextUrl.pathname;

    // Define public routes that don't require authentication
    const publicRoutes = [
        "/",
        "/login",
        "/register",
        "/api/auth",
        "/reset-password",
    ];

    // Define role-specific protected routes
    const protectedRoutes = {
        user: ["/user/editor", "/editor", "/bookings"],
        mechanic: ["/mechanic/bookings", "/schedule", "/mechanic"],
        admin: [
            "/admin/parts",
            "/admin/vehicles",
            "/admin/types",
            "/admin/dashboard",
            "/manage",
        ],
    };

    // Check if current path is public
    const isPublicRoute = publicRoutes.some(
        (route) => pathname === route || pathname.startsWith(route)
    );

    // If no user and trying to access protected route, redirect to login
    if (!user && !isPublicRoute) {
        const url = request.nextUrl.clone();
        url.pathname = "/login";
        return NextResponse.redirect(url);
    }

    // If user exists, get their profile and role
    if (user) {
        try {
            const { data: profile } = await supabase
                .from("user_profiles")
                .select("role")
                .eq("id", user.id)
                .single();

            if (profile?.role) {
                const userRole = profile.role as "user" | "mechanic" | "admin";

                // Handle role-based redirections

                // If user is on login/register pages but already authenticated, redirect to appropriate dashboard
                if (pathname === "/login" || pathname === "/register") {
                    const url = request.nextUrl.clone();
                    if (userRole == "user") {
                        url.pathname = `/user/editor`;
                    } else {
                        url.pathname = `/${userRole}/dashboard`;
                    }
                    return NextResponse.redirect(url);
                }

                // Check if user is trying to access a route they're not authorized for
                const isUserRoute = protectedRoutes.user.some((route) =>
                    pathname.startsWith(route)
                );
                const isMechanicRoute = protectedRoutes.mechanic.some((route) =>
                    pathname.startsWith(route)
                );
                const isAdminRoute = protectedRoutes.admin.some((route) =>
                    pathname.startsWith(route)
                );

                // Redirect to appropriate dashboard if accessing wrong role-specific route
                if (userRole === "user" && (isMechanicRoute || isAdminRoute)) {
                    const url = request.nextUrl.clone();
                    url.pathname = "/user/editor";
                    return NextResponse.redirect(url);
                }

                if (userRole === "mechanic" && (isUserRoute || isAdminRoute)) {
                    const url = request.nextUrl.clone();
                    url.pathname = "/mechanic/bookings";
                    return NextResponse.redirect(url);
                }

                if (userRole === "admin" && (isUserRoute || isMechanicRoute)) {
                    // Admins can access everything, so no redirect needed
                    // But you can add specific admin-only routes if needed
                }
            } else {
                // User exists but no profile found, redirect to profile setup or login
                if (!isPublicRoute) {
                    const url = request.nextUrl.clone();
                    url.pathname = "/login";
                    return NextResponse.redirect(url);
                }
            }
        } catch (error) {
            console.error("Error fetching user profile in middleware:", error);
            // On error, if trying to access protected route, redirect to login
            if (!isPublicRoute) {
                const url = request.nextUrl.clone();
                url.pathname = "/login";
                return NextResponse.redirect(url);
            }
        }
    }

    return supabaseResponse;
}
