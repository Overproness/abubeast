"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/ui/page-header";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Page() {
  const { user, isAuthenticated, authChecked, logout, walletInfo } = useAuth();
  const router = useRouter();
  const [editMode, setEditMode] = useState(false);
  const [Data, setData] = useState({
    name: "",
    email: "",
    bio: "",
    location: "",
    website: "",
    twitter: "",
    telegram: "",
    notifications: {
      email: true,
      trades: true,
      security: true,
      newsletter: false,
    },
  });
  const [saveStatus, setSaveStatus] = useState("");
  const [userStats, setUserStats] = useState(null);
  const [userAchievements, setUserAchievements] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (authChecked && !isAuthenticated) {
      router.push("/auth/login?from=/");
    } else if (user) {
      setData((prev) => ({
        ...prev,
        name: user.name || "",
        email: user.email || "",
        bio: user.bio || "",
        location: user.location || "",
        website: user.website || "",
        twitter: user.twitter || "",
        telegram: user.telegram || "",
        notifications: user.notifications || {
          email: true,
          trades: true,
          security: true,
          newsletter: false,
        },
      }));

      // Fetch user statistics
      fetchUserStats();
    }
  }, [authChecked, isAuthenticated, router, user]);

  const fetchUserStats = async () => {
    if (!user?.id) return;

    try {
      setLoadingStats(true);
      const response = await fetch(`/api/user/stats?userId=${user.id}`, {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setUserStats(data.stats);
        setUserAchievements(data.achievements);
        setRecentActivity(data.recentActivity);

        // Update profile data from API response
        if (data.user) {
          setData((prev) => ({
            ...prev,
            bio: data.user.bio || "",
            location: data.user.location || "",
            website: data.user.website || "",
            twitter: data.user.twitter || "",
            telegram: data.user.telegram || "",
            notifications: data.user.notifications || prev.notifications,
          }));
        }
      }
    } catch (error) {
      console.error("Failed to fetch user stats:", error);
    } finally {
      setLoadingStats(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.startsWith("notifications.")) {
      const notificationType = name.split(".")[1];
      setData((prev) => ({
        ...prev,
        notifications: {
          ...prev.notifications,
          [notificationType]: checked,
        },
      }));
    } else {
      setData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const handleSave = async () => {
    setSaveStatus("saving");
    try {
      const response = await fetch(`/api/user/profile?userId=${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bio: Data.bio,
          location: Data.location,
          website: Data.website,
          twitter: Data.twitter,
          telegram: Data.telegram,
          notifications: Data.notifications,
        }),
        credentials: "include",
      });

      if (response.ok) {
        setSaveStatus("success");
        setEditMode(false);
        setTimeout(() => setSaveStatus(""), 3000);
      } else {
        throw new Error("Failed to save profile");
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      setSaveStatus("error");
      setTimeout(() => setSaveStatus(""), 3000);
    }
  };

  if (!authChecked || !isAuthenticated) {
    return null;
  }

  // Use real data from API or show loading/default states
  const stats = userStats || [
    { label: "Total Trades", value: "0", change: "+0%", color: "blue" },
    { label: "Win Rate", value: "0%", change: "+0%", color: "green" },
    {
      label: "Total Volume",
      value: "$0",
      change: "+0%",
      color: "purple",
    },
    {
      label: "Days Active",
      value: "0",
      change: "consecutive",
      color: "orange",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20">
      <PageHeader
        title="Your "
        subtitle="Manage your account and track your progress"
        gradient={true}
        size="default"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        {/*  Header */}
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 text-white">
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold backdrop-blur-sm">
                  {Data.name.charAt(0).toUpperCase() || "U"}
                </div>
                <div>
                  <h1 className="text-2xl font-bold">
                    {Data.name || "User"}
                  </h1>
                  <p className="text-blue-100">{Data.email}</p>
                  <div className="flex items-center mt-2">
                    <span className="bg-green-400 w-3 h-3 rounded-full mr-2"></span>
                    <span className="text-sm">Active Trader</span>
                  </div>
                </div>
              </div>
              <Button
                variant="secondary"
                onClick={() => setEditMode(!editMode)}
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                {editMode ? "Cancel" : "Edit "}
              </Button>
            </div>
          </div>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {loadingStats ? (
            // Loading state for stats
            Array.from({ length: 4 }).map((_, index) => (
              <Card
                key={index}
                className="text-center hover:shadow-lg transition-all duration-300"
              >
                <CardContent className="p-6">
                  <div className="text-3xl font-bold text-gray-400 dark:text-gray-600 mb-2 animate-pulse">
                    ---
                  </div>
                  <div className="text-sm font-medium text-gray-400 dark:text-gray-600 mb-1 animate-pulse">
                    Loading...
                  </div>
                  <div className="text-xs text-gray-400 dark:text-gray-600 animate-pulse">
                    ---
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            stats.map((stat, index) => (
              <Card
                key={index}
                className="text-center hover:shadow-lg transition-all duration-300"
              >
                <CardContent className="p-6">
                  <div
                    className={`text-3xl font-bold text-${stat.color}-600 dark:text-${stat.color}-400 mb-2`}
                  >
                    {stat.value}
                  </div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                    {stat.label}
                  </div>
                  <div
                    className={`text-xs text-${stat.color}-600 dark:text-${stat.color}-400`}
                  >
                    {stat.change}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/*  Information */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Information
                  {saveStatus === "success" && (
                    <span className="text-sm text-green-600 font-normal">
                      ✅ Saved
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={Data.name}
                      onChange={handleInputChange}
                      disabled={!editMode}
                      className={!editMode ? "bg-gray-50 dark:bg-gray-800" : ""}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={Data.email}
                      onChange={handleInputChange}
                      disabled={true}
                      className="bg-gray-50 dark:bg-gray-800"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    value={Data.bio}
                    onChange={handleInputChange}
                    disabled={!editMode}
                    placeholder="Tell us about yourself..."
                    rows={3}
                    className={!editMode ? "bg-gray-50 dark:bg-gray-800" : ""}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      name="location"
                      value={Data.location}
                      onChange={handleInputChange}
                      disabled={!editMode}
                      placeholder="City, Country"
                      className={!editMode ? "bg-gray-50 dark:bg-gray-800" : ""}
                    />
                  </div>
                  <div>
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      name="website"
                      value={Data.website}
                      onChange={handleInputChange}
                      disabled={!editMode}
                      placeholder="https://yoursite.com"
                      className={!editMode ? "bg-gray-50 dark:bg-gray-800" : ""}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="twitter">Twitter Handle</Label>
                    <Input
                      id="twitter"
                      name="twitter"
                      value={Data.twitter}
                      onChange={handleInputChange}
                      disabled={!editMode}
                      placeholder="@username"
                      className={!editMode ? "bg-gray-50 dark:bg-gray-800" : ""}
                    />
                  </div>
                  <div>
                    <Label htmlFor="telegram">Telegram</Label>
                    <Input
                      id="telegram"
                      name="telegram"
                      value={Data.telegram}
                      onChange={handleInputChange}
                      disabled={!editMode}
                      placeholder="@username"
                      className={!editMode ? "bg-gray-50 dark:bg-gray-800" : ""}
                    />
                  </div>
                </div>

                {editMode && (
                  <div className="flex gap-4 pt-4">
                    <Button
                      onClick={handleSave}
                      disabled={saveStatus === "saving"}
                      className="flex-1"
                    >
                      {saveStatus === "saving" ? "Saving..." : "Save Changes"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setEditMode(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(Data.notifications).map(
                  ([key, value]) => (
                    <div
                      key={key}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <Label className="text-sm font-medium capitalize">
                          {key === "email"
                            ? "Email Notifications"
                            : key === "trades"
                              ? "Trade Alerts"
                              : key === "security"
                                ? "Security Alerts"
                                : "Newsletter"}
                        </Label>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {key === "email"
                            ? "Receive email notifications"
                            : key === "trades"
                              ? "Get notified about your trades"
                              : key === "security"
                                ? "Security-related notifications"
                                : "Weekly market insights"}
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          name={`notifications.${key}`}
                          checked={value}
                          onChange={handleInputChange}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  )
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Connected Wallet */}
            {walletInfo && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <span className="w-3 h-3 bg-green-400 rounded-full mr-3"></span>
                    Connected Wallet
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div>
                        <p className="font-medium capitalize">
                          {walletInfo.type} Wallet
                        </p>
                        <p className="text-sm text-gray-500 font-mono">
                          {walletInfo.address.substring(0, 8)}...
                          {walletInfo.address.substring(
                            walletInfo.address.length - 6
                          )}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-green-600 dark:text-green-400">
                          Connected
                        </p>
                        <p className="text-xs text-gray-500">Trading Active</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Achievements */}
            <Card>
              <CardHeader>
                <CardTitle>Achievements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {loadingStats ? (
                    // Loading state for achievements
                    Array.from({ length: 3 }).map((_, index) => (
                      <div
                        key={index}
                        className="flex items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-800 animate-pulse"
                      >
                        <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full mr-3"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded mb-1"></div>
                          <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
                        </div>
                      </div>
                    ))
                  ) : userAchievements.length > 0 ? (
                    userAchievements.map((achievement, index) => (
                      <div
                        key={index}
                        className={`flex items-center p-3 rounded-lg ${achievement.earned
                          ? "bg-green-50 dark:bg-green-900/20"
                          : "bg-gray-50 dark:bg-gray-800"
                          }`}
                      >
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${achievement.earned
                            ? "bg-green-500"
                            : "bg-gray-300 dark:bg-gray-600"
                            }`}
                        >
                          {achievement.earned ? "🏆" : "🔒"}
                        </div>
                        <div className="flex-1">
                          <h3
                            className={`font-medium ${achievement.earned
                              ? "text-green-700 dark:text-green-300"
                              : "text-gray-700 dark:text-gray-300"
                              }`}
                          >
                            {achievement.title}
                          </h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {achievement.description}
                          </p>
                          {achievement.earned && achievement.date && (
                            <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                              Earned on{" "}
                              {new Date(achievement.date).toLocaleDateString()}
                            </p>
                          )}
                          {!achievement.earned && achievement.progress && (
                            <div className="mt-2">
                              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div
                                  className="bg-blue-600 h-2 rounded-full"
                                  style={{
                                    width: `${Math.min(
                                      (achievement.progress /
                                        (achievement.title === "Volume Trader"
                                          ? 100000
                                          : achievement.title === "Diversified"
                                            ? 10
                                            : 30)) *
                                      100,
                                      100
                                    )}%`,
                                  }}
                                ></div>
                              </div>
                              <p className="text-xs text-gray-500 mt-1">
                                {achievement.progress} /{" "}
                                {achievement.title === "Volume Trader"
                                  ? "100K"
                                  : achievement.title === "Diversified"
                                    ? "10"
                                    : "30"}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <p>No achievements yet. Start trading to earn your first achievement!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {loadingStats ? (
                    // Loading state for recent activity
                    Array.from({ length: 4 }).map((_, index) => (
                      <div key={index} className="flex items-start space-x-3 animate-pulse">
                        <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600"></div>
                        <div className="flex-1 min-w-0">
                          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded mb-1"></div>
                          <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-2/3"></div>
                        </div>
                      </div>
                    ))
                  ) : recentActivity.length > 0 ? (
                    recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${activity.type === "trade"
                            ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30"
                            : activity.type === "security"
                              ? "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30"
                              : "bg-gray-100 text-gray-600 dark:bg-gray-800"
                            }`}
                        >
                          {activity.type === "trade"
                            ? "💰"
                            : activity.type === "security"
                              ? "🔒"
                              : "⚙️"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {activity.description}
                          </p>
                          <div className="flex items-center justify-between mt-1">
                            <p className="text-xs text-gray-500">
                              {activity.time}
                            </p>
                            {activity.profit && (
                              <span
                                className={`text-xs font-medium ${activity.profit.startsWith("+")
                                  ? "text-green-600"
                                  : "text-red-600"
                                  }`}
                              >
                                {activity.profit}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <p>No recent activity. Connect a wallet and start trading!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Account Actions */}
        <Card className="border-red-200 dark:border-red-800">
          <CardHeader>
            <CardTitle className="text-red-600 dark:text-red-400">
              Account Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                variant="outline"
                className="text-red-600 border-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                Export Data
              </Button>
              <Button
                variant="outline"
                className="text-red-600 border-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                Deactivate Account
              </Button>
              <Button
                variant="destructive"
                onClick={logout}
                className="bg-red-600 hover:bg-red-700"
              >
                Sign Out
              </Button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              These actions are permanent and cannot be undone. Please proceed
              with caution.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
