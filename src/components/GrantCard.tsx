import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  Award,
  FileText,
  HelpCircle,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface GrantCardProps {
  id?: string;
  title?: string;
  organization?: string;
  amount?: string;
  deadline?: string;
  daysRemaining?: number;
  eligibilityHighlights?: string[];
  requirements?: {
    type: string;
    label: string;
  }[];
  matchPercentage?: number;
  onHelpMeApply?: (grantId: string) => void;
}

const GrantCard = ({
  id = "1",
  title = "STEM Innovation Scholarship",
  organization = "Tech Future Foundation",
  amount = "$5,000",
  deadline = "June 30, 2023",
  daysRemaining = 14,
  eligibilityHighlights = [
    "Computer Science major",
    "Female identifying",
    "Undergraduate student",
  ],
  requirements = [
    { type: "essay", label: "Needs an essay" },
    { type: "enrollment", label: "Proof of enrollment" },
  ],
  matchPercentage = 92,
  onHelpMeApply = () => {},
}: GrantCardProps) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleHelpMeApply = (e: React.MouseEvent) => {
    e.stopPropagation();
    onHelpMeApply(id);
  };

  const getDeadlineColor = () => {
    if (daysRemaining <= 3) return "text-red-500";
    if (daysRemaining <= 7) return "text-amber-500";
    return "text-green-500";
  };

  return (
    <div className="relative w-full h-[420px] perspective-[1000px]">
      <motion.div
        className="relative w-full h-full"
        onClick={handleFlip}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{
          duration: 0.6,
          type: "spring",
          stiffness: 300,
          damping: 30,
        }}
        style={{
          transformStyle: "preserve-3d",
        }}
      >
        {/* Front of card */}
        <Card
          className="absolute w-full h-full border-2 hover:border-primary/50 transition-colors"
          style={{ backfaceVisibility: "hidden" }}
        >
          <CardContent className="p-6 flex flex-col h-full overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <Badge variant="outline" className="bg-primary/10 text-primary">
                {matchPercentage}% Match
              </Badge>
              <Badge
                variant="outline"
                className={`flex items-center gap-1 ${getDeadlineColor()}`}
              >
                <Clock className="h-3 w-3" />
                {daysRemaining} days left
              </Badge>
            </div>

            <h3 className="text-xl font-bold mb-2">{title}</h3>
            <p className="text-muted-foreground mb-4">{organization}</p>

            <div className="flex items-center text-lg font-semibold mb-6 text-primary">
              <Award className="mr-2 h-5 w-5" />
              {amount}
            </div>

            <div className="mt-auto flex justify-between items-center">
              <div className="flex gap-2 flex-wrap">
                {requirements.map((req, index) => (
                  <Badge key={req.type} variant="secondary" className="text-xs">
                    {req.type === "essay" ? (
                      <FileText className="h-3 w-3 mr-1" />
                    ) : null}
                    {req.label}
                  </Badge>
                ))}
              </div>
              <Button variant="ghost" size="sm" className="text-primary">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Back of card */}
        <Card
          className="absolute w-full h-full border-2 border-primary/50"
          style={{
            transform: "rotateY(180deg)",
            backfaceVisibility: "hidden",
          }}
        >
          <CardContent className="p-6 flex flex-col h-full overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold">{title}</h3>
              <Badge
                variant="outline"
                className={`flex items-center gap-1 ${getDeadlineColor()}`}
              >
                <Calendar className="h-3 w-3" />
                Due: {deadline}
              </Badge>
            </div>

            <div className="mb-4">
              <h4 className="text-sm font-semibold mb-2">
                Why you're eligible:
              </h4>
              <ul className="space-y-1">
              {eligibilityHighlights.flatMap((highlight, i) =>
                highlight
                  .split(" - ")
                  .map((point, j) => (
                    point.trim() && (
                      <li key={`${i}-${j}`} className="text-sm flex items-start">
                        <span className="text-green-500 mr-2">✓</span>
                        {point.replace(/^[-–•*]\s*/, '').trim()}
                      </li>
                    )
                  ))
              )}
              </ul>
            </div>

            <div className="mb-4">
              <h4 className="text-sm font-semibold mb-2">Requirements:</h4>
              <ul className="space-y-1">
                {requirements.flatMap((req, i) =>
                  req.label.split(/,| and /i).map((item, j) => {
                    const trimmed = item.trim();
                    const capitalized = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
                    return (
                      trimmed && (
                        <li key={`${i}-${j}`} className="text-sm flex items-start">
                          <span className="text-primary mr-2">•</span>
                          {capitalized.replace(/^[-–•*]\s*/, '')}
                        </li>
                      )
                    );
                  })
                )}
              </ul>
            </div>

            <div className="mt-auto">
              <Button onClick={handleHelpMeApply} className="w-full gap-2">
                <HelpCircle className="h-4 w-4" />
                Help me apply
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default GrantCard;
