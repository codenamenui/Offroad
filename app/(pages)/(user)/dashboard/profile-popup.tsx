import { createClient } from "@/utils/supabase/client";
import { useState, useEffect } from "react";

const ProfilePopup = ({ user, onClose, onUpdate }) => {
    const [name, setName] = useState(user.name || "");
    const [contactNumber, setContactNumber] = useState(
        user.contact_number || ""
    );
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [hasPassword, setHasPassword] = useState(false);
    const [checkingAuth, setCheckingAuth] = useState(true);

    useEffect(() => {
        checkUserAuthMethod();
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

    const updateProfile = async () => {
        setLoading(true);
        try {
            const supabase = await createClient();
            const { error } = await supabase
                .from("users")
                .update({
                    name: name,
                    contact_number: contactNumber,
                })
                .eq("user_id", user.user_id);

            if (error) throw error;

            if (onUpdate) {
                onUpdate({ ...user, name, contact_number: contactNumber });
            }
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
        } catch (error) {
            console.error("Error updating password:", error);
            alert("Error updating password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-96 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold">Profile Settings</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        ✕
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Full Name
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full border p-2 rounded"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            value={user.email}
                            disabled
                            className="w-full border p-2 rounded bg-gray-100"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Contact Number
                        </label>
                        <input
                            type="text"
                            value={contactNumber}
                            onChange={(e) => setContactNumber(e.target.value)}
                            className="w-full border p-2 rounded"
                        />
                    </div>

                    <div className="flex space-x-2">
                        <button
                            onClick={onClose}
                            className="flex-1 border p-2 rounded hover:bg-gray-50"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={updateProfile}
                            disabled={loading}
                            className="flex-1 bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:opacity-50"
                        >
                            {loading ? "Saving..." : "Save"}
                        </button>
                    </div>
                </div>

                {!checkingAuth && hasPassword && (
                    <div className="mt-8 pt-6 border-t">
                        <h3 className="text-lg font-semibold mb-4">
                            Change Password
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    New Password
                                </label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    className="w-full border p-2 rounded"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Confirm Password
                                </label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) =>
                                        setConfirmPassword(e.target.value)
                                    }
                                    className="w-full border p-2 rounded"
                                />
                            </div>

                            <button
                                onClick={changePassword}
                                disabled={
                                    loading || !password || !confirmPassword
                                }
                                className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600 disabled:opacity-50"
                            >
                                {loading ? "Updating..." : "Change Password"}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfilePopup;
