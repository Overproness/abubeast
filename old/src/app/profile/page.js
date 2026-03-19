"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FeatureIcon,
  GlassCard,
  GradientOrb,
  StatsCard,
} from "@/components/ui/glass";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/ui/page-header.jsx";
import { useAuth } from "@/context/AuthContext";
import {
  Activity,
  Award,
  Calendar,
  Check,
  Clock,
  Edit3,
  Globe,
  Loader2,
  LogOut,
  MapPin,
  Save,
  Send,
  Shield,
  TrendingUp,
  Twitter,
  User,
  Wallet,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ProfilePage() {
  const { user, isAuthenticated, authChecked, logout, walletInfo } = useAuth();
  const router = useRouter();
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    bio: "",
    location: "",
    website: "",
    twitter: "",
    telegram: "",
  });

  const [stats, setStats] = useState({
    totalTrades: 0,
    winRate: 0,
    totalVolume: 0,
    daysActive: 0,
  });

  const [recentActivity, setRecentActivity] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (authChecked && !isAuthenticated) {
      router.push("/auth/login?from=/profile");
    } else if (user) {
      setProfileData({
        name: user.name || "",
        email: user.email || "",
        bio: user.bio || "",
        location: user.location || "",
        website: user.website || "",
        twitter: user.twitter || "",
        telegram: user.telegram || "",
      });
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
        setStats(data.stats || {});
        setAchievements(data.achievements || []);
        setRecentActivity(data.recentActivity || []);
      }
    } catch (error) {
      console.error("Failed to fetch user stats:", error);
    } finally {
      setLoadingStats(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/user/profile?userId=${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileData),
        credentials: "include",
      });

      if (response.ok) {
        setSaved(true);
        setEditMode(false);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (error) {
      console.error("Error saving profile:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  if (!authChecked || !isAuthenticated) {
    return null;
  }

  const defaultAchievements = [
    {
      name: "First Trade",
      icon: <TrendingUp className="w-4 h-4" />,
      unlocked: true,
    },
    {
      name: "Early Adopter",
      icon: <Award className="w-4 h-4" />,
      unlocked: true,
    },
    {
      name: "Week Streak",
      icon: <Calendar className="w-4 h-4" />,
      unlocked: false,
    },
    {
      name: "Whale Status",
      icon: <Wallet className="w-4 h-4" />,
      unlocked: false,
    },
  ];

  return (
    <main className="min-h-screen">
      <PageHeader
        badge="Profile"
        badgeIcon={<User className="w-4 h-4 mr-2" />}
        title="Your Profile"
        subtitle="Manage your account and track your progress"
        size="small"
      />

      <div className="section-container py-12 relative">
        <GradientOrb
          color="blue"
          className="w-[500px] h-[500px] top-0 right-0 opacity-10 fixed"
        />
        <GradientOrb
          color="violet"
          className="w-[400px] h-[400px] bottom-0 left-0 opacity-10 fixed"
        />

        <div className="max-w-5xl mx-auto space-y-8">
          {/* Profile Header Card */}
          <GlassCard className="overflow-hidden">
            <div className="h-32 bg-gradient-to-r from-violet-600 to-purple-500 relative">
              <div className="absolute inset-0 bg-grid-pattern opacity-20" />
            </div>
            <div className="relative px-8 pb-8">
              <div className="flex flex-col md:flex-row md:items-end gap-6 -mt-12">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-500 flex items-center justify-center text-white text-3xl font-bold shadow-neon border-4 border-background">
                  {profileData.name?.charAt(0).toUpperCase() || "U"}
                </div>

                <div className="flex-1">
                  <div className="flex flex-col md:flex-row md:items-center gap-4 md:justify-between">
                    <div>
                      <h2 className="text-2xl font-bold">
                        {profileData.name || "User"}
                      </h2>
                      <p className="text-muted-foreground">
                        {profileData.email}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="success">
                          <Check className="w-3 h-3 mr-1" />
                          Active Trader
                        </Badge>
                        {walletInfo?.address && (
                          <Badge variant="outline">
                            <Wallet className="w-3 h-3 mr-1" />
                            Wallet Connected
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        variant={editMode ? "outline" : "default"}
                        onClick={() => setEditMode(!editMode)}
                        className="gap-2"
                      >
                        {editMode ? (
                          <>
                            <X className="w-4 h-4" />
                            Cancel
                          </>
                        ) : (
                          <>
                            <Edit3 className="w-4 h-4" />
                            Edit Profile
                          </>
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={handleLogout}
                        className="gap-2 text-error hover:text-error"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard
              title="Total Trades"
              value={loadingStats ? "—" : stats.totalTrades || "0"}
              icon={<Activity className="w-5 h-5" />}
            />
            <StatsCard
              title="Win Rate"
              value={loadingStats ? "—" : `${stats.winRate || 0}%`}
              icon={<TrendingUp className="w-5 h-5" />}
              change={stats.winRate > 50 ? "+above avg" : undefined}
            />
            <StatsCard
              title="Total Volume"
              value={
                loadingStats
                  ? "—"
                  : `$${(stats.totalVolume || 0).toLocaleString()}`
              }
              icon={<Wallet className="w-5 h-5" />}
            />
            <StatsCard
              title="Days Active"
              value={loadingStats ? "—" : stats.daysActive || "0"}
              icon={<Calendar className="w-5 h-5" />}
            />
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Profile Information */}
            <div className="lg:col-span-2 space-y-6">
              <GlassCard className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <FeatureIcon>
                    <User className="w-5 h-5" />
                  </FeatureIcon>
                  <h3 className="text-lg font-semibold">Profile Information</h3>
                  {saved && <Badge variant="success">Saved!</Badge>}
                </div>

                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        name="name"
                        value={profileData.name}
                        onChange={handleInputChange}
                        disabled={!editMode}
                        variant="glass"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={profileData.email}
                        disabled
                        variant="glass"
                        className="opacity-60"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <textarea
                      id="bio"
                      name="bio"
                      value={profileData.bio}
                      onChange={handleInputChange}
                      disabled={!editMode}
                      placeholder="Tell us about yourself..."
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl glass-input bg-transparent text-foreground resize-none disabled:opacity-60"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="location">
                        <MapPin className="w-4 h-4 inline mr-2" />
                        Location
                      </Label>
                      <Input
                        id="location"
                        name="location"
                        value={profileData.location}
                        onChange={handleInputChange}
                        disabled={!editMode}
                        placeholder="City, Country"
                        variant="glass"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="website">
                        <Globe className="w-4 h-4 inline mr-2" />
                        Website
                      </Label>
                      <Input
                        id="website"
                        name="website"
                        value={profileData.website}
                        onChange={handleInputChange}
                        disabled={!editMode}
                        placeholder="https://..."
                        variant="glass"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="twitter">
                        <Twitter className="w-4 h-4 inline mr-2" />
                        Twitter
                      </Label>
                      <Input
                        id="twitter"
                        name="twitter"
                        value={profileData.twitter}
                        onChange={handleInputChange}
                        disabled={!editMode}
                        placeholder="@username"
                        variant="glass"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="telegram">
                        <Send className="w-4 h-4 inline mr-2" />
                        Telegram
                      </Label>
                      <Input
                        id="telegram"
                        name="telegram"
                        value={profileData.telegram}
                        onChange={handleInputChange}
                        disabled={!editMode}
                        placeholder="@username"
                        variant="glass"
                      />
                    </div>
                  </div>

                  {editMode && (
                    <Button
                      onClick={handleSave}
                      disabled={saving}
                      className="w-full gap-2"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </GlassCard>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Achievements */}
              <GlassCard className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <FeatureIcon>
                    <Award className="w-5 h-5" />
                  </FeatureIcon>
                  <h3 className="text-lg font-semibold">Achievements</h3>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {(achievements.length > 0
                    ? achievements
                    : defaultAchievements
                  ).map((achievement, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-xl text-center transition-all ${
                        achievement.unlocked
                          ? "glass-card"
                          : "glass-card opacity-40"
                      }`}
                    >
                      <div
                        className={`w-10 h-10 mx-auto rounded-xl flex items-center justify-center mb-2 ${
                          achievement.unlocked
                            ? "bg-gradient-to-br from-violet-600 to-purple-500 text-white"
                            : "bg-foreground/10 text-muted-foreground"
                        }`}
                      >
                        {achievement.icon}
                      </div>
                      <p className="text-xs font-medium">{achievement.name}</p>
                    </div>
                  ))}
                </div>
              </GlassCard>

              {/* Recent Activity */}
              <GlassCard className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <FeatureIcon>
                    <Clock className="w-5 h-5" />
                  </FeatureIcon>
                  <h3 className="text-lg font-semibold">Recent Activity</h3>
                </div>

                {recentActivity.length > 0 ? (
                  <div className="space-y-3">
                    {recentActivity.slice(0, 5).map((activity, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 text-sm"
                      >
                        <div className="w-8 h-8 rounded-lg bg-foreground/5 flex items-center justify-center shrink-0">
                          <Activity className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate">{activity.description}</p>
                          <p className="text-xs text-muted-foreground">
                            {activity.time}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No recent activity
                  </p>
                )}
              </GlassCard>

              {/* Security */}
              <GlassCard className="p-6 bg-gradient-to-br from-primary/10 to-purple-400/10">
                <div className="flex items-center gap-3 mb-3">
                  <Shield className="w-5 h-5 text-primary" />
                  <h4 className="font-semibold">Security</h4>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Keep your account secure with 2FA and regular security checks.
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  Security Settings
                </Button>
              </GlassCard>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
