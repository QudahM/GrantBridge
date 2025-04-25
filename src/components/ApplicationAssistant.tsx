import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  BrainIcon,
  ClipboardCheckIcon,
  PenIcon,
  LightbulbIcon,
  XIcon,
  CopyIcon,
  RefreshCwIcon,
} from "lucide-react";

interface ApplicationAssistantProps {
  isOpen?: boolean;
  onClose?: () => void;
  grantTitle?: string;
  grantDeadline?: string;
  grantAmount?: string;
  grantRequirements?: string[];
}

const ApplicationAssistant = ({
  isOpen = true,
  onClose = () => {},
  grantTitle = "STEM Diversity Scholarship",
  grantDeadline = "May 15, 2023",
  grantAmount = "$5,000",
  grantRequirements = [
    "500-word personal statement",
    "Proof of enrollment",
    "Academic transcript",
    "Letter of recommendation",
  ],
}: ApplicationAssistantProps) => {
  const [activeTab, setActiveTab] = useState("checklist");
  const [completedItems, setCompletedItems] = useState<string[]>([]);

  const toggleCompletedItem = (item: string) => {
    if (completedItems.includes(item)) {
      setCompletedItems(completedItems.filter((i) => i !== item));
    } else {
      setCompletedItems([...completedItems, item]);
    }
  };

  const suggestedPhrases = [
    "As a woman in STEM, I've navigated unique challenges that have strengthened my resolve and perspective.",
    "My background in computer science has equipped me with both technical skills and a passion for inclusive technology.",
    "Through my academic journey, I've demonstrated resilience and commitment to excellence despite systemic barriers.",
    "I aim to leverage this scholarship to further my education while creating pathways for other underrepresented students.",
  ];

  const applicationTips = [
    "Focus on specific examples rather than general statements",
    "Connect your personal experiences to your academic goals",
    "Highlight any community involvement or leadership roles",
    "Address how you'll contribute to diversity in your field",
    "Proofread carefully for grammar and clarity",
  ];

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", damping: 30, stiffness: 300 }}
      className="fixed right-0 top-0 h-screen w-full sm:w-[450px] bg-background border-l shadow-xl z-50 flex flex-col"
    >
      <div className="flex items-center justify-between p-4 border-b">
        <div>
          <h2 className="text-xl font-semibold">Application Assistant</h2>
          <p className="text-sm text-muted-foreground">{grantTitle}</p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <XIcon className="h-5 w-5" />
        </Button>
      </div>

      <div className="p-4 bg-muted/50">
        <div className="flex justify-between items-center">
          <div>
            <Badge variant="outline" className="mb-1">
              Deadline: {grantDeadline}
            </Badge>
            <h3 className="text-lg font-medium">{grantAmount}</h3>
          </div>
          <Button size="sm" variant="outline" className="gap-1">
            <RefreshCwIcon className="h-4 w-4" />
            Refresh suggestions
          </Button>
        </div>
      </div>

      <Tabs
        defaultValue="checklist"
        className="flex-1 flex flex-col"
        onValueChange={setActiveTab}
      >
        <div className="px-4 pt-2">
          <TabsList className="w-full">
            <TabsTrigger value="checklist" className="flex-1">
              <ClipboardCheckIcon className="h-4 w-4 mr-2" />
              Checklist
            </TabsTrigger>
            <TabsTrigger value="phrases" className="flex-1">
              <PenIcon className="h-4 w-4 mr-2" />
              Phrases
            </TabsTrigger>
            <TabsTrigger value="tips" className="flex-1">
              <LightbulbIcon className="h-4 w-4 mr-2" />
              Tips
            </TabsTrigger>
            <TabsTrigger value="explain" className="flex-1">
              <BrainIcon className="h-4 w-4 mr-2" />
              Explain
            </TabsTrigger>
          </TabsList>
        </div>

        <ScrollArea className="flex-1 p-4">
          <TabsContent value="checklist" className="mt-0 h-full">
            <Card>
              <CardHeader>
                <CardTitle>Application Requirements</CardTitle>
                <CardDescription>
                  Track your progress through the application process
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {grantRequirements.map((requirement, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <Checkbox
                        id={`requirement-${index}`}
                        checked={completedItems.includes(requirement)}
                        onCheckedChange={() => toggleCompletedItem(requirement)}
                      />
                      <div className="grid gap-1.5">
                        <label
                          htmlFor={`requirement-${index}`}
                          className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${completedItems.includes(requirement) ? "line-through text-muted-foreground" : ""}`}
                        >
                          {requirement}
                        </label>
                        <p className="text-sm text-muted-foreground">
                          {index === 0 &&
                            "Focus on your unique perspective and experiences"}
                          {index === 1 &&
                            "Upload your current student ID or enrollment letter"}
                          {index === 2 &&
                            "Make sure it's your most recent transcript"}
                          {index === 3 &&
                            "Ideally from a professor in your field of study"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full">Generate application draft</Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="phrases" className="mt-0 h-full">
            <Card>
              <CardHeader>
                <CardTitle>Suggested Phrases</CardTitle>
                <CardDescription>
                  Personalized content based on your profile
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {suggestedPhrases.map((phrase, index) => (
                    <div
                      key={index}
                      className="group relative p-3 border rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
                    >
                      <p className="text-sm">{phrase}</p>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <CopyIcon className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Copy to clipboard</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-2">
                <Textarea
                  placeholder="Write your own custom phrase here..."
                  className="min-h-[100px]"
                />
                <Button className="w-full">Generate more phrases</Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="tips" className="mt-0 h-full">
            <Card>
              <CardHeader>
                <CardTitle>Application Tips</CardTitle>
                <CardDescription>
                  Insights from successful applicants
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {applicationTips.map((tip, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="mt-0.5 bg-primary/10 text-primary p-1 rounded-full">
                        <LightbulbIcon className="h-4 w-4" />
                      </div>
                      <p className="text-sm">{tip}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  View example applications
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="explain" className="mt-0 h-full">
            <Card>
              <CardHeader>
                <CardTitle>Grant Explanation</CardTitle>
                <CardDescription>
                  Understanding what this grant is looking for
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-muted rounded-md">
                    <h4 className="font-medium mb-2">Key Selection Criteria</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start space-x-2">
                        <span className="text-primary font-bold">•</span>
                        <span>
                          <span className="font-medium">
                            Academic excellence:
                          </span>{" "}
                          Demonstrated through GPA and coursework
                        </span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-primary font-bold">•</span>
                        <span>
                          <span className="font-medium">
                            Commitment to diversity:
                          </span>{" "}
                          Evidence of promoting inclusion in STEM
                        </span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-primary font-bold">•</span>
                        <span>
                          <span className="font-medium">
                            Leadership potential:
                          </span>{" "}
                          Demonstrated through extracurricular activities
                        </span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-primary font-bold">•</span>
                        <span>
                          <span className="font-medium">Financial need:</span>{" "}
                          Consideration given to students with demonstrated need
                        </span>
                      </li>
                    </ul>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-medium mb-2">
                      What Makes This Grant Unique
                    </h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      This scholarship specifically seeks to support
                      underrepresented students in STEM fields who demonstrate
                      both academic excellence and a commitment to promoting
                      diversity in their field. The selection committee places
                      particular emphasis on how applicants plan to use their
                      education to create positive change.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Unlike many other scholarships, this one considers both
                      academic achievements and personal experiences that have
                      shaped your perspective and goals.
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  Ask a specific question
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </ScrollArea>
      </Tabs>

      <div className="p-4 border-t">
        <div className="flex space-x-2">
          <Button variant="default" className="flex-1">
            Start application
          </Button>
          <Button variant="outline" className="flex-1">
            Save for later
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default ApplicationAssistant;
