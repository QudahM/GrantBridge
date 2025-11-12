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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`flex items-center gap-3 px-3 py-2 rounded-full bg-slate-800/80 border border-slate-700/50 backdrop-blur-sm hover:bg-slate-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900 ${className}`}
        >
          <Avatar className="w-8 h-8 border-2 border-indigo-500/30">
            <AvatarImage src="" alt={user.user_metadata?.first_name} />
            <AvatarFallback className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white text-sm font-medium">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
          <div className="hidden md:flex flex-col items-start">
            <span className="text-sm font-medium text-white">
              {user.user_metadata?.first_name || "User"}
            </span>
            <span className="text-xs text-slate-400">View Profile</span>
          </div>
        </motion.button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-56 bg-slate-800 border-slate-700 text-white"
      >
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user.user_metadata?.first_name} {user.user_metadata?.last_name}
            </p>
            <p className="text-xs leading-none text-slate-400">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-slate-700" />
        <DropdownMenuItem
          onClick={() => navigate("/")}
          className="cursor-pointer focus:bg-slate-700 focus:text-white"
        >
          <Home size={16} className="mr-2" />
          Home
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => navigate("/dashboard")}
          className="cursor-pointer focus:bg-slate-700 focus:text-white"
        >
          <LayoutDashboard size={16} className="mr-2" />
          Dashboard
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => navigate("/profile")}
          className="cursor-pointer focus:bg-slate-700 focus:text-white"
        >
          <User size={16} className="mr-2" />
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleSignOut}
          className="cursor-pointer focus:bg-red-600 focus:text-white text-red-400"
        >
          <LogOut size={16} className="mr-2" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};