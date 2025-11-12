import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, Settings, LogOut, LayoutDashboard, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { fetchUserProfile } from "../../lib/profile";
import { toLegacyProfile, isProfileCompleteEnough } from "../../lib/profileMap";

interface UserNavProps {
  className?: string;
}

export const UserNav = ({ className = "" }: UserNavProps) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <Link to="/login">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-600/20 border border-indigo-500/30 backdrop-blur-sm hover:bg-indigo-600/30 transition-all duration-200 ${className}`}
        >
          <User size={18} className="text-indigo-300" />
          <span className="text-sm font-medium text-white">Sign In</span>
        </motion.div>
      </Link>
    );
  }

  const getInitials = () => {
    const firstName = user.user_metadata?.first_name || "";
    const lastName = user.user_metadata?.last_name || "";
    const initials = (firstName[0] || "") + (lastName[0] || "");
    return initials.toUpperCase() || user.email?.[0].toUpperCase() || "U";
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const handleDashboardClick = async () => {
    if (!user?.id) {
      navigate("/login");
      return;
    }

    try {
      console.log('[UserNav] Navigating to dashboard, checking profile...');
      
      // Fetch user profile
      const profile = await fetchUserProfile(user.id);
      
      if (!profile) {
        console.log('[UserNav] No profile found → /onboarding');
        navigate("/onboarding");
        return;
      }

      // Check if profile is complete enough
      if (isProfileCompleteEnough(profile)) {
        console.log('[UserNav] Profile complete → /dashboard with data');
        const legacyProfile = toLegacyProfile(profile);
        navigate("/dashboard", { state: legacyProfile });
      } else {
        console.log('[UserNav] Profile incomplete → /onboarding');
        navigate("/onboarding");
      }
    } catch (error) {
      console.error('[UserNav] Error fetching profile:', error);
      // Fallback to onboarding on error
      navigate("/onboarding");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`flex items-center gap-3 px-4 py-2.5 rounded-xl bg-card dark:bg-card border border-border dark:border-border hover:bg-accent dark:hover:bg-accent transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background ${className}`}
        >
          <Avatar className="w-9 h-9 border-2 border-primary/30">
            <AvatarImage src="" alt={user.user_metadata?.first_name} />
            <AvatarFallback className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white text-sm font-semibold">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col items-start min-w-0">
            <span className="text-sm font-semibold text-foreground dark:text-foreground truncate max-w-[150px]">
              {user.user_metadata?.first_name && user.user_metadata?.last_name
                ? `${user.user_metadata.first_name} ${user.user_metadata.last_name}`
                : user.user_metadata?.first_name || "User"}
            </span>
            <span className="text-xs text-muted-foreground dark:text-muted-foreground">
              View Profile
            </span>
          </div>
        </motion.button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-64 bg-card dark:bg-card border-border dark:border-border text-foreground dark:text-foreground shadow-lg"
      >
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-2 p-2">
            <div className="flex items-center gap-3">
              <Avatar className="w-12 h-12 border-2 border-primary/30">
                <AvatarImage src="" alt={user.user_metadata?.first_name} />
                <AvatarFallback className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white font-semibold">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0 flex-1">
                <p className="text-sm font-semibold leading-none text-foreground dark:text-foreground truncate">
                  {user.user_metadata?.first_name} {user.user_metadata?.last_name}
                </p>
                <p className="text-xs leading-none text-muted-foreground dark:text-muted-foreground mt-1 truncate">
                  {user.email}
                </p>
              </div>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-border dark:bg-border" />
        <DropdownMenuItem
          onClick={() => navigate("/")}
          className="cursor-pointer focus:bg-accent dark:focus:bg-accent focus:text-accent-foreground dark:focus:text-accent-foreground py-2.5"
        >
          <Home size={16} className="mr-3" />
          <span className="font-medium">Home</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleDashboardClick}
          className="cursor-pointer focus:bg-accent dark:focus:bg-accent focus:text-accent-foreground dark:focus:text-accent-foreground py-2.5"
        >
          <LayoutDashboard size={16} className="mr-3" />
          <span className="font-medium">Dashboard</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => navigate("/profile")}
          className="cursor-pointer focus:bg-accent dark:focus:bg-accent focus:text-accent-foreground dark:focus:text-accent-foreground py-2.5"
        >
          <User size={16} className="mr-3" />
          <span className="font-medium">Profile</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-border dark:bg-border" />
        <DropdownMenuItem
          onClick={handleSignOut}
          className="cursor-pointer focus:bg-destructive dark:focus:bg-destructive focus:text-destructive-foreground dark:focus:text-destructive-foreground text-destructive dark:text-destructive py-2.5"
        >
          <LogOut size={16} className="mr-3" />
          <span className="font-medium">Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};