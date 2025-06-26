import { createClient } from "@/utils/supabase/client";
import { useState, useEffect } from "react";
import { User, Mail } from "lucide-react";

const ProfilePopup = ({ user, onClose, onUpdate }) => {
    const [name, setName] = useState(user.name || "");
    const [contactNumber, setContactNumber] = useState(
        user.contact_number || ""
    );
    const [email, setEmail] = useState(user.email || "");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [hasPassword, setHasPassword] = useState(false);
    const [checkingAuth, setCheckingAuth] = useState(true);
    const [isMechanic, setIsMechanic] = useState(false);

    useEffect(() => {
        checkUserAuthMethod();
        checkIfMechanic();
    }, []);

    const checkUserAuthMethod = async () => {
        try {
            const supabase = await createClient();
            const {
                data: { user: authUser },
            } = await supabase.auth.getUser();
            if (authUser) {
                const providers = authUser.app_metadata?.providers || [];
                setHasPassword(!providers.includes("google"));
            }
        } catch (error) {
            console.error("Error checking auth method:", error);
        } finally {
            setCheckingAuth(false);
        }
    };

    const checkIfMechanic = async () => {
        try {
            const supabase = await createClient();
            const {
                data: { user: authUser },
            } = await supabase.auth.getUser();
            const { data: mechanic, error } = await supabase
                .from("mechanics")
                .select("*")
                .eq("profile_id", authUser.id)
                .single();

            if (!error && mechanic) {
                setIsMechanic(true);
                // Pre-fill mechanic-specific fields if they exist
                if (mechanic.contact) setContactNumber(mechanic.contact);
                if (mechanic.email) setEmail(mechanic.email);
            }
        } catch (error) {
            console.error("Error checking mechanic status:", error);
        }
    };

    const updateProfile = async () => {
        setLoading(true);
        try {
            const supabase = await createClient();

            const {
                data: { user: authUser },
            } = await supabase.auth.getUser();

            // Update users table
            const { error: userError } = await supabase
                .from("users")
                .update({
                    name: name,
                    contact_number: contactNumber,
                })
                .eq("user_id", authUser.id);

            if (userError) throw userError;

            // If user is a mechanic, update mechanics table
            if (isMechanic) {
                const { error: mechanicError } = await supabase
                    .from("mechanics")
                    .update({
                        name: name,
                        contact_number: contactNumber,
                        email: email,
                    })
                    .eq("profile_id", authUser.id);

                if (mechanicError) throw mechanicError;
            }

            if (onUpdate) {
                onUpdate({
                    ...user,
                    name,
                    contact_number: contactNumber,
                    ...(isMechanic && { email }),
                });
            }

            onClose();
        } catch (error) {
            console.error("Error updating profile:", error);
            alert("Error updating profile");
        } finally {
            setLoading(false);
        }
    };

    const changePassword = async () => {
        if (password !== confirmPassword) {
            alert("Passwords do not match");
            return;
        }

        if (password.length < 6) {
            alert("Password must be at least 6 characters");
            return;
        }

        setLoading(true);
        try {
            const supabase = await createClient();
            const { error } = await supabase.auth.updateUser({
                password: password,
            });

            if (error) throw error;

            setPassword("");
            setConfirmPassword("");
            alert("Password updated successfully");
        } catch (error) {
            console.error("Error updating password:", error);
            alert("Error updating password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-[500px] max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                            <User size={20} className="text-amber-600" />
                        </div>
                        <span className="font-medium text-gray-900">
                            {user.name}
                        </span>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 text-xl"
                    >
                        ✕
                    </button>
                </div>

                {/* Personal Info Section */}
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold text-gray-900">
                            Personal info
                        </h2>
                        <div className="flex space-x-3">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={updateProfile}
                                disabled={loading}
                                className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:opacity-50 transition-colors"
                            >
                                {loading ? "Saving..." : "Save"}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Full Name
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email address
                            </label>
                            <div className="relative">
                                <Mail
                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                    size={18}
                                />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={!isMechanic}
                                    className={`w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                                        !isMechanic
                                            ? "bg-gray-50 text-gray-500"
                                            : ""
                                    }`}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Contact Number
                            </label>
                            <input
                                type="text"
                                value={contactNumber}
                                onChange={(e) =>
                                    setContactNumber(e.target.value)
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                            />
                        </div>

                        {isMechanic && (
                            <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                                <p className="font-medium">Mechanic Account</p>
                                <p>
                                    You&apos;re registered as a mechanic. Email
                                    updates will affect your mechanic profile.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Password Section */}
                {!checkingAuth && hasPassword && (
                    <div className="border-t px-6 py-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-semibold text-gray-900">
                                Change your password
                            </h2>
                            <button
                                onClick={changePassword}
                                disabled={
                                    loading || !password || !confirmPassword
                                }
                                className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:opacity-50 transition-colors"
                            >
                                {loading ? "Updating..." : "Change Password"}
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    New Password
                                </label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Confirm Password
                                </label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) =>
                                        setConfirmPassword(e.target.value)
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfilePopup;
