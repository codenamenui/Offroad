import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { hasEnvVars } from "../utils";

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    });

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

    const publicRoutes = [
        "/",
        "/login",
        "/register",
        "/api/auth",
        "/reset-password",
    ];

    const protectedRoutes = {
        user: ["/user/editor", "/user/bookings"],
        mechanic: ["/mechanic/bookings", "/mechanic/leaves"],
        admin: [
            "/admin/parts",
            "/admin/vehicles",
            "/admin/types",
            "/admin/mechanics",
            "/admin/dashboard",
        ],
    };

    const isPublicRoute = publicRoutes.some(
        (route) =>
            pathname === route ||
            pathname.startsWith(route === "/" ? "odwfwaewfewfwadw" : route)
    );

    if (!user && !isPublicRoute) {
        const url = request.nextUrl.clone();
        url.pathname = "/login";
        return NextResponse.redirect(url);
    }

    if (user) {
        try {
            const { data: profile } = await supabase
                .from("user_profiles")
                .select("role")
                .eq("id", user.id)
                .single();

            if (profile?.role) {
                const userRole = profile.role as "user" | "mechanic" | "admin";

                if (pathname === "/login" || pathname === "/register") {
                    const url = request.nextUrl.clone();
                    if (userRole === "user") {
                        url.pathname = "/user/editor";
                    } else if (userRole === "admin") {
                        url.pathname = "/admin/dashboard";
                    } else {
                        url.pathname = "/mechanic/bookings";
                    }
                    return NextResponse.redirect(url);
                }

                if (pathname === "/") {
                    const url = request.nextUrl.clone();
                    if (userRole === "user") {
                        url.pathname = "/user/editor";
                    } else if (userRole === "admin") {
                        url.pathname = "/admin/dashboard";
                    } else {
                        url.pathname = "/mechanic/bookings";
                    }
                    return NextResponse.redirect(url);
                }

                const isUserRoute = protectedRoutes.user.some((route) =>
                    pathname.startsWith(route)
                );
                const isMechanicRoute = protectedRoutes.mechanic.some((route) =>
                    pathname.startsWith(route)
                );
                const isAdminRoute = protectedRoutes.admin.some((route) =>
                    pathname.startsWith(route)
                );

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
                    return supabaseResponse;
                }
            } else {
                if (!isPublicRoute) {
                    const url = request.nextUrl.clone();
                    url.pathname = "/login";
                    return NextResponse.redirect(url);
                }
            }
        } catch (error) {
            console.error("Error fetching user profile in middleware:", error);
            if (!isPublicRoute) {
                const url = request.nextUrl.clone();
                url.pathname = "/login";
                return NextResponse.redirect(url);
            }
        }
    }

    return supabaseResponse;
}
