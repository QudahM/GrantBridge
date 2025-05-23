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
  requirements?: { type: string; label: string }[];
  matchPercentage?: number;
  onHelpMeApply?: (grantId: string) => void;
  link?: string;
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
  link = "#",
}: GrantCardProps) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => setIsFlipped(!isFlipped);
  const handleHelpMeApply = (e: React.MouseEvent) => {
    e.stopPropagation();
    onHelpMeApply(id);
  };

  const getDeadlineColor = () => {
    if (isNaN(daysRemaining)) return "text-muted-foreground";
    if (daysRemaining <= 3) return "text-red-500";
    if (daysRemaining <= 7) return "text-amber-500";
    return "text-green-500";
  };

  const formatAmountRange = (amount: string) => {
    const match = amount.match(/\$?([\d,]+)\s*[-–]\s*\$?([\d,]+)/);
    if (!match) return amount;
    const [num1, num2] = match.slice(1).map(s => parseInt(s.replace(/,/g, "")));
    const [high, low] = num1 > num2 ? [num1, num2] : [num2, num1];
    return `$${high.toLocaleString()} - $${low.toLocaleString()}`;
  };

  const renderScrollContent = (isBack = false) => (
    <div className="scroll-wrapper flex flex-col h-full overflow-y-auto pr-2">
      {!isBack && (
        <>
          <div className="flex justify-between items-start mb-4">
            <Badge variant="outline" className="bg-primary/10 text-primary">
              {matchPercentage}% Match
            </Badge>
            <Badge variant="outline" className={`flex items-center gap-1 ${getDeadlineColor()}`}>
              <Clock className="h-3 w-3" />
              {isNaN(daysRemaining) ? "Date not specified" : `${daysRemaining} days left`}
            </Badge>
          </div>
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xl font-bold mb-2 hover:underline hover:text-primary transition-colors"
          >
            {title}
          </a>
          <p className="text-muted-foreground mb-4">{organization}</p>
          <div className="flex items-center text-lg font-semibold mb-6 text-primary">
            <Award className="mr-2 h-5 w-5" />
            {formatAmountRange(amount)}
          </div>
          <div className="mt-auto flex justify-between items-center">
            <div className="flex gap-2 flex-wrap">
              {requirements.map((req) => (
                <Badge key={req.label} variant="secondary" className="text-xs">
                  {req.type === "essay" && <FileText className="h-3 w-3 mr-1" />}
                  {req.label}
                </Badge>
              ))}
            </div>
            <Button variant="ghost" size="sm" className="text-primary">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </>
      )}

      {isBack && (
        <>
          <div className="flex justify-between items-start mb-4">
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xl font-bold hover:underline hover:text-primary transition-colors"
            >
              {title}
            </a>
            <Badge
              variant="outline"
              className={`flex items-center gap-1 ${getDeadlineColor()}`}
            >
              <Calendar className="h-3 w-3" />
              Due: {deadline}
            </Badge>
          </div>

          <div className="mb-4">
            <h4 className="text-sm font-semibold mb-2">Why you're eligible:</h4>
            <ul className="space-y-1">
              {eligibilityHighlights.flatMap((highlight, i) =>
                  highlight
                    .split(/[•*;]| and /i)
                    .map((point, j) => (
                      point.trim() && (
                        <li key={`${i}-${j}`} className="text-sm flex items-start">
                          <span className="text-green-500 mr-2">✓</span>
                          {(() => {
                            const text = point.replace(/^[-–•*]\s*/, '').trim();
                            const capitalized = text.charAt(0).toUpperCase() + text.slice(1);
                            return capitalized.endsWith(".") ? capitalized : capitalized + ".";
                          })()}
                        </li>
                      )
                    ))
                )}
            </ul>
          </div>

          <div className="mb-4">
            <h4 className="text-sm font-semibold mb-2">Requirements:</h4>
            <ul className="space-y-1">
              {requirements.flatMap((req, i) => {
                  // First, clean up the text: remove newlines and normalize semicolons
                  const cleaned = req.label.replace(/\n/g, " ").replace(/\s*[,-;]\s*/g, "; ");

                  // Now split ONLY on semicolons — this avoids breaking numeric ranges like "500-1000"
                  return cleaned.split(";").map((item, j) => {
                    const trimmed = item.trim();
                    return (
                      trimmed && (
                        <li key={`${i}-${j}`} className="text-sm flex items-start">
                          <span className="text-primary mr-2">•</span>
                          {(() => {
                            const capitalized = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
                            return capitalized.endsWith(".") ? capitalized : capitalized + ".";
                          })()}
                        </li>
                      )
                    );
                  });
                })}
            </ul>
          </div>

          <div className="mt-auto">
            <Button onClick={handleHelpMeApply} className="w-full gap-2">
              <HelpCircle className="h-4 w-4" />
              Help me apply
            </Button>
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="relative w-full h-[420px] perspective-[1000px]">
      <motion.div
        className="relative w-full h-full"
        onClick={handleFlip}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 300, damping: 30 }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Front of card */}
        <Card
          className="absolute w-full h-full border-2 hover:border-primary/50 transition-colors overflow-hidden"
          style={{ backfaceVisibility: "hidden" }}
        >
          <CardContent className="p-6 flex flex-col h-full overflow-hidden">
            {renderScrollContent(false)}
          </CardContent>
        </Card>

        {/* Back of card */}
        <Card
          className="absolute w-full h-full border-2 border-primary/50 overflow-hidden"
          style={{ transform: "rotateY(180deg)", backfaceVisibility: "hidden" }}
        >
          <CardContent className="p-6 flex flex-col h-full overflow-hidden">
            {renderScrollContent(true)}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default GrantCard;
